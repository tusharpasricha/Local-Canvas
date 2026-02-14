import React from 'react';
import type { Tool, CanvasState } from '../types';
import { ExportMenu } from './ExportMenu';

interface ToolbarProps {
  canvasState: CanvasState;
  onToolChange: (tool: Tool) => void;
  onStrokeColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onRoughnessChange: (roughness: number) => void;
  onFontSizeChange: (fontSize: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
  onImport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const toolIcons: Record<Tool, JSX.Element> = {
  select: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>,
  pen: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>,
  rectangle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>,
  circle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>,
  line: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
  text: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4,7 4,4 20,4 20,7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
};

const toolNames: Record<Tool, string> = {
  select: 'Select',
  pen: 'Pen',
  rectangle: 'Rectangle',
  circle: 'Circle',
  line: 'Line',
  arrow: 'Arrow',
  text: 'Text'
};

export const Toolbar: React.FC<ToolbarProps> = ({
  canvasState,
  onToolChange,
  onStrokeColorChange,
  onFillColorChange,
  onStrokeWidthChange,
  onRoughnessChange,
  onFontSizeChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onImport,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onBringForward,
  onSendBackward,
  canUndo,
  canRedo
}) => {
  const tools: Tool[] = ['select', 'pen', 'rectangle', 'circle', 'line', 'arrow', 'text'];

  return (
    <div className="px-4 py-3" style={{ backgroundColor: '#2a2a2a', borderBottom: '1px solid #404040' }}>
      <div className="flex items-center justify-between">
        {/* Left side - Tools */}
        <div className="flex items-center gap-2">
          {/* Tool buttons */}
          <div className="flex items-center gap-1">
            {tools.map((tool) => (
              <button
                key={tool}
                onClick={() => onToolChange(tool)}
                className="p-2 rounded transition-colors"
                style={{
                  backgroundColor: canvasState.currentTool === tool ? '#f5f5f5' : 'transparent',
                  color: canvasState.currentTool === tool ? '#0a0a0a' : '#d0d0d0'
                }}
                onMouseEnter={(e) => {
                  if (canvasState.currentTool !== tool) {
                    e.currentTarget.style.backgroundColor = '#404040';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canvasState.currentTool !== tool) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={toolNames[tool]}
              >
                {toolIcons[tool]}
              </button>
            ))}
          </div>

          <div className="w-px h-6 mx-1" style={{ backgroundColor: '#505050' }}></div>

          {/* Stroke width */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: '#c0c0c0' }}>Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={canvasState.strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-16 h-1 rounded-lg appearance-none cursor-pointer"
              style={{ backgroundColor: '#505050' }}
            />
            <span className="text-xs w-6 text-center" style={{ color: '#a0a0a0' }}>{canvasState.strokeWidth}</span>
          </div>

          {/* Roughness */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: '#c0c0c0' }}>Rough:</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={canvasState.roughness}
              onChange={(e) => onRoughnessChange(Number(e.target.value))}
              className="w-16 h-1 rounded-lg appearance-none cursor-pointer"
              style={{ backgroundColor: '#505050' }}
            />
            <span className="text-xs w-8 text-center" style={{ color: '#a0a0a0' }}>{canvasState.roughness.toFixed(1)}</span>
          </div>

          {/* Font size for text tool */}
          {canvasState.currentTool === 'text' && (
            <div className="flex items-center gap-2">
              <label className="text-xs" style={{ color: '#c0c0c0' }}>Size:</label>
              <input
                type="number"
                min="8"
                max="72"
                value={canvasState.fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                className="w-12 px-2 py-1 rounded text-xs focus:outline-none"
                style={{
                  backgroundColor: '#404040',
                  border: '1px solid #505050',
                  color: '#f0f0f0'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f0f0f0'}
                onBlur={(e) => e.target.style.borderColor = '#505050'}
              />
            </div>
          )}
        </div>

        {/* Center - Colors - Monochromatic Only */}
        <div className="flex items-center gap-3">
          {/* Stroke shade */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: '#c0c0c0' }}>Stroke:</label>
            <div className="flex gap-1">
              {['#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'].map((shade) => (
                <button
                  key={shade}
                  onClick={() => onStrokeColorChange(shade)}
                  className="w-6 h-6 rounded border-2 cursor-pointer transition-all"
                  style={{
                    backgroundColor: shade,
                    borderColor: canvasState.strokeColor === shade ? '#f0f0f0' : '#505050'
                  }}
                  title={`Stroke: ${shade}`}
                />
              ))}
            </div>
          </div>

          {/* Fill shade */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: '#c0c0c0' }}>Fill:</label>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {['#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'].map((shade) => (
                  <button
                    key={shade}
                    onClick={() => onFillColorChange(shade)}
                    className="w-6 h-6 rounded border-2 cursor-pointer transition-all"
                    style={{
                      backgroundColor: shade,
                      borderColor: canvasState.fillColor === shade ? '#f0f0f0' : '#505050'
                    }}
                    title={`Fill: ${shade}`}
                  />
                ))}
              </div>
              <button
                onClick={() => onFillColorChange('transparent')}
                className="px-2 py-1 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: canvasState.fillColor === 'transparent' ? '#f0f0f0' : '#404040',
                  color: canvasState.fillColor === 'transparent' ? '#0a0a0a' : '#c0c0c0',
                  borderColor: '#505050'
                }}
                onMouseEnter={(e) => {
                  if (canvasState.fillColor !== 'transparent') {
                    e.currentTarget.style.backgroundColor = '#505050';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canvasState.fillColor !== 'transparent') {
                    e.currentTarget.style.backgroundColor = '#404040';
                  }
                }}
                title="No Fill"
              >
                None
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded transition-colors"
            style={{
              color: canUndo ? '#d0d0d0' : '#606060',
              cursor: canUndo ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = '#404040';
              }
            }}
            onMouseLeave={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            title="Undo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6"/>
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded transition-colors"
            style={{
              color: canRedo ? '#d0d0d0' : '#606060',
              cursor: canRedo ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => {
              if (canRedo) {
                e.currentTarget.style.backgroundColor = '#404040';
              }
            }}
            onMouseLeave={(e) => {
              if (canRedo) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            title="Redo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6"/>
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3-2.3"/>
            </svg>
          </button>

          <div className="w-px h-6 mx-1" style={{ backgroundColor: '#505050' }}></div>

          <button
            onClick={onClear}
            className="p-2 rounded transition-colors"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Clear"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
            </svg>
          </button>

          <ExportMenu onExport={onExport} />

          <button
            onClick={onImport}
            className="p-2 rounded transition-colors"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Import"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </button>

          <div className="w-px h-6 mx-1" style={{ backgroundColor: '#505050' }}></div>

          {/* Zoom Controls */}
          <button
            onClick={onZoomOut}
            className="p-2 rounded transition-colors"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Zoom Out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          <button
            onClick={onZoomReset}
            className="px-2 py-1 rounded transition-colors text-xs"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Reset Zoom"
          >
            {Math.round(canvasState.viewport.zoom * 100)}%
          </button>

          <button
            onClick={onZoomIn}
            className="p-2 rounded transition-colors"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Zoom In"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          {/* Layer Controls - only show when shape is selected */}
          {canvasState.selectedShapeId && (
            <>
              <div className="w-px h-6 mx-1" style={{ backgroundColor: '#505050' }}></div>

              <button
                onClick={onBringForward}
                className="p-2 rounded transition-colors"
                style={{ color: '#d0d0d0' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#404040';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Bring Forward"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="17,11 21,7 17,3"/>
                  <line x1="21" y1="7" x2="9" y2="7"/>
                  <polyline points="13,21 9,17 13,13"/>
                  <line x1="9" y1="17" x2="21" y2="17"/>
                </svg>
              </button>

              <button
                onClick={onSendBackward}
                className="p-2 rounded transition-colors"
                style={{ color: '#d0d0d0' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#404040';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Send Backward"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="7,11 3,7 7,3"/>
                  <line x1="3" y1="7" x2="15" y2="7"/>
                  <polyline points="11,21 15,17 11,13"/>
                  <line x1="15" y1="17" x2="3" y2="17"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
