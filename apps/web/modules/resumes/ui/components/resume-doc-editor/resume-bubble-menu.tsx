"use client";

import React, { useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  Heading1 as H1Icon,
  Heading2 as H2Icon,
  Heading3 as H3Icon,
  ChevronDown,
  Type as TypeIcon,
} from "lucide-react";

interface ResumeBubbleMenuProps {
  editor: Editor | null;
}

export const ResumeBubbleMenu: React.FC<ResumeBubbleMenuProps> = ({ editor }) => {
  const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false);

  if (!editor) return null;

  const isH1 = editor.isActive("heading", { level: 1 });
  const isH2 = editor.isActive("heading", { level: 2 });
  const isH3 = editor.isActive("heading", { level: 3 });
  const isParagraph = !isH1 && !isH2 && !isH3;

  const currentLevelLabel = isH1
    ? "Title (H1)"
    : isH2
    ? "Subheading (H2)"
    : isH3
    ? "Section (H3)"
    : "Normal";

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top",
        offset: 8,
      }}
      shouldShow={({ state, from, to }: { state: { selection: { empty: boolean } }; from?: number; to?: number }) => {
        // Disappear when selection is empty/cleared
        return !state.selection.empty && from !== to;
      }}
      className="z-50 flex items-center rounded-lg border border-slate-700/60 bg-slate-900/95 px-1.5 py-1 text-slate-100 shadow-2xl backdrop-blur-md transition-all duration-150"
    >
      {/* Heading / Font size control */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setHeadingDropdownOpen((prev) => !prev);
          }}
          className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          title="Text style / Heading level"
          aria-label="Text style / Heading level"
        >
          <TypeIcon className="h-3.5 w-3.5 text-slate-400" />
          <span className="max-w-[70px] truncate text-[11px] font-medium">{currentLevelLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        {headingDropdownOpen && (
          <div
            className="absolute left-0 top-full mt-1.5 w-36 rounded-md border border-slate-700 bg-slate-900 p-1 shadow-xl"
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setHeadingDropdownOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                isParagraph ? "bg-slate-800 font-semibold text-sky-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <TypeIcon className="h-3.5 w-3.5" />
              <span>Normal text</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setHeadingDropdownOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                isH1 ? "bg-slate-800 font-semibold text-sky-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <H1Icon className="h-3.5 w-3.5" />
              <span>Heading 1</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setHeadingDropdownOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                isH2 ? "bg-slate-800 font-semibold text-sky-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <H2Icon className="h-3.5 w-3.5" />
              <span>Heading 2</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setHeadingDropdownOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                isH3 ? "bg-slate-800 font-semibold text-sky-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <H3Icon className="h-3.5 w-3.5" />
              <span>Heading 3</span>
            </button>
          </div>
        )}
      </div>

      <div className="mx-1 h-4 w-px bg-slate-700/80" />

      {/* Bold */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive("bold")
            ? "bg-slate-800 text-sky-400"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <BoldIcon className="h-3.5 w-3.5 font-bold" />
      </button>

      {/* Italic */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive("italic")
            ? "bg-slate-800 text-sky-400"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <ItalicIcon className="h-3.5 w-3.5" />
      </button>

      {/* Underline */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive("underline")
            ? "bg-slate-800 text-sky-400"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
        title="Underline (Ctrl+U)"
        aria-label="Underline"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-px bg-slate-700/80" />

      {/* Bullet List Toggle */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive("bulletList")
            ? "bg-slate-800 text-sky-400"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
        title="Bullet list"
        aria-label="Bullet list"
      >
        <ListIcon className="h-3.5 w-3.5" />
      </button>
    </BubbleMenu>
  );
};
