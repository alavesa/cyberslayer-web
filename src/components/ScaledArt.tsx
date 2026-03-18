import { useRef, useEffect, useState, memo } from "react";

interface Props {
  art: string;
  className?: string;
  artClassName?: string;
}

function ScaledArt({ art, className = "", artClassName = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const rafRef = useRef<number | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    const updateScale = () => {
      // Measure using a hidden off-screen clone to avoid mutating or flickering the visible element
      const clone = pre.cloneNode(true) as HTMLPreElement;
      clone.style.cssText = "visibility:hidden;position:absolute;left:-9999px;top:-9999px;transform:none;pointer-events:none;";
      document.body.appendChild(clone);
      const artWidth = clone.scrollWidth;
      const artHeight = clone.scrollHeight;
      document.body.removeChild(clone);

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (artWidth === 0 || artHeight === 0 || containerWidth === 0 || containerHeight === 0) return;

      const s = Math.min(containerWidth / artWidth, containerHeight / artHeight, 1);
      // Always apply imperatively so the transform is correct even if React bails out of re-rendering
      pre.style.transform = `scale(${s})`;
      setScale(s);
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateScale();
      });
    };

    scheduleUpdate();

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [art]);

  return (
    <div ref={containerRef} className={`flex items-center justify-center overflow-hidden ${className}`}>
      <pre
        ref={preRef}
        className={`text-xs leading-tight font-mono whitespace-pre ${artClassName}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        aria-hidden="true"
      >
        {art}
      </pre>
    </div>
  );
}

export default memo(ScaledArt);
