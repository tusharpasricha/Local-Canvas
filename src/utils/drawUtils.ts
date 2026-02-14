import type { Shape } from '../types';

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  roughCanvas: any
): void => {
  ctx.save();
  
  const options = {
    stroke: shape.strokeColor,
    fill: shape.fillColor,
    strokeWidth: shape.strokeWidth,
    roughness: shape.roughness,
    fillStyle: 'solid' as const
  };

  if (shape.rotation) {

    
    // Calculate center based on shape type
    let centerX = shape.x + shape.width / 2;
    let centerY = shape.y + shape.height / 2;

    if (shape.type === 'line' || shape.type === 'arrow') {
        centerX = (shape.x + shape.endX) / 2;
        centerY = (shape.y + shape.endY) / 2;
    } else if (shape.type === 'pen') {
        const xs = shape.points.map(p => p.x);
        const ys = shape.points.map(p => p.y);
        centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
        centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
    }

    ctx.translate(centerX, centerY);
    ctx.rotate(shape.rotation);
    ctx.translate(-centerX, -centerY);
  }

  switch (shape.type) {
    case 'pen':
      if (shape.points.length > 1) {
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      }
      break;
      
    case 'rectangle':
      roughCanvas.rectangle(shape.x, shape.y, shape.width, shape.height, options);
      break;
      
    case 'circle': {
      const radius = Math.min(shape.width, shape.height) / 2;
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      roughCanvas.circle(centerX, centerY, radius * 2, options);
      break;
    }
      
    case 'line':
      roughCanvas.line(shape.x, shape.y, shape.endX, shape.endY, options);
      break;
      
    case 'arrow': {
      // Draw the main line
      roughCanvas.line(shape.x, shape.y, shape.endX, shape.endY, options);
      
      // Draw arrowhead
      const angle = Math.atan2(shape.endY - shape.y, shape.endX - shape.x);
      const arrowLength = 15;
      const arrowAngle = Math.PI / 6;
      
      const arrowX1 = shape.endX - arrowLength * Math.cos(angle - arrowAngle);
      const arrowY1 = shape.endY - arrowLength * Math.sin(angle - arrowAngle);
      const arrowX2 = shape.endX - arrowLength * Math.cos(angle + arrowAngle);
      const arrowY2 = shape.endY - arrowLength * Math.sin(angle + arrowAngle);
      
      roughCanvas.line(shape.endX, shape.endY, arrowX1, arrowY1, options);
      roughCanvas.line(shape.endX, shape.endY, arrowX2, arrowY2, options);
      break;
    }
      
    case 'text':
      ctx.fillStyle = shape.strokeColor;
      ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillText(shape.text, shape.x, shape.y);
      break;
  }
  
  ctx.restore();
};


