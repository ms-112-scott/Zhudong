/**
 * Graph.gs — 知識圖譜資料產生 + 節點檢查
 *
 *   doGet()               : Web app 入口，回傳 nodes/links/legend JSON
 *   processGraphData(ss)  : 核心，掃描 / 一致性檢查 / 上色 / 更新 missing_node
 *   runGraphCheckWithUI() : 按鈕用，跑檢查並顯示摘要
 *
 * 注意：本專案綁定「圖譜試算表」，與 Image.gs（圖片試算表）完全獨立。
 *
 * 同步：跟 Image.gs 一樣，把圖譜 JSON 推到 GitHub src/data/graph.json，
 *       網站直接讀 raw 檔（不再用 doGet Web App 即時抓）。
 *       需設 GITHUB_TOKEN 指令碼屬性（本專案自己一份）。
 */

const GRAPH_CONFIG = {
  REPO_OWNER: 'ms-112-scott',
  REPO_NAME: 'Zhudong',
  FILE_PATH: 'src/data/graph.json'
};

// ===== 選單：簡單觸發器，開啟試算表自動建立「圖譜工具」=====
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('圖譜工具')
    .addItem('推送 graph.json 到 GitHub', 'runGraphSyncWithUI')
    .addItem('檢查節點 / 更新圖譜標記（不推送）', 'runGraphCheckWithUI')
    .addToUi();
}

// ===== 按鈕：跑圖譜檢查（上色 + missing_node），顯示摘要 =====
function runGraphCheckWithUI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  try {
    ss.toast('檢查中，請稍候…', '圖譜工具', 30);
    const out = processGraphData(ss);
    const s = out.summary;
    ss.toast('完成', '圖譜工具', 3);
    ui.alert('檢查完成',
      '節點：' + s.nodeCount + '\n連線：' + s.linkCount +
      '\n缺漏節點（Link 表標黃，見 missing_node）：' + s.missingCount +
      '\n定義衝突（Node 表標紅）：' + s.conflictCount + ' 處',
      ui.ButtonSet.OK);
  } catch (e) {
    ss.toast('失敗', '圖譜工具', 3);
    ui.alert('檢查失敗', e.message, ui.ButtonSet.OK);
  }
}

// ===== 按鈕：跑檢查 + 推送 graph.json 到 GitHub =====
function runGraphSyncWithUI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  try {
    ss.toast('同步中，請稍候…', '圖譜工具', 30);
    const out = processGraphData(ss);
    const s = out.summary;
    const pushMsg = pushGraphToGitHub(out.result);
    ss.toast('完成', '圖譜工具', 3);
    ui.alert('同步完成',
      pushMsg +
      '\n節點：' + s.nodeCount + '，連線：' + s.linkCount +
      '\n缺漏節點（見 missing_node）：' + s.missingCount +
      '\n定義衝突（Node 表標紅）：' + s.conflictCount + ' 處',
      ui.ButtonSet.OK);
  } catch (e) {
    ss.toast('失敗', '圖譜工具', 3);
    ui.alert('同步失敗', e.message, ui.ButtonSet.OK);
  }
}

// ===== GitHub：比對舊內容，有變動才 PUT graph.json =====
function pushGraphToGitHub(resultObj) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    throw new Error('找不到 GITHUB_TOKEN。請至「專案設定 → 指令碼屬性」新增。');
  }

  const url = `https://api.github.com/repos/${GRAPH_CONFIG.REPO_OWNER}/${GRAPH_CONFIG.REPO_NAME}/contents/${GRAPH_CONFIG.FILE_PATH}`;

  let sha = '';
  let oldContent = '';
  const getRes = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { 'Authorization': 'token ' + token },
    muteHttpExceptions: true
  });
  if (getRes.getResponseCode() === 200) {
    const gitData = JSON.parse(getRes.getContentText());
    sha = gitData.sha;
    oldContent = Utilities.newBlob(Utilities.base64Decode(gitData.content)).getDataAsString();
  }

  const newContent = JSON.stringify(resultObj, null, 2);
  if (oldContent === newContent) {
    return '資料無變動，跳過推送。';
  }

  const putRes = UrlFetchApp.fetch(url, {
    method: 'put',
    headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      message: 'Auto-sync (content changed): graph.json',
      content: Utilities.base64Encode(newContent, Utilities.Charset.UTF_8),
      sha: sha
    })
  });
  return '推送成功！HTTP ' + putRes.getResponseCode();
}

// ===== Web app 入口（保留向下相容，可不用）：回傳圖譜 JSON =====
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = processGraphData(ss);
  return ContentService.createTextOutput(JSON.stringify(out.result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== 核心：掃描 / 一致性檢查 / 上色 / 更新 missing_node，回傳 { result, summary } =====
function processGraphData(ss) {
  const allSheets = ss.getSheets();

  // --- 1. 建立顏色與圖例 ---
  const nodeColorMap = createColorMap(ss, "nodes_color");
  const linkColorMap = createColorMap(ss, "links_color");
  const legendData = getLegendData(ss, "nodes_color");

  const nodesMap = {};
  let allLinks = [];

  // ==========================================
  // 變數準備
  // ==========================================
  // [Node檢查] 用於標記定義衝突 (紅色)
  const nodeConsistencyMap = {};
  const conflictBatches = {};

  // [Link檢查] 用於標記缺漏節點 (黃色)
  // 結構: { "NodeID": [ {sheet: "Link_A", range: "A2"}, {sheet: "Link_A", range: "B5"} ] }
  const linkNodeLocations = {};
  const yellowBatches = {};

  // ==========================================
  // 第一階段：掃描 Link (記錄位置與建立自動節點)
  // ==========================================
  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheet.getLastRow() <= 1) return;

    if (sheetName.toLowerCase().startsWith("link_")) {
      // 1. 先清除 A, B 欄舊的黃色底色 (重置狀態)
      sheet.getRange("A2:B").setBackground(null);

      const data = sheet.getDataRange().getValues();
      const rows = data.slice(1);
      rows.forEach((row, index) => {
        if (!row[0] || !row[1]) return;
        const sourceId = row[0].toString();
        const targetId = row[1].toString();
        const group = row[2];
        const currentRow = index + 2;

        // --- 記錄每個 ID 在 Link 表中的出現位置 ---
        const sourceRange = "A" + currentRow;
        const targetRange = "B" + currentRow;

        if (!linkNodeLocations[sourceId]) linkNodeLocations[sourceId] = [];
        linkNodeLocations[sourceId].push({ sheet: sheetName, range: sourceRange });

        if (!linkNodeLocations[targetId]) linkNodeLocations[targetId] = [];
        linkNodeLocations[targetId].push({ sheet: sheetName, range: targetRange });

        if (!nodesMap[sourceId]) nodesMap[sourceId] = createAutoNode(sourceId, nodeColorMap, sheetName, currentRow);
        if (!nodesMap[targetId]) nodesMap[targetId] = createAutoNode(targetId, nodeColorMap, sheetName, currentRow);

        allLinks.push({
          source: sourceId,
          target: targetId,
          group: group,
          label: row[3] || "",
          info: row[4] || "",
          color: linkColorMap[group] || "#999999"
        });
      });
    }
  });

  // ==========================================
  // 第二階段：掃描 Node (覆蓋資料與檢查衝突)
  // ==========================================
  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName === "nodes_color" || sheetName === "links_color" || sheetName === "missing_node") return;
    if (sheet.getLastRow() <= 1) return;

    if (sheetName.toLowerCase().startsWith("nodes_")) {
      // 重置背景色 (清除之前的紅色標記)
      sheet.getRange("B2:B").setBackground(null);

      const data = sheet.getDataRange().getValues();
      const rows = data.slice(1);

      rows.forEach((row, index) => {
        if (!row[0]) return;

        const id = row[0].toString();
        const group = row[1];
        const info = row[2] || "";

        // --- 一致性檢查 (紅色) ---
        const rowNum = index + 2;
        const currentRangeA1 = "B" + rowNum;

        if (nodeConsistencyMap[id]) {
            const previousRecord = nodeConsistencyMap[id];
            if (previousRecord.group !== group) {
                if (!conflictBatches[sheetName]) conflictBatches[sheetName] = [];
                conflictBatches[sheetName].push(currentRangeA1);

                const prevSheetName = previousRecord.sheetName;
                const prevRange = previousRecord.rangeA1;
                if (!conflictBatches[prevSheetName]) conflictBatches[prevSheetName] = [];
                if (!conflictBatches[prevSheetName].includes(prevRange)) {
                    conflictBatches[prevSheetName].push(prevRange);
                }
            }
        } else {
            nodeConsistencyMap[id] = { group: group, sheetName: sheetName, rangeA1: currentRangeA1 };
        }
        // -----------------------

        const realData = {
          id: id,
          group: group,
          info: info,
          start_year: row[3] || null,
          end_year: row[4] || null,
          lon: row[5] || null,
          lat: row[6] || null,
          col: nodeColorMap[group] || "#CCCCCC"
        };

        if (nodesMap[id]) {
          const existingNode = nodesMap[id];
          Object.assign(existingNode, realData);
          if (existingNode.info === "(自動生成的關聯節點)") {
             existingNode.info = info;
          } else if (info !== "") {
             if (!existingNode.info.includes(info)) {
                existingNode.info = existingNode.info + "\n" + info;
             }
          }
        } else {
          nodesMap[id] = realData;
        }
      });
    }
  });

  // ==========================================
  // 第三階段：處理視覺化標記 (紅與黃)
  // ==========================================

  // 1. 執行紅色批次上色 (Node 表衝突)
  for (const [sheetName, ranges] of Object.entries(conflictBatches)) {
      if (ranges.length > 0) {
          const sheet = ss.getSheetByName(sheetName);
          sheet.getRangeList(ranges).setBackground("#ffcdd2"); // 淺紅
      }
  }

  // 2. 執行黃色批次上色 (Link 表缺漏)
  // 找出最終仍是 "自動增加" 的節點
  const finalMissingNodes = Object.values(nodesMap).filter(node => node.group === "自動增加");

  finalMissingNodes.forEach(node => {
      const locations = linkNodeLocations[node.id];
      if (locations) {
          locations.forEach(loc => {
              if (!yellowBatches[loc.sheet]) yellowBatches[loc.sheet] = [];
              yellowBatches[loc.sheet].push(loc.range);
          });
      }
  });

  for (const [sheetName, ranges] of Object.entries(yellowBatches)) {
      if (ranges.length > 0) {
          const sheet = ss.getSheetByName(sheetName);
          sheet.getRangeList(ranges).setBackground("#fff59d"); // 淺黃
      }
  }

  // ==========================================
  // 第四階段：更新 missing_node 與 Output
  // ==========================================
  updateAutoNodeSheet(ss, finalMissingNodes);

  const finalNodes = Object.values(nodesMap);
  const result = {
    nodes: finalNodes,
    links: allLinks,
    legend: legendData
  };

  const conflictCount = Object.values(conflictBatches).flat().length;
  console.log("========== 📊 資料處理完成 ==========");
  console.log(`節點總數: ${finalNodes.length}, 連線總數: ${allLinks.length}`);
  console.log(`缺漏節點 (Link表已標黃): ${finalMissingNodes.length}`);
  console.log(`定義衝突 (Node表已標紅): ${conflictCount} 處`);
  console.log("=====================================");

  const summary = {
    nodeCount: finalNodes.length,
    linkCount: allLinks.length,
    missingCount: finalMissingNodes.length,
    conflictCount: conflictCount
  };
  return { result: result, summary: summary };
}

// ==========================================
// 輔助函式區域
// ==========================================

function updateAutoNodeSheet(ss, missingNodes) {
  const sheetName = "missing_node";
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clear();

  const headers = [["來源表單", "行號", "id", "node_Group", "info", "start_year", "end_year", "Lon", "Lat"]];

  const headerRange = sheet.getRange(1, 1, 1, headers[0].length);
  headerRange.setValues(headers);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#EFEFEF");
  sheet.setFrozenRows(1);

  if (missingNodes.length > 0) {
    const rows = missingNodes.map(node => [
      node.sourceSheet || "未知",
      node.sourceRow || "",
      node.id,
      node.group,
      "",
      "",
      "",
      "",
      ""
    ]);

    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    sheet.autoResizeColumn(1);
    sheet.getRange(2 + rows.length, 1).setValue("--- 請將補齊的資料剪下貼上至 nodes_ 表格，並重新整理網頁 ---").setFontColor("red");
  } else {
    sheet.getRange(2, 1).setValue("目前沒有缺漏的節點 (All clean)").setFontColor("green");
  }
}

function createAutoNode(id, colorMap, sheetName, rowNumber) {
  const autoGroup = "自動增加";
  return {
    id: id,
    group: autoGroup,
    sourceSheet: sheetName,
    sourceRow: rowNumber,
    info: "(自動生成的關聯節點)",
    start_year: null,
    end_year: null,
    lon: null,
    lat: null,
    col: colorMap[autoGroup] || "#777777"
  };
}

function createColorMap(ss, sheetName) {
  const map = {};
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return map;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const color = data[i][1];
    if (key) map[key] = color;
  }
  return map;
}

function getLegendData(ss, sheetName) {
  const list = [];
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return list;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const label = data[i][0];
    const color = data[i][1];
    if (label) {
      list.push({ label: label, color: color || "#CCCCCC" });
    }
  }
  return list;
}



所以gs會push to github哪一個branch
github page要設定在哪一的branch?