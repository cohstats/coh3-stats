import { ActionIcon, Group, Paper, SimpleGrid, Text, TextInput } from "@mantine/core";
import { IconArrowRight, IconMap, IconSearch, IconTank, IconUsers } from "@tabler/icons-react";
import { TFunction } from "next-i18next/pages";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { getSearchRoute } from "../../../src/routes";
import classes from "./home-search.module.css";

interface HomeSearchProps {
  t: TFunction;
}

const HomeSearch = ({ t }: HomeSearchProps) => {
  const { push } = useRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const query = value.trim();
    if (query.length > 1) {
      push(getSearchRoute(query));
    } else {
      inputRef.current?.focus();
    }
  };

  const categories = [
    { icon: IconUsers, label: t("sections.search.players") },
    { icon: IconTank, label: t("sections.search.units") },
    { icon: IconMap, label: t("sections.search.maps") },
  ];

  return (
    <Paper withBorder radius="md" mb="md" className={classes.frame} data-testid="home-search">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextInput
          ref={inputRef}
          data-testid="home-search-input"
          size="lg"
          variant="unstyled"
          px="md"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder={t("sections.search.placeholder")}
          aria-label={t("sections.search.placeholder")}
          leftSection={<IconSearch />}
          leftSectionWidth={40}
          rightSection={
            <ActionIcon
              type="submit"
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              aria-label={t("sections.search.submit")}
            >
              <IconArrowRight />
            </ActionIcon>
          }
        />
      </form>
      <SimpleGrid cols={3} spacing={0} className={classes.categories}>
        {categories.map(({ icon: Icon, label }) => (
          <Group
            key={label}
            gap={6}
            justify="center"
            wrap="nowrap"
            py="xs"
            px={4}
            className={classes.category}
            onClick={() => inputRef.current?.focus()}
          >
            <Icon size={20} />
            <Text fw={500} size="sm">
              {label}
            </Text>
          </Group>
        ))}
      </SimpleGrid>
    </Paper>
  );
};

export default HomeSearch;
