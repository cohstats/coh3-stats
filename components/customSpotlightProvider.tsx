import React, { ChangeEvent, ReactNode, useDeferredValue, useRef, useState } from "react";
import { IconFileText, IconSearch } from "@tabler/icons";
import { SearchPlayerEntry } from "./SearchPlayerEntry";
import { Loader } from "@mantine/core";
import {
  registerSpotlightActions,
  removeSpotlightActions,
  SpotlightAction,
  SpotlightProvider,
} from "@mantine/spotlight";
import { useDebouncedState, useDidUpdate } from "@mantine/hooks";
import config from "../config";
import { useRouter } from "next/router";

const CustomSpotlightProvider = ({ children }: { children: ReactNode[] | null }) => {
  const router = useRouter();
  /* Spotlight Search Related */
  const [actions, setActions] = useState<[] | SpotlightAction[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  // debounce query (wait till user stopped actively entering stuff in the search field)
  const [debouncedQuery, setDebouncedQuery] = useDebouncedState("", 200);

  /**
   * Request additional results for the spotlight search based on the user input and add to spotlight entries
   * @param query Search input
   */
  const fetchResults = async (query: string) => {
    console.log("SEARCH", query);
    let data = null;
    let error = null;

    try {
      const res = await fetch(
        `${config.BASE_CLOUD_FUNCTIONS_URL}/searchPlayersHttp?alias=${query}`,
      );

      // Also check status code if not 200
      data = await res.json();
      const newEntries: SpotlightAction[] = [];
      for (const playerKey in data) {
        const playerData = data[playerKey];
        newEntries.push({
          id: playerData.relicProfile.id,
          image: playerData.steamProfile.avatarmedium,
          xp: playerData.relicProfile.members[0].xp,
          level: playerData.relicProfile.members[0].level,
          country: playerData.relicProfile.members[0].country,
          playerID: playerData.relicProfile.members[0].profile_id,
          title: playerData.relicProfile.members[0].alias,
          onTrigger: () =>
            router.replace("/players/" + playerData.relicProfile.members[0].profile_id),
          icon: <IconFileText size={18} />,
        });
      }
      const filterEntries = newEntries.filter((entry) => entry.id!);
      setActions(filterEntries);
    } catch (e: any) {
      console.error(`Failed getting data for player id ${query}`);
      console.error(e);
      error = e.message;
    } finally {
      setFetchLoading(false);
    }
  };

  // when debounced query entry changes fetch player results
  useDidUpdate(() => {
    if (debouncedQuery.length > 1) {
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <SpotlightProvider
      onSpotlightClose={() => setDebouncedQuery("")}
      actions={actions}
      onQueryChange={(query) => {
        setFetchLoading(true);
        setDebouncedQuery(query);
      }}
      searchIcon={<IconSearch size={18} />}
      searchPlaceholder="Search..."
      actionComponent={SearchPlayerEntry}
      shortcut="mod + K"
      nothingFoundMessage={fetchLoading ? <Loader /> : "Nothing found..."}
    >
      {children}
    </SpotlightProvider>
  );
};

export default CustomSpotlightProvider;
