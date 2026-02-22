"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const linkClass = (href) =>
    `text-sm transition ${
      pathname === href
        ? "text-emerald-400 font-semibold"
        : "text-gray-400 hover:text-emerald-400"
    }`;

  return (
    <nav className="border-b border-gray-800/60 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-emerald-400 font-bold text-sm tracking-tight">
          MacroMeal
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/profile" className={linkClass("/profile")}>Profile</Link>
          <Link href="/calculator" className={linkClass("/calculator")}>Calculator</Link>
          <Link href="/plan" className={linkClass("/plan")}>Plan</Link>
        </div>
      </div>
    </nav>
  );
}
