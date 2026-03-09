import { useRef, useEffect, useState, memo } from "react";

interface Props {
  art: string;
  className?: string;
  artClassName?: string;
}

function ScaledArt({ art, className = "", artClassName = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    const updateScale = () => {
      // Reset scale to measure natural size
      pre.style.transform = "scale(1)";
      const artWidth = pre.scrollWidth;
      const artHeight = pre.scrollHeight;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (artWidth === 0 || artHeight === 0) return;

      const s = Math.min(containerWidth / artWidth, containerHeight / artHeight, 1);
      setScale(s);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
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
      >
        {art}
      </pre>
    </div>
  );
}

export default memo(ScaledArt);
