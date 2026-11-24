import React, { useEffect, useState } from "react";
import { Accordion, Box, Text } from "@mantine/core";
import { IconList } from "@tabler/icons-react";
import { WikiHeading } from "../../../src/wiki/wiki-types";
import classes from "../Wiki.module.css";

/** The last heading above the top third of the screen is the active one. */
const useActiveHeading = (headings: WikiHeading[]) => {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const idsKey = headings.map((h) => h.id).join(",");

  useEffect(() => {
    const ids = idsKey.split(",").filter(Boolean);
    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current: string | null = ids[0] ?? null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (atBottom || element.getBoundingClientRect().top <= window.innerHeight / 3) {
          current = id;
        }
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [idsKey]);

  return activeId;
};

const TocLinks = ({
  headings,
  activeId,
  onNavigate,
}: {
  headings: WikiHeading[];
  activeId: string | null;
  onNavigate?: () => void;
}) => (
  <Box component="ul" p={0} m={0} style={{ listStyle: "none" }}>
    {headings.map((heading) => (
      <li key={heading.id}>
        <a
          href={`#${heading.id}`}
          className={classes.tocLink}
          data-level={heading.level}
          data-active={heading.id === activeId || undefined}
          aria-current={heading.id === activeId ? "location" : undefined}
          data-testid={`wiki-toc-${heading.id}`}
          onClick={(event) => {
            const element = document.getElementById(heading.id);
            if (!element || event.metaKey || event.ctrlKey || event.shiftKey) return;
            event.preventDefault();
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            // Keep the URL shareable without a Next.js navigation.
            window.history.replaceState(window.history.state, "", `#${heading.id}`);
            onNavigate?.();
          }}
        >
          {heading.label}
        </a>
      </li>
    ))}
  </Box>
);

/** Sticky "On this page" in the right column. */
export const WikiToc = ({ headings, title }: { headings: WikiHeading[]; title: string }) => {
  const activeId = useActiveHeading(headings);
  if (headings.length < 2) return null;
  return (
    <Box component="nav" aria-label={title} data-testid="wiki-toc">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
        {title}
      </Text>
      <TocLinks headings={headings} activeId={activeId} />
    </Box>
  );
};

/** The same list folded above the article, when there is no room for the right column. */
export const WikiTocMobile = ({
  headings,
  title,
}: {
  headings: WikiHeading[];
  title: string;
}) => {
  const [value, setValue] = useState<string | null>(null);
  if (headings.length < 2) return null;
  return (
    <Accordion
      value={value}
      onChange={setValue}
      variant="contained"
      radius="md"
      className={classes.mobileToc}
      mb="md"
    >
      <Accordion.Item value="toc">
        <Accordion.Control icon={<IconList size={16} />}>{title}</Accordion.Control>
        <Accordion.Panel>
          <TocLinks headings={headings} activeId={null} onNavigate={() => setValue(null)} />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
