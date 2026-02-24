import { useState } from 'react';
import { useAppState } from '../../store/useStore';
import { formatCurrency, formatDate, statusLabel, statusColor } from '../../utils/format';
import type { Bill, VoteRecord } from '../../types';

function emptyVoteRecord(billId: string): VoteRecord {
  return {
    billId,
    houseVotes: [],
    senateVotes: [],
    houseCount: { yea: 0, nay: 0, present: 0, absent: 0 },
    senateCount: { yea: 0, nay: 0, present: 0, absent: 0 },
    presidentialAction: null,
    vetoOverrideHouse: null,
    vetoOverrideSenate: null,
  };
}

export default function BillList() {
  const [state, dispatch] = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSponsor, setNewSponsor] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim() || !newSponsor.trim()) return;

    const id = `bill-${Date.now()}`;
    const newBill: Bill = {
      id,
      title: newTitle.trim(),
      status: 'draft',
      sponsor: newSponsor.trim(),
      introducedDate: new Date().toISOString().slice(0, 10),
      text: '',
      authorizations: [],
      amendments: [],
      votes: emptyVoteRecord(id),
    };

    dispatch({ type: 'ADD_BILL', payload: newBill });
    dispatch({ type: 'SELECT_BILL', payload: id });
    setNewTitle('');
    setNewSponsor('');
    setShowForm(false);
  };

  const totalAuth = (bill: Bill) =>
    bill.authorizations.reduce((sum, a) => sum + (a.amountCap ?? 0), 0);

  return (
    <aside className="w-80 min-w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Bills
          </h2>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {showForm ? 'Cancel' : '+ New Bill'}
          </button>
        </div>

        {/* Inline creation form */}
        {showForm && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder="Bill title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Sponsor (e.g. Rep. Jane Doe [D-CA])"
              value={newSponsor}
              onChange={(e) => setNewSponsor(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newSponsor.trim()}
              className="w-full px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Create Bill
            </button>
          </div>
        )}
      </div>

      {/* Bill cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {state.bills.map((bill) => {
          const isSelected = state.selectedBillId === bill.id;
          return (
            <button
              key={bill.id}
              onClick={() => dispatch({ type: 'SELECT_BILL', payload: bill.id })}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                {bill.title}
              </h3>
              <p className="text-xs text-gray-500 mb-1.5">{bill.sponsor}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {formatDate(bill.introducedDate)}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 ${statusColor(
                    bill.status
                  )}`}
                >
                  {statusLabel(bill.status)}
                </span>
              </div>
              {totalAuth(bill) > 0 && (
                <p className="text-xs font-medium text-gray-600 mt-1.5">
                  Total: {formatCurrency(totalAuth(bill))}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
