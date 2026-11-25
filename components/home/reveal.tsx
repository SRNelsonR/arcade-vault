"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  className?: string;
  children: ReactNode;
}

// Envuelve una sección del Home y le añade la clase `in` al entrar en pantalla.
export function Reveal({ className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sin IntersectionObserver la sección se muestra ya visible.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={(className ? className + " " : "") + "reveal"}>
      {children}
    </section>
  );
}
