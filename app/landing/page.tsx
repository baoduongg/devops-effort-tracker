"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingScreenSimulator } from "@/components/landing/landing-screen-simulator";
import { LandingAiSandbox } from "@/components/landing/landing-ai-sandbox";
import { LandingSlashCommands } from "@/components/landing/landing-slash-commands";
import { LandingChatops } from "@/components/landing/landing-chatops";
import { LandingComparison } from "@/components/landing/landing-comparison";
import { LandingRoleTabs } from "@/components/landing/landing-role-tabs";
import { LandingTechStack } from "@/components/landing/landing-tech-stack";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 selection:bg-sky-500/30 selection:text-sky-200 overflow-x-hidden">
      {/* Dynamic Background Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-sky-500/20 via-blue-600/15 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[65%] -right-48 w-[650px] h-[650px] bg-sky-600/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Fluid Navbar */}
      <LandingNavbar />

      {/* 1. Hero Section */}
      <LandingHero />

      {/* 2. Interactive Real-World App Screen Simulator (5 Deep Tabs) */}
      <LandingScreenSimulator />

      {/* 3. Interactive AI Copilot Sandbox Simulator */}
      <LandingAiSandbox />

      {/* 4. Slash Commands & Live Execution Preview Showcase */}
      <LandingSlashCommands />

      {/* 5. ChatOps Realtime Notifications & Webhooks */}
      <LandingChatops />

      {/* 6. Efficiency & Visibility Comparison */}
      <LandingComparison />

      {/* 7. Role-Tailored Value Proposition (DevOps vs Tech Lead) */}
      <LandingRoleTabs />

      {/* 8. Enterprise Tech Stack Architecture */}
      <LandingTechStack />

      {/* 9. Cosmic Aurora Conversion CTA */}
      <LandingCta />

      {/* 10. Agency Footer */}
      <LandingFooter />
    </div>
  );
}
