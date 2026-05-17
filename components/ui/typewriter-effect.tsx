"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import React, { useEffect } from "react";

type WordItem = {
  text: string;
  className?: string;
};

interface TypewriterEffectProps {
  words: WordItem[];
  className?: string;
  cursorClassName?: string;
}

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: TypewriterEffectProps) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true, margin: "-100px" });

  const totalChars = wordsArray.reduce(
    (acc, word) => acc + word.text.length + 1,
    0
  );

  useEffect(() => {
    if (!isInView || !scope.current) return;

    const timer = setTimeout(() => {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
        },
        {
          duration: 0.1,
          delay: stagger(0.02),
          ease: [0.25, 0.1, 0.25, 1],
        }
      );
    }, 100);

    return () => clearTimeout(timer);
  }, [isInView, animate, totalChars, scope]);

  const renderWords = () => {
    return (
      <motion.div
        ref={scope}
        className="inline"
        style={{
          willChange: "contents",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {wordsArray.map((word, idx) => (
          <React.Fragment key={`word-${idx}`}>
            {word.text.map((char, index) => (
              <motion.span
                initial={{}}
                key={`char-${idx}-${index}`}
                className={cn("opacity-0 hidden", word.className)}
                style={{
                  willChange: "opacity, display",
                  transform: "translateZ(0)",
                }}
              >
                {char}
              </motion.span>
            ))}
            {idx < wordsArray.length - 1 && (
              <motion.span
                initial={{}}
                key={`space-${idx}`}
                className={cn("opacity-0 hidden", word.className)}
                style={{
                  willChange: "opacity, display",
                  transform: "translateZ(0)",
                  width: "0.3em",
                }}
              >
                &nbsp;
              </motion.span>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn("text-center", className)}>
      <div>
        {renderWords()}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{ willChange: "opacity" }}
          className={cn(
            "ml-1 inline-block h-4 w-[4px] rounded-sm md:h-5 lg:h-6",
            cursorClassName || "bg-gray-700"
          )}
        />
      </div>
    </div>
  );
};
