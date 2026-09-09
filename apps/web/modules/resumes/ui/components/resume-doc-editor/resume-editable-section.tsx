"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Editor } from "@tiptap/react";
import { ResumeBubbleMenu } from "./resume-bubble-menu";

interface ResumeEditableSectionProps {
  content: string;
  onChange?: (html: string) => void;
  onFocus?: (editor: Editor) => void;
  onEditorReady?: (editor: Editor) => void;
  className?: string;
  placeholder?: string;
}

export const ResumeEditableSection: React.FC<ResumeEditableSectionProps> = ({
  content,
  onChange,
  onFocus,
  onEditorReady,
  className = "",
  placeholder = "",
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "list-disc pl-4 space-y-1 my-1",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "list-decimal pl-4 space-y-1 my-1",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "text-[13.5px] leading-relaxed text-foreground/90",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "text-[13.5px] leading-relaxed text-foreground/90 my-0.5",
          },
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `outline-none focus:outline-none focus-visible:outline-none border-none ring-0 focus:ring-0 w-full min-h-[1.5rem] selection:bg-primary/20 selection:text-foreground text-foreground ${className}`,
        "data-placeholder": placeholder,
      },
    },
    onCreate: ({ editor }) => {
      onEditorReady?.(editor);
    },
    onFocus: ({ editor }) => {
      onFocus?.(editor);
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Sync external content updates without disturbing active cursor
  useEffect(() => {
    if (!editor || content === undefined) return;
    const currentHTML = editor.getHTML();
    if (content !== currentHTML && !editor.isFocused) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div className="relative group/editor">
      <ResumeBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
