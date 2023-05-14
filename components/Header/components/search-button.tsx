import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import React from "react";
import { debounce } from "lodash";
import { getSearchRoute } from "../../../src/routes";
import { useRouter } from "next/router";

export const SearchButton: React.FC = () => {
  const { push } = useRouter();

  const debouncedSearch = debounce((value) => {
    if (value.length > 1) {
      push(getSearchRoute(value));
    }
  }, 600);

  return (
    <>
      <Input
        icon={<IconSearch />}
        placeholder="Search players"
        radius={"md"}
        onChange={(event: { currentTarget: { value: any } }) => {
          debouncedSearch(event.currentTarget.value);
        }}
      />
    </>
  );
};
