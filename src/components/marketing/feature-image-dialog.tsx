"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

type FeatureImageDialogProps = {
  image: string;
  title: string;
  description: string;
};

export function FeatureImageDialog({ image, title, description }: FeatureImageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`${title}. ${description}`}
          className="relative block w-full overflow-hidden rounded-3xl transition-transform duration-200 hover:scale-105 focus:outline-none"
        >
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-contain"
            />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-transparent"
        className="left-0 top-0 h-screen max-w-none translate-x-0 translate-y-0 border-none bg-transparent p-0 shadow-none md:left-[50%] md:top-[50%] md:h-[85vh] md:w-[min(92vw,1200px)] md:max-w-[92vw] md:max-h-[90vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border md:border-neutral-800 md:bg-transparent"
      >
        <div className="relative h-full w-full">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
          <DialogClose className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/40 md:right-4 md:top-4">
            <Icon icon="lucide:x" width={20} height={20} />
            <span className="sr-only">Close image preview</span>
          </DialogClose>
          <div className="relative flex h-full min-h-0 w-full items-center justify-center p-3 sm:p-4 md:p-5">
            <div className="relative h-full w-full">
              <Image
                src={image}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
