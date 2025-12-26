// components/helper/graph/GraphUtils.js
import * as d3 from 'd3';

/**
 * 計算邊界並縮放到適合視窗大小
 */
export const fitToView = (instance) => {
  if (!instance.mainGroup || !instance.svg) return;

  // 取得目前所有內容的邊界框 (Bounding Box)
  const bounds = instance.mainGroup.node().getBBox();
  
  // 容器尺寸
  const fullWidth = instance.container.clientWidth || instance.props.width;
  const fullHeight = instance.container.clientHeight || instance.props.height;

  // 如果圖表是空的，不做動作
  if (bounds.width === 0 || bounds.height === 0) return;

  // 計算中心點
  const midX = bounds.x + bounds.width / 2;
  const midY = bounds.y + bounds.height / 2;

  // 計算縮放比例 (預留 20% 邊距，scale = 0.8)
  const scale = 0.8 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);

  // 計算位移量 (讓 bounding box 中心對齊視窗中心)
  const translate = [
    fullWidth / 2 - scale * midX,
    fullHeight / 2 - scale * midY
  ];

  // 執行動畫過渡
  instance.svg.transition()
    .duration(750) // 0.75秒動畫
    .call(
      instance.zoomBehavior.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );
};