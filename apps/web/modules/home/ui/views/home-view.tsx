"use client";

import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

import { BentoFeatures } from "../components/bento-features";
import { HomeFaq } from "../components/home-faq";
import { HomeCta } from "../components/home-cta";
import CharAnimation from "@repo/ui/components/char-animation";
import { HeroDashboard } from "../components/hero-dashboard";
import { CursorTrailEffect } from "../components/cursor-trail-effect";

const HomeView = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden w-full bg-background transition-colors duration-300">
      {/* Rectangular horizon backdrop */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-screen overflow-hidden pointer-events-none select-none z-0 blur-sm"
        style={{
          backgroundImage: `linear-gradient(
            to top,
            var(--radial-center) 0%,
            var(--radial-stop1) 18%,
            var(--radial-stop2) 35%,
            var(--radial-stop3) 50%,
            var(--radial-stop4) 70%,
            var(--radial-stop5) 100%
          )`,
        }}
      >
        {/* Rectangular foreground overlay */}
        <div className="absolute inset-x-0 bottom-0 z-50 h-3/4 bg-background transition-colors duration-300 animate-fade-in md:mx-24 rounded-t-4xl" />
      </div>

      <CursorTrailEffect fixed />

      <div className="relative z-10">
        {/* ── Hero Section ── */}
        <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center mt-24">
          {/* Center Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-3 rounded-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium border border-foreground/5 shadow-sm relative z-10"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-custom animate-pulse" />
            <span className="text-foreground font-semibold">
              Rescomail v1.0
            </span>
            <span className="hidden md:block text-muted-foreground">·</span>
            <span className="hidden md:block text-muted-foreground">
              Beta Version
            </span>
          </motion.div>

          {/* Main Content */}
          <div className="mx-auto max-w-4xl px-4 w-full text-center relative z-10 flex flex-col items-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-sans tracking-wider mb-6 text-4xl sm:text-6xl font-extrabold text-foreground leading-[1.08] max-w-3xl"
            >
              An assistant for <br />
              your{" "}
              <CharAnimation
                text="shortlist"
                className="text-4xl md:text-6xl text-blue-500! dark:text-purple-500!"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-8 text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto"
            >
              Rescomail surfaces relevant jobs, perfects your resume, and writes
              high-converting cold emails so you can land your role.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative group z-10"
            >
              {/* Glowing background behind button */}
              <div className="absolute -inset-x-8 -inset-y-4 bg-blue-500/20 blur-2xl rounded-full opacity-60 group-hover:opacity-85 transition-opacity duration-500 pointer-events-none" />

              <Button
                className="relative h-9 md:h-11 px-6 md:px-8 text-xs md:text-sm backdrop-blur-xl! font-semibold rounded-full"
                asChild
              >
                <Link
                  href="/login"
                  className="h-9.5! md:h-11! relative pl-11 md:pl-14!"
                >
                  Try for free
                  <div className="absolute left-0.5 md:left-1 p-2 md:p-2.5 bg-background text-foreground rounded-full border border-black!">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <HeroDashboard />
        <BentoFeatures />
        <HomeCta />
        <HomeFaq />
      </div>
    </main>
  );
};

export default HomeView;
