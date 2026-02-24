import { useState } from 'react';
import { useAppState } from '../../store/useStore';
import { formatCurrency, formatDate, statusLabel, statusColor } from '../../utils/format';
import VoteSimulation from './VoteSimulation';
import type { Bill, Authorization, Amendment } from '../../types';

type DetailTab = 'authorizations' | 'amendments' | 'vote';

// ---------------------------------------------------------------------------
// Authorization Form
// ---------------------------------------------------------------------------

function AddAuthorizationForm({
  bill,
  onClose,
}: {
  bill: Bill;
  onClose: () => void;
}) {
  const [state, dispatch] = useAppState();
  const [agencyId, setAgencyId] = useState(state.agencies[0]?.id ?? '');
  const [amountCap, setAmountCap] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [restriction, setRestriction] = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);

  const handleSubmit = () => {
    const auth: Authorization = {
      id: `auth-${Date.now()}`,
      billId: bill.id,
      agencyId,
      type: amountCap ? 'quantitative' : 'qualitative',
      amountCap: amountCap ? Number(amountCap) : null,
      timeLimit: timeLimit || null,
      restrictions,
      categories: [],
      color: '#6366f1',
    };
    dispatch({ type: 'ADD_AUTHORIZATION', payload: { billId: bill.id, authorization: auth } });
    onClose();
  };

  return (
    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">New Authorization</h4>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Agency</label>
        <select
          value={agencyId}
          onChange={(e) => setAgencyId(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {state.agencies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.abbreviation})
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount Cap ($)</label>
          <input
            type="number"
            value={amountCap}
            onChange={(e) => setAmountCap(e.target.value)}
            placeholder="e.g. 1000000000"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Time Limit</label>
          <input
            type="date"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Restrictions</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={restriction}
            onChange={(e) => setRestriction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && restriction.trim()) {
                setRestrictions((prev) => [...prev, restriction.trim()]);
                setRestriction('');
              }
            }}
            placeholder="Type and press Enter"
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              if (restriction.trim()) {
                setRestrictions((prev) => [...prev, restriction.trim()]);
                setRestriction('');
              }
            }}
            className="px-3 py-1.5 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Add
          </button>
        </div>
        {restrictions.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {restrictions.map((r, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-gray-400 mt-0.5">-</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={!agencyId}
          className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add Authorization
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Amendment Form
// ---------------------------------------------------------------------------

function ProposeAmendmentForm({
  bill,
  onClose,
}: {
  bill: Bill;
  onClose: () => void;
}) {
  const [, dispatch] = useAppState();
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');

  const handleSubmit = () => {
    if (!author.trim() || !description.trim()) return;

    const amendment: Amendment = {
      id: `amend-${Date.now()}`,
      billId: bill.id,
      author: author.trim(),
      timestamp: new Date().toISOString(),
      description: description.trim(),
      changes: [
        {
          lineNumber: 1,
          oldText: oldText.trim(),
          newText: newText.trim(),
        },
      ],
      status: 'proposed',
    };

    dispatch({ type: 'ADD_AMENDMENT', payload: { billId: bill.id, amendment } });
    onClose();
  };

  return (
    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Propose Amendment</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Rep. Jane Doe"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Original Text</label>
        <textarea
          value={oldText}
          onChange={(e) => setOldText(e.target.value)}
          rows={3}
          placeholder="Text to be replaced"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">New Text</label>
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          rows={3}
          placeholder="Replacement text"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={!author.trim() || !description.trim()}
          className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Submit Amendment
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BillDetail() {
  const [state, dispatch] = useAppState();
  const [activeTab, setActiveTab] = useState<DetailTab>('authorizations');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showAmendForm, setShowAmendForm] = useState(false);

  const bill = state.bills.find((b) => b.id === state.selectedBillId);
  if (!bill) return null;

  const agencyName = (agencyId: string) =>
    state.agencies.find((a) => a.id === agencyId)?.name ?? agencyId;

  const agencyAbbr = (agencyId: string) =>
    state.agencies.find((a) => a.id === agencyId)?.abbreviation ?? '';

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'authorizations', label: 'Authorizations' },
    { key: 'amendments', label: 'Amendments' },
    { key: 'vote', label: 'Vote' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Enacted banner */}
      {bill.status === 'enacted' && (
        <div className="mb-4 p-3 bg-green-100 border-2 border-green-400 rounded-lg flex items-center gap-3">
          <span className="text-2xl">&#9878;</span>
          <div>
            <p className="text-sm font-bold text-green-800">Enacted into Law</p>
            <p className="text-xs text-green-600">
              This bill has passed both chambers and received presidential approval. Authorizations are now active.
            </p>
          </div>
        </div>
      )}

      {/* Bill header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">{bill.title}</h1>
          <span
            className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full border ${statusColor(
              bill.status
            )} border-current bg-white`}
          >
            {statusLabel(bill.status)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>{bill.sponsor}</span>
          <span>Introduced {formatDate(bill.introducedDate)}</span>
        </div>
      </div>

      {/* Bill text */}
      {bill.text && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Bill Text
          </h2>
          <pre className="max-h-64 overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
            {bill.text}
          </pre>
        </div>
      )}

      {/* Sub-navigation tabs */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.key === 'authorizations' && bill.authorizations.length > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    ({bill.authorizations.length})
                  </span>
                )}
                {tab.key === 'amendments' && bill.amendments.length > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    ({bill.amendments.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'authorizations' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Spending Authorizations</h3>
            <button
              onClick={() => setShowAuthForm((prev) => !prev)}
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {showAuthForm ? 'Cancel' : '+ Add Authorization'}
            </button>
          </div>

          {showAuthForm && (
            <AddAuthorizationForm bill={bill} onClose={() => setShowAuthForm(false)} />
          )}

          {bill.authorizations.length === 0 && !showAuthForm && (
            <p className="text-sm text-gray-400 italic py-8 text-center">
              No authorizations yet. Add one to define spending authority.
            </p>
          )}

          <div className="space-y-3 mt-3">
            {bill.authorizations.map((auth) => (
              <div
                key={auth.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-start gap-3">
                  {/* Color indicator */}
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: auth.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {agencyName(auth.agencyId)}{' '}
                        <span className="text-gray-400 font-normal">
                          ({agencyAbbr(auth.agencyId)})
                        </span>
                      </h4>
                      {auth.amountCap !== null && (
                        <span className="text-sm font-bold text-gray-800">
                          {formatCurrency(auth.amountCap)}
                        </span>
                      )}
                    </div>

                    {auth.timeLimit && (
                      <p className="text-xs text-gray-500 mb-2">
                        Expires: {formatDate(auth.timeLimit)}
                      </p>
                    )}

                    {/* Categories */}
                    {auth.categories.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Categories:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {auth.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {cat.label}
                              {cat.quantitativeCap !== null && (
                                <span className="text-gray-400">
                                  ({formatCurrency(cat.quantitativeCap)})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Restrictions */}
                    {auth.restrictions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Restrictions:</p>
                        <ul className="space-y-0.5">
                          {auth.restrictions.map((r, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-red-300 before:rounded-full"
                            >
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'amendments' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Amendments</h3>
            <button
              onClick={() => setShowAmendForm((prev) => !prev)}
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {showAmendForm ? 'Cancel' : '+ Propose Amendment'}
            </button>
          </div>

          {showAmendForm && (
            <ProposeAmendmentForm bill={bill} onClose={() => setShowAmendForm(false)} />
          )}

          {bill.amendments.length === 0 && !showAmendForm && (
            <p className="text-sm text-gray-400 italic py-8 text-center">
              No amendments have been proposed.
            </p>
          )}

          <div className="space-y-3 mt-3">
            {bill.amendments.map((amend) => {
              const statusBg =
                amend.status === 'adopted'
                  ? 'bg-green-100 text-green-700'
                  : amend.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700';

              return (
                <div
                  key={amend.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {amend.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {amend.author} &middot; {formatDate(amend.timestamp)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusBg}`}
                    >
                      {amend.status.charAt(0).toUpperCase() + amend.status.slice(1)}
                    </span>
                  </div>

                  {/* Diff display */}
                  {amend.changes.map((change, ci) => (
                    <div
                      key={ci}
                      className="mt-2 font-mono text-xs rounded overflow-hidden border border-gray-200"
                    >
                      {change.oldText && (
                        <div className="bg-red-50 text-red-800 px-3 py-1.5 border-b border-gray-200">
                          <span className="select-none text-red-400 mr-2">-</span>
                          {change.oldText}
                        </div>
                      )}
                      {change.newText && (
                        <div className="bg-green-50 text-green-800 px-3 py-1.5">
                          <span className="select-none text-green-400 mr-2">+</span>
                          {change.newText}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Action buttons for proposed amendments */}
                  {amend.status === 'proposed' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_AMENDMENT_STATUS',
                            payload: {
                              billId: bill.id,
                              amendmentId: amend.id,
                              status: 'adopted',
                            },
                          })
                        }
                        className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Adopt
                      </button>
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_AMENDMENT_STATUS',
                            payload: {
                              billId: bill.id,
                              amendmentId: amend.id,
                              status: 'rejected',
                            },
                          })
                        }
                        className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'vote' && <VoteSimulation bill={bill} />}
    </div>
  );
}
