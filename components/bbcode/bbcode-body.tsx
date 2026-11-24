import BBCode from "@bbob/react";
import reactPreset from "@bbob/preset-react";
import React from "react";
import { Anchor, AspectRatio, Image } from "@mantine/core";
import { imageUrlTransform } from "../../src/utils";

// BBCode renderer shared by the news (Steam posts and local news) and the wiki articles.

type BBCodeNode = { tag?: string; attrs?: Record<string, any>; content?: any };
type BBCodeTagHandlers = Record<string, (node: any) => any>;

/** Tags allowed in the news, the Steam posts use most of them. */
export const DEFAULT_BBCODE_TAGS = [
  "img",
  "url",
  "h1",
  "h2",
  "h3",
  "i",
  "list",
  "*",
  "strike",
  "u",
  "b",
  "p",
  "hr",
  "code",
  "table",
  "tr",
  "th",
  "td",
  "br",
  "quote",
  "center",
  "left",
  "right",
  "justify",
  "color",
  "size",
  "font",
  "email",
  "link",
  "youtube",
  "video",
  "audio",
  "soundcloud",
  "vimeo",
  "twitch",
  "dailymotion",
  "spotify",
  "iframe",
  "previewyoutube",
  "dynamiclink",
];

const defaultTagHandlers: BBCodeTagHandlers = {
  url: (node: { attrs: NonNullable<unknown>; content: any }) => {
    return {
      tag: Anchor,
      attrs: {
        href: Object.keys(node.attrs)[0] || null,
        target: "_blank",
      },
      content: node.content,
    };
  },
  img: (node: { attrs: Record<string, string>; content: any }) => {
    // bbob provides content as an array of child nodes (usually a single string URL)
    const rawContent = Array.isArray(node.content) ? node.content.join("") : node.content;
    const imageUrl =
      typeof rawContent === "string" && rawContent.length > 0 ? rawContent : node.attrs?.src;

    return {
      tag: Image,
      attrs: {
        pt: "sm",
        pb: "sm",
        // The radius doesn't work for some reason
        // radius: "md",
        // w: "auto",
        fit: "contain",
        src: imageUrlTransform(imageUrl),
        alt: "news image",
        // Most images are further down the page, the list shows 10 articles.
        loading: "lazy",
      },
    };
  },
  br: () => {
    return {
      tag: "br",
    };
  },
  previewyoutube: (node: { attrs: NonNullable<unknown> }) => {
    try {
      const youtubeId = Object.keys(node.attrs)[0]?.split(";")[0] || null;

      return {
        tag: AspectRatio,
        attrs: {
          ratio: 16 / 9,
        },
        // bbob only renders array content; a single node object is silently dropped
        content: [
          {
            tag: "iframe",
            attrs: {
              src: `https://www.youtube.com/embed/${youtubeId}`,
              frameBorder: "0",
              allowFullScreen: true,
              loading: "lazy",
            },
          },
        ],
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  // Custom list handler to properly handle nested content in list items
  list: (node: { attrs: Record<string, string>; content: any }) => {
    const processListContent = (content: any[]): any[] => {
      if (!Array.isArray(content)) return content;

      return content.reduce((acc: any[], item: any) => {
        // Handle [*] tags with nested content
        if (item && typeof item === "object" && item.tag === "*") {
          acc.push({
            tag: "li",
            attrs: {},
            content: item.content || [],
          });
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    };

    const type = node.attrs && Object.keys(node.attrs)[0];
    return {
      tag: type ? "ol" : "ul",
      attrs: type ? { type } : {},
      content: processListContent(node.content || []),
    };
  },
  // Custom asterisk handler for list items
  "*": (node: { content: any }) => {
    return {
      tag: "li",
      attrs: {},
      content: node.content || [],
    };
  },
  // Custom handler for dynamiclink tags
  dynamiclink: (node: { attrs: Record<string, string> }) => {
    const href = node.attrs?.href || "";
    return {
      tag: Anchor,
      attrs: {
        href: href,
        target: "_blank",
      },
      content: [href],
    };
  },
};

/**
 * A bbob preset with the default handlers, `overrides` replace or add tags.
 * Create it once at module level, not during render.
 */
export const createBBCodePreset = (overrides: BBCodeTagHandlers = {}) =>
  reactPreset.extend((tags: any) => ({
    ...tags,
    ...defaultTagHandlers,
    ...overrides,
  }));

const defaultPreset = createBBCodePreset();

/** Plain text of a bbob node tree, e.g. the label of a heading. */
export const getBBCodeNodeText = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(getBBCodeNodeText).join("");
  if (content && typeof content === "object") {
    return getBBCodeNodeText((content as BBCodeNode).content);
  }
  return "";
};

class BBCodeErrorBoundary extends React.Component<
  { children?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong when rendering this article.</h1>;
    }

    return this.props.children;
  }
}

export const BBCodeBody = ({
  contents,
  preset = defaultPreset,
  allowedTags = DEFAULT_BBCODE_TAGS,
}: {
  contents?: string;
  /** From `createBBCodePreset`, the news preset by default. */
  preset?: ReturnType<typeof createBBCodePreset>;
  allowedTags?: string[];
}) => {
  return (
    <BBCodeErrorBoundary>
      <BBCode plugins={[preset()]} options={{ onlyAllowTags: allowedTags }}>
        {contents}
      </BBCode>
    </BBCodeErrorBoundary>
  );
};
