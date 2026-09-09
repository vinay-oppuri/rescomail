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
    <div className="sticky top-[52px] z-30 flex w-full flex-wrap items-center justify-between gap-y-1.5 border-b border-slate-200/90 bg-white px-4 py-1 text-slate-700 shadow-xs sm:px-6">
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
          className="flex h-7 w-7 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
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
          className="flex h-7 w-7 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1 h-4 w-px bg-slate-200" />

        {/* Text Style / Heading dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault();
              setStyleDropdownOpen((prev) => !prev);
            }}
            className="flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            title="Styles"
          >
            <Type className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] font-medium">{currentStyleLabel}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {styleDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-44 rounded-md border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 z-50"
              onMouseDown={(e) => e.preventDefault()}
            >
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().setParagraph().run();
                  setStyleDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs ${
                  isParagraph ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-700 hover:bg-slate-100"
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
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs ${
                  isH1 ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-700 hover:bg-slate-100"
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
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs ${
                  isH2 ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-700 hover:bg-slate-100"
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
                className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs ${
                  isH3 ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Heading3 className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">Heading 3</span>
              </button>
            </div>
          )}
        </div>

        <div className="mx-1 h-4 w-px bg-slate-200" />

        {/* Bold */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleBold().run();
          }}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            isBold
              ? "bg-blue-100 text-blue-700 font-bold"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            isItalic
              ? "bg-blue-100 text-blue-700 font-bold"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            isUnderline
              ? "bg-blue-100 text-blue-700 font-bold"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          } disabled:opacity-50`}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1 h-4 w-px bg-slate-200" />

        {/* Bullet List */}
        <button
          type="button"
          disabled={!editor}
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleBulletList().run();
          }}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            isBulletList
              ? "bg-blue-100 text-blue-700 font-bold"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            isOrderedList
              ? "bg-blue-100 text-blue-700 font-bold"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
          className="flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          title="Clear formatting"
          aria-label="Clear formatting"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Active Section Info Tag */}
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        <span className="hidden sm:inline">Active region:</span>
        <span className="font-semibold text-slate-800">{activeSectionName}</span>
      </div>
    </div>
  );
};
