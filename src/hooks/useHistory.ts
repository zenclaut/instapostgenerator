import { useState, useCallback, useEffect, useRef } from 'react';

export interface HistoryOptions {
  maxHistory?: number;
}

export interface UseHistoryReturn<T> {
  state: T;
  set: (nextStateOrFn: T | ((prev: T) => T), recordHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pastCount: number;
  futureCount: number;
  reset: (newState: T) => void;
  startTransaction: () => void;
  commitTransaction: () => void;
  cancelTransaction: () => void;
}

export function useHistory<T>(initialPresent: T, options: HistoryOptions = {}): UseHistoryReturn<T> {
  const { maxHistory = 30 } = options;

  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);

  // Sürükleme veya çok adımlı işlemler için işlem başlangıcı anlık görüntüsü
  const transactionSnapshotRef = useRef<T | null>(null);

  // Güncel present referansı (stale closure önleme)
  const presentRef = useRef<T>(present);
  presentRef.current = present;

  const pastRef = useRef<T[]>(past);
  pastRef.current = past;

  const futureRef = useRef<T[]>(future);
  futureRef.current = future;

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Yeni durum atama
  const set = useCallback((nextStateOrFn: T | ((prev: T) => T), recordHistory: boolean = true) => {
    setPresent((prevPresent) => {
      const nextPresent = typeof nextStateOrFn === 'function'
        ? (nextStateOrFn as (prev: T) => T)(prevPresent)
        : nextStateOrFn;

      if (prevPresent === nextPresent) return prevPresent;

      if (recordHistory) {
        setPast((prevPast) => {
          const updatedPast = [...prevPast, prevPresent];
          if (updatedPast.length > maxHistory) {
            return updatedPast.slice(updatedPast.length - maxHistory);
          }
          return updatedPast;
        });
        setFuture([]);
      }

      return nextPresent;
    });
  }, [maxHistory]);

  // Geri Al (Undo)
  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;

    const previous = pastRef.current[pastRef.current.length - 1];
    const newPast = pastRef.current.slice(0, pastRef.current.length - 1);

    setPast(newPast);
    setFuture((prevFuture) => [presentRef.current, ...prevFuture]);
    setPresent(previous);
  }, []);

  // İleri Al (Redo)
  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;

    const next = futureRef.current[0];
    const newFuture = futureRef.current.slice(1);

    setPast((prevPast) => [...prevPast, presentRef.current]);
    setFuture(newFuture);
    setPresent(next);
  }, []);

  // Geçmişi Sıfırla
  const reset = useCallback((newState: T) => {
    setPast([]);
    setPresent(newState);
    setFuture([]);
    transactionSnapshotRef.current = null;
  }, []);

  // Sürükleme başlangıcında çağrılır
  const startTransaction = useCallback(() => {
    transactionSnapshotRef.current = JSON.parse(JSON.stringify(presentRef.current));
  }, []);

  // Sürükleme bittiğinde çağrılır: Başlangıç ile bitiş farklıysa tek bir hamle olarak geçmişe ekler
  const commitTransaction = useCallback(() => {
    if (!transactionSnapshotRef.current) return;
    const initial = transactionSnapshotRef.current;
    const current = presentRef.current;
    transactionSnapshotRef.current = null;

    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      setPast((prevPast) => {
        const updatedPast = [...prevPast, initial];
        if (updatedPast.length > maxHistory) {
          return updatedPast.slice(updatedPast.length - maxHistory);
        }
        return updatedPast;
      });
      setFuture([]);
    }
  }, [maxHistory]);

  // İşlemi iptal edip başlangıç anına dön
  const cancelTransaction = useCallback(() => {
    if (transactionSnapshotRef.current) {
      setPresent(transactionSnapshotRef.current);
      transactionSnapshotRef.current = null;
    }
  }, []);

  // Klavye Kısayolları (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Cmd+Z, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Form alanlarında (input, textarea veya contenteditable) metin içi standart undo/redo'yu engelleme
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && !isInput) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    pastCount: past.length,
    futureCount: future.length,
    reset,
    startTransaction,
    commitTransaction,
    cancelTransaction
  };
}
