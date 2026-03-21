"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

type HeroImageProps = {
  src: string;
  alt?: string;
};

export function HeroImage({ src, alt = "Hero image" }: HeroImageProps) {
  const { scrollY } = useScroll();

  // 0px -> 20deg tilt, 0.9 scale
  // 400px -> 0deg tilt, 1.0 scale (flat)
  const rotateX = useTransform(scrollY, [0, 400], [20, 0]);
  const scale = useTransform(scrollY, [0, 400], [0.9, 1]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 perspective-[1200px]">
      <motion.div
        style={{
          rotateX,
          scale,
          transformOrigin: "top center",
        }}
        className="relative aspect-[16/10] rounded-3xl"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-contain"
          priority
        />
      </motion.div>
    </div>
  );
}
