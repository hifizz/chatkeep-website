"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Icon } from "@iconify/react";
import { useRef } from "react";

export function HeroImage() {
  const { scrollY } = useScroll();

  // Transform scroll position to rotation and scale
  // 0px -> 20deg tilt, 0.9 scale
  // 400px -> 0deg tilt, 1.0 scale (flat)
  const rotateX = useTransform(scrollY, [0, 400], [20, 0]);
  const scale = useTransform(scrollY, [0, 400], [0.9, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 400], [0.5, 0.2]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 perspective-[1200px]">
      <motion.div
        style={{
          rotateX,
          scale,
          transformOrigin: "top center",
        }}
        className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/50"
      >
        {/* Placeholder for the actual app screenshot. Using a simple UI representation. */}
        <div className="absolute inset-0 bg-neutral-950">
          <div className="absolute top-0 left-0 right-0 h-12 border-b border-neutral-800 bg-neutral-900 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
              <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
              <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
            </div>
            <div className="mx-auto w-1/3 h-6 bg-neutral-800 rounded-md flex items-center justify-center text-[10px] text-neutral-500 font-mono">
              https://dev.chatkeep.dev
            </div>
          </div>
          <div className="absolute top-12 bottom-0 left-0 w-64 border-r border-neutral-800 bg-neutral-900 p-4 space-y-3 hidden md:block">
            <div className="h-4 w-3/4 bg-neutral-800 rounded"></div>
            <div className="h-4 w-1/2 bg-neutral-800 rounded"></div>
            <div className="h-4 w-5/6 bg-neutral-800 rounded"></div>
          </div>
          <div className="absolute top-12 bottom-0 right-0 left-0 md:left-64 p-8 flex flex-col gap-6 items-center justify-center text-neutral-500">
            <div className="text-center space-y-2">
              <Icon
                icon="lucide:message-square"
                width={48}
                height={48}
                className="mx-auto opacity-10"
              />
              <p className="text-lg font-medium text-neutral-400">Your Chat Knowledge Base</p>
              <p className="text-sm opacity-60 text-neutral-600">
                Visual placeholder for app screenshot
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
