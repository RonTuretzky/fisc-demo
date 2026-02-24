import { useAppState } from '../../store/useStore';
import type { AppState } from '../../types';

const TABS: { key: AppState['currentView']; label: string }[] = [
  { key: 'legislative', label: 'Legislative' },
  { key: 'committee', label: 'Committee Refinement' },
  { key: 'agency', label: 'Agency Spending' },
];

export default function Header() {
  const [state, dispatch] = useAppState();

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-amber-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.58-3.77-1.22-7-5.75-7-10.58V6.3l7-3.12zM11 7v2h2V7h-2zm0 4v6h2v-6h-2z" />
          </svg>
          <h1 className="text-lg font-bold tracking-tight">
            Congressional Fiscal Ledger
          </h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = state.currentView === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: tab.key })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Reset Demo Button */}
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-700 rounded hover:bg-gray-800 hover:text-gray-200 transition-colors"
        >
          Reset Demo
        </button>
      </div>
    </header>
  );
}
