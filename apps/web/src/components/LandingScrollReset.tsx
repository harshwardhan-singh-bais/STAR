"use client";

import { useLayoutEffect } from "react";

export function LandingScrollReset() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  return null;
}