import React from 'react';

const NodeDescription = ({ text, graphData, onNodeClick }) => {
  const renderHyperlinkedText = (content) => {
    if (!content || !graphData?.nodes) return content;
    const nodeIds = new Set(graphData.nodes.map((n) => n.id));
    const parts = content.split(/(\s+|[.,;!?])/g);

    return parts.map((part, index) => {
      const cleanPart = part.trim();
      if (nodeIds.has(cleanPart)) {
        return (
          <span
            key={index}
            onClick={() => {
              const target = graphData.nodes.find((n) => n.id === cleanPart);
              if (target) onNodeClick(target);
            }}
            className="text-[#457B9D] font-bold cursor-pointer hover:underline hover:text-[#A8DADC] transition-colors"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="prose prose-invert prose-sm text-white/70 leading-relaxed whitespace-pre-wrap mb-8">
      <p>{renderHyperlinkedText(text || "暫無詳細描述")}</p>
    </div>
  );
};

export default NodeDescription;