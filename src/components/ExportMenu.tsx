import React, { useState, useRef, useEffect } from 'react';

interface ExportMenuProps {
  onExport: (format: 'png' | 'svg' | 'json') => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = (format: 'png' | 'svg' | 'json') => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded transition-colors"
        style={{ color: '#d0d0d0' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#404040';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Export"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-32 rounded shadow-lg z-20 overflow-hidden"
          style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #505050'
          }}
        >
          <button
            onClick={() => handleExport('png')}
            className="w-full px-3 py-2 text-left text-xs transition-colors"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            PNG
          </button>
          <button
            onClick={() => handleExport('svg')}
            className="w-full px-3 py-2 text-left text-xs transition-colors"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            SVG
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full px-3 py-2 text-left text-xs transition-colors"
            style={{ color: '#d0d0d0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            JSON
          </button>
        </div>
      )}
    </div>
  );
};
