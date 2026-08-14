/*
 * Home — Lume
 * Design: Modernismo Humanista com Sistema de Abas
 * Página principal com navegação por abas para melhor UX
 * Público-alvo: pessoas com mais de 60 anos e seus familiares
 */

import { lazy, Suspense, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import type { TabItem } from "@/components/Tabs";
import HomeExplorer from "@/components/HomeExplorer";
import TutorialOverlay from "@/components/TutorialOverlay";
import { useTabsContext } from "@/contexts/TabsContext";
import { Wallet, Shield, Brain, Download, CheckCircle2 } from "lucide-react";

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
const MonthlyReportExport = lazy(() => import("@/components/MonthlyReportExport"));
const CategoryMonthlyComparison = lazy(() => import("@/components/CategoryMonthlyComparison"));
const PrintableFinancialSummary = lazy(() => import("@/components/PrintableFinancialSummary"));
const PersonalizedFinancialAdvice = lazy(() => import("@/components/PersonalizedFinancialAdvice"));
const FinancialHealthIndicator = lazy(() => import("@/components/FinancialHealthIndicator"));
const RecentScamCheck = lazy(() => import("@/components/RecentScamCheck"));
const FinancialPlanningPanel = lazy(() => import("@/components/FinancialPlanningPanel"));
const PluggyOpenBankingPanel = lazy(() => import("@/components/PluggyOpenBankingPanel"));
const AnnualSummaryPanel = lazy(() => import("@/components/AnnualSummaryPanel"));
const TrustVerification = lazy(() => import("@/components/TrustVerification"));
const TrustIntegration = lazy(() => import("@/components/TrustIntegration"));
const SecurityCenterSettings = lazy(() => import("@/components/SecurityCenterSettings"));
const FraudAlertsPanel = lazy(() => import("@/components/FraudAlertsPanel"));
const DocumentVault = lazy(() => import("@/components/DocumentVault"));
const ScamPreventionPanel = lazy(() => import("@/components/ScamPreventionPanel"));
const HealthStatusPanel = lazy(() => import("@/components/HealthStatusPanel"));
const EconomicIndicators = lazy(() => import("@/components/EconomicIndicators"));
const DocumentValidator = lazy(() => import("@/components/DocumentValidator"));
const DownloadSection = lazy(() => import("@/components/DownloadSection"));
const Footer = lazy(() => import("@/components/Footer"));
const FloatingAIAssistant = lazy(() => import("@/components/FloatingAIAssistant"));

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
  const { activeTab, setActiveTab } = useTabsContext();

  const mainTabs = useMemo<TabItem[]>(() => [
    {
      id: "financeiro",
      label: "Gestão Financeira",
      icon: <Wallet className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <Suspense fallback={<SectionPlaceholder />}>
            <FinancialHealthIndicator />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <PersonalizedFinancialAdvice />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <CategoryMonthlyComparison />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <PrintableFinancialSummary />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <MonthlyReportExport />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <FinancialPlanningPanel />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <PluggyOpenBankingPanel />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <AnnualSummaryPanel />
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
            <RecentScamCheck />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <SecuritySection />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <SecurityDashboard />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <SecurityCenterSettings />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <FraudProtection />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <FraudAlertsPanel />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <DocumentValidator />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <DocumentVault />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <ScamPreventionPanel />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <TrustVerification />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <TrustIntegration />
          </Suspense>
          <Suspense fallback={<SectionPlaceholder />}>
            <HealthStatusPanel />
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
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <TutorialOverlay />
      <Suspense fallback={null}>
        <FloatingAIAssistant />
      </Suspense>
      <HeroSection />
      <FeaturesSection />

      <main>
        <HomeExplorer tabs={mainTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </main>

      <Suspense fallback={<SectionPlaceholder />}>
        <Footer />
      </Suspense>
    </div>
  );
}
