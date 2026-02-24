import { useAppState } from '../../store/useStore';
import BillList from './BillList';
import BillDetail from './BillDetail';

export default function LegislativeDashboard() {
  const [state] = useAppState();

  return (
    <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
      <BillList />
      {state.selectedBillId ? (
        <BillDetail />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg
              className="mx-auto w-16 h-16 text-gray-300 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-400">
              Select a bill to view details
            </p>
            <p className="text-sm text-gray-300 mt-1">
              Choose from the list on the left or create a new bill
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
