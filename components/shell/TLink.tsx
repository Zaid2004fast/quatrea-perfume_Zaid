"use client";
import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useTransition } from "./Providers";

/** A Next.js Link that plays the house curtain before navigating. */
export function TLink({ href, label, onClick, ...rest }: ComponentProps<typeof Link> & { href: string; label?: string }) {
  const { go } = useTransition();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(href, label);
      }}
    />
  );
}
