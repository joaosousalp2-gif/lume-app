/*
 * Home — Lume
 * Design: Modernismo Humanista com Sistema de Abas
 * Página principal com navegação por abas para melhor UX
 * Público-alvo: pessoas com mais de 60 anos e seus familiares
 */

import { lazy, Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Tabs, { TabItem } from "@/components/Tabs";
import { Wallet, Shield, BarChart3, Brain, Download, CheckCircle2 } from "lucide-react";

// Lazy load seções
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
const EconomicIndicators = lazy(() => import("@/components/EconomicIndicators"));
const DocumentValidator = lazy(() => import("@/components/DocumentValidator"));
const DownloadSection = lazy(() => import("@/components/DownloadSection"));
const Footer = lazy(() => import("@/components/Footer"));

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
  const [activeSection, setActiveSection] = useState("financeiro");

  const mainTabs: TabItem[] = [
    {
      id: "financeiro",
      label: "Gestão Financeira",
      icon: <Wallet className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
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
            <EconomicIndicators />
          </Suspense>
        </div>
      ),
    },
    {
      id: "seguranca",
      label: "Segurança",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <Suspense fallback={<SectionPlaceholder />}>
            <SecuritySection />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <SecurityDashboard />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <FraudProtection />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <DocumentValidator />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <TrustVerification />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <TrustIntegration />
          </Suspense>
        </div>
      ),
    },
    {
      id: "analise",
      label: "Análise & IA",
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <Suspense fallback={<SectionPlaceholder />}>
            <AIAnalysis />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <HowItWorksSection />
          </Suspense>
        </div>
      ),
    },
    {
      id: "acessibilidade",
      label: "Acessibilidade",
      icon: <CheckCircle2 className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <Suspense fallback={<SectionPlaceholder />}>
            <AccessibilitySection />
          </Suspense>
        </div>
      ),
    },
    {
      id: "download",
      label: "Baixar",
      icon: <Download className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <Suspense fallback={<SectionPlaceholder />}>
            <DownloadSection />
          </Suspense>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {/* Main Content with Tabs */}
      <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Explore Lume</h2>
            <p className="text-gray-400">Escolha uma seção para descobrir todas as funcionalidades</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <Tabs
              tabs={mainTabs}
              defaultTab="financeiro"
              variant="pills"
              size="md"
              onTabChange={setActiveSection}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Suspense fallback={<SectionPlaceholder />}>
        <Footer />
      </Suspense>
    </div>
  );
}
