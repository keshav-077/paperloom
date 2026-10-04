"use client";

import { PaperLoomLogoMark } from "./paperloom-logo";

type BrandHeaderProps = {
  onClick?: () => void;
  variant?: "landing" | "workspace" | "mark";
  label?: string;
};

export function BrandHeader({ onClick, variant = "landing", label = "PaperLoom home" }: BrandHeaderProps) {
  const className =
    variant === "workspace" ? "workspace-brand brand-mark-only" : variant === "mark" ? "brand brand-mark-only" : "brand";

  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      <PaperLoomLogoMark className="brand-logo-mark" />
    </button>
  );
}
