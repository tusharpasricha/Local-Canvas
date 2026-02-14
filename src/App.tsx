import React, { useRef, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { useCanvas } from './hooks/useCanvas';
import { exportToPNG, exportToSVG, exportToJSON, importFromJSON } from './utils/exportUtils';
import './styles/custom.css';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    canvasState,
    updateCanvasState,
    setCurrentTool,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
    setRoughness,
    setFontSize,
    clearCanvas,
    canUndo,
    canRedo,
    undo,
    redo,
    panViewport,
    zoomViewport,
    bringForward,
    sendBackward
  } = useCanvas();

  // Zoom control functions
  const handleZoomIn = () => {
    zoomViewport(0.1);
  };

  const handleZoomOut = () => {
    zoomViewport(-0.1);
  };

  const handleZoomReset = () => {
    zoomViewport(1 - canvasState.viewport.zoom);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }

      // Delete selected shape
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvasState.selectedShapeId) {
          const newState = {
            ...canvasState,
            shapes: canvasState.shapes.filter(shape => shape.id !== canvasState.selectedShapeId),
            selectedShapeId: null
          };
          updateCanvasState(newState);
        }
      }

      // Tool shortcuts
      switch (e.key) {
        case 'v':
          setCurrentTool('select');
          break;
        case 'p':
          setCurrentTool('pen');
          break;
        case 'r':
          setCurrentTool('rectangle');
          break;
        case 'c':
          setCurrentTool('circle');
          break;
        case 'l':
          setCurrentTool('line');
          break;
        case 'a':
          setCurrentTool('arrow');
          break;
        case 't':
          setCurrentTool('text');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setCurrentTool, canvasState, updateCanvasState, zoomViewport, handleZoomIn, handleZoomOut, handleZoomReset]);

  const handleExport = (format: 'png' | 'svg' | 'json') => {
    switch (format) {
      case 'png': {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          exportToPNG(canvas);
        }
        break;
      }
      case 'svg':
        exportToSVG(canvasState);
        break;
      case 'json':
        exportToJSON(canvasState);
        break;
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      try {
        const importedState = await importFromJSON(file);
        updateCanvasState(importedState);
      } catch {
        alert('Failed to import file. Please make sure it\'s a valid whiteboard JSON file.');
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [dimensions, setDimensions] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight - 64
  });

  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure layout is complete
      requestAnimationFrame(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight - 64
        });
      });
    };

    // Initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    
    // Also use ResizeObserver if available to catch container changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      <Toolbar
        canvasState={canvasState}
        onToolChange={setCurrentTool}
        onStrokeColorChange={setStrokeColor}
        onFillColorChange={setFillColor}
        onStrokeWidthChange={setStrokeWidth}
        onRoughnessChange={setRoughness}
        onFontSizeChange={setFontSize}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        onExport={handleExport}
        onImport={handleImport}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onBringForward={bringForward}
        onSendBackward={sendBackward}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex-1" style={{ backgroundColor: '#1a1a1a' }}>
        <Canvas
          canvasState={canvasState}
          onCanvasStateChange={updateCanvasState}
          onPan={panViewport}
          onZoom={zoomViewport}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default App;
