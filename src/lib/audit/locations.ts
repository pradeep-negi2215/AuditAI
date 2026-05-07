import type { CountryCode, CurrencyCode } from "./types";

export interface CountryOption {
  code: CountryCode;
  label: string;
  currency: CurrencyCode;
  locale: string;
}

export const countryOptions: CountryOption[] = [
  {
    code: "US",
    label: "United States",
    currency: "USD",
    locale: "en-US",
  },
  {
    code: "IN",
    label: "India",
    currency: "INR",
    locale: "en-IN",
  },
];

export const getCountryConfig = (code?: CountryCode) =>
  countryOptions.find((option) => option.code === code);

export const getCurrencyForCountry = (code?: CountryCode) => {
  const config = getCountryConfig(code);
  return config?.currency;
};

export const getLocaleForCountry = (code?: CountryCode) => {
  const config = getCountryConfig(code);
  return config?.locale ?? "en-US";
};
