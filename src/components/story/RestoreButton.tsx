"use client";

export function RestoreButton({ onRestore }: { onRestore: () => void }) {
  return (
    <button type="button" onClick={onRestore} className="btn btn-ghost" data-cursor="hover">
      Switch to 3D view
    </button>
  );
}
