import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import React from "react";
import { debounce } from "lodash";
import { getSearchRoute } from "../../../src/routes";
import { useRouter } from "next/router";
import { TFunction } from "next-i18next";

interface SearchButtonProps {
  redirectOnClick?: boolean;
  close?: () => void;
  t: TFunction;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ redirectOnClick, close, t }) => {
  const { push } = useRouter();
  redirectOnClick = redirectOnClick || false;

  const debouncedSearch = debounce((value) => {
    if (value.length > 1) {
      push(getSearchRoute(value));
    }
  }, 600);

  return (
    <>
      <TextInput
        style={{ width: 160 }}
        leftSection={<IconSearch />}
        placeholder={t("search.playersAndUnits")}
        radius={"md"}
        onChange={(event: { currentTarget: { value: any } }) => {
          debouncedSearch(event.currentTarget.value);
        }}
        onClick={() => {
          if (redirectOnClick && close) {
            push(getSearchRoute(""));
            close();
          }
        }}
      />
    </>
  );
};
