"use client";
import dynamic from "next/dynamic";

const WorldCanvas = dynamic(() => import("../world/WorldCanvas"), { ssr: false });

export function WorldMount() {
  return (
    <>
      <WorldCanvas />
      <div className="finish" aria-hidden />
    </>
  );
}
