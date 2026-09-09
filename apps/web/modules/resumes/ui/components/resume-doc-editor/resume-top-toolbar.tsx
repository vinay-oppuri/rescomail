"use client";

import React, { useState, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Undo2,
  Redo2,
  RemoveFormatting,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@repo/ui/components/badge";

interface ResumeTopToolbarProps {
  editor: Editor | null;
  activeSectionName?: string;
}

export const ResumeTopToolbar: React.FC<ResumeTopToolbarProps> = ({
  editor,
  activeSectionName = "Document",
}) => {
  const [, setTick] = useState(0);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  // Subscribe to editor transactions so toolbar active states update live
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      setTick((t) => t + 1);
    };
    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  const isBold = editor?.isActive("bold") ?? false;
  const isItalic = editor?.isActive("italic") ?? false;
  const isUnderline = editor?.isActive("underline") ?? false;
  const isBulletList = editor?.isActive("bulletList") ?? false;
  const isOrderedList = editor?.isActive("orderedList") ?? false;
  const isH1 = editor?.isActive("heading", { level: 1 }) ?? false;
  const isH2 = editor?.isActive("heading", { level: 2 }) ?? false;
  const isH3 = editor?.isActive("heading", { level: 3 }) ?? false;
  const isParagraph = !isH1 && !isH2 && !isH3;

  const currentStyleLabel = isH1
    ? "Heading 1"
    : isH2
    ? "Heading 2"
    : isH3
    ? "Heading 3"
    : "Normal text";

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  return (
    <div className="w-full bg-card/95 backdrop-blur-md px-3 sm:px-4 py-1 text-muted-foreground flex flex-wrap items-center justify-between gap-y-1 rounded-t-sm">
      {/* Primary Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
        {/* Undo */}
        <button
          type="button"
          disabled={!editor || !canUndo}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().undo().run();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>

        {/* Redo */}
        <button
          type="button"
          disabled={!editor || !canRedo}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().redo().run();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1 h-4 w-px bg-border/80 shrink-0" />

        {/* Text Style / Heading dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault();
              setStyleDropdownOpen((prev) => !prev);
            }}
            className="flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            title="Styles"
          >
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium">{currentStyleLabel}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {styleDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-44 rounded-md border border-border bg-popover p-1 shadow-lg text-popover-foreground z-50"
              onMouseDown={(e) => e.preventDefault()}
            >
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().setParagraph().run();
                  setStyleDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isParagraph ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-sm">Normal text</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().toggleHeading({ level: 1 }).run();
                  setStyleDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isH1 ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Heading1 className="h-3.5 w-3.5" />
                <span className="text-base font-bold">Heading 1</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().toggleHeading({ level: 2 }).run();
                  setStyleDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isH2 ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Heading2 className="h-3.5 w-3.5" />
                <span className="text-sm font-semibold">Heading 2</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().toggleHeading({ level: 3 }).run();
                  setStyleDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isH3 ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Heading3 className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">Heading 3</span>
              </button>
            </div>
          )}
        </div>

        <div className="mx-1 h-4 w-px bg-border/80 shrink-0" />

        {/* Bold */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleBold().run();
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${
            isBold
              ? "bg-primary/15 text-primary font-bold shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          } disabled:opacity-50`}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <Bold className="h-3.5 w-3.5 font-bold" />
        </button>

        {/* Italic */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleItalic().run();
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${
            isItalic
              ? "bg-primary/15 text-primary font-bold shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          } disabled:opacity-50`}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>

        {/* Underline */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleUnderline().run();
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${
            isUnderline
              ? "bg-primary/15 text-primary font-bold shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          } disabled:opacity-50`}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1 h-4 w-px bg-border/80 shrink-0" />

        {/* Bullet List */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleBulletList().run();
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${
            isBulletList
              ? "bg-primary/15 text-primary font-bold shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          } disabled:opacity-50`}
          title="Bulleted list"
          aria-label="Bulleted list"
        >
          <List className="h-3.5 w-3.5" />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleOrderedList().run();
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${
            isOrderedList
              ? "bg-primary/15 text-primary font-bold shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          } disabled:opacity-50`}
          title="Numbered list"
          aria-label="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().unsetAllMarks().clearNodes().run();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Clear formatting"
          aria-label="Clear formatting"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Active Section Info Tag */}
      <div className="flex items-center gap-1.5 text-xs shrink-0">
        <Badge
          variant="outline"
          className="h-6 rounded-sm border-border/70 bg-card/50 text-[10px] font-mono text-muted-foreground gap-1.5 px-2 font-normal"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-[200px]">{activeSectionName}</span>
        </Badge>
      </div>
    </div>
  );
};
