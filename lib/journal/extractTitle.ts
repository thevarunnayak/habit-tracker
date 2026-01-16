export function extractTitleFromContent(content: any): string {
  try {
    // Tiptap doc → content[]
    const firstNode = content?.content?.[0];

    if (!firstNode) return "Journal Entry";

    // Heading → use its text
    if (firstNode.type === "heading") {
      return (
        firstNode.content
          ?.map((c: any) => c.text)
          ?.join("")
          ?.trim() || "Journal Entry"
      );
    }

    // Paragraph → use its text
    if (firstNode.type === "paragraph") {
      return (
        firstNode.content
          ?.map((c: any) => c.text)
          ?.join("")
          ?.trim() || "Journal Entry"
      );
    }

    return "Journal Entry";
  } catch {
    return "Journal Entry";
  }
}
