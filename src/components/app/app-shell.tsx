"use client";

import {
  Bell, Bookmark, BookOpenText, CalendarDays, Compass, Ellipsis,
  Headphones, HeartHandshake, Home, Menu, MoonStar, Settings2, Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  AnimatedSidebar, AnimatedSidebarContent, AnimatedSidebarFooter,
  AnimatedSidebarGroup, AnimatedSidebarGroupContent, AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader, AnimatedSidebarInset, AnimatedSidebarMenu,
  AnimatedSidebarMenuButton, AnimatedSidebarMenuItem, AnimatedSidebarProvider,
  AnimatedSidebarRail, AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { UniversalSearch } from "@/components/search/universal-search";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { GlobalAudioPlayer } from "@/components/audio/global-player";

const navigation = [
  { href: "/", label: "الرئيسية", icon: Home, group: "اليوم" },
  { href: "/quran", label: "القرآن الكريم", icon: BookOpenText, group: "العبادة" },
  { href: "/listen", label: "استمع", icon: Headphones, group: "العبادة" },
  { href: "/prayer", label: "الصلاة", icon: CalendarDays, group: "العبادة" },
  { href: "/qibla", label: "القبلة", icon: Compass, group: "العبادة" },
  { href: "/adhkar", label: "الأذكار", icon: Sparkles, group: "الذِكر" },
  { href: "/dua", label: "الأدعية", icon: HeartHandshake, group: "الذِكر" },
  { href: "/hisn", label: "حصن المسلم", icon: Bookmark, group: "الذِكر" },
  { href: "/hadith", label: "الحديث", icon: MoonStar, group: "العلم" },
  { href: "/saved", label: "المحفوظات", icon: Bookmark, group: "شخصي" },
  { href: "/reminders", label: "التذكيرات", icon: Bell, group: "شخصي" },
] as const;

const searchItems = navigation.map((item) => ({
  id: item.href,
  title: item.label,
  description: `انتقل إلى ${item.label}`,
  icon: item.icon,
  keywords: [item.group],
}));

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <AnimatedSidebarProvider
      defaultOpen
      style={{ "--sidebar-width": "17.5rem", "--sidebar-width-icon": "4.75rem", "--sidebar-width-mobile": "19rem" }}
    >
      <AnimatedSidebar side="right" variant="inset" collapsible="icon" ariaLabel="التنقل الرئيسي" panelClassName="border-e border-border bg-card">
        <AnimatedSidebarHeader className="border-b border-border/60 p-4">
          <div className="flex min-h-11 items-center gap-3 overflow-hidden px-1">
            <div className="brand-signature" aria-hidden="true"><span>ذُو</span><i /></div>
            <div className="min-w-0 whitespace-nowrap group-data-[state=collapsed]/sidebar-wrapper:hidden">
              <p className="text-lg font-[750] leading-none text-foreground">ذُو الجَلاَلْ</p>
              <p className="mt-1 text-[11px] text-muted-foreground">رفيق يومك بهدوء</p>
            </div>
          </div>
        </AnimatedSidebarHeader>

        <AnimatedSidebarContent className="px-3">
          {["اليوم", "العبادة", "الذِكر", "العلم", "شخصي"].map((group) => {
            const items = navigation.filter((item) => item.group === group);
            return (
              <AnimatedSidebarGroup key={group}>
                <AnimatedSidebarGroupLabel>{group}</AnimatedSidebarGroupLabel>
                <AnimatedSidebarGroupContent>
                  <AnimatedSidebarMenu>
                    {items.map((item) => (
                      <AnimatedSidebarMenuItem key={item.href}>
                        <AnimatedSidebarMenuButton
                          href={item.href}
                          icon={<item.icon className="size-[18px]" />}
                          isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                        >
                          {item.label}
                        </AnimatedSidebarMenuButton>
                      </AnimatedSidebarMenuItem>
                    ))}
                  </AnimatedSidebarMenu>
                </AnimatedSidebarGroupContent>
              </AnimatedSidebarGroup>
            );
          })}
        </AnimatedSidebarContent>

        <AnimatedSidebarFooter>
          <AnimatedSidebarMenu>
            <AnimatedSidebarMenuItem>
              <AnimatedSidebarMenuButton href="/settings" icon={<Settings2 className="size-[18px]" />}>
                الإعدادات
              </AnimatedSidebarMenuButton>
            </AnimatedSidebarMenuItem>
          </AnimatedSidebarMenu>
        </AnimatedSidebarFooter>
        <AnimatedSidebarRail aria-label="طي القائمة الجانبية" />
      </AnimatedSidebar>

      <AnimatedSidebarInset className="min-h-dvh bg-background pb-44 md:pb-28">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-border/65 bg-background/88 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <AnimatedSidebarTrigger className="text-muted-foreground hover:bg-muted md:hidden" aria-label="فتح القائمة">
              <Menu className="size-5" />
            </AnimatedSidebarTrigger>
            <p className="text-[17px] font-[750] md:hidden">ذُو الجَلاَلْ</p>
            <p className="hidden text-sm text-muted-foreground md:block">مساحتك الهادئة للقرآن والعبادة</p>
          </div>
          <div className="flex items-center gap-2">
            <UniversalSearch initialItems={searchItems} />
            <ThemeToggle variant="circle" start="top-right" className="size-10 rounded-xl border border-border bg-card text-foreground hover:bg-muted" iconClassName="size-[18px]" />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
        <GlobalAudioPlayer />

        <nav aria-label="التنقل المحمول" className="mobile-nav md:hidden">
          {navigation.slice(0, 4).map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <a key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="mobile-nav-item">
                <item.icon className="size-5" />
                <span>{item.label === "القرآن الكريم" ? "القرآن" : item.label}</span>
              </a>
            );
          })}
          <button type="button" onClick={() => setMoreOpen(true)} aria-expanded={moreOpen} className="mobile-nav-item">
            <Ellipsis className="size-5" /><span>المزيد</span>
          </button>
        </nav>
        <BottomSheet open={moreOpen} onOpenChange={setMoreOpen} snapPoints={["auto"]} title="المزيد" description="انتقل إلى أقسام ذُو الجَلاَلْ">
          <nav aria-label="المزيد من الأقسام" className="grid grid-cols-2 gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {navigation.slice(4).map((item) => (
              <button key={item.href} type="button" onClick={() => { setMoreOpen(false); router.push(item.href); }} className="more-sheet-item">
                <item.icon className="size-5" /><span>{item.label}</span>
              </button>
            ))}
            <button type="button" onClick={() => { setMoreOpen(false); router.push("/settings"); }} className="more-sheet-item">
              <Settings2 className="size-5" /><span>الإعدادات</span>
            </button>
          </nav>
        </BottomSheet>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}
