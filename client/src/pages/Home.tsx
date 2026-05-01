/*
 * Home — Lume
 * Design: Modernismo Humanista
 * Página principal com todas as seções do site de apresentação do aplicativo Lume
 * Público-alvo: pessoas com mais de 60 anos e seus familiares
 * Otimizações: Lazy loading para seções below-the-fold, React.memo para componentes estáticos
 */

import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";

// Lazy load seções below-the-fold para melhor performance inicial
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection"));
const AccessibilitySection = lazy(() => import("@/components/AccessibilitySection"));
const LaunchesSection = lazy(() => import("@/components/LaunchesSection"));
const SavingsGoals = lazy(() => import("@/components/SavingsGoals"));
const SpreadsheetsSection = lazy(() => import("@/components/SpreadsheetsSection"));
const SecurityDashboard = lazy(() => import("@/components/SecurityDashboard"));
const FraudProtection = lazy(() => import("@/components/FraudProtection"));
const CentralDashboard = lazy(() => import("@/components/CentralDashboard"));
const AIAnalysis = lazy(() => import("@/components/AIAnalysis"));
const BankAccounts = lazy(() => import("@/components/BankAccounts"));
const Budget = lazy(() => import("@/components/Budget"));
const TrustVerification = lazy(() => import("@/components/TrustVerification"));
const TrustIntegration = lazy(() => import("@/components/TrustIntegration"));
const DownloadSection = lazy(() => import("@/components/DownloadSection"));
const Footer = lazy(() => import("@/components/Footer"));

// Placeholder para seções lazy-loaded
function SectionPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando seção...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      
      {/* Seções lazy-loaded com Suspense fallback */}
      <Suspense fallback={<SectionPlaceholder />}>
        <SecuritySection />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <HowItWorksSection />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <AccessibilitySection />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <LaunchesSection />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <SavingsGoals />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <CentralDashboard />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <BankAccounts />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <Budget />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <SpreadsheetsSection />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <SecurityDashboard />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <FraudProtection />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <AIAnalysis />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <TrustVerification />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <TrustIntegration />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <DownloadSection />
      </Suspense>
      
      <Suspense fallback={<SectionPlaceholder />}>
        <Footer />
      </Suspense>
    </div>
  );
}
