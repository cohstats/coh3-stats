import React from "react";
import { IconBulb } from "@tabler/icons-react";
import { getWikiTipAnchor, WikiTipSection } from "../../../src/wiki/tips/wiki-tips";
import classes from "../Wiki.module.css";

/** The tips of a "Game Tips" page, a heading per section and a card per tip. */
export const WikiTipsList = ({ sections }: { sections: WikiTipSection[] }) => (
  <div className={classes.body} data-testid="wiki-tips">
    {sections.map((section) => (
      <section key={section.id} data-testid={`wiki-tips-section-${section.id}`}>
        <h2 id={section.id} className={classes.heading}>
          {section.title}
        </h2>
        <ul className={classes.tipList}>
          {section.tips.map((tip) => (
            <li
              key={tip.id}
              id={getWikiTipAnchor(tip)}
              className={classes.tip}
              data-testid="wiki-tip"
            >
              <IconBulb size={18} stroke={1.75} className={classes.tipIcon} aria-hidden />
              <span>{tip.text}</span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);
