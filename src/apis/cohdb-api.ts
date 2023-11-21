export interface ReplayAPIResponse {
  replays: Array<{
    id: number;
    download_link: string;
    downloads_count: number;
    length: number;
    likes_count: number;
    map: {
      id: string;
      name: string;
    };
    match_id: number;
    meta: {
      cursor: string;
    };
    mode: string;
    patch: {
      build_number: number;
      name: null;
      version: string;
    };
    players: [
      {
        faction: string;
        name: string;
        profile_id: number;
        steam_id: number;
        team: number;
      },
    ];
    recorded_at: string;
    title: string;
    uploaded_at: string;
    uploaded_by: {
      name: string;
      profile_id: number;
      steam_id: number;
    };
  }>;
  meta: {
    count: number;
    end_cursor: string;
    has_next_page: boolean;
  };
}

export interface ProcessedReplayData {
  data: Array<{
    id: number;
    downloads_count: number;
    length: number;
    likes_count: number;
    map_id: string;
    match_id: number;
    mode: string;
    patch: string;
    players: Array<{
      name: string;
      profile_id: number;
      steam_id: number;
      team: number;
      faction: string;
    }>;
    recorded_at: string;
    title: string;
    uploaded_at: string;
    uploaded_by: {
      name: string;
      profile_id: number;
    };
  }>;
  replaysTotal: number;
}

const RECORDS_PER_REPLAYS_PAGE = 25;

const ProcessReplaysData = (
  data: ReplayAPIResponse | void | null,
): ProcessedReplayData | null => {
  if (!data) {
    return null;
  }

  const convertReplayModes = (replayMode: string) => {
    switch (replayMode) {
      case "ones":
        return "1v1";
      case "twos":
        return "2v2";
      case "threes":
        return "3v3";
      case "fours":
        return "4v4";
    }

    return "unknown";
  };

  const processedData = [];

  for (const replay of data.replays) {
    processedData.push({
      id: replay.id,
      downloads_count: replay.downloads_count,
      length: replay.length,
      likes_count: replay.likes_count,
      map_id: replay.map.id,
      match_id: replay.match_id,
      mode: convertReplayModes(replay.mode),
      patch: replay.patch.version,
      players: replay.players.map((player) => ({
        name: player.name,
        profile_id: player.profile_id,
        steam_id: player.steam_id,
        team: player.team,
        faction: player.faction,
      })),
      recorded_at: replay.recorded_at,
      title: replay.title,
      uploaded_at: replay.uploaded_at,
      uploaded_by: {
        name: replay.uploaded_by.name,
        profile_id: replay.uploaded_by.profile_id,
      },
    });
  }

  return {
    data: processedData,
    replaysTotal: data.meta.count,
  };
};

const getReplaysForPlayer = async (
  playerID: string | number,
  offset: string | number | null | undefined,
  limit = RECORDS_PER_REPLAYS_PAGE,
) => {
  offset = offset || 0;

  const url = encodeURI(
    `https://cohdb.com/api/v1/replays?profile_id=${playerID}&limit=${limit}&offset=${offset}`,
  );

  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const data: ReplayAPIResponse = await response.json();

  return data;
};

const getCOHDBReplaysURL = (replayID: number | string) => {
  return encodeURI(`https://cohdb.com/replays/${replayID}`);
};

const getCOHDBUploadULR = () => {
  return encodeURI(`https://cohdb.com/`);
};

export {
  RECORDS_PER_REPLAYS_PAGE,
  getReplaysForPlayer,
  getCOHDBReplaysURL,
  getCOHDBUploadULR,
  ProcessReplaysData,
};
