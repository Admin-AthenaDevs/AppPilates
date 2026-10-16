import { getStudioCountry, SUPPORTED_CURRENCIES, STUDIO_COUNTRIES } from "@/lib/region-config";

export type BaseStudioConfig = {
  name: string;
  logoUrl: string;
  primary: string;
  accent: string;
  countryCode: string;
  currency: string;
  timezone: string;
  locale: string;
};

const DEFAULT_CONFIG: BaseStudioConfig = {
  name: "Casa Forma",
  logoUrl: "",
  primary: "#176b5b",
  accent: "#e89a78",
  countryCode: "ES",
  currency: "EUR",
  timezone: "Europe/Madrid",
  locale: "es-ES",
};

function validatedColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function validatedLogo(value: string | undefined) {
  if (!value) return "";
  if (/^\/(?!\/)[a-zA-Z0-9/_%.-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export function getBaseStudioConfig(): BaseStudioConfig {
  const countryCode = STUDIO_COUNTRIES.some((country) => country.code === process.env.NEXT_PUBLIC_STUDIO_COUNTRY)
    ? process.env.NEXT_PUBLIC_STUDIO_COUNTRY!
    : DEFAULT_CONFIG.countryCode;
  const country = getStudioCountry(countryCode);
  const configuredCurrency = process.env.NEXT_PUBLIC_STUDIO_CURRENCY;
  const currency = SUPPORTED_CURRENCIES.some((item) => item.code === configuredCurrency)
    ? configuredCurrency!
    : country.currency;
  return {
    name: process.env.NEXT_PUBLIC_STUDIO_NAME?.trim() || DEFAULT_CONFIG.name,
    logoUrl: validatedLogo(process.env.NEXT_PUBLIC_STUDIO_LOGO_URL),
    primary: validatedColor(process.env.NEXT_PUBLIC_STUDIO_PRIMARY, DEFAULT_CONFIG.primary),
    accent: validatedColor(process.env.NEXT_PUBLIC_STUDIO_ACCENT, DEFAULT_CONFIG.accent),
    countryCode,
    currency,
    timezone: country.timezone,
    locale: country.locale,
  };
}