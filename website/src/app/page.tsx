import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionOverview from "@/components/landing/SolutionOverview";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import TechArchitecture from "@/components/landing/TechArchitecture";
import AmdOptimization from "@/components/landing/AmdOptimization";
import Roadmap from "@/components/landing/Roadmap";
import TeamSection from "@/components/landing/TeamSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSection />
      <SolutionOverview />
      <FeaturesGrid />
      <TechArchitecture />
      <AmdOptimization />
      <Roadmap />
      <TeamSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
