import React, { useMemo } from "react";
import Link from "next/link";
import { Alert, Anchor, Image } from "@mantine/core";
import {
  BBCodeBody,
  createBBCodePreset,
  DEFAULT_BBCODE_TAGS,
  getBBCodeNodeText,
} from "../../../components/bbcode/bbcode-body";
import { slugifyHeading } from "../../../src/wiki/get-wiki";
import { prepareWikiContents } from "../../../src/wiki/wiki-bbcode";
import { imageUrlTransform } from "../../../src/utils";
import classes from "../Wiki.module.css";

type Node = { attrs?: Record<string, string>; content?: any };

/** Tables can't have whitespace text between rows and cells, React and the browser disagree. */
const withoutWhitespace = (content: any) =>
  Array.isArray(content)
    ? content.filter((item) => !(typeof item === "string" && item.trim() === ""))
    : content;

// bbob walks into the nodes a handler returns, a plain "table" child would hit the table
// handler again and recurse forever.
const TableElement = (props: React.ComponentProps<"table">) => <table {...props} />;

const heading = (level: 2 | 3) => (node: Node) => ({
  tag: `h${level}`,
  attrs: { id: slugifyHeading(getBBCodeNodeText(node.content)), className: classes.heading },
  content: node.content,
});

const wikiPreset = createBBCodePreset({
  h2: heading(2),
  h3: heading(3),
  // Links inside the site stay in the tab and use client side navigation.
  url: (node: Node) => {
    const href = Object.keys(node.attrs ?? {})[0] || "";
    const isInternal = href.startsWith("/");
    return {
      tag: Anchor,
      attrs: isInternal
        ? { component: Link, href }
        : { href, target: "_blank", rel: "noopener noreferrer" },
      content: node.content,
    };
  },
  // [img alt="..." caption="..."]/images/wiki/...[/img]
  img: (node: Node) => {
    const raw = Array.isArray(node.content) ? node.content.join("") : node.content;
    const src = typeof raw === "string" && raw.trim() ? raw.trim() : node.attrs?.src;
    const caption = node.attrs?.caption;
    return {
      tag: "figure",
      attrs: { className: classes.figure },
      content: [
        {
          tag: Image,
          attrs: {
            src: imageUrlTransform(src ?? null),
            alt: node.attrs?.alt || caption || "",
            fit: "contain",
            loading: "lazy",
          },
        },
        ...(caption
          ? [{ tag: "figcaption", attrs: { className: classes.caption }, content: [caption] }]
          : []),
      ],
    };
  },
  // [note title="TL;DR" color="yellow"]...[/note]
  note: (node: Node) => ({
    tag: Alert,
    attrs: {
      variant: "light",
      color: node.attrs?.color || "blue",
      title: node.attrs?.title,
      className: classes.note,
    },
    content: node.content,
  }),
  code: (node: Node) => ({
    tag: "pre",
    attrs: { className: classes.code },
    content: node.content,
  }),
  table: (node: Node) => ({
    tag: "div",
    attrs: { className: classes.tableWrap },
    content: [
      {
        tag: TableElement,
        attrs: { className: classes.table },
        content: [{ tag: "tbody", attrs: {}, content: withoutWhitespace(node.content) }],
      },
    ],
  }),
  tr: (node: Node) => ({ tag: "tr", attrs: {}, content: withoutWhitespace(node.content) }),
});

const WIKI_TAGS = [...DEFAULT_BBCODE_TAGS, "note"];

export const WikiArticleBody = ({ contents }: { contents: string }) => {
  const prepared = useMemo(() => prepareWikiContents(contents), [contents]);
  return (
    <div className={classes.body} data-testid="wiki-article-body">
      <BBCodeBody contents={prepared} preset={wikiPreset} allowedTags={WIKI_TAGS} />
    </div>
  );
};
