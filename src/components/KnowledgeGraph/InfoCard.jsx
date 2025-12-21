import React from "react";

function InfoCard({hoveredNodeData}) {

  
  return (
    <div className="z-50 absolute bottom-5 left-5 right-5 md:left-auto md:right-5 md:w-80 bg-black/80 text-white p-4 rounded-lg border border-gray-600 backdrop-blur-sm pointer-events-none select-none">
          <h3 className="text-lg font-bold mb-1">
            {hoveredNodeData.id} <span className="text-sm font-normal text-gray-300 ml-2">({hoveredNodeData.group})</span>
          </h3>
          <p className="text-sm text-gray-200">{hoveredNodeData.info}</p>
        </div>
  );
}

export default InfoCard;