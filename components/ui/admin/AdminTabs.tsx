// NOT IN Template-Repo — application-level pattern, not a generic primitive.
// Vertical tab switcher specifically for admin pages; not template-worthy.

/**
 * Generic vertical tab switcher for admin panels.
 * 
 * @example
 * ```tsx
 * const tabs = ['Students', 'Carriers', 'Senders'] as const;
 * const [activeTab, setActiveTab] = useState(tabs[0]);
 * 
 * <AdminTabs
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   setActiveTab={setActiveTab}
 * />
 * ```
 */
interface AdminTabsProps<T extends string> {
  /** List of tab labels */
  tabs: T[];
  
  /** Currently selected tab */
  activeTab: T;
  
  /** Callback when a tab is clicked */
  setActiveTab: (tab: T) => void;
}

export default function AdminTabs<T extends string>({
  tabs,
  activeTab,
  setActiveTab,
}: AdminTabsProps<T>) {
  return (
    <div className="w-48 flex flex-col gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`text-left px-4 py-2 rounded ${
            activeTab === tab
              ? 'bg-byu-navy text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}