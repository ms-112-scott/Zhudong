import React from 'react';

const NodeHeader = ({ node }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-[#457B9D] font-mono text-sm tracking-wider">
        {node.year ? `${node.year} YEAR` : 'CONCEPT'}
      </span>
      <div className="h-px bg-white/10 grow" />
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-3xl font-bold text-white leading-none">{node.id}</h2>
      <span
        className="px-2 py-1 rounded text-xs border font-bold shadow-sm whitespace-nowrap"
        style={{
          color: node.col,
          borderColor: `${node.col}66`,
          backgroundColor: `${node.col}1A`,
        }}
      >
        {node.group}
      </span>
    </div>
  </div>
);

export default NodeHeader;