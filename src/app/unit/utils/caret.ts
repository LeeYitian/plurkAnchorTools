export function getCaretPosition(x: number, y: number) {
  // Firefox
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    return {
      offsetNode: pos.offsetNode,
      offset: pos.offset,
    };
  }

  // Chrome / Safari 舊版
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;
    return {
      offsetNode: range.startContainer,
      offset: range.startOffset,
    };
  }

  return null;
}
