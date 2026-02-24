import { useState, useMemo } from 'react';
import { useAppState } from '../../store/useStore';
import { checkTransactionCompliance } from '../../utils/compliance';
import { formatCurrency } from '../../utils/format';
import TransactionLog from './TransactionLog';
import type { Transaction } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Total approved spend for a given set of transactions. */
function approvedSpend(txs: Transaction[]): number {
  return txs
    .filter((t) => t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Approved spend for a specific authorization. */
function authSpend(txs: Transaction[], authId: string): number {
  return txs
    .filter((t) => t.authorizationId === authId && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Approved spend for a specific category within an authorization. */
function categorySpend(txs: Transaction[], authId: string, categoryLabel: string): number {
  return txs
    .filter(
      (t) =>
        t.authorizationId === authId &&
        t.category === categoryLabel &&
        t.status === 'approved',
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

// ---------------------------------------------------------------------------
// Progress bar component
// ---------------------------------------------------------------------------

function ProgressBar({
  spent,
  total,
  color = '#2563eb',
  height = 'h-4',
}: {
  spent: number;
  total: number;
  color?: string;
  height?: string;
}) {
  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const overBudget = spent > total;

  return (
    <div className={`w-full ${height} bg-slate-200 rounded-full overflow-hidden`}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${pct}%`,
          backgroundColor: overBudget ? '#dc2626' : color,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AgencyDashboard() {
  const [state, dispatch] = useAppState();

  // Transaction form state
  const [selectedAuthId, setSelectedAuthId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txResult, setTxResult] = useState<{
    success: boolean;
    message: string;
    violations?: string[];
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const fundedAgencies = useMemo(
    () => state.agencies.filter((a) => a.creditLimit > 0),
    [state.agencies],
  );

  const selectedAgency = useMemo(
    () => state.agencies.find((a) => a.id === state.selectedAgencyId) ?? null,
    [state.agencies, state.selectedAgencyId],
  );

  const agencyTransactions = useMemo(
    () =>
      selectedAgency
        ? state.transactions.filter((t) => t.agencyId === selectedAgency.id)
        : [],
    [state.transactions, selectedAgency],
  );

  const totalSpent = useMemo(() => approvedSpend(agencyTransactions), [agencyTransactions]);

  const selectedAuth = useMemo(
    () => selectedAgency?.authorizations.find((a) => a.id === selectedAuthId) ?? null,
    [selectedAgency, selectedAuthId],
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function selectAgency(agencyId: string) {
    dispatch({ type: 'SELECT_AGENCY', payload: agencyId });
    setSelectedAuthId('');
    setSelectedCategory('');
    setTxAmount('');
    setTxDescription('');
    setTxResult(null);
  }

  function handleSubmitTransaction() {
    if (!selectedAgency || !selectedAuth || !txAmount || !selectedCategory) return;

    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) return;

    const txPartial = {
      agencyId: selectedAgency.id,
      authorizationId: selectedAuth.id,
      amount,
      category: selectedCategory,
      description: txDescription,
    };

    const result = checkTransactionCompliance(
      txPartial,
      selectedAuth,
      selectedAgency,
      state.transactions,
    );

    const transaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...txPartial,
      timestamp: new Date().toISOString(),
      status: result.passed ? 'approved' : 'rejected',
      complianceCheck: result,
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });

    if (result.passed) {
      setTxResult({
        success: true,
        message: `Transaction of ${formatCurrency(amount)} approved and recorded.`,
      });
    } else {
      setTxResult({
        success: false,
        message: 'Transaction rejected due to compliance violations.',
        violations: result.violations,
      });
    }

    // Reset form fields
    setTxAmount('');
    setTxDescription('');
    setSelectedCategory('');
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (fundedAgencies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 text-slate-300">&#127974;</div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            No agency funding yet
          </h2>
          <p className="text-slate-500">
            No agency funding yet. Enact legislation first.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-full">
      {/* Left sidebar -- agency list */}
      <aside className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-slate-200 bg-[#0f172a]">
          <h2 className="text-lg font-bold text-white">Agencies</h2>
          <p className="text-sm text-slate-300 mt-1">Select an agency to manage spending</p>
        </div>

        {fundedAgencies.map((agency) => {
          const agTxs = state.transactions.filter((t) => t.agencyId === agency.id);
          const spent = approvedSpend(agTxs);
          const remaining = agency.creditLimit - spent;
          const isSelected = agency.id === state.selectedAgencyId;

          return (
            <button
              key={agency.id}
              onClick={() => selectAgency(agency.id)}
              className={`w-full text-left px-4 py-4 border-b border-slate-200 transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-l-4 border-l-blue-600'
                  : 'hover:bg-slate-100 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{agency.name}</span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  {agency.abbreviation}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <div className="flex justify-between">
                  <span>Credit Limit</span>
                  <span className="font-mono font-medium text-slate-700">
                    {formatCurrency(agency.creditLimit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining</span>
                  <span
                    className={`font-mono font-medium ${
                      remaining < 0 ? 'text-red-600' : 'text-green-700'
                    }`}
                  >
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar
                  spent={spent}
                  total={agency.creditLimit}
                  color="#2563eb"
                  height="h-1.5"
                />
              </div>
            </button>
          );
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {!selectedAgency ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p className="text-lg">Select an agency from the sidebar to view spending details</p>
          </div>
        ) : (
          <div className="p-6 space-y-8 max-w-5xl mx-auto">
            {/* Agency header */}
            <div>
              <h2 className="text-2xl font-bold text-[#0f172a]">{selectedAgency.name}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Total Credit Limit:{' '}
                <span className="font-semibold text-slate-700">
                  {formatCurrency(selectedAgency.creditLimit)}
                </span>
              </p>
            </div>

            {/* Credit Overview */}
            <section>
              <h3 className="text-lg font-bold text-[#0f172a] mb-4">Credit Overview</h3>

              {/* Main progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">
                    Spent: <span className="font-semibold">{formatCurrency(totalSpent)}</span>
                  </span>
                  <span className="text-slate-600">
                    Remaining:{' '}
                    <span
                      className={`font-semibold ${
                        selectedAgency.creditLimit - totalSpent < 0
                          ? 'text-red-600'
                          : 'text-green-700'
                      }`}
                    >
                      {formatCurrency(selectedAgency.creditLimit - totalSpent)}
                    </span>
                  </span>
                </div>
                <ProgressBar
                  spent={totalSpent}
                  total={selectedAgency.creditLimit}
                  color="#1e40af"
                  height="h-6"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {selectedAgency.creditLimit > 0
                    ? `${((totalSpent / selectedAgency.creditLimit) * 100).toFixed(1)}% utilized`
                    : '0% utilized'}
                </p>
              </div>

              {/* Per-authorization breakdown */}
              <div className="mt-6 space-y-4">
                <p className="text-sm font-semibold text-slate-700">By Authorization</p>
                {selectedAgency.authorizations.map((auth) => {
                  const spent = authSpend(agencyTransactions, auth.id);
                  const cap = auth.amountCap ?? 0;
                  return (
                    <div key={auth.id} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: auth.color }}
                          />
                          Auth {auth.id.replace('auth-', '#')}
                        </span>
                        <span className="font-mono">
                          {formatCurrency(spent)} / {formatCurrency(cap)}
                        </span>
                      </div>
                      <ProgressBar spent={spent} total={cap} color={auth.color} height="h-2.5" />
                    </div>
                  );
                })}
              </div>

              {/* Category breakdown table */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-700 mb-2">Category Breakdown</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Category
                        </th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Cap
                        </th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Spent
                        </th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Remaining
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAgency.authorizations.flatMap((auth) =>
                        auth.categories.map((cat) => {
                          const spent = categorySpend(
                            agencyTransactions,
                            auth.id,
                            cat.label,
                          );
                          const cap = cat.quantitativeCap ?? 0;
                          const remaining = cap - spent;

                          return (
                            <tr
                              key={`${auth.id}-${cat.id}`}
                              className="border-b border-slate-100"
                            >
                              <td className="py-2 px-3 text-slate-700 flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                                  style={{ backgroundColor: auth.color }}
                                />
                                {cat.label}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-600">
                                {formatCurrency(cap)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-800">
                                {formatCurrency(spent)}
                              </td>
                              <td
                                className={`py-2 px-3 text-right font-mono font-medium ${
                                  remaining < 0 ? 'text-red-600' : 'text-green-700'
                                }`}
                              >
                                {formatCurrency(remaining)}
                              </td>
                            </tr>
                          );
                        }),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Initiate Transaction */}
            <section>
              <h3 className="text-lg font-bold text-[#0f172a] mb-4">Initiate Transaction</h3>

              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Authorization select */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Authorization
                    </label>
                    <select
                      value={selectedAuthId}
                      onChange={(e) => {
                        setSelectedAuthId(e.target.value);
                        setSelectedCategory('');
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select authorization...</option>
                      {selectedAgency.authorizations.map((auth) => (
                        <option key={auth.id} value={auth.id}>
                          {auth.id.replace('auth-', '#')} -- Cap:{' '}
                          {auth.amountCap != null ? formatCurrency(auth.amountCap) : 'N/A'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category select */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={!selectedAuth}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select category...</option>
                      {selectedAuth?.categories.map((cat) => (
                        <option key={cat.id} value={cat.label}>
                          {cat.label}
                          {cat.quantitativeCap != null
                            ? ` (Cap: ${formatCurrency(cat.quantitativeCap)})`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      placeholder="0.00"
                      min={0}
                      className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {txAmount && !isNaN(parseFloat(txAmount)) && (
                    <p className="text-xs text-slate-400 mt-1">
                      {formatCurrency(parseFloat(txAmount))}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Description
                  </label>
                  <textarea
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe the purpose of this transaction..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmitTransaction}
                  disabled={!selectedAuth || !selectedCategory || !txAmount}
                  className="px-5 py-2.5 text-sm font-semibold rounded transition-colors bg-[#0f172a] text-white hover:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit Transaction
                </button>

                {/* Result feedback */}
                {txResult && (
                  <div
                    className={`rounded-lg p-4 border mt-2 ${
                      txResult.success
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        txResult.success ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {txResult.message}
                    </p>

                    {txResult.violations && txResult.violations.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {txResult.violations.map((v, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                            <span className="mt-0.5 text-red-400">&bull;</span>
                            {v}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Transaction Log */}
            <section>
              <h3 className="text-lg font-bold text-[#0f172a] mb-4">
                Transaction Log (Audit Trail)
              </h3>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <TransactionLog
                  transactions={agencyTransactions}
                  authorizations={selectedAgency.authorizations}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
