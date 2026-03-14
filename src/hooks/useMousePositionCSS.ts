import { useEffect } from "react";

export default function useMousePositionCSS() {
  useEffect(() => {
    let frame: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--mouseX", `${e.clientX}px`);
        document.documentElement.style.setProperty("--mouseY", `${e.clientY}px`);
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);
}