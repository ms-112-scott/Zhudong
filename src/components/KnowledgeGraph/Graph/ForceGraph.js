import * as d3 from 'd3';
import { drawNodes, drawLinks, drawNodeLabels, drawLinkLabels } from './GraphRenderers';
import { setupInteractions } from './GraphInteractions';
import { applyTimeMode, removeTimeMode } from './GraphTimeline';
import { fitToView } from './GraphUtils';

export class ForceGraph {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.props = {
      width: 800,
      height: 600,
      onNodeHover: () => {},
      onBackgroundClick: () => {},
      ...options
    };
    
    // 核心狀態
    this.simulation = null;
    this.svg = null;
    this.mainGroup = null;
    this.zoomBehavior = null;
    
    // [新增] 鎖定狀態：用來判斷是否固定顯示某個節點 (共享於 Interactions)
    this.isLocked = false;

    // 儲存 D3 選擇器
    this.elements = {
      nodes: null,
      links: null,
      nodeLabels: null,
      linkLabels: null
    };
  }

  /**
   * 主要渲染入口
   */
  render(data) {
    this.destroy(); 
    const { width, height } = this.props;

    // 1. 深拷貝資料
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // 2. 初始化畫布
    this._initCanvas(width, height);

    // 3. 初始化物理模擬
    this.simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(200)) 
      .force("charge", d3.forceManyBody().strength(-3000)) 
      .force("x", d3.forceX(width / 2).strength(0.15))
      .force("y", d3.forceY(height / 2).strength(0.15))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40).strength(0.7));

    // 4. 繪製視覺元素
    this.elements.links = drawLinks(this.mainGroup, links);
    
    const { labelGroup } = drawLinkLabels(this.mainGroup, links);
    this.elements.linkLabels = labelGroup; 
    
    this.elements.nodes = drawNodes(this.mainGroup, nodes);
    this.elements.nodeLabels = drawNodeLabels(this.mainGroup, nodes);

    // 初始隱藏 Link Labels
    if (this.elements.linkLabels) {
       this.elements.linkLabels.style("opacity", 0);
    }

    // 5. 綁定互動事件
    setupInteractions(this);

    // 6. 設定物理更新迴圈
    this.simulation.on("tick", () => this._onTick());
    
    // 7. 結束時自動置中
    this.simulation.on("end", () => {
      this.zoomToFit();
      this.simulation.on("end", null);
    });
  }

  _initCanvas(width, height) {
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .style('background-color', '#1e1e23')
      .style('width', '100%')
      .style('height', '100%');

    // 背景點擊
    this.svg.on("click", () => {
      this.resetHighlight(); 
      if (this.props.onBackgroundClick) {
        this.props.onBackgroundClick();
      }
    });

    this.mainGroup = this.svg.append("g").attr("class", "main-container");

    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        this.mainGroup.attr("transform", event.transform);
      });

    this.svg.call(this.zoomBehavior).on("dblclick.zoom", null);
  }

  _onTick() {
    const { links, nodes, nodeLabels, linkLabels } = this.elements;

    if (links) {
      links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    }

    if (linkLabels) {
      linkLabels.attr("transform", d => 
        `translate(${(d.source.x + d.target.x)/2}, ${(d.source.y + d.target.y)/2})`
      );
    }

    if (nodes) {
      nodes.attr("cx", d => d.x).attr("cy", d => d.y);
    }

    if (nodeLabels) {
      nodeLabels.attr("x", d => d.x).attr("y", d => d.y + 35);
    }
  }

  // --- Public Methods ---

  /**
   * [新增] 外部觸發高亮節點 (供 React useEffect 使用)
   * 邏輯與 Click Interaction 一致
   */
  highlightNode(node) {
    if (!node) return;
    const { nodes, links, nodeLabels, linkLabels } = this.elements;

    // 1. 設定鎖定狀態
    this.isLocked = true;

    // 2. 準備資料
    const currentId = String(node.id);
    const linkedNodeIds = new Set();
    const linkedLinks = new Set();
    
    // 必須使用 D3 綁定的資料來查找連線
    if (links) {
        const linksData = links.data();
        linksData.forEach(l => {
        const sourceId = String(l.source.id || l.source);
        const targetId = String(l.target.id || l.target);
        if (sourceId === currentId) {
            linkedNodeIds.add(targetId);
            linkedLinks.add(l);
        } else if (targetId === currentId) {
            linkedNodeIds.add(sourceId);
            linkedLinks.add(l);
        }
        });
    }

    // 3. 執行視覺動畫 (先 interrupt 避免衝突)
    if (nodes) {
        nodes.interrupt().transition().duration(200)
             .style("opacity", n => (String(n.id) === currentId || linkedNodeIds.has(String(n.id))) ? 1 : 0.1);
    }

    if (nodeLabels) {
        nodeLabels.interrupt().transition().duration(200)
             .style("opacity", n => (String(n.id) === currentId || linkedNodeIds.has(String(n.id))) ? 1 : 0.1);
    }
    
    if (links) {
        links.interrupt().transition().duration(200)
             .style("stroke-opacity", l => linkedLinks.has(l) ? 1 : 0.05)
             .style("stroke", l => linkedLinks.has(l) ? "#fff" : "#999");
    }
    
    if (linkLabels) {
        linkLabels.interrupt().transition().duration(200)
             .style("opacity", l => linkedLinks.has(l) ? 1 : 0);
    }
  }

  /**
   * 重置所有高亮狀態
   */
  resetHighlight() {
    // [關鍵] 解除鎖定
    this.isLocked = false;

    const { nodes, links, nodeLabels, linkLabels } = this.elements;
    
    if (nodes) nodes.interrupt();
    if (links) links.interrupt();
    if (nodeLabels) nodeLabels.interrupt();
    if (linkLabels) linkLabels.interrupt();

    if (linkLabels) linkLabels.transition().duration(200).style("opacity", 0);
    if (nodes) nodes.transition().duration(200).style("opacity", 1);
    if (nodeLabels) nodeLabels.transition().duration(200).style("opacity", 1);
    
    if (links) {
      links.transition().duration(200)
        .style("stroke-opacity", 0.6)
        .style("stroke", "#999");
    }
  }

  /**
   * [新增功能] 聚焦並放大至特定節點
   * @param {string} nodeId - 目標節點 ID
   */
  zoomToNode(nodeId) {
    if (!this.elements.nodes || !this.zoomBehavior || !this.svg) return;

    // 1. 找到目標節點資料 (d3 綁定在 DOM 上的 data)
    // 這裡我們直接從傳入的 props 資料找，或者從 d3 selection 找皆可
    // 建議直接遍歷 d3 節點的 data 以確保拿到最新的 x, y
    let targetNode = null;
    this.elements.nodes.each(function(d) {
      if (d.id === nodeId) {
        targetNode = d;
      }
    });

    if (!targetNode) {
      console.warn(`Node ${nodeId} not found in graph.`);
      return;
    }

    // 2. 計算 Zoom 參數
    const width = this.props.width;
    const height = this.props.height;
    const scale = 1.0; // 放大倍率 (可自行調整，例如 2.5 或 1.5)

    // transform: translate(cx, cy) scale(k)
    // 目標是讓 node.x, node.y 位於畫面中心
    // 公式: tx = centerWidth - nodeX * scale
    const tx = (width / 2) - (targetNode.x * scale);
    const ty = (height / 2) - (targetNode.y * scale);

    // 3. 執行過渡動畫
    this.svg.transition()
      .duration(1500) // 動畫時間 (毫秒)
      .call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
      )
      .on("end", () => {
         // 動畫結束後，如果需要可以觸發一些事件
         // 比如高亮該節點 (通常由 React 父層呼叫 handleNodeClick 處理)
      });
  }

  /**
   * [新增] 高亮特定群組的節點
   * @param {string|null} groupName - 群組名稱，若為 null 則重置
   */
  highlightGroup(groupName) {
    // 1. 如果傳入 null，代表取消篩選，執行重置
    if (!groupName) {
      this.resetHighlight();
      return;
    }

    const { nodes, links, nodeLabels, linkLabels } = this.elements;

    // 2. 設定鎖定狀態 (防止 Hover 蓋過效果)
    this.isLocked = true;

    // 3. 節點篩選邏輯
    if (nodes) {
      nodes.interrupt().transition().duration(200)
        .style("opacity", d => d.group === groupName ? 1 : 0.1); // 非該群組變淡
    }

    if (nodeLabels) {
      nodeLabels.interrupt().transition().duration(200)
        .style("opacity", d => d.group === groupName ? 1 : 0.1);
    }

    // 4. 連線篩選邏輯 (選項：只顯示該群組內部的連線)
    // 這裡的邏輯是：只有當 Source 和 Target 都在該群組內，連線才顯示
    if (links) {
      links.interrupt().transition().duration(200)
        .style("stroke-opacity", d => {
          // 取得 source/target 的 group (注意 d3 資料結構可能是物件)
          const sGroup = d.source.group;
          const tGroup = d.target.group;
          // 兩端都在該群組才顯示
          return (sGroup === groupName && tGroup === groupName) ? 0.6 : 0.05;
        });
    }

    // 隱藏所有 Label 以保持畫面乾淨
    if (linkLabels) {
      linkLabels.transition().duration(200).style("opacity", 0);
    }
  }

  updateTimeMode(isTimeMode, data) {
    if (isTimeMode) applyTimeMode(this, data);
    else removeTimeMode(this);
  }

  zoomToFit() {
    fitToView(this);
  }

  resize(w, h) {
    this.props.width = w;
    this.props.height = h;
    if (this.svg) this.svg.attr("viewBox", [0, 0, w, h]);
    if (this.simulation) {
      this.simulation.force("center", d3.forceCenter(w / 2, h / 2));
      this.simulation.alpha(0.3).restart();
    }
  }

  destroy() {
    if (this.simulation) this.simulation.stop();
    if (this.svg) this.svg.remove();
  }
}