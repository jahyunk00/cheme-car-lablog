"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";

import { AvatarArt } from "@/components/avatar-faces";
import type { LablogAvatarId } from "@/lib/avatar-ids";
import { LABLOG_AVATAR_IDS } from "@/lib/avatar-ids";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const AVATAR_META: { id: LablogAvatarId; alt: string }[] = LABLOG_AVATAR_IDS.map((id) => ({
  id,
  alt: `Avatar option ${id}`,
}));

const mainAvatarVariants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const pickerVariants = {
  container: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    initial: {
      y: 20,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      },
    },
  },
};

const selectedVariants = {
  initial: {
    opacity: 0,
    rotate: -180,
  },
  animate: {
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    rotate: 180,
    transition: {
      duration: 0.2,
    },
  },
};

export type AvatarPickerProps = {
  value: LablogAvatarId;
  onChange: (id: LablogAvatarId) => void;
  /** Shown under the large preview (e.g. the name they typed). */
  displayName: string;
};

export function AvatarPicker({ value, onChange, displayName }: AvatarPickerProps) {
  const rootId = useId().replace(/:/g, "");
  const [rotationCount, setRotationCount] = useState(0);

  const selected = useMemo(() => AVATAR_META.find((a) => a.id === value) ?? AVATAR_META[0], [value]);

  function handleAvatarSelect(id: LablogAvatarId) {
    setRotationCount((prev) => prev + 1080);
    onChange(id);
  }

  return (
    <motion.div initial="initial" animate="animate" className="w-full">
      <Card className="mx-auto w-full max-w-md overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <CardContent className="p-0">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "8rem",
              transition: {
                height: {
                  type: "spring" as const,
                  stiffness: 100,
                  damping: 20,
                },
              },
            }}
            className="w-full bg-gradient-to-r from-primary/20 to-primary/10"
          />

          <div className="-mt-16 px-8 pb-8">
            <motion.div
              className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 bg-background"
              variants={mainAvatarVariants}
              layoutId={`${rootId}-selectedAvatar`}
            >
              <motion.div
                className="flex h-full w-full scale-[3] items-center justify-center"
                animate={{
                  rotate: rotationCount,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1] as const,
                }}
              >
                <AvatarArt id={selected.id} uniquePrefix={`${rootId}-hero`} pixelSize={40} />
              </motion.div>
            </motion.div>

            <motion.div className="mt-4 text-center" variants={pickerVariants.item}>
              <motion.h2
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {displayName.trim() || "You"}
              </motion.h2>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Select your avatar
              </motion.p>
            </motion.div>

            <motion.div className="mt-6" variants={pickerVariants.container}>
              <motion.div className="flex justify-center gap-4" variants={pickerVariants.container}>
                {AVATAR_META.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleAvatarSelect(avatar.id)}
                    className={cn(
                      "relative h-12 w-12 overflow-hidden rounded-full border-2",
                      "transition-all duration-300"
                    )}
                    variants={pickerVariants.item}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{
                      y: 0,
                      transition: { duration: 0.2 },
                    }}
                    aria-label={avatar.alt}
                    aria-pressed={value === avatar.id}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <AvatarArt id={avatar.id} uniquePrefix={`${rootId}-thumb-${avatar.id}`} pixelSize={40} />
                    </div>
                    {value === avatar.id ? (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        variants={selectedVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layoutId={`${rootId}-selectedIndicator-${avatar.id}`}
                      />
                    ) : null}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
