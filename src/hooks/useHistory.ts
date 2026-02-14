import { useState, useCallback } from 'react';
import type { CanvasState, HistoryState } from '../types';

const MAX_HISTORY_SIZE = 50;

export const useHistory = (initialState: CanvasState) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: []
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const pushToHistory = useCallback((newState: CanvasState) => {
    setHistory(prev => {
      const newPast = [...prev.past, prev.present];
      
      // Limit history size
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      
      return {
        past: newPast,
        present: newState,
        future: [] // Clear future when new action is performed
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return history.present;
    
    setHistory(prev => {
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      };
    });
    
    return history.past[history.past.length - 1];
  }, [canUndo, history.past, history.present]);

  const redo = useCallback(() => {
    if (!canRedo) return history.present;
    
    setHistory(prev => {
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
    
    return history.future[0];
  }, [canRedo, history.future, history.present]);

  const clearHistory = useCallback(() => {
    setHistory({
      past: [],
      present: initialState,
      future: []
    });
  }, [initialState]);

  const replacePresent = useCallback((newState: CanvasState) => {
    setHistory(prev => ({
      ...prev,
      present: newState
    }));
  }, []);

  return {
    present: history.present,
    canUndo,
    canRedo,
    pushToHistory,
    undo,
    redo,
    clearHistory,
    replacePresent
  };
};
