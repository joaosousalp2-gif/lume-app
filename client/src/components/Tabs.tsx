import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  variant = 'default',
  size = 'md',
  className = '',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  // Sincronizar activeTab quando defaultTab muda (ex: clique na Navbar)
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    default: {
      container: 'flex gap-2 border-b border-gray-700 overflow-x-auto',
      tab: 'relative font-semibold transition-all duration-200 whitespace-nowrap',
      active: 'text-blue-400 border-b-2 border-blue-400',
      inactive: 'text-gray-400 hover:text-gray-300',
    },
    pills: {
      container: 'flex gap-2 flex-wrap',
      tab: 'relative font-semibold transition-all duration-200 rounded-full whitespace-nowrap',
      active: 'bg-blue-600 text-white',
      inactive: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
    },
    underline: {
      container: 'flex gap-4 border-b border-gray-700 overflow-x-auto',
      tab: 'relative font-semibold transition-all duration-200 whitespace-nowrap pb-3',
      active: 'text-blue-400 border-b-2 border-blue-400 -mb-3',
      inactive: 'text-gray-400 hover:text-gray-300',
    },
  };

  const variantStyle = variantClasses[variant];

  return (
    <div className={className}>
      {/* Tab List */}
      <div className={variantStyle.container} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`${sizeClasses[size]} ${variantStyle.tab} ${
              activeTab === tab.id ? variantStyle.active : variantStyle.inactive
            } flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            className={`${activeTab === tab.id ? 'block' : 'hidden'} animate-fadeIn`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
