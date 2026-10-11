"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Adds one-shot, reduced-motion-aware reveals to server-rendered sections. */
export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-motion="reveal"]')];
    if (!sections.length || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    sections.forEach((section) => { section.dataset.motionState = "hidden"; });
    document.body.classList.add("motion-ready");

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.motionState = "visible";
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      document.body.classList.remove("motion-ready");
    };
  }, [pathname]);

  return null;
}
