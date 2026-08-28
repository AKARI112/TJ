import { HomeDashboard } from "@/components/home/home-dashboard";
import { getDailyContent } from "@/lib/islamic/daily-content";

export default function HomePage() {
  return <HomeDashboard daily={getDailyContent()} />;
}
