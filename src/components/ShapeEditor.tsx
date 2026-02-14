import React from 'react';
import type { Shape, BoundingBox } from '../types';

interface ShapeEditorProps {
  shape: Shape;
  bounds: BoundingBox;
  zoom: number;
  onResize: (shape: Shape, newBounds: BoundingBox) => void;
  onRotate: (shape: Shape, rotation: number) => void;
}

export const ShapeEditor: React.FC<ShapeEditorProps> = ({
  shape,
  bounds,
  zoom,
  onResize,
  onRotate
}) => {
  const handleSize = 8 / zoom; // Keep handle size consistent regardless of zoom
  const borderWidth = 1 / zoom;

  const handles = [
    { id: 'nw', x: bounds.x - handleSize/2, y: bounds.y - handleSize/2, cursor: 'nw-resize' },
    { id: 'n', x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y - handleSize/2, cursor: 'n-resize' },
    { id: 'ne', x: bounds.x + bounds.width - handleSize/2, y: bounds.y - handleSize/2, cursor: 'ne-resize' },
    { id: 'e', x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2, cursor: 'e-resize' },
    { id: 'se', x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height - handleSize/2, cursor: 'se-resize' },
    { id: 's', x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y + bounds.height - handleSize/2, cursor: 's-resize' },
    { id: 'sw', x: bounds.x - handleSize/2, y: bounds.y + bounds.height - handleSize/2, cursor: 'sw-resize' },
    { id: 'w', x: bounds.x - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2, cursor: 'w-resize' },
  ];

  const handleMouseDown = (e: React.MouseEvent, handleId: string) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startBounds = { ...bounds };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;

      const newBounds = { ...startBounds };

      switch (handleId) {
        case 'nw':
          newBounds.x = startBounds.x + deltaX;
          newBounds.y = startBounds.y + deltaY;
          newBounds.width = startBounds.width - deltaX;
          newBounds.height = startBounds.height - deltaY;
          break;
        case 'n':
          newBounds.y = startBounds.y + deltaY;
          newBounds.height = startBounds.height - deltaY;
          break;
        case 'ne':
          newBounds.y = startBounds.y + deltaY;
          newBounds.width = startBounds.width + deltaX;
          newBounds.height = startBounds.height - deltaY;
          break;
        case 'e':
          newBounds.width = startBounds.width + deltaX;
          break;
        case 'se':
          newBounds.width = startBounds.width + deltaX;
          newBounds.height = startBounds.height + deltaY;
          break;
        case 's':
          newBounds.height = startBounds.height + deltaY;
          break;
        case 'sw':
          newBounds.x = startBounds.x + deltaX;
          newBounds.width = startBounds.width - deltaX;
          newBounds.height = startBounds.height + deltaY;
          break;
        case 'w':
          newBounds.x = startBounds.x + deltaX;
          newBounds.width = startBounds.width - deltaX;
          break;
      }

      // Ensure minimum size
      if (newBounds.width < 10) {
        newBounds.width = 10;
        if (handleId.includes('w')) {
          newBounds.x = startBounds.x + startBounds.width - 10;
        }
      }
      if (newBounds.height < 10) {
        newBounds.height = 10;
        if (handleId.includes('n')) {
          newBounds.y = startBounds.y + startBounds.height - 10;
        }
      }

      onResize(shape, newBounds);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <g transform={`rotate(${(shape.rotation || 0) * 180 / Math.PI} ${bounds.x + bounds.width / 2} ${bounds.y + bounds.height / 2})`}>
      {/* Selection border */}
      <rect
        x={bounds.x - borderWidth}
        y={bounds.y - borderWidth}
        width={bounds.width + 2 * borderWidth}
        height={bounds.height + 2 * borderWidth}
        fill="none"
        stroke="#f0f0f0"
        strokeWidth={borderWidth}
        strokeDasharray={`${4/zoom} ${4/zoom}`}
      />
      
      {/* Resize handles */}
      {handles.map(handle => (
        <rect
          key={handle.id}
          x={handle.x}
          y={handle.y}
          width={handleSize}
          height={handleSize}
          fill="#f0f0f0"
          stroke="#808080"
          strokeWidth={borderWidth}
          style={{ cursor: handle.cursor, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, handle.id)}
        />
      ))}
      
      {/* Rotation handle */}
      <circle
        cx={bounds.x + bounds.width / 2}
        cy={bounds.y - 20 / zoom}
        r={handleSize / 2}
        fill="#f0f0f0"
        stroke="#808080"
        strokeWidth={borderWidth}
        style={{ cursor: 'grab', pointerEvents: 'auto' }}
        onMouseDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
           
          const handleMouseMove = (e: MouseEvent) => {
             // Drag left/right to rotate
            const sensitivity = 0.01;
            const delta = (e.clientX - startX) * sensitivity;
            onRotate(shape, (shape.rotation || 0) + delta);
          };

          const handleMouseUp = () => {
             document.removeEventListener('mousemove', handleMouseMove);
             document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
      
      {/* Rotation line */}
      <line
        x1={bounds.x + bounds.width / 2}
        y1={bounds.y}
        x2={bounds.x + bounds.width / 2}
        y2={bounds.y - 20 / zoom}
        stroke="#f0f0f0"
        strokeWidth={borderWidth}
      />
    </g>
  );
};
