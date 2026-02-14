import React, { useRef, useEffect, useCallback, useState } from 'react';
import rough from 'roughjs';
import type { Shape, Point, CanvasState, Tool } from '../types';
import { drawShape } from '../utils/drawUtils';
import { generateId, getShapeBounds, getShapeAtPoint, moveShape, resizeShape, rotateShape } from '../utils/shapeUtils';
import { ShapeEditor } from './ShapeEditor';

interface CanvasProps {
  canvasState: CanvasState;
  onCanvasStateChange: (state: CanvasState) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onZoom: (zoomDelta: number, centerX?: number, centerY?: number) => void;
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  canvasState,
  onCanvasStateChange,
  onPan,
  onZoom,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roughCanvasRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });

  // Initialize rough canvas
  useEffect(() => {
    if (canvasRef.current) {
      roughCanvasRef.current = rough.canvas(canvasRef.current);
    }
  }, []);

  // Redraw canvas when state changes
  useEffect(() => {
    redrawCanvas();
  }, [canvasState]);

  // Coordinate transformation utilities
  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    const { viewport } = canvasState;
    return {
      x: (screenX - viewport.offsetX) / viewport.zoom,
      y: (screenY - viewport.offsetY) / viewport.zoom
    };
  }, [canvasState.viewport]);

  const canvasToScreen = useCallback((canvasX: number, canvasY: number): Point => {
    const { viewport } = canvasState;
    return {
      x: canvasX * viewport.zoom + viewport.offsetX,
      y: canvasY * viewport.zoom + viewport.offsetY
    };
  }, [canvasState.viewport]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { viewport } = canvasState;
    const gridSize = 20 * viewport.zoom;

    if (gridSize < 5) return; // Don't draw grid when too zoomed out

    ctx.save();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.3;
    ctx.setLineDash([]);

    // Calculate grid offset
    const offsetX = viewport.offsetX % gridSize;
    const offsetY = viewport.offsetY % gridSize;

    // Draw vertical lines
    for (let x = offsetX; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = offsetY; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [canvasState.viewport]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !roughCanvasRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Apply viewport transformation
    ctx.save();
    ctx.translate(canvasState.viewport.offsetX, canvasState.viewport.offsetY);
    ctx.scale(canvasState.viewport.zoom, canvasState.viewport.zoom);

    // Sort shapes by zIndex
    const sortedShapes = [...canvasState.shapes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Draw all shapes
    sortedShapes.forEach(shape => {
      drawShape(ctx, shape, roughCanvasRef.current);

      // Draw selection box for selected shape
      // Selection box is now handled by ShapeEditor overlay
      // if (shape.selected) {
      //   const bounds = getShapeBounds(shape);
      //   drawSelectionBox(ctx, bounds.x, bounds.y, bounds.width, bounds.height, canvasState.viewport.zoom);
      // }
    });

    ctx.restore();
  }, [canvasState, drawGrid]);

  const getMousePos = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getCanvasMousePos = (e: React.MouseEvent): Point => {
    const screenPos = getMousePos(e);
    return screenToCanvas(screenPos.x, screenPos.y);
  };

  const createShape = (startPoint: Point, tool: Tool): Shape => {
    const baseShape = {
      id: generateId(),
      type: tool,
      x: startPoint.x,
      y: startPoint.y,
      width: 0,
      height: 0,
      strokeColor: canvasState.strokeColor,
      fillColor: canvasState.fillColor,
      strokeWidth: canvasState.strokeWidth,
      roughness: canvasState.roughness
    };

    switch (tool) {
      case 'pen':
        return {
          ...baseShape,
          type: 'pen',
          points: [startPoint]
        } as Shape;
      case 'line':
      case 'arrow':
        return {
          ...baseShape,
          type: tool,
          endX: startPoint.x,
          endY: startPoint.y
        } as Shape;
      case 'text':
        return {
          ...baseShape,
          type: 'text',
          text: '',
          fontSize: canvasState.fontSize,
          fontFamily: canvasState.fontFamily
        } as Shape;
      default:
        return baseShape as Shape;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default browser behavior (focus shifting, text selection, etc.)
    // This is crucial to prevent the input from being blurred immediately after creation
    e.preventDefault();

    const screenPoint = getMousePos(e);
    const canvasPoint = getCanvasMousePos(e);

    // Handle panning with middle mouse button or space+click
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setPanStart(screenPoint);
      return;
    }

    if (canvasState.currentTool === 'select') {
      const clickedShape = getShapeAtPoint(canvasPoint, canvasState.shapes);

      if (clickedShape) {
        // Select the shape and prepare for dragging
        const newState = {
          ...canvasState,
          shapes: canvasState.shapes.map(shape => ({
            ...shape,
            selected: shape.id === clickedShape.id
          })),
          selectedShapeId: clickedShape.id
        };
        onCanvasStateChange(newState);
        setIsDragging(true);
        setDragStart(canvasPoint);
      } else {
        // Check if clicking on empty space - start panning
        setIsPanning(true);
        setPanStart(screenPoint);

        // Deselect all shapes
        const newState = {
          ...canvasState,
          shapes: canvasState.shapes.map(shape => ({
            ...shape,
            selected: false
          })),
          selectedShapeId: null
        };
        onCanvasStateChange(newState);
      }
    } else if (canvasState.currentTool === 'text') {
      setTextInput({ x: canvasPoint.x, y: canvasPoint.y, visible: true });
    } else {
      // Start drawing a new shape
      const newShape = createShape(canvasPoint, canvasState.currentTool);
      setCurrentShape(newShape);
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const screenPoint = getMousePos(e);
    const canvasPoint = getCanvasMousePos(e);

    if (isPanning && panStart) {
      // Handle panning
      const deltaX = screenPoint.x - panStart.x;
      const deltaY = screenPoint.y - panStart.y;
      onPan(deltaX, deltaY);
      setPanStart(screenPoint);
    } else if (isDragging && dragStart && canvasState.selectedShapeId) {
      // Move selected shape
      const deltaX = canvasPoint.x - dragStart.x;
      const deltaY = canvasPoint.y - dragStart.y;

      const newState = {
        ...canvasState,
        shapes: canvasState.shapes.map(shape =>
          shape.id === canvasState.selectedShapeId
            ? moveShape(shape, deltaX, deltaY)
            : shape
        )
      };
      onCanvasStateChange(newState);
      setDragStart(canvasPoint);
    } else if (isDrawing && currentShape) {
      // Update current shape being drawn
      let updatedShape: Shape;

      switch (currentShape.type) {
        case 'pen':
          updatedShape = {
            ...currentShape,
            points: [...currentShape.points, canvasPoint]
          };
          break;
        case 'rectangle':
        case 'circle':
          updatedShape = {
            ...currentShape,
            width: canvasPoint.x - currentShape.x,
            height: canvasPoint.y - currentShape.y
          };
          break;
        case 'line':
        case 'arrow':
          updatedShape = {
            ...currentShape,
            endX: canvasPoint.x,
            endY: canvasPoint.y
          };
          break;
        default:
          updatedShape = currentShape;
          break;
      }

      setCurrentShape(updatedShape);

      // Redraw canvas with current shape
      redrawCanvas();

      // Draw the current shape being created
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && roughCanvasRef.current) {
        ctx.save();
        ctx.translate(canvasState.viewport.offsetX, canvasState.viewport.offsetY);
        ctx.scale(canvasState.viewport.zoom, canvasState.viewport.zoom);
        drawShape(ctx, updatedShape, roughCanvasRef.current);
        ctx.restore();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentShape) {
      // Add the completed shape to the canvas
      const newState = {
        ...canvasState,
        shapes: [...canvasState.shapes, currentShape]
      };
      onCanvasStateChange(newState);
      setCurrentShape(null);
    }

    setIsDrawing(false);
    setIsDragging(false);
    setIsPanning(false);
    setDragStart(null);
    setPanStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Check if this is a pinch gesture (ctrlKey is set on trackpad pinch)
    if (e.ctrlKey) {
      // Zoom gesture
      const screenPoint = getMousePos(e);
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      onZoom(zoomDelta, screenPoint.x, screenPoint.y);
    } else {
      // Pan gesture (two-finger scroll)
      onPan(-e.deltaX, -e.deltaY);
    }
  };

  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: React.TouchList): Point => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      // Single touch - treat like mouse down
      const touch = e.touches[0];
      const mockEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        ctrlKey: false
      } as React.MouseEvent;
      handleMouseDown(mockEvent);
    } else if (e.touches.length === 2) {
      // Two finger touch - prepare for pan/zoom
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      const center = getTouchCenter(e.touches);
      setPanStart(center);
      setIsPanning(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && !isPanning) {
      // Single touch move - treat like mouse move
      const touch = e.touches[0];
      const mockEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      } as React.MouseEvent;
      handleMouseMove(mockEvent);
    } else if (e.touches.length === 2) {
      // Two finger gesture
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);

      if (lastTouchDistance && panStart) {
        // Handle zoom
        const zoomDelta = (distance - lastTouchDistance) * 0.01;
        if (Math.abs(zoomDelta) > 0.01) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const centerX = center.x - rect.left;
            const centerY = center.y - rect.top;
            onZoom(zoomDelta, centerX, centerY);
          }
        }

        // Handle pan
        const deltaX = center.x - panStart.x;
        const deltaY = center.y - panStart.y;
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          onPan(deltaX, deltaY);
          setPanStart(center);
        }
      }

      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 0) {
      // All touches ended
      handleMouseUp();
      setLastTouchDistance(null);
    } else if (e.touches.length === 1) {
      // One finger remaining - reset two-finger state
      setLastTouchDistance(null);
      setIsPanning(false);
      setPanStart(null);
    }
  };

  const textInputRef = useRef<HTMLInputElement>(null);

  // Focus text input when it becomes visible
  useEffect(() => {
    if (textInput.visible && textInputRef.current) {
      // Use setTimeout to ensure focus happens after any native events have settled
      // and asking browser to focus on the next tick
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 10);
    }
  }, [textInput.visible]);

  const handleTextSubmit = (text: string) => {
    if (text.trim()) {
      const newId = generateId();
      
      const textShape: Shape = {
        id: newId,
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        width: text.length * canvasState.fontSize * 0.6, // Approximate width
        height: canvasState.fontSize,
        strokeColor: canvasState.strokeColor,
        fillColor: canvasState.fillColor,
        strokeWidth: canvasState.strokeWidth,
        roughness: canvasState.roughness,
        text,
        fontSize: canvasState.fontSize,
        fontFamily: canvasState.fontFamily,
        zIndex: (canvasState.shapes.length > 0 
          ? Math.max(...canvasState.shapes.map(s => s.zIndex || 0)) + 1 
          : 0)
      } as Shape;
      
      const newState = {
        ...canvasState,
        shapes: [...canvasState.shapes, textShape]
      };
      onCanvasStateChange(newState);
    }
    
    setTextInput({ x: 0, y: 0, visible: false });
  };
  
  // Attach non-passive event listeners for wheel and touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const options = { passive: false };

    canvas.addEventListener('wheel', handleWheel as any, options);
    canvas.addEventListener('touchstart', handleTouchStart as any, options);
    canvas.addEventListener('touchmove', handleTouchMove as any, options);
    canvas.addEventListener('touchend', handleTouchEnd as any, options);

    return () => {
      canvas.removeEventListener('wheel', handleWheel as any);
      canvas.removeEventListener('touchstart', handleTouchStart as any);
      canvas.removeEventListener('touchmove', handleTouchMove as any);
      canvas.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);


// ... (existing imports)

// Inside Canvas component, before return:

  const handleResizeShape = useCallback((shape: Shape, newBounds: any) => {
    const newState = {
      ...canvasState,
      shapes: canvasState.shapes.map(s => 
        s.id === shape.id ? resizeShape(s, newBounds) : s
      )
    };
    onCanvasStateChange(newState);
  }, [canvasState, onCanvasStateChange]);

  const handleRotateShape = useCallback((shape: Shape, rotation: number) => {
    const newState = {
      ...canvasState,
      shapes: canvasState.shapes.map(s => 
        s.id === shape.id ? rotateShape(s, rotation) : s
      )
    };
    onCanvasStateChange(newState);
  }, [canvasState, onCanvasStateChange]);

  const selectedShape = canvasState.selectedShapeId 
    ? canvasState.shapes.find(s => s.id === canvasState.selectedShapeId)
    : null;

  const inputPos = canvasToScreen(textInput.x, textInput.y);

  return (
    <div className="relative overflow-hidden">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        style={{ backgroundColor: '#1a1a1a', touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Zoom indicator */}
      <div
        className="absolute top-4 right-4 px-2 py-1 rounded text-xs"
        style={{ backgroundColor: '#2a2a2a', color: '#c0c0c0' }}
      >
        {Math.round(canvasState.viewport.zoom * 100)}%
      </div>

       {/* Shape Editor Overlay */}
      {selectedShape && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: `translate(${canvasState.viewport.offsetX}px, ${canvasState.viewport.offsetY}px) scale(${canvasState.viewport.zoom})`,
          transformOrigin: 'top left'
        }}>
          <svg style={{ overflow: 'visible' }}>
             <ShapeEditor
               shape={selectedShape}
               bounds={getShapeBounds(selectedShape)}
               zoom={canvasState.viewport.zoom}
               onResize={handleResizeShape}
               onRotate={handleRotateShape}
             />
          </svg>
        </div>
      )}

      {textInput.visible && (
        <input
          // ... (existing input props)
          ref={textInputRef}
          type="text"
          className="absolute px-2 py-1 focus:outline-none"
          style={{
            left: inputPos.x,
            top: inputPos.y,
            fontSize: canvasState.fontSize * canvasState.viewport.zoom,
            fontFamily: canvasState.fontFamily,
            minWidth: '100px',
            backgroundColor: '#404040',
            border: '1px solid #505050',
            color: '#f0f0f0',
            borderRadius: '4px',
            zIndex: 1000,
            transform: 'translateY(-50%)', // Center vertically relative to click point
            userSelect: 'text',
            WebkitUserSelect: 'text'
          }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent clicking input from triggering canvas mousedown
          onFocus={(e) => e.target.style.borderColor = '#f0f0f0'}
          onBlur={(e) => {
            e.target.style.borderColor = '#505050';
            handleTextSubmit(e.target.value);
          }}
          // Remove autoFocus as we handle it with useEffect
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTextSubmit(e.currentTarget.value);
            } else if (e.key === 'Escape') {
              setTextInput({ x: 0, y: 0, visible: false });
            }
          }}
        />
      )}
    </div>
  );
};
