import { Text, Tooltip } from "@mantine/core";
import TimeAgo from "javascript-time-ago";
import React from "react";
import { useRouter } from "next/router";

// Import all supported locales
import en from "javascript-time-ago/locale/en";
import fr from "javascript-time-ago/locale/fr";
import de from "javascript-time-ago/locale/de";
import it from "javascript-time-ago/locale/it";
import ja from "javascript-time-ago/locale/ja";
import ko from "javascript-time-ago/locale/ko";
import pl from "javascript-time-ago/locale/pl";
import ptBR from "javascript-time-ago/locale/pt";
import zhHans from "javascript-time-ago/locale/zh-Hans-HK";
import es from "javascript-time-ago/locale/es";
import zhHant from "javascript-time-ago/locale/zh-Hant";
import tr from "javascript-time-ago/locale/tr";
import cs from "javascript-time-ago/locale/cs";
import ru from "javascript-time-ago/locale/ru";

// Register all locales
TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(fr);
TimeAgo.addLocale(de);
TimeAgo.addLocale(it);
TimeAgo.addLocale(ja);
TimeAgo.addLocale(ko);
TimeAgo.addLocale(pl);
TimeAgo.addLocale(ptBR);
TimeAgo.addLocale(zhHans);
TimeAgo.addLocale(es);
TimeAgo.addLocale(zhHant);
TimeAgo.addLocale(tr);
TimeAgo.addLocale(cs);
TimeAgo.addLocale(ru);

const InternalTimeAgo = ({ timestamp }: { timestamp: number }) => {
  const router = useRouter();
  const timeAgo = new TimeAgo(router.locale || "en");

  if (!timestamp || timestamp < 0) return <Text inherit>-</Text>;

  return (
    <Tooltip withArrow label={new Date(timestamp * 1000).toLocaleString()}>
      <Text inherit>{timeAgo.format(timestamp * 1000)}</Text>
    </Tooltip>
  );
};

export default InternalTimeAgo;
