import React, { useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'lessonloom_seq_left_width';
const MIN_PX = 320;
const MAX_PX = 800;

// Applique la largeur stockée au montage et la persiste en cours d'utilisation
const useResizableLeftPanel = () => {
  useEffect(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '', 10);
    if (saved && saved >= MIN_PX && saved <= MAX_PX) {
      document.documentElement.style.setProperty('--seq-left-width', `${saved}px`);
    }
  }, []);
};

// Poignée draggable à placer entre la colonne gauche (editor-panel) et droite (preview-panel)
const ResizableGutter = () => {
  useResizableLeftPanel();
  const gutterRef = useRef(null);
  const dragRef = useRef(false);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragRef.current = true;
    gutterRef.current?.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const layout = gutterRef.current?.parentElement;
      if (!layout) return;
      const rect = layout.getBoundingClientRect();
      let w = e.clientX - rect.left;
      if (w < MIN_PX) w = MIN_PX;
      if (w > MAX_PX) w = MAX_PX;
      document.documentElement.style.setProperty('--seq-left-width', `${w}px`);
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = false;
      gutterRef.current?.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--seq-left-width'), 10);
      if (w) localStorage.setItem(STORAGE_KEY, String(w));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      ref={gutterRef}
      className="seq-layout-gutter"
      data-testid="seq-layout-gutter"
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      title="Glisser pour redimensionner — double-cliquer pour réinitialiser"
      onDoubleClick={() => {
        document.documentElement.style.setProperty('--seq-left-width', '460px');
        localStorage.setItem(STORAGE_KEY, '460');
      }}
    />
  );
};

export default ResizableGutter;
