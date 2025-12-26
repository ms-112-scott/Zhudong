import * as d3 from 'd3';

export const setupInteractions = (instance) => {
  const { simulation, props, elements } = instance;
  const { nodes, links, nodeLabels, linkLabels } = elements;
  const linksData = links.data();

  // --- Drag Behavior ---
  const dragBehavior = d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.target).style("cursor", "grabbing");
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.target).style("cursor", "pointer");
    });

  nodes.call(dragBehavior).style("cursor", "pointer");

  // --- Click Behavior ---
  nodes.on("click", (event, d) => {
    event.stopPropagation();

    // 1. 設定鎖定狀態 (使用 instance 屬性)
    instance.isLocked = true;

    // 2. 通知 React
    if (props.onNodeClick) {
      props.onNodeClick(d);
    }
    
    // 3. 呼叫 ForceGraph 統一的高亮邏輯 (避免重複代碼)
    instance.highlightNode(d);
  });

  // --- Hover Behavior ---
  nodes.on("mouseenter", (event, d) => {
      if (props.onNodeHover) props.onNodeHover(d);

      // [關鍵] 檢查 instance.isLocked，如果是 true 就不做任何事
      if (instance.isLocked) return;

      // 執行 Hover 預覽邏輯 (只變暗，不顯示 Label)
      const currentId = String(d.id);
      const linkedNodeIds = new Set();
      const linkedLinks = new Set();

      linksData.forEach(l => {
        const sourceId = String(l.source.id || l.source);
        const targetId = String(l.target.id || l.target);
        if (sourceId === currentId || targetId === currentId) {
          linkedNodeIds.add(sourceId === currentId ? targetId : sourceId);
          linkedLinks.add(l);
        }
      });

      nodes.interrupt().transition().duration(200)
        .style("opacity", n => (String(n.id) === currentId || linkedNodeIds.has(String(n.id))) ? 1 : 0.1);
      
      links.interrupt().transition().duration(200)
        .style("stroke-opacity", l => linkedLinks.has(l) ? 1 : 0.05)
        .style("stroke", l => linkedLinks.has(l) ? "#fff" : "#999");
    })
    .on("mouseleave", (event, d) => {
      if (props.onNodeHover) props.onNodeHover(null);

      // 如果鎖定中，不重置
      if (instance.isLocked) return;

      instance.resetHighlight();
    });
};