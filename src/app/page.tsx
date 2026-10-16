import StudioDashboard from "@/components/studio-dashboard";
import { getBaseStudioConfig } from "@/lib/studio-config";
import { redirectToStudio } from "@/lib/studio-access";

export default async function Home() {
  const access = await redirectToStudio();
  const initialSettings = access ? {
    ...getBaseStudioConfig(),
    name: access.studio.name,
    logoUrl: access.studio.logoUrl ?? "",
    primary: access.studio.brandPrimary,
    accent: access.studio.brandAccent,
    countryCode: access.studio.countryCode,
    currency: access.studio.currency,
    timezone: access.studio.timezone,
  } : getBaseStudioConfig();
  return <StudioDashboard initialSettings={initialSettings} />;
}