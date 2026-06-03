/**
 * Image.gs — 圖片資料同步：Sheets IMAGE_ → Drive 比對 → GitHub images.json
 *
 *   runSyncImagesWithUI() : 按鈕用，跑同步並顯示結果
 *   syncImagesToGitHub()  : 核心
 *
 * 資料分頁（本試算表自有，不依賴 Graph 的 nodes_）：
 *   分頁名（小寫）開頭為 image_，欄位順序：
 *     A=node_id（輸出用）  B=file_name（當前綴）  C=info  D=website_sync_info
 *   讀 B（前綴）、A（node_id 輸出）、C（info）；D 為輸出參考欄，不影響比對。
 *
 * 邏輯：
 *   1. 只處理分頁名（小寫）開頭為 image_ 的資料分頁
 *   2. 每列 B 欄的 file_name 當前綴 prefix（A 欄 node_id 寫入 JSON）
 *   3. 遞迴掃 Drive 資料夾（含所有子層），圖檔名符合 {prefix}_* 的全部收進 JSON
 *   4. 沒被任何 prefix 配對到的圖檔 = 孤兒，寫進 missing_img 分頁
 *   5. JSON 內容有變動才推送到 GitHub
 *
 * 選單：開啟試算表自動出現「圖片同步」選單。
 *   本專案綁定「圖片試算表」，與 Graph.gs（圖譜試算表）完全獨立，
 *   各自有自己的簡單觸發器 onOpen，互不相連。
 * Token 設定：見 TOKEN_設定說明.md。操作：見 使用者說明書.md
 */

const SYNC_CONFIG = {
  IMAGE_FOLDER_ID: '1oya0SekgD_GgG7ONzfQ7rd-jcZxoIX66',
  REPO_OWNER: 'ms-112-scott',
  REPO_NAME: 'Zhudong',
  FILE_PATH: 'src/data/images.json',
  MISSING_SHEET: 'missing_img'
};

// ===== 選單：簡單觸發器，開啟試算表自動建立「圖片同步」=====
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('圖片同步')
    .addItem('推送 images.json 到 GitHub', 'runSyncImagesWithUI')
    .addToUi();
}

// ===== 按鈕：toast + 結果視窗 =====
function runSyncImagesWithUI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  try {
    ss.toast('同步中，請稍候…', '圖片同步', 30);
    const result = syncImagesToGitHub();
    ss.toast('完成', '圖片同步', 3);
    ui.alert('同步完成', result, ui.ButtonSet.OK);
  } catch (e) {
    ss.toast('失敗', '圖片同步', 3);
    ui.alert('同步失敗', e.message, ui.ButtonSet.OK);
  }
}

// ===== 主程式 =====
function syncImagesToGitHub() {
  const GITHUB_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!GITHUB_TOKEN) {
    throw new Error('找不到 GITHUB_TOKEN。請至「專案設定 → 指令碼屬性」新增。詳見 TOKEN_設定說明.md');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. 掃 Drive 全子層，取所有圖檔 { name, id, path }
  const allImages = [];
  collectImages(DriveApp.getFolderById(SYNC_CONFIG.IMAGE_FOLDER_ID), '', allImages);

  // 2. 走訪 image_ 分頁，B 欄 file_name 當 prefix，比對 {prefix}_*
  const finalJson = [];
  const matchedIds = {};   // 已被任何 prefix 配對到的圖檔 id
  const problems = [];     // 有問題的項目 { node_id, file_name, info, website_sync_info }
  const nameCount = {};    // 圖檔名出現次數（判重複用）

  allImages.forEach(img => { nameCount[img.name] = (nameCount[img.name] || 0) + 1; });

  ss.getSheets().forEach(sheet => {
    const sheetName = sheet.getName();
    const lower = sheetName.toLowerCase();
    if (!lower.startsWith('image_')) return;                  // 只處理 image_ 資料分頁
    if (sheet.getLastRow() <= 1) return;

    const rows = sheet.getDataRange().getValues().slice(1);
    rows.forEach(row => {
      const nodeId = row[0] ? row[0].toString().trim() : '';  // A 欄 = node_id（輸出用）
      const prefix = row[1] ? row[1].toString().trim() : '';  // B 欄 = file_name（當前綴）
      if (!prefix) return;
      const info = row[2] || '';                              // C 欄 = info

      const needle = prefix;
      let hitCount = 0;
      allImages.forEach(img => {
        if (img.name.indexOf(needle) === 0) {                 // 圖名以 {prefix}_ 開頭
          hitCount++;
          matchedIds[img.id] = true;

          // 重複檔名 → 不同子資料夾同名圖，img_id 會衝突
          if (nameCount[img.name] > 1) {
            problems.push({
              node_id: nodeId,
              file_name: img.name,
              info: info,
              website_sync_info: '重複檔名（位置：' + img.path + '），多張同名圖會互相覆蓋，請改名'
            });
          }

          finalJson.push({
            img_id: img.id,
            node_id: nodeId,
            file_name: img.name,
            info: info,
            sheet_source: sheetName
          });
        }
      });

      // 此前綴完全找不到圖
      if (hitCount === 0) {
        problems.push({
          node_id: nodeId,
          file_name: prefix,
          info: info,
          website_sync_info: '找不到圖檔：雲端硬碟沒有 ' + needle + '* 的圖（此前綴網站不會有圖）'
        });
      }
    });
  });

  // 3. 孤兒圖檔（雲端硬碟有、沒被任何 prefix 配對）
  allImages.forEach(img => {
    if (!matchedIds[img.id]) {
      problems.push({
        node_id: '',
        file_name: img.name,
        info: '',
        website_sync_info: '孤兒圖檔（位置：' + img.path + '）：無對應節點前綴，不會上網站'
      });
    }
  });

  writeMissingImgSheet(ss, problems);

  if (finalJson.length === 0) {
    return '警告：JSON 為空，停止推送。請檢查 image_ 分頁的 file_name 是否與圖檔前綴一致。\n問題項目：' + problems.length + ' 筆（已寫入 ' + SYNC_CONFIG.MISSING_SHEET + '）';
  }

  // 4. 推 GitHub（有變動才推）
  const pushMsg = pushImagesToGitHub(GITHUB_TOKEN, finalJson);
  return pushMsg + '\nJSON：' + finalJson.length + ' 筆，問題項目：' + problems.length + ' 筆（已寫入 ' + SYNC_CONFIG.MISSING_SHEET + '）';
}

// ===== 遞迴蒐集圖檔：名稱 / ID / Drive 路徑 =====
function collectImages(folder, path, out) {
  const here = path ? path + '/' + folder.getName() : folder.getName();
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    out.push({ name: file.getName(), id: file.getId(), path: here });
  }
  const subs = folder.getFolders();
  while (subs.hasNext()) {
    collectImages(subs.next(), here, out);
  }
}

// ===== 問題項目寫進 missing_img：node_id / file_name / info / website_sync_info =====
function writeMissingImgSheet(ss, problems) {
  let sheet = ss.getSheetByName(SYNC_CONFIG.MISSING_SHEET);
  if (!sheet) sheet = ss.insertSheet(SYNC_CONFIG.MISSING_SHEET);
  sheet.clear();

  const header = ['node_id', 'file_name', 'info', 'website_sync_info'];
  sheet.getRange(1, 1, 1, 4).setValues([header]).setFontWeight('bold').setBackground('#EFEFEF');
  sheet.setFrozenRows(1);

  if (problems.length > 0) {
    const rows = problems.map(p => [p.node_id, p.file_name, p.info, p.website_sync_info]);
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  } else {
    sheet.getRange(2, 1).setValue('目前沒有問題圖片 (All clean)').setFontColor('green');
  }
}

// ===== GitHub：比對舊內容，有變動才 PUT =====
function pushImagesToGitHub(token, jsonArr) {
  const url = `https://api.github.com/repos/${SYNC_CONFIG.REPO_OWNER}/${SYNC_CONFIG.REPO_NAME}/contents/${SYNC_CONFIG.FILE_PATH}`;

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

  const newContent = JSON.stringify(jsonArr, null, 2);
  if (oldContent === newContent) {
    return '資料無變動，跳過推送。';
  }

  const putRes = UrlFetchApp.fetch(url, {
    method: 'put',
    headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      message: 'Auto-sync (content changed): images.json',
      content: Utilities.base64Encode(newContent, Utilities.Charset.UTF_8),
      sha: sha
    })
  });
  return '推送成功！HTTP ' + putRes.getResponseCode();
}
