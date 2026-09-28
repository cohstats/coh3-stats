import { Badge, Box, Button } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import classes from "./unit-section-nav.module.css";

export type UnitSectionNavItem = {
  id: string;
  label: string;
  count?: number;
};

// Section wrappers must use this class so the jump lands below the sticky header + nav.
export const unitSectionClassName = classes.section;

export const UnitSectionNav = ({
  items,
  leftSection,
  rightSection,
}: {
  items: UnitSectionNavItem[];
  /** Shown on the left only once the nav is stuck to the top, e.g. the unit icon. Desktop only. */
  leftSection?: React.ReactNode;
  /** Extra actions on the right side of the nav, e.g. a link to another tool. */
  rightSection?: React.ReactNode;
}) => {
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [isStuck, setIsStuck] = useState(false);
  // The items array is rebuilt on every render, only re-subscribe when the sections change.
  const sectionIdsKey = items.map(({ id }) => id).join(",");

  useEffect(() => {
    const sectionIds = sectionIdsKey.split(",");

    const onScroll = () => {
      const nav = navRef.current;
      const navRect = nav?.getBoundingClientRect();
      const navBottom = navRect?.bottom ?? 0;
      if (nav && navRect) {
        const stickyTop = parseFloat(window.getComputedStyle(nav).top) || 0;
        setIsStuck(window.scrollY > 0 && navRect.top <= stickyTop + 1);
      }
      const atPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      let current: string | null = sectionIds[0] || null;
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        // The section counts as active once its top gets close to the nav,
        // the tolerance must be bigger than the gap left by `scroll-margin-top`.
        if (atPageBottom || element.getBoundingClientRect().top <= navBottom + 32) {
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
  }, [sectionIdsKey]);

  // The nav height depends on how the buttons wrap, publish the space it covers when stuck
  // (site header + nav) so the sections' `scroll-margin-top` lands right below it.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateOffset = () => {
      const stickyTop = parseFloat(window.getComputedStyle(nav).top) || 0;
      document.documentElement.style.setProperty(
        "--unit-section-nav-offset",
        `${Math.ceil(stickyTop + nav.offsetHeight + 12)}px`,
      );
    };

    updateOffset();
    // A direct `#section` link can be scrolled by the browser before the offset is measured.
    const hashTarget =
      window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (hashTarget) {
      requestAnimationFrame(() => hashTarget.scrollIntoView({ block: "start" }));
    }
    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(nav);
    // The sticky `top` changes with the site header height on resize.
    window.addEventListener("resize", updateOffset);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOffset);
      document.documentElement.style.removeProperty("--unit-section-nav-offset");
    };
  }, []);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    // Leave new tab / new window clicks to the browser.
    const isModifiedClick =
      event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!element || isModifiedClick) return;
    event.preventDefault();
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move keyboard focus to the section, so tabbing continues from there.
    if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
    // Keep the URL shareable without triggering a Next.js navigation.
    window.history.replaceState(window.history.state, "", `#${id}`);
  };

  if (items.length < 2) return null;

  return (
    <Box component="nav" ref={navRef} className={classes.nav} data-testid="unit-section-nav">
      {leftSection && (
        <div
          className={classes.lead}
          data-visible={isStuck || undefined}
          aria-hidden={!isStuck}
          data-testid="unit-section-nav-lead"
        >
          {leftSection}
        </div>
      )}
      <div className={classes.list}>
        {items.map(({ id, label, count }) => {
          const isActive = id === activeId;
          return (
            <Button
              key={id}
              component="a"
              href={`#${id}`}
              onClick={(event: React.MouseEvent<HTMLAnchorElement>) => onClick(event, id)}
              variant={isActive ? "light" : "subtle"}
              color={isActive ? undefined : "gray"}
              size="compact-md"
              radius="md"
              // Buttons stretch to the grid cell on phones, keep the label on the left.
              justify="flex-start"
              classNames={{ root: classes.root, label: classes.label, section: classes.badge }}
              aria-current={isActive ? "location" : undefined}
              data-testid={`unit-section-nav-${id}`}
              rightSection={
                count !== undefined ? (
                  <Badge size="sm" variant="default" radius="sm">
                    {count}
                  </Badge>
                ) : undefined
              }
            >
              {label}
            </Button>
          );
        })}
      </div>
      {rightSection}
    </Box>
  );
};
