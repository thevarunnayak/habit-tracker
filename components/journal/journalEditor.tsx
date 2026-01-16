"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function JournalEditor({
  initialContent,
  onSave,
}: {
  initialContent?: any;
  onSave: (content: any) => void;
}) {
  const [isEmpty, setIsEmpty] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: initialContent ?? null,
    immediatelyRender: false, // ✅ Next.js SSR fix
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[220px] focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      setIsEmpty(editor.isEmpty);
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/30 p-2">
        {/* text */}
        <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>B</Btn>
        <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>I</Btn>
        <Btn on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>S</Btn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* block types */}
        <Btn on={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}>
          P
        </Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
          H1
        </Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          H2
        </Btn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* lists */}
        <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          • List
        </Btn>
        <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          1. List
        </Btn>
      </div>

      {/* Editor */}
      <div className="rounded-lg border bg-background p-3">
        <EditorContent editor={editor} />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          disabled={isEmpty}
          onClick={() => onSave(editor.getJSON())}
        >
          Save Journal
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Button ---------------- */

function Btn({
  children,
  on,
  active,
}: {
  children: React.ReactNode;
  on: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={on}
      className={[
        "rounded-md px-2 py-1 text-sm border transition-colors",
        active
          ? "bg-background border-foreground text-foreground"
          : "border-muted text-muted-foreground hover:bg-muted",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
