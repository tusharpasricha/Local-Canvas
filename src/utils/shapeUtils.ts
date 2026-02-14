import type { Shape, Point, BoundingBox } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getShapeBounds = (shape: Shape): BoundingBox => {
  switch (shape.type) {
    case 'pen': {
      if (shape.points.length === 0) {
        return { x: shape.x, y: shape.y, width: 0, height: 0 };
      }
      const xs = shape.points.map(p => p.x);
      const ys = shape.points.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }
    case 'line':
    case 'arrow': {
      const minX2 = Math.min(shape.x, shape.endX);
      const maxX2 = Math.max(shape.x, shape.endX);
      const minY2 = Math.min(shape.y, shape.endY);
      const maxY2 = Math.max(shape.y, shape.endY);
      return {
        x: minX2,
        y: minY2,
        width: maxX2 - minX2,
        height: maxY2 - minY2
      };
    }
    default:
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
      };
  }
};

export const isPointInShape = (point: Point, shape: Shape): boolean => {
  const bounds = getShapeBounds(shape);
  const padding = 5; // Add some padding for easier selection
  
  if (shape.rotation) {
    // Calculate center
    let centerX = shape.x + shape.width / 2;
    let centerY = shape.y + shape.height / 2;

    if (shape.type === 'line' || shape.type === 'arrow') {
        centerX = bounds.x + bounds.width / 2;
        centerY = bounds.y + bounds.height / 2;
    } else if (shape.type === 'pen') {
        centerX = bounds.x + bounds.width / 2;
        centerY = bounds.y + bounds.height / 2;
    }

    // Rotate point around center by -rotation
    const cos = Math.cos(-shape.rotation);
    const sin = Math.sin(-shape.rotation);
    const dx = point.x - centerX;
    const dy = point.y - centerY;

    const rotatedX = centerX + (dx * cos - dy * sin);
    const rotatedY = centerY + (dx * sin + dy * cos);

    // Check if rotated point is in bounds
    return (
        rotatedX >= bounds.x - padding &&
        rotatedX <= bounds.x + bounds.width + padding &&
        rotatedY >= bounds.y - padding &&
        rotatedY <= bounds.y + bounds.height + padding
      );
  }

  return (
    point.x >= bounds.x - padding &&
    point.x <= bounds.x + bounds.width + padding &&
    point.y >= bounds.y - padding &&
    point.y <= bounds.y + bounds.height + padding
  );
};

export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const moveShape = (shape: Shape, deltaX: number, deltaY: number): Shape => {
  switch (shape.type) {
    case 'pen':
      return {
        ...shape,
        x: shape.x + deltaX,
        y: shape.y + deltaY,
        points: shape.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }))
      };
    case 'line':
    case 'arrow':
      return {
        ...shape,
        x: shape.x + deltaX,
        y: shape.y + deltaY,
        endX: shape.endX + deltaX,
        endY: shape.endY + deltaY
      };
    case 'rectangle':
    case 'circle':
    case 'text':
      return {
        ...shape,
        x: shape.x + deltaX,
        y: shape.y + deltaY
      };
    default:
      return shape;
  }
};

export const resizeShape = (shape: Shape, newBounds: BoundingBox): Shape => {
  const oldBounds = getShapeBounds(shape);
  
  // Avoid division by zero
  const oldWidth = Math.max(oldBounds.width, 0.1);
  const oldHeight = Math.max(oldBounds.height, 0.1);
  
  const scaleX = newBounds.width / oldWidth;
  const scaleY = newBounds.height / oldHeight;

  switch (shape.type) {
    case 'pen':
      return {
        ...shape,
        x: newBounds.x,
        y: newBounds.y,
        width: newBounds.width,
        height: newBounds.height,
        points: shape.points.map(p => ({
          x: newBounds.x + (p.x - oldBounds.x) * scaleX,
          y: newBounds.y + (p.y - oldBounds.y) * scaleY
        }))
      };
    case 'line':
    case 'arrow':
      return {
        ...shape,
        x: newBounds.x + (shape.x - oldBounds.x) * scaleX,
        y: newBounds.y + (shape.y - oldBounds.y) * scaleY,
        endX: newBounds.x + (shape.endX - oldBounds.x) * scaleX,
        endY: newBounds.y + (shape.endY - oldBounds.y) * scaleY,
        width: newBounds.width,
        height: newBounds.height
      };
    case 'rectangle':
    case 'circle':
    case 'text':
      return {
        ...shape,
        x: newBounds.x,
        y: newBounds.y,
        width: newBounds.width,
        height: newBounds.height
      };
    default:
      return shape;
  }
};

export const rotateShape = (shape: Shape, rotation: number): Shape => {
  return {
    ...shape,
    rotation: rotation
  };
};

export const getShapeAtPoint = (point: Point, shapes: Shape[]): Shape | null => {
  // Search from top to bottom (reverse order)
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (isPointInShape(point, shapes[i])) {
      return shapes[i];
    }
  }
  return null;
};
