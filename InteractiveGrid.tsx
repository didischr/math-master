import React, { useState } from 'react';

const InteractiveGrid: React.FC = () => {
  const [hoveredCell, setHoveredCell] = useState<{ r: number, c: number } | null>(null);
  const size = 20;
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
        {/* Header Row with compact info */}
        <div className="flex justify-between items-center mb-2 shrink-0 px-1">
            <h2 className="text-lg font-bold text-blue-800">לוח הכפל (20x20)</h2>
            <div className="h-6 flex items-center justify-end text-blue-600 font-bold text-lg min-w-[150px]">
                {hoveredCell ? (
                    <span className="animate-fade-in">
                        {hoveredCell.r} × {hoveredCell.c} = <span className="text-2xl">{hoveredCell.r * hoveredCell.c}</span>
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 font-normal">הצבע על תא</span>
                )}
            </div>
        </div>
        
        {/* Grid Container */}
        <div className="flex-1 w-full border border-blue-200 rounded-lg bg-white shadow-sm overflow-hidden relative">
            <div 
                className="grid gap-px bg-blue-200 w-full h-full"
                style={{ 
                    gridTemplateColumns: `30px repeat(${size}, 1fr)`,
                    gridTemplateRows: `26px repeat(${size}, 1fr)`
                }}
            >
                {/* Top-Left Corner */}
                <div className="bg-blue-600 text-white font-bold flex items-center justify-center text-xs z-20">
                    X
                </div>

                {/* Top Header Row */}
                {numbers.map(c => (
                    <div 
                        key={`h-${c}`} 
                        className={`font-bold text-center text-[10px] sm:text-xs flex items-center justify-center
                            ${hoveredCell?.c === c ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-900'}
                        `}
                    >
                        {c}
                    </div>
                ))}

                {/* Rows */}
                {numbers.map(r => (
                    <React.Fragment key={`row-${r}`}>
                        {/* Left Header Col */}
                        <div 
                             className={`font-bold text-center text-[10px] sm:text-xs flex items-center justify-center
                                ${hoveredCell?.r === r ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-900'}
                            `}
                        >
                            {r}
                        </div>

                        {/* Cells */}
                        {numbers.map(c => {
                            const isHighlighted = hoveredCell?.r === r || hoveredCell?.c === c;
                            const isSelected = hoveredCell?.r === r && hoveredCell?.c === c;

                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onMouseEnter={() => setHoveredCell({ r, c })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    onClick={() => setHoveredCell({ r, c })}
                                    className={`
                                        flex items-center justify-center text-[9px] sm:text-[11px] cursor-pointer transition-colors duration-0
                                        ${isSelected 
                                            ? 'bg-blue-600 text-white font-bold' 
                                            : isHighlighted 
                                                ? 'bg-blue-200 text-blue-900' 
                                                : 'bg-white hover:bg-blue-50 text-gray-600'}
                                    `}
                                >
                                    {r * c}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
  );
};

export default InteractiveGrid;