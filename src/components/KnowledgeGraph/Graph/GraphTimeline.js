import * as d3 from 'd3';

// --- 樣式設定 ---
const R_NORMAL = 10;       
const R_SMALL = R_NORMAL / 2; 
const PADDING = 5;

// [新增/調整] 樣式變數
const MAIN_COLOR = "#457B9D";    // 時間節點的邊框色 (與您的 bg-main 一致)
const NO_TIME_COLOR = "#6B7280"; // 無時間節點的灰色 (這裡選用中灰色)
const STROKE_WIDTH_ACTIVE = 2; 
const STROKE_WIDTH_NORMAL = 1; 
const OPACITY_INACTIVE = 0.7;  

export const applyTimeMode = (instance, data) => {
  const { width, height } = instance.props;
  const { nodes } = instance.elements;
  
  const years = data.nodes.map(d => d.year).filter(y => y !== null && y !== undefined);
  if (years.length === 0) return;

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // 垂直 Y 軸
  const yScale = d3.scaleLinear()
    .domain([minYear, maxYear])
    .range([height * 0.1, height * 0.9]); 

  // --- 3. [視覺更新] ---
  nodes.transition().duration(750)
    // 大小
    .attr("r", d => d.year ? R_NORMAL : R_SMALL)
    
    // 透明度
    .style("opacity", d => d.year ? 1 : OPACITY_INACTIVE)
    
    // [新功能] 填充顏色：有年份維持原色(d.col)，沒年份變灰色
    .attr("fill", d => d.year ? (d.col || "#457B9D") : NO_TIME_COLOR)

    // 邊框顏色
    .attr("stroke", d => d.year ? MAIN_COLOR : "#fff")
    
    // 邊框粗細
    .attr("stroke-width", d => d.year ? STROKE_WIDTH_ACTIVE : STROKE_WIDTH_NORMAL);

  // --- 4. [物理更新] ---
  instance.simulation
    .force("y", d3.forceY(d => d.year ? yScale(d.year) : 0).strength(d => d.year ? 1 : 0))
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("center", null)
    .force("collide", d3.forceCollide()
      .radius(d => (d.year ? R_NORMAL : R_SMALL) + PADDING)
      .iterations(2)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .alpha(1).restart();

  renderTimelineBg(instance, yScale);
};

export const removeTimeMode = (instance) => {
  const { width, height } = instance.props;
  const { nodes } = instance.elements;

  // --- 1. [視覺還原] ---
  nodes.transition().duration(750)
    .attr("r", R_NORMAL)        
    .style("opacity", 1)       
    
    // [還原] 顏色變回原本的 d.col
    .attr("fill", d => d.col || "#457B9D") 
    
    .attr("stroke", "#fff")     
    .attr("stroke-width", 1.5); 

  // --- 2. [物理還原] ---
  instance.simulation
    .force("x", null)
    .force("y", null)
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("collide", d3.forceCollide().radius(R_NORMAL + PADDING + 10)) 
    .alpha(1).restart();

  instance.mainGroup.selectAll(".timeline-bg")
    .transition().duration(500)
    .style("opacity", 0)
    .remove();
};

// ... renderTimelineBg 維持不變 (垂直畫線) ...
function renderTimelineBg(instance, yScale) {
  instance.mainGroup.selectAll(".timeline-bg").remove();

  const [minYear, maxYear] = yScale.domain();
  const span = maxYear - minYear;
  const step = span > 100 ? 40 : 20; 
  const ticks = d3.range(Math.ceil(minYear / step) * step, maxYear + 1, step);

  const bgGroup = instance.mainGroup.insert("g", ":first-child").attr("class", "timeline-bg");

  // 水平線
  bgGroup.selectAll("line").data(ticks).join("line")
    .attr("x1", -5000).attr("x2", 5000)
    .attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
    .attr("stroke", "rgba(255,255,255,0.1)")
    .attr("stroke-width", 1).attr("stroke-dasharray", "5,5");

  // 文字
  bgGroup.selectAll("text").data(ticks).join("text")
    .attr("x", 50).attr("y", d => yScale(d)).attr("dy", -5)
    .attr("text-anchor", "start").attr("fill", "rgba(255,255,255,0.7)")
    .style("font-size", "14px").style("font-family", "monospace")
    .style("pointer-events", "none").text(d => d);
}