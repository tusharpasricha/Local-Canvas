import { useState, useCallback, useEffect } from 'react';
import type { CanvasState, Tool, Shape } from '../types';
import { saveCanvasState, loadCanvasState } from '../utils/storageUtils';
import { useHistory } from './useHistory';

const initialCanvasState: CanvasState = {
  shapes: [],
  selectedShapeId: null,
  currentTool: 'pen',
  strokeColor: '#ffffff',
  fillColor: 'transparent',
  strokeWidth: 2,
  roughness: 0,
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
  viewport: {
    offsetX: 0,
    offsetY: 0,
    zoom: 1
  }
};

export const useCanvas = () => {
  const [initialState, setInitialState] = useState<CanvasState>(initialCanvasState);
  const {
    present: canvasState,
    canUndo,
    canRedo,
    pushToHistory,
    undo,
    redo,
    replacePresent
  } = useHistory(initialState);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadCanvasState();
    if (savedState) {
      // Merge saved state with initial state to ensure all fields are present
      // This handles cases where new fields (like viewport) were added after the user saved their state
      const mergedState: CanvasState = {
        ...initialCanvasState,
        ...savedState,
        viewport: {
          ...initialCanvasState.viewport,
          ...(savedState.viewport || {})
        }
      };
      
      setInitialState(mergedState);
      replacePresent(mergedState);
    }
  }, [replacePresent]);

  // Auto-save state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCanvasState(canvasState);
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [canvasState]);

  const updateCanvasState = useCallback((newState: CanvasState) => {
    pushToHistory(newState);
  }, [pushToHistory]);

  const setCurrentTool = useCallback((tool: Tool) => {
    const newState = {
      ...canvasState,
      currentTool: tool,
      selectedShapeId: null,
      shapes: canvasState.shapes.map(shape => ({ ...shape, selected: false }))
    };
    replacePresent(newState); // Don't add tool changes to history
  }, [canvasState, replacePresent]);

  const setStrokeColor = useCallback((color: string) => {
    const newState = { ...canvasState, strokeColor: color };
    replacePresent(newState); // Don't add color changes to history
  }, [canvasState, replacePresent]);

  const setFillColor = useCallback((color: string) => {
    const newState = { ...canvasState, fillColor: color };
    replacePresent(newState); // Don't add color changes to history
  }, [canvasState, replacePresent]);

  const setStrokeWidth = useCallback((width: number) => {
    const newState = { ...canvasState, strokeWidth: width };
    replacePresent(newState); // Don't add width changes to history
  }, [canvasState, replacePresent]);

  const setRoughness = useCallback((roughness: number) => {
    const newState = { ...canvasState, roughness: roughness };
    replacePresent(newState); // Don't add roughness changes to history
  }, [canvasState, replacePresent]);

  const setFontSize = useCallback((fontSize: number) => {
    const newState = { ...canvasState, fontSize };
    replacePresent(newState); // Don't add font size changes to history
  }, [canvasState, replacePresent]);

  const clearCanvas = useCallback(() => {
    const newState = {
      ...canvasState,
      shapes: [],
      selectedShapeId: null
    };
    pushToHistory(newState); // Add clear action to history
  }, [canvasState, pushToHistory]);

  const deleteSelectedShape = useCallback(() => {
    if (canvasState.selectedShapeId) {
      const newState = {
        ...canvasState,
        shapes: canvasState.shapes.filter(shape => shape.id !== canvasState.selectedShapeId),
        selectedShapeId: null
      };
      pushToHistory(newState); // Add delete action to history
    }
  }, [canvasState, pushToHistory]);

  const duplicateSelectedShape = useCallback(() => {
    if (canvasState.selectedShapeId) {
      const selectedShape = canvasState.shapes.find(shape => shape.id === canvasState.selectedShapeId);
      if (selectedShape) {
        const duplicatedShape: Shape = {
          ...selectedShape,
          id: Math.random().toString(36).substr(2, 9),
          x: selectedShape.x + 20,
          y: selectedShape.y + 20,
          selected: false
        };

        const newState = {
          ...canvasState,
          shapes: [...canvasState.shapes.map(shape => ({ ...shape, selected: false })), duplicatedShape],
          selectedShapeId: duplicatedShape.id
        };
        pushToHistory(newState); // Add duplicate action to history
      }
    }
  }, [canvasState, pushToHistory]);

  const undoAction = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      replacePresent(previousState);
    }
  }, [undo, replacePresent]);

  const redoAction = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      replacePresent(nextState);
    }
  }, [redo, replacePresent]);

  const setViewport = useCallback((viewport: Partial<{ offsetX: number; offsetY: number; zoom: number }>) => {
    const newState = {
      ...canvasState,
      viewport: {
        ...canvasState.viewport,
        ...viewport
      }
    };
    replacePresent(newState); // Don't add viewport changes to history
  }, [canvasState, replacePresent]);

  const panViewport = useCallback((deltaX: number, deltaY: number) => {
    setViewport({
      offsetX: canvasState.viewport.offsetX + deltaX,
      offsetY: canvasState.viewport.offsetY + deltaY
    });
  }, [canvasState.viewport, setViewport]);

  const zoomViewport = useCallback((zoomDelta: number, centerX?: number, centerY?: number) => {
    const newZoom = Math.max(0.1, Math.min(5, canvasState.viewport.zoom + zoomDelta));

    if (centerX !== undefined && centerY !== undefined) {
      // Zoom towards a specific point
      const zoomRatio = newZoom / canvasState.viewport.zoom;
      const newOffsetX = centerX - (centerX - canvasState.viewport.offsetX) * zoomRatio;
      const newOffsetY = centerY - (centerY - canvasState.viewport.offsetY) * zoomRatio;

      setViewport({
        zoom: newZoom,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      });
    } else {
      setViewport({ zoom: newZoom });
    }
  }, [canvasState.viewport, setViewport]);

  const bringForward = useCallback(() => {
    if (canvasState.selectedShapeId) {
      const newState = {
        ...canvasState,
        shapes: canvasState.shapes.map(shape =>
          shape.id === canvasState.selectedShapeId
            ? { ...shape, zIndex: (shape.zIndex || 0) + 1 }
            : shape
        )
      };
      pushToHistory(newState);
    }
  }, [canvasState, pushToHistory]);

  const sendBackward = useCallback(() => {
    if (canvasState.selectedShapeId) {
      const newState = {
        ...canvasState,
        shapes: canvasState.shapes.map(shape =>
          shape.id === canvasState.selectedShapeId
            ? { ...shape, zIndex: Math.max(0, (shape.zIndex || 0) - 1) }
            : shape
        )
      };
      pushToHistory(newState);
    }
  }, [canvasState, pushToHistory]);

  return {
    canvasState,
    updateCanvasState,
    setCurrentTool,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
    setRoughness,
    setFontSize,
    clearCanvas,
    deleteSelectedShape,
    duplicateSelectedShape,
    canUndo,
    canRedo,
    undo: undoAction,
    redo: redoAction,
    setViewport,
    panViewport,
    zoomViewport,
    bringForward,
    sendBackward
  };
};
