"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax on mouse
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#1a120b]"
      style={{ cursor: "default" }}
    >
      {/* ── Background with parallax ── */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px) scale(1.06)`,
        }}
      >
        <Image
          src="/premium-cafe.png"
          alt="Premium Cafe Interior"
          fill
          unoptimized
          className="object-cover object-center"
          priority
        />
      </div>
    </section>
  );
}
