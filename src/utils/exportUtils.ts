import type { CanvasState, ExportOptions } from '../types';

export const exportToPNG = (
  canvas: HTMLCanvasElement,
  options: ExportOptions = { format: 'png' }
): void => {
  const link = document.createElement('a');
  link.download = `whiteboard-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png', options.quality || 1.0);
  link.click();
};

export const exportToSVG = (canvasState: CanvasState): void => {
  // Create SVG content
  const shapes = canvasState.shapes;
  if (shapes.length === 0) return;
  
  // Calculate canvas bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  shapes.forEach(shape => {
    switch (shape.type) {
      case 'pen':
        shape.points.forEach(point => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
        break;
      case 'line':
      case 'arrow':
        minX = Math.min(minX, shape.x, shape.endX);
        minY = Math.min(minY, shape.y, shape.endY);
        maxX = Math.max(maxX, shape.x, shape.endX);
        maxY = Math.max(maxY, shape.y, shape.endY);
        break;
      default:
        minX = Math.min(minX, shape.x);
        minY = Math.min(minY, shape.y);
        maxX = Math.max(maxX, shape.x + shape.width);
        maxY = Math.max(maxY, shape.y + shape.height);
    }
  });
  
  const padding = 20;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  
  let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  shapes.forEach(shape => {
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;
    
    switch (shape.type) {
      case 'rectangle':
        svgContent += `<rect x="${shape.x + offsetX}" y="${shape.y + offsetY}" width="${shape.width}" height="${shape.height}" stroke="${shape.strokeColor}" fill="${shape.fillColor}" stroke-width="${shape.strokeWidth}"/>`;
        break;
      case 'circle': {
        const radius = Math.min(shape.width, shape.height) / 2;
        const centerX = shape.x + shape.width / 2 + offsetX;
        const centerY = shape.y + shape.height / 2 + offsetY;
        svgContent += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="${shape.strokeColor}" fill="${shape.fillColor}" stroke-width="${shape.strokeWidth}"/>`;
        break;
      }
      case 'line':
        svgContent += `<line x1="${shape.x + offsetX}" y1="${shape.y + offsetY}" x2="${shape.endX + offsetX}" y2="${shape.endY + offsetY}" stroke="${shape.strokeColor}" stroke-width="${shape.strokeWidth}"/>`;
        break;
      case 'text':
        svgContent += `<text x="${shape.x + offsetX}" y="${shape.y + offsetY}" font-family="${shape.fontFamily}" font-size="${shape.fontSize}" fill="${shape.strokeColor}">${shape.text}</text>`;
        break;
      case 'pen':
        if (shape.points.length > 1) {
          const pathData = `M ${shape.points[0].x + offsetX} ${shape.points[0].y + offsetY} ` +
            shape.points.slice(1).map(p => `L ${p.x + offsetX} ${p.y + offsetY}`).join(' ');
          svgContent += `<path d="${pathData}" stroke="${shape.strokeColor}" fill="none" stroke-width="${shape.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        break;
    }
  });
  
  svgContent += '</svg>';
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = `whiteboard-${Date.now()}.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToJSON = (canvasState: CanvasState): void => {
  const jsonContent = JSON.stringify(canvasState, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = `whiteboard-${Date.now()}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
};

export const importFromJSON = (file: File): Promise<CanvasState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedState = JSON.parse(content);
        
        // Ensure viewport exists to prevent crashes
        if (!parsedState.viewport) {
          parsedState.viewport = {
            offsetX: 0,
            offsetY: 0,
            zoom: 1
          };
        }
        
        resolve(parsedState);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
