import type { CanvasState } from '../types';

const STORAGE_KEY = 'whiteboard-canvas-state';

export const saveCanvasState = (state: CanvasState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save canvas state:', error);
  }
};

export const loadCanvasState = (): CanvasState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load canvas state:', error);
    return null;
  }
};

export const clearCanvasState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear canvas state:', error);
  }
};
