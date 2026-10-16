/**
 * Merge consecutive image-only paragraphs into one paragraph so the renderer
 * can lay them out as a 2-column grid (2×2 for four images, etc.).
 *
 * Works whether images are separated by blank lines or stacked tightly:
 *
 *   ![a](…)
 *
 *   ![b](…)
 *
 * becomes a single paragraph containing both images.
 */
type MdNode = {
  type: string;
  children?: MdNode[];
  value?: string;
};

function isWhitespaceText(node: MdNode): boolean {
  return node.type === "text" && !node.value?.trim();
}

function isImageOnlyParagraph(node: MdNode): boolean {
  if (node.type !== "paragraph" || !node.children?.length) return false;
  const meaningful = node.children.filter((child) => !isWhitespaceText(child));
  return (
    meaningful.length > 0 && meaningful.every((child) => child.type === "image")
  );
}

function collectImages(paragraph: MdNode): MdNode[] {
  return (paragraph.children ?? []).filter((child) => child.type === "image");
}

export function remarkMergeImageParagraphs() {
  return (tree: { children: MdNode[] }) => {
    const kids = tree.children;
    const out: MdNode[] = [];
    let i = 0;

    while (i < kids.length) {
      const node = kids[i]!;
      if (isImageOnlyParagraph(node)) {
        const start = i;
        const images: MdNode[] = [];
        while (i < kids.length && isImageOnlyParagraph(kids[i]!)) {
          images.push(...collectImages(kids[i]!));
          i += 1;
        }
        if (images.length >= 2) {
          out.push({ type: "paragraph", children: images });
        } else {
          for (let j = start; j < i; j += 1) {
            out.push(kids[j]!);
          }
        }
      } else {
        out.push(node);
        i += 1;
      }
    }

    tree.children = out;
  };
}
