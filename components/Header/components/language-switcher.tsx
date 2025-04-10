import { Select, Group, SelectProps } from "@mantine/core";
import { useRouter } from "next/router";
import CountryFlag from "../../country-flag";

const languages: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ko: "한국어",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  fr: "Français",
  "pt-BR": "Português (Brasil)",
  ja: "日本語",
  pl: "Polski",
  it: "Italiano",
  es: "Español",
  tr: "Türkçe",
  cs: "Čeština",
  ru: "Русский",
};

const getCountryCode = (languageCode: string): string => {
  switch (languageCode) {
    case "en":
      return "gb";
    case "zh-Hans":
      return "cn";
    case "zh-Hant":
      return "tw";
    case "pt-BR":
      return "br";
    case "cs":
      return "cz";
    case "ja":
      return "jp";
    case "ko":
      return "kr";
    case "ru":
      return "ru";
    default:
      return languageCode.split("-")[0];
  }
};

const renderSelectOption: SelectProps["renderOption"] = ({ option }) => (
  <Group gap="xs">
    <CountryFlag countryCode={getCountryCode(option.value)} size="xs" />
    {option.label}
  </Group>
);

export const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const { pathname, asPath, query } = router;

  const handleLanguageChange = (newLocale: string | null) => {
    if (newLocale) {
      // Set the NEXT_LOCALE cookie
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`; // 1 year expiry

      router.push({ pathname, query }, asPath, { locale: newLocale });
    }
  };

  return (
    <Select
      radius="md"
      value={router.locale}
      onChange={handleLanguageChange}
      withCheckIcon={false}
      allowDeselect={false}
      data={Object.entries(languages).map(([code, name]) => ({
        value: code,
        label: name,
      }))}
      renderOption={renderSelectOption}
      style={{ width: 110 }}
      comboboxProps={{ width: 180, position: "bottom-start" }}
    />
  );
};

export default LanguageSwitcher;
