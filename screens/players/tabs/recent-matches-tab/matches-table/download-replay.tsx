import { ProcessedMatch } from "../../../../../src/coh3/coh3-types";
import React from "react";
import { Button, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconDownload } from "@tabler/icons-react";
import { generateReplayUrl } from "../../../../../src/apis/coh3stats-api";
import { matchTypesAsObject } from "../../../../../src/coh3/coh3-data";
import dayjs from "dayjs";

const DownloadReplayButton = ({ match }: { match: ProcessedMatch }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<null | string>(null);

  const downloadReplay = async () => {
    setLoading(true);
    try {
      const replayStatus = await generateReplayUrl(match);

      if (replayStatus.status === "success" && replayStatus.url) {
        // Fetch the file content
        const response = await fetch(replayStatus.url);
        const blob = await response.blob();

        // Create a local URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Trigger browser download of the file
        const matchType =
          matchTypesAsObject[match.matchtype_id as number]["localizedName"] ||
          matchTypesAsObject[match.matchtype_id as number]["name"] ||
          "";

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${match.id}-${matchType.toLowerCase().replace(/\s+/g, "")}-${match.mapname.replace(/\s+/g, "_")}-${dayjs(match.completiontime * 1000).format("DD-MMM-YY")}.rec`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      } else if (replayStatus.status === "error") {
        setError(replayStatus.message);
      }
    } catch (e) {
      console.error(e);
      setError("There was an error downloading the replay. Old games might not have replays.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Tooltip label={error} withArrow>
        <Button
          variant="filled"
          color="red"
          size="compact-md"
          rightSection={<IconAlertCircle size={14} />}
        >
          Replay
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={"Downloading replay might take a while."} withArrow>
      <Button
        w={100}
        variant="default"
        size="compact-md"
        leftSection={<IconDownload size={14} />}
        loading={loading}
        onClick={() => {
          downloadReplay().then();
        }}
      >
        Replay
      </Button>
    </Tooltip>
  );
};

export default DownloadReplayButton;
