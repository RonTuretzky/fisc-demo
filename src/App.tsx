import { useAppState } from './store/useStore';
import Header from './components/common/Header';
import LegislativeDashboard from './components/legislative/LegislativeDashboard';
import CommitteeRefinement from './components/committee/CommitteeRefinement';
import AgencyDashboard from './components/agency/AgencyDashboard';

function App() {
  const [state] = useAppState();

  return (
    <div className="min-h-screen bg-navy-50">
      <Header />
      <main className="pt-16">
        {state.currentView === 'legislative' && <LegislativeDashboard />}
        {state.currentView === 'committee' && <CommitteeRefinement />}
        {state.currentView === 'agency' && <AgencyDashboard />}
      </main>
    </div>
  );
}

export default App;
