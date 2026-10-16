export type StudioCountry = {
  code: string;
  name: string;
  locale: string;
  currency: string;
  timezone: string;
};

export const STUDIO_COUNTRIES: StudioCountry[] = [
  { code: "ES", name: "España", locale: "es-ES", currency: "EUR", timezone: "Europe/Madrid" },
  { code: "MX", name: "México", locale: "es-MX", currency: "MXN", timezone: "America/Mexico_City" },
  { code: "CO", name: "Colombia", locale: "es-CO", currency: "COP", timezone: "America/Bogota" },
  { code: "AR", name: "Argentina", locale: "es-AR", currency: "ARS", timezone: "America/Argentina/Buenos_Aires" },
  { code: "CL", name: "Chile", locale: "es-CL", currency: "CLP", timezone: "America/Santiago" },
  { code: "PE", name: "Perú", locale: "es-PE", currency: "PEN", timezone: "America/Lima" },
  { code: "UY", name: "Uruguay", locale: "es-UY", currency: "UYU", timezone: "America/Montevideo" },
  { code: "CR", name: "Costa Rica", locale: "es-CR", currency: "CRC", timezone: "America/Costa_Rica" },
  { code: "DO", name: "República Dominicana", locale: "es-DO", currency: "DOP", timezone: "America/Santo_Domingo" },
  { code: "EC", name: "Ecuador", locale: "es-EC", currency: "USD", timezone: "America/Guayaquil" },
  { code: "PA", name: "Panamá", locale: "es-PA", currency: "USD", timezone: "America/Panama" },
  { code: "US", name: "Estados Unidos", locale: "en-US", currency: "USD", timezone: "America/New_York" },
  { code: "CA", name: "Canadá", locale: "en-CA", currency: "CAD", timezone: "America/Toronto" },
  { code: "GB", name: "Reino Unido", locale: "en-GB", currency: "GBP", timezone: "Europe/London" },
  { code: "BR", name: "Brasil", locale: "pt-BR", currency: "BRL", timezone: "America/Sao_Paulo" },
  { code: "PT", name: "Portugal", locale: "pt-PT", currency: "EUR", timezone: "Europe/Lisbon" },
  { code: "FR", name: "Francia", locale: "fr-FR", currency: "EUR", timezone: "Europe/Paris" },
  { code: "DE", name: "Alemania", locale: "de-DE", currency: "EUR", timezone: "Europe/Berlin" },
  { code: "IT", name: "Italia", locale: "it-IT", currency: "EUR", timezone: "Europe/Rome" },
];

export const SUPPORTED_CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "MXN", name: "Peso mexicano" },
  { code: "COP", name: "Peso colombiano" },
  { code: "ARS", name: "Peso argentino" },
  { code: "CLP", name: "Peso chileno" },
  { code: "PEN", name: "Sol peruano" },
  { code: "UYU", name: "Peso uruguayo" },
  { code: "CRC", name: "Colón costarricense" },
  { code: "DOP", name: "Peso dominicano" },
  { code: "USD", name: "Dólar estadounidense" },
  { code: "CAD", name: "Dólar canadiense" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "BRL", name: "Real brasileño" },
] as const;

export function getStudioCountry(code: string) {
  return STUDIO_COUNTRIES.find((country) => country.code === code) ?? STUDIO_COUNTRIES[0];
}

export function formatStudioCurrency(amount: number, currency: string, countryCode: string) {
  const country = getStudioCountry(countryCode);
  const ambiguousDollarCurrencies = new Set(["USD", "CAD", "MXN", "COP", "ARS", "CLP", "UYU", "CRC", "DOP"]);
  return new Intl.NumberFormat(country.locale, {
    style: "currency",
    currency,
    currencyDisplay: ambiguousDollarCurrencies.has(currency) ? "code" : "symbol",
  }).format(amount);
}