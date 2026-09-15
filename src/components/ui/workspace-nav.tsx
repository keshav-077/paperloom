"use client";

import { BookOpen, Download, FileJson, FlaskConical, Home, LayoutTemplate, Plus, Share2 } from "lucide-react";

export type WorkspaceMode = "lab" | "story" | "preview";

type WorkspaceNavProps = {
  mode: WorkspaceMode;
  projectTitle: string;
  homeLabel: string;
  libraryLabel: string;
  onHome: () => void;
  onLibrary: () => void;
  onModeChange: (mode: WorkspaceMode) => void;
  onExportJson: () => void;
  onExportHtml: () => void;
  onNew: () => void;
};

export function WorkspaceNav({
  mode,
  projectTitle,
  homeLabel,
  libraryLabel,
  onHome,
  onLibrary,
  onModeChange,
  onExportJson,
  onExportHtml,
  onNew,
}: WorkspaceNavProps) {
  return (
    <header className="workspace-header">
      <button type="button" className="workspace-brand brand-mark-only" onClick={onHome} aria-label="PaperLoom home">
        <span className="brand-mark">P · PaperLoom</span>
      </button>
      <div className="project-identity">
        <span>Current paper</span>
        <strong>{projectTitle}</strong>
      </div>
      <nav className="mode-tabs" aria-label="Workspace mode">
        <button type="button" className={mode === "lab" ? "active" : ""} onClick={() => onModeChange("lab")}>
          <FlaskConical size={15} /> Lab
        </button>
        <button type="button" className={mode === "story" ? "active" : ""} onClick={() => onModeChange("story")}>
          <LayoutTemplate size={15} /> Story
        </button>
        <button type="button" className={mode === "preview" ? "active" : ""} onClick={() => onModeChange("preview")}>
          <Share2 size={15} /> Preview
        </button>
      </nav>
      <div className="workspace-actions">
        <button type="button" title={homeLabel} onClick={onHome}>
          <Home size={16} /><span>{homeLabel}</span>
        </button>
        <button type="button" title={libraryLabel} onClick={onLibrary}>
          <BookOpen size={16} /><span>{libraryLabel}</span>
        </button>
        <button type="button" title="Download the project JSON" onClick={onExportJson}>
          <FileJson size={16} /><span>JSON</span>
        </button>
        <button type="button" className="export-button" onClick={onExportHtml}>
          <Download size={16} /> Export
        </button>
        <button type="button" className="icon-button" title="New paper" onClick={onNew}>
          <Plus size={17} />
        </button>
      </div>
    </header>
  );
}
