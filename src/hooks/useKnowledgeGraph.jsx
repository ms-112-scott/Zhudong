import { useEffect, useRef, useState, useMemo } from 'react';
import { ForceGraph } from '../components/KnowledgeGraph/Graph/ForceGraph';


export const useKnowledgeGraph = (graphData, containerRef) => {
  const graphInstanceRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 年份狀態
  const [globalYearRange, setGlobalYearRange] = useState([1900, 2030]);
  const [displayYearRange, setDisplayYearRange] = useState([1900, 2030]);
  const [filterYearRange, setFilterYearRange] = useState([1900, 2030]);

  // A. 計算年份邊界
  useEffect(() => {
    if (graphData?.nodes?.length > 0) {
      const allYears = graphData.nodes.flatMap(n => [
        parseInt(n.start_year),
        parseInt(n.end_year)
      ]).filter(y => !isNaN(y));

      if (allYears.length > 0) {
        const range = [Math.min(...allYears), Math.max(...allYears)];
        setGlobalYearRange(range);
        setDisplayYearRange(range);
        setFilterYearRange(range);
      }
    }
  }, [graphData]);

  // B. 資料過濾邏輯
  const filteredData = useMemo(() => {
    if (!graphData) return null;
    const [min, max] = filterYearRange;

    const validNodes = graphData.nodes.filter(node => {
      if (!node.start_year || isNaN(parseInt(node.start_year))) return true;
      const nodeStart = parseInt(node.start_year);
      const nodeEnd = node.end_year ? parseInt(node.end_year) : nodeStart;
      return (nodeStart <= max) && (nodeEnd >= min);
    });

    const validNodeIds = new Set(validNodes.map(n => n.id));
    const validLinks = graphData.links.filter(link => {
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      return validNodeIds.has(s) && validNodeIds.has(t);
    });

    return { nodes: validNodes, links: validLinks };
  }, [graphData, filterYearRange]);

  // C. D3 初始化與渲染
  useEffect(() => {
    if (!filteredData || !containerRef.current) return;
    if (!graphInstanceRef.current) {
      graphInstanceRef.current = new ForceGraph(containerRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        onNodeClick: setSelectedNode,
        onBackgroundClick: () => setSelectedNode(null),
      });
    }
    graphInstanceRef.current.render(filteredData);
  }, [filteredData, containerRef]);

  // D. 高亮同步
  useEffect(() => {
    if (!graphInstanceRef.current) return;
    if (selectedNode) graphInstanceRef.current.highlightNode(selectedNode);
    else graphInstanceRef.current.resetHighlight();
  }, [selectedNode]);

  // E. API 方法暴露
  const actions = {
    zoomToNode: (id) => graphInstanceRef.current?.zoomToNode(id),
    zoomToFit: () => graphInstanceRef.current?.zoomToFit(),
    highlightGroup: (group) => graphInstanceRef.current?.highlightGroup(group),
    setSelectedNode,
    setFilterYearRange,
    setDisplayYearRange
  };

  return {
    filteredData,
    selectedNode,
    globalYearRange,
    displayYearRange,
    actions
  };
};