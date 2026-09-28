"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, LayoutGrid, Gamepad2, ReceiptText, User } from "lucide-react";
import { useSession, useSlip } from "@/lib/store";
import { BrandIcon } from "@/components/icons";
import { AccountDrawer } from "@/components/AccountDrawer";
import { formatMoney } from "@/lib/countries";

/**
 * The app shell.
 *
 * Header is 44px on the brand bar: mark on the left, then search and the two
 * account actions. Bottom navigation is five items with the home mark first,
 * and the bet slip rides above it as a floating counter that only appears once
 * there is something on the slip.
 *
 * Content runs edge to edge at every width — a desktop board fills the viewport
 * rather than sitting in a centred column. Only the padding grows with the
 * screen. Form panels (login, deposit) keep their own narrow measure.
 */

function HeaderActions({ onOpenAccount }: { onOpenAccount: () => void }) {
  const player = useSession((s) => s.player);
  const hydrated = useSession((s) => s.hydrated);
  const setBalance = useSession((s) => s.setBalance);

  // Keep the header balance honest without the player having to reload.
  useEffect(() => {
    if (!player) return;
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/me?userId=${player.id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (alive && json.user) setBalance(Number(json.user.balance));
      } catch {
        /* the header balance is not worth an error state */
      }
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [player?.id, setBalance, player]);

  if (!hydrated) return <div className="h-7 w-32 rounded-lg bg-[var(--surface-2)]" />;

  if (!player) {
    return (
      <>
        <Link
          href="/login"
          className="rounded-xl border border-white/40 px-3.5 py-1.5 text-[12px] font-bold text-white"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-gradient-to-r from-[#fbbf24] via-[#fcd34d] to-[#facc15] px-4 py-1.5 text-[12px] font-bold text-black shadow-lg shadow-amber-500/20"
        >
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <button
        onClick={onOpenAccount}
        aria-label="Account and balance"
        className="rounded-full px-3 py-1 text-[13px] font-bold text-[var(--accent)] ring-1 ring-[var(--accent)]"
      >
        {formatMoney(Number(player.balance), player.currency)}
      </button>
      <Link
        href="/deposit"
        className="rounded-xl bg-gradient-to-r from-[#fbbf24] via-[#fcd34d] to-[#facc15] px-4 py-1.5 text-[12px] font-bold text-black shadow-lg shadow-amber-500/20"
      >
        Deposit
      </Link>
    </>
  );
}

export function Header() {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="flex h-[52px] w-full items-center gap-2 px-2.5 md:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <Image src="/logo-mark.svg" alt="Stakeza" width={26} height={26} priority />
          <span className="font-display text-[19px] font-black tracking-wider text-white">
            STAKE<span className="text-[var(--accent)]">ZA</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Link href="/search" aria-label="Search" className="p-1 text-[var(--text-bright)]">
            <Search size={21} strokeWidth={2} />
          </Link>
          <HeaderActions onOpenAccount={() => setAccountOpen(true)} />
        </div>
      </div>

      <AccountDrawer open={accountOpen} onClose={() => setAccountOpen(false)} />
    </header>
  );
}

// ------------------------------------------------------------- bottom nav

const NAV = [
  { href: "/", label: "Home", Icon: BrandIcon },
  { href: "/az", label: "AZ Menu", Icon: LayoutGrid },
  { href: "/games", label: "Games", Icon: Gamepad2 },
  { href: "/my-bets", label: "My Bets", Icon: ReceiptText },
  { href: "/account", label: "Me", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-[var(--surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      <div className="grid w-full grid-cols-5 md:mx-auto md:max-w-2xl">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 pb-2 pt-2.5"
              style={{ color: active ? "var(--accent)" : "rgba(255,255,255,0.7)" }}
            >
              {active && (
                <span className="glow-gold-sm absolute top-0 h-1 w-8 rounded-full bg-[var(--accent)]" />
              )}
              <item.Icon size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Floating slip counter — only shown once there is something to place. */
export function SlipButton() {
  const legs = useSlip((s) => s.legs);
  const setOpen = useSlip((s) => s.setOpen);

  if (!legs.length) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Bet slip, ${legs.length} selection${legs.length === 1 ? "" : "s"}`}
      className="glow-gold fixed bottom-[78px] right-3 z-30 flex h-[54px] w-[54px] flex-col items-center justify-center rounded-full border-2 border-white bg-[var(--accent)] text-black transition-transform active:scale-95"
    >
      <span className="text-[16px] font-black leading-none">SLIP</span>
      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-[var(--lose)] text-[11px] font-black text-white shadow-md">
        {legs.length}
      </span>
    </button>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] w-full pb-24">{children}</main>
      <SlipButton />
      <BottomNav />
    </>
  );
}
