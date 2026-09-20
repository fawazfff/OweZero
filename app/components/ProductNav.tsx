// @ts-nocheck
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProductNav() {
  const path = usePathname();
  return <header className="product-nav"><div className="product-nav-inner">
    <Link className="brand" href="/"><span className="brand-mark">0</span>OweZero</Link>
    <nav><Link className={path === "/groups" ? "active" : ""} href="/groups">My groups</Link><Link href="/how-it-works">How it works</Link><Link href="/help">Help</Link></nav>
    <Link className="primary small" href="/create">+ New group</Link>
  </div></header>;
}
