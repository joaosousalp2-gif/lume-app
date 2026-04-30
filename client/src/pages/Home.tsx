/*
 * Home — Lume
 * Design: Modernismo Humanista
 * Página principal com todas as seções do site de apresentação do aplicativo Lume
 * Público-alvo: pessoas com mais de 60 anos e seus familiares
 */

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SecuritySection from "@/components/SecuritySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AccessibilitySection from "@/components/AccessibilitySection";
import LaunchesSection from "@/components/LaunchesSection";
import SpreadsheetsSection from "@/components/SpreadsheetsSection";
import SecurityDashboard from "@/components/SecurityDashboard";
import FraudProtection from "@/components/FraudProtection";
import CentralDashboard from "@/components/CentralDashboard";
import AIAnalysis from "@/components/AIAnalysis";
import TrustVerification from "@/components/TrustVerification";
import TrustIntegration from "@/components/TrustIntegration";
import TestimonialsSection from "@/components/TestimonialsSection";
import DownloadSection from "@/components/DownloadSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <HowItWorksSection />
      <LaunchesSection />
      <CentralDashboard />
      <SpreadsheetsSection />
      <SecurityDashboard />
      <FraudProtection />
      <AIAnalysis />
      <TrustVerification />
      <TrustIntegration />
      <DownloadSection />
      <Footer />
    </div>
  );
}
