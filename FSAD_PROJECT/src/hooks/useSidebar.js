import { useState, useEffect } from "react";

export const useSidebar = () => {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) setOpen(false);
  }, []);
  const toggle = () => setOpen((prev) => !prev);
  return { open, toggle };
};