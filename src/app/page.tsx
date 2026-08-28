import { HomeDashboard } from "@/components/home/home-dashboard";
import { getDailyContent } from "@/lib/islamic/daily-content";

export const revalidate = 86400;

export default async function HomePage() {
  return <HomeDashboard daily={await getDailyContent()} />;
}
