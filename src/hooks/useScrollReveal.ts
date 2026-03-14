import { useEffect } from "react";

export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");

            // stop observing so it never hides again
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll<HTMLElement>(".reveal");

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}