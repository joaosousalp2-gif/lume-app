import type { TabItem } from "@/components/Tabs";
import Tabs from "@/components/Tabs";
import { useId } from "react";

interface HomeExplorerProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function HomeExplorer({ tabs, activeTab, onTabChange }: HomeExplorerProps) {
  const headingId = useId();

  return (
    <section
      id="funcionalidades"
      className="w-full bg-gradient-to-b from-slate-900 to-slate-950 py-12"
      aria-labelledby={headingId}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <header className="mb-8">
          <h2 id={headingId} className="text-3xl font-bold text-white md:text-4xl">
            Explore o Lume
          </h2>
          <p className="mt-2 text-gray-400">
            Escolha uma área para ver as funcionalidades principais.
          </p>
        </header>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
          <Tabs
            tabs={tabs}
            defaultTab={activeTab}
            variant="pills"
            size="md"
            onTabChange={onTabChange}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
