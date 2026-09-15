"use client";

type BrandHeaderProps = {
  onClick?: () => void;
  variant?: "landing" | "workspace" | "mark";
  label?: string;
};

export function BrandHeader({ onClick, variant = "landing", label = "PaperLoom home" }: BrandHeaderProps) {
  const className = variant === "workspace" ? "workspace-brand" : "brand";

  if (variant === "mark") {
    return (
      <button type="button" className={className} onClick={onClick} aria-label={label}>
        <span className="brand-mark">P · PaperLoom</span>
      </button>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      <span className="brand-glyph">P</span>
      <span>
        <strong>PaperLoom</strong>
        <small>research studio</small>
      </span>
    </button>
  );
}
