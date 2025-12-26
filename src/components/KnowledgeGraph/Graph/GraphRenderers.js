// components/helper/graph/GraphRenderers.js
import * as d3 from 'd3';

/**
 * 繪製連線
 */
export const drawLinks = (container, links) => {
  return container.append("g")
    .attr("class", "links-layer")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 1.5);
};

/**
 * 繪製節點 (圓圈)
 */
export const drawNodes = (container, nodes) => {
  return container.append("g")
    .attr("class", "nodes-layer")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 25)
    .attr("fill", d => d.col || "#457B9D") 
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .style("cursor", "grab");
};

/**
 * 繪製節點下方的文字標籤
 */
export const drawNodeLabels = (container, nodes) => {
  return container.append("g")
    .attr("class", "node-labels-layer")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .style("font-size", "12px")
    .style("pointer-events", "none") // 讓滑鼠可以直接穿透文字點到節點
    .style("text-shadow", "0px 0px 3px #000") // 增加可讀性
    .text(d => d.id);
};

/**
 * 繪製連線中間的標籤 (含背景黑框)
 */
export const drawLinkLabels = (container, links) => {
  const labelGroup = container.append("g").attr("class", "link-labels");

  // 1. 綁定資料
  const labels = labelGroup.selectAll("text")
    .data(links)
    .join("text")
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "#ccc")
    .style("pointer-events", "none") // 讓滑鼠可以穿透文字點到連線
    .style("opacity", 0); // 預設隱藏

  // 2. 處理文字換行
  labels.each(function(d) {
    const text = d.label || ""; // 假設資料欄位是 label
    const maxCharsPerLine = 10;  // [設定] 超過 6 個字就換行
    
    // 如果文字太長，進行切割
    if (text.length > maxCharsPerLine) {
       const el = d3.select(this);
       const words = splitString(text, maxCharsPerLine); // 輔助函式切割字串
       
       // 建立 tspan
       el.text(null); // 清空原本文字
       words.forEach((word, i) => {
         el.append("tspan")
           .text(word)
           .attr("x", 0)
           .attr("dy", i === 0 ? 0 : "1.1em"); // 第一行不移，之後每行往下移
       });
    } else {
       d3.select(this).text(text);
    }
  });

  // 如果你需要背景框 (bgRects)，通常文字換行後背景框計算會變複雜
  // 這裡簡化為只回傳 labels Group
  return { labelGroup: labels, bgRects: null }; 
};

// 輔助函式：簡單的依長度切割字串 (可依需求改為依空白切割)
function splitString(str, len) {
  const result = [];
  for (let i = 0; i < str.length; i += len) {
    result.push(str.substring(i, i + len));
  }
  return result;
}


