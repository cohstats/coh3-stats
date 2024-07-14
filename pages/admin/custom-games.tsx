import {
  Anchor,
  Button,
  Container,
  Grid,
  PasswordInput,
  Select,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { IconEyeCheck, IconEyeOff } from "@tabler/icons-react";
import { useDebouncedState } from "@mantine/hooks";
import {
  getPlayersCardsConfigsHttp,
  setPlayerCardsConfigAdminHttp,
} from "../../src/apis/coh3stats-api";
import { DataTable } from "mantine-datatable";
import Link from "next/link";
import { getPlayerCardRoute } from "../../src/routes";

const ChangeCustomVisibilityForm = () => {
  // state for hideCustomGames
  const [customGamesHidden, setCustomGamesHidden] = useState<boolean | null>(null);
  const [profileIDs, setProfileIDs] = useDebouncedState<string[]>([], 400);
  const [password, setPassword] = useState<string>("");

  const [isLoadingChangeRequest, setIsLoadingChangeRequest] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");

  const submitChanges = async () => {
    try {
      setIsLoadingChangeRequest(true);
      setResponseMessage(
        await setPlayerCardsConfigAdminHttp(profileIDs, customGamesHidden || false, password),
      );
    } catch (e) {
      setResponseMessage(`Failed to change custom games visibility ${e}`);
      console.error(e);
    } finally {
      setIsLoadingChangeRequest(false);
    }
  };

  return (
    <>
      <Select
        label="Are custom games hidden"
        placeholder="Pick one"
        withAsterisk
        data={[
          { value: "true", label: "Custom games are HIDDEN" },
          { value: "false", label: "Custom games are VISIBLE" },
        ]}
        onChange={(value) => {
          if (value === "true") {
            setCustomGamesHidden(true);
          } else {
            setCustomGamesHidden(false);
          }
        }}
      />
      <PasswordInput
        label="Enter admin password for change"
        placeholder=""
        defaultValue=""
        withAsterisk
        visibilityToggleIcon={({ reveal }) =>
          reveal ? <IconEyeOff size={20} /> : <IconEyeCheck size={20} />
        }
        onChange={(event) => {
          setPassword(event.currentTarget.value);
        }}
      />
      <Textarea
        placeholder="Separate them with comma (,) for example: 227,4456,1234"
        label="COH3 Profile IDs, comma separated"
        withAsterisk
        onChange={(event) => {
          const data = event.currentTarget.value;
          // remove all whitespaces from data
          const arrayData = data.replaceAll(/\s/g, ``).split(",");
          setProfileIDs(arrayData);
        }}
      />
      <div>Selected profile IDs: {profileIDs.map((id) => `${id}, `)}</div>
      <Button onClick={submitChanges} loading={isLoadingChangeRequest}>
        Submit changes
      </Button>
      <Text fz={"xs"}>
        It can take up to 24 hours for the games to be hidden on player card pages. It should take
        effect at 6AM UTC.
      </Text>
      <Textarea
        placeholder="..."
        label="Action results"
        readOnly={true}
        value={JSON.stringify(responseMessage, null, 2)}
        minRows={20}
        maxRows={60}
      />
    </>
  );
};

const CustomGamesVisibilityData = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const result = await getPlayersCardsConfigsHttp();
        setData(result.profiles);
      } catch (e) {
        console.error(`Failed getting players cards configs`);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Container>
      <DataTable
        withTableBorder={true}
        border={2}
        borderRadius="md"
        highlightOnHover
        striped
        minHeight={1000}
        records={data}
        idAccessor={"profile_id"}
        fetching={isLoading}
        columns={[
          {
            accessor: "alias",
            textAlign: "left",
            title: "Alias",
            // @ts-ignore
            render: ({ alias, profile_id }) => {
              return (
                <>
                  <Anchor component={Link} href={getPlayerCardRoute(profile_id)}>
                    {alias}
                  </Anchor>
                </>
              );
            },
          },
          {
            accessor: "profile_id",
            textAlign: "left",
            title: "Profile ID",
          },
          {
            accessor: "steam_id",
            textAlign: "left",
            title: "Steam ID",
          },
          {
            accessor: "customGamesHidden",
            textAlign: "left",
            title: "Custom Games",
            // @ts-ignore
            render: ({ customGamesHidden }) => {
              if (customGamesHidden.hidden === true) {
                return <>HIDDEN</>;
              } else {
                return <>VISIBLE</>;
              }
            },
          },
          {
            accessor: "customGamesHidden_updatedAt",
            textAlign: "left",
            title: "Settings changed",
            // @ts-ignore
            render: ({ customGamesHidden }) => {
              return <>{new Date(customGamesHidden.updatedAt).toLocaleString()}</>;
            },
          },
        ]}
      />
    </Container>
  );
};

const CustomGames = () => {
  return (
    <Container size={"lg"}>
      <Title>Custom Games Visibility - Admin interface</Title>
      <Text>Custom games are hidden for some players due to their activity in tournaments</Text>
      <Grid>
        <Grid.Col span={4}>
          {" "}
          <ChangeCustomVisibilityForm />
        </Grid.Col>
        <Grid.Col span={8}>
          <CustomGamesVisibilityData />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default CustomGames;
