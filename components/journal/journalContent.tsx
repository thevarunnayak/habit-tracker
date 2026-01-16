"use client";

import StarterKit from "@tiptap/starter-kit";
import { generateHTML } from "@tiptap/core";

export default function JournalContent({ content }: { content: any }) {
  if (!content) {
    return (
      <p className="text-sm text-muted-foreground">
        No content
      </p>
    );
  }

  let html = "";

  try {
    // Ensure valid Tiptap doc structure
    const doc =
      content?.type === "doc"
        ? content
        : { type: "doc", content: content?.content ?? [] };

    html = generateHTML(doc, [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ]);
  } catch (err) {
    console.error("Journal render error:", err);
    html =
      "<p class='text-sm text-muted-foreground'>Unable to render content</p>";
  }

  return (
    <div
      className="
        prose prose-sm dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-ul:list-disc prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-6
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}