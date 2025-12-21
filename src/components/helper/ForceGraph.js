import * as d3 from 'd3';

/**
 * ForceGraph 類別
 * 負責處理 D3 力導向圖的渲染、物理模擬與互動行為
 */
export class ForceGraph {
  constructor(containerElement, options = {}) {
    this.container = containerElement; // 繪圖容器
    this.props = {
      width: 800,
      height: 600,
      onNodeHover: () => {}, // 懸浮回傳回呼函式
      ...options
    };
    this.simulation = null;   // 物理模擬器
    this.svg = null;          // SVG 根節點
    this.mainGroup = null;    // 受縮放影響的內容主群組
    this.zoomBehavior = null; // 縮放行為實例
  }

  /**
   * 手動觸發：縮放至全圖 (Zoom to Fit)
   * 計算目前所有節點的邊界框，並平滑調整視角
   */
  zoomToFit() {
    if (this.zoomBehavior && this.svg && this.mainGroup) {
      this._fitToView(this.zoomBehavior);
    }
  }

  /**
   * 主要渲染函式
   * @param {Object} data 包含 nodes 與 links 的資料物件
   */  

  render(data) {
    this.destroy(); // 清理先前可能存在的圖表

    const { width, height, onNodeHover } = this.props;
    
    // 深拷貝資料避免 D3 物理運算污染 React 狀態原始資料
    const nodes = JSON.parse(JSON.stringify(data.nodes));
    const links = JSON.parse(JSON.stringify(data.links));

    // --- 1. 初始化基礎畫布 ---
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block')
      .style('background-color', '#1e1e23');

    // 建立 mainGroup，所有圖表內容將放入此群組以進行縮放位移
    this.mainGroup = this.svg.append("g").attr("class", "main-container");

    // --- 2. 配置縮放控制 (Zoom & Pan) ---
    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 5]) // 縮放範圍 10% ~ 500%
      .on("zoom", (event) => {
        this.mainGroup.attr("transform", event.transform);
      });

    this.svg.call(this.zoomBehavior);

    // --- 3. 初始化物理力場 ---
    const colorScale = d3.scaleOrdinal()
      .domain(nodes.map(d => d.group))
      .range(nodes.map(d => d.col));

    this.simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(35));

    // --- 4. 繪製連線 (Links) ---
    const link = this.mainGroup.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", 1.5);

    // --- 5. 繪製連線標籤 (Link Labels) ---
    const linkLabelGroup = this.mainGroup.append("g")
      .selectAll("g")
      .data(links)
      .join("g")
      // 關鍵：如果標籤為空或僅包含空格，則隱藏該標籤群組
      .style("display", d => (d.label && d.label.trim() !== "") ? "block" : "none");

    linkLabelGroup.append("rect")
      .attr("fill", "#333")
      .attr("rx", 4)
      .attr("ry", 4);

    linkLabelGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#fff")
      .style("font-size", "10px")
      .text(d => d.label);

    // 動態計算標籤背景矩形的尺寸
    linkLabelGroup.each(function(d) {
        if (!d.label || d.label.trim() === "") return;
        const textNode = this.querySelector("text");
        if (textNode) {
            const bbox = textNode.getBBox();
            d3.select(this.querySelector("rect"))
                .attr("x", bbox.x - 4)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 8)
                .attr("height", bbox.height + 4);
        }
    });

    // --- 6. 繪製節點 (Nodes) ---
    const node = this.mainGroup.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", 25)
        .attr("fill", d => colorScale(d.group))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .style("cursor", "grab")
        .call(this._dragBehavior());

    // 節點名稱文字
    const nodeLabel = this.mainGroup.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .text(d => d.id);

    // --- 7. 設定互動行為 (Hover Effects) ---
    node.on("mouseover", (event, d) => {
      onNodeHover(d);
      const linkedNodeIds = new Set();
      const linkedLinks = new Set();
      
      // 找出與當前節點相連的所有節點與連線
      links.forEach(l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id) { linkedNodeIds.add(tId); linkedLinks.add(l); }
        else if (tId === d.id) { linkedNodeIds.add(sId); linkedLinks.add(l); }
      });

      // 執行高亮與淡化視覺效果
      node.style("opacity", n => (n.id === d.id || linkedNodeIds.has(n.id)) ? 1 : 0.2);
      link.style("stroke-opacity", l => (linkedLinks.has(l)) ? 1 : 0.1);
      linkLabelGroup.style("opacity", l => (linkedLinks.has(l)) ? 1 : 0.1);
      nodeLabel.style("opacity", n => (n.id === d.id || linkedNodeIds.has(n.id)) ? 1 : 0.2);
    })
    .on("mouseout", () => {
      onNodeHover(null);
      // 還原原始樣式
      node.style("opacity", 1);
      link.style("stroke-opacity", 0.6);
      linkLabelGroup.style("opacity", 1);
      nodeLabel.style("opacity", 1);
    });

    // --- 8. 物理模擬每一幀的更新 (Tick) ---
    this.simulation.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      linkLabelGroup.attr("transform", d => `translate(${(d.source.x + d.target.x)/2}, ${(d.source.y + d.target.y)/2})`);
      node.attr("cx", d => d.x).attr("cy", d => d.y);
      nodeLabel.attr("x", d => d.x).attr("y", d => d.y + 35);
    });

    // --- 9. 初始自動聚焦 ---
    // 當物理模擬穩定(end)時，自動縮放至適合視野的大小。
    this.simulation.on("end", () => {
      this._fitToView(this.zoomBehavior);
      this.simulation.on("end", null); // 移除監聽器以避免重覆觸發
    });

    this._drawLegend(colorScale);
  }

  /**
   * 計算並執行自動縮放
   */
  _fitToView(zoomBehavior) {
    if (!this.mainGroup || !this.svg) return;

    const bounds = this.mainGroup.node().getBBox();
    const parent = this.svg.node();
    const fullWidth = parent.clientWidth || this.props.width;
    const fullHeight = parent.clientHeight || this.props.height;
    
    if (bounds.width === 0 || bounds.height === 0) return;

    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;

    // 保留 20% 的邊界空間 (scale 為 0.8)
    const scale = 0.8 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);
    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    this.svg.transition().duration(750).call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );
  }

  /**
   * 響應視窗大小調整
   */
  resize(newWidth, newHeight) {
    this.props.width = newWidth;
    this.props.height = newHeight;
    if (this.svg) this.svg.attr("viewBox", [0, 0, newWidth, newHeight]);
    if (this.simulation) {
      this.simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
      this.simulation.alpha(0.3).restart();
    }
  }

  /**
   * 繪製圖例 (Legend)
   * 註：圖例直接繪製於 SVG 上，不隨平移縮放改變位置
   */
  _drawLegend(colorScale) {
    const legendData = [
        {label: "基層/眷屬", col: "#E63946"},
        {label: "官員/組織", col: "#457B9D"},
        {label: "技術/民間", col: "#F4A261"},
        {label: "地點", col: "#2A9D8F"},
        {label: "事件", col: "#6D597A"}
    ];
    const legend = this.svg.append("g").attr("transform", "translate(20, 100)");
    legendData.forEach((item, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
      row.append("circle").attr("r", 6).attr("fill", item.col);
      row.append("text").attr("x", 15).attr("y", 1)
         .attr("alignment-baseline", "middle").attr("fill", "#fff")
         .style("font-size", "12px").text(item.label);
    });
  }

  /**
   * 定義拖拽行為邏輯
   */
  _dragBehavior() {
    return d3.drag()
      .on("start", (event) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", (event) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", (event) => {
        if (!event.active) this.simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });
  }

  /**
   * 銷毀圖表實例與資源
   */
  destroy() {
    if (this.simulation) this.simulation.stop();
    if (this.svg) this.svg.remove();
  }
}