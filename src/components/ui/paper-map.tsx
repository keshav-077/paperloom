"use client";

import type { LucideIcon } from "lucide-react";

export type PaperMapItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type PaperMapProps = {
  label: string;
  items: PaperMapItem[];
  activeId: string;
  sourceCount: number;
  sourceLabel: string;
  onSelect: (id: string) => void;
};

export function PaperMap({ label, items, activeId, sourceCount, sourceLabel, onSelect }: PaperMapProps) {
  return (
    <nav className="lab-nav" aria-label={label}>
      <div className="lab-nav-label">{label}</div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={activeId === item.id ? "active" : ""}
            onClick={() => onSelect(item.id)}
          >
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
      <div className="source-count">
        <span>{sourceCount}</span>
        <small>{sourceLabel}</small>
      </div>
    </nav>
  );
}
