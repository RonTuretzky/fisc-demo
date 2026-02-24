import { useState, useMemo } from 'react';
import { useAppState } from '../../store/useStore';
import { checkRefinementCompliance } from '../../utils/compliance';
import { formatCurrency } from '../../utils/format';
import type {
  Authorization,
  ComplianceResult,
  SpendingCategory,
} from '../../types';

// ---------------------------------------------------------------------------
// Subcategory editor row
// ---------------------------------------------------------------------------

interface SubcategoryRow {
  tempId: string;
  label: string;
  cap: string; // kept as string for controlled input
  rules: string; // newline-separated
}

function newSubcategoryRow(): SubcategoryRow {
  return {
    tempId: crypto.randomUUID(),
    label: '',
    cap: '',
    rules: '',
  };
}

// ---------------------------------------------------------------------------
// Signatory entry
// ---------------------------------------------------------------------------

interface Signatory {
  name: string;
  signed: boolean;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CommitteeRefinement() {
  const [state, dispatch] = useAppState();

  // Panel state
  const [selectedAuthId, setSelectedAuthId] = useState<string | null>(null);
  const [expandedBillIds, setExpandedBillIds] = useState<Set<string>>(new Set());

  // Refinement form state
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([]);
  const [committeeName, setCommitteeName] = useState('');
  const [requiredSigs, setRequiredSigs] = useState(1);
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [newSignatoryName, setNewSignatoryName] = useState('');

  // Compliance & submission feedback
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const enactedBills = useMemo(
    () => state.bills.filter((b) => b.status === 'enacted'),
    [state.bills],
  );

  const agencyMap = useMemo(() => {
    const m = new Map<string, string>();
    state.agencies.forEach((a) => m.set(a.id, a.name));
    return m;
  }, [state.agencies]);

  // Currently selected authorization (across all enacted bills)
  const selectedAuth = useMemo(() => {
    if (!selectedAuthId) return null;
    for (const bill of enactedBills) {
      const auth = bill.authorizations.find((a) => a.id === selectedAuthId);
      if (auth) return auth;
    }
    return null;
  }, [selectedAuthId, enactedBills]);

  // Subcategory totals
  const subCapsTotal = useMemo(
    () =>
      subcategories.reduce((sum, sc) => {
        const val = parseFloat(sc.cap);
        return sum + (isNaN(val) ? 0 : val);
      }, 0),
    [subcategories],
  );

  const withinCap =
    selectedAuth?.amountCap != null ? subCapsTotal <= selectedAuth.amountCap : true;

  const signedCount = signatories.filter((s) => s.signed).length;
  const allRequiredSigned = signedCount >= requiredSigs;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function toggleBill(billId: string) {
    setExpandedBillIds((prev) => {
      const next = new Set(prev);
      if (next.has(billId)) next.delete(billId);
      else next.add(billId);
      return next;
    });
  }

  function selectAuth(auth: Authorization) {
    setSelectedAuthId(auth.id);
    setSubcategories([]);
    setCommitteeName('');
    setRequiredSigs(1);
    setSignatories([]);
    setNewSignatoryName('');
    setComplianceResult(null);
    setSubmitSuccess(false);
  }

  function addSubcategory() {
    setSubcategories((prev) => [...prev, newSubcategoryRow()]);
  }

  function updateSubcategory(tempId: string, field: keyof SubcategoryRow, value: string) {
    setSubcategories((prev) =>
      prev.map((sc) => (sc.tempId === tempId ? { ...sc, [field]: value } : sc)),
    );
  }

  function removeSubcategory(tempId: string) {
    setSubcategories((prev) => prev.filter((sc) => sc.tempId !== tempId));
  }

  function addSignatory() {
    const trimmed = newSignatoryName.trim();
    if (!trimmed) return;
    setSignatories((prev) => [...prev, { name: trimmed, signed: false }]);
    setNewSignatoryName('');
  }

  function toggleSignatory(index: number) {
    setSignatories((prev) =>
      prev.map((s, i) => (i === index ? { ...s, signed: !s.signed } : s)),
    );
  }

  function buildSpendingCategories(): SpendingCategory[] {
    return subcategories.map((sc, idx) => ({
      id: `subcat-${Date.now()}-${idx}`,
      label: sc.label,
      parentCategory: selectedAuth?.id ?? null,
      quantitativeCap: sc.cap ? parseFloat(sc.cap) : null,
      qualitativeRules: sc.rules
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    }));
  }

  function runComplianceCheck() {
    if (!selectedAuth) return;
    const cats = buildSpendingCategories();
    const result = checkRefinementCompliance(cats, selectedAuth);
    setComplianceResult(result);
  }

  function submitRefinement() {
    if (!selectedAuth || !complianceResult?.passed || !allRequiredSigned) return;
    const cats = buildSpendingCategories();
    dispatch({
      type: 'ADD_REFINEMENT',
      payload: {
        id: `refine-${Date.now()}`,
        authorizationId: selectedAuth.id,
        committeeId: `committee-${Date.now()}`,
        committeeName,
        subcategories: cats,
        signatories: signatories.filter((s) => s.signed).map((s) => s.name),
        requiredSignatures: requiredSigs,
        status: 'approved',
      },
    });
    setSubmitSuccess(true);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (enactedBills.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 text-slate-300">&#9881;</div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            No enacted bills yet
          </h2>
          <p className="text-slate-500">
            No enacted bills yet. Complete the legislative process first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left column -- bill / auth list */}
      <aside className="w-96 border-r border-slate-200 bg-slate-50 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 bg-navy-900 bg-[#0f172a]">
          <h2 className="text-lg font-bold text-white">Committee Refinement</h2>
          <p className="text-sm text-slate-300 mt-1">
            Select an authorization to refine spending subcategories
          </p>
        </div>

        {enactedBills.map((bill) => (
          <div key={bill.id} className="border-b border-slate-200">
            {/* Bill header */}
            <button
              onClick={() => toggleBill(bill.id)}
              className="w-full text-left px-4 py-3 hover:bg-slate-100 flex items-center justify-between transition-colors"
            >
              <div>
                <span className="text-sm font-semibold text-slate-800">
                  {bill.title}
                </span>
                <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  Enacted
                </span>
              </div>
              <span className="text-slate-400 text-xs">
                {expandedBillIds.has(bill.id) ? '\u25B2' : '\u25BC'}
              </span>
            </button>

            {/* Authorizations list */}
            {expandedBillIds.has(bill.id) && (
              <div className="bg-white">
                {bill.authorizations.map((auth) => {
                  const isSelected = auth.id === selectedAuthId;
                  return (
                    <button
                      key={auth.id}
                      onClick={() => selectAuth(auth)}
                      className={`w-full text-left px-6 py-3 border-l-4 transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                      style={{ borderLeftColor: isSelected ? auth.color : undefined }}
                    >
                      <p className="text-sm font-medium text-slate-700">
                        {agencyMap.get(auth.agencyId) ?? auth.agencyId}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Cap: {auth.amountCap != null ? formatCurrency(auth.amountCap) : 'N/A'}{' '}
                        &middot; Expires:{' '}
                        {auth.timeLimit ?? 'No limit'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {auth.categories.length} categories &middot;{' '}
                        {auth.restrictions.length} restrictions
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* Right column -- refinement panel */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selectedAuth ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p className="text-lg">Select an authorization from the left panel to begin refinement</p>
          </div>
        ) : submitSuccess ? (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-green-50 border border-green-300 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2 text-green-600">&#10003;</div>
              <h3 className="text-lg font-semibold text-green-800">
                Refinement Submitted Successfully
              </h3>
              <p className="text-sm text-green-700 mt-1">
                The committee refinement for{' '}
                <strong>{agencyMap.get(selectedAuth.agencyId)}</strong> has been approved
                and recorded.
              </p>
              <button
                onClick={() => {
                  setSelectedAuthId(null);
                  setSubmitSuccess(false);
                }}
                className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
              >
                Refine Another Authorization
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Auth details */}
            <section>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">
                Authorization Details
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {agencyMap.get(selectedAuth.agencyId) ?? selectedAuth.agencyId}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Amount Cap</p>
                  <p className="text-lg font-bold text-[#0f172a] mt-1">
                    {selectedAuth.amountCap != null
                      ? formatCurrency(selectedAuth.amountCap)
                      : 'Unlimited'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Time Limit</p>
                  <p className="text-lg font-bold text-[#0f172a] mt-1">
                    {selectedAuth.timeLimit ?? 'No Expiration'}
                  </p>
                </div>
              </div>

              {/* Existing categories */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Existing Categories
                </p>
                <div className="space-y-1">
                  {selectedAuth.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between text-sm bg-white rounded px-3 py-2 border border-slate-100"
                    >
                      <span className="text-slate-700">{cat.label}</span>
                      <span className="text-slate-500 font-mono text-xs">
                        {cat.quantitativeCap != null
                          ? formatCurrency(cat.quantitativeCap)
                          : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restrictions */}
              {selectedAuth.restrictions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Restrictions
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {selectedAuth.restrictions.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Subcategory definition */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0f172a]">
                  Define Subcategories
                </h3>
                <button
                  onClick={addSubcategory}
                  className="px-3 py-1.5 text-sm font-medium bg-[#0f172a] text-white rounded hover:bg-[#1e293b] transition-colors"
                >
                  + Add Subcategory
                </button>
              </div>

              {subcategories.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  No subcategories added yet. Click "Add Subcategory" to begin.
                </p>
              ) : (
                <div className="space-y-4">
                  {subcategories.map((sc, idx) => (
                    <div
                      key={sc.tempId}
                      className="border border-slate-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-600">
                          Subcategory {idx + 1}
                        </span>
                        <button
                          onClick={() => removeSubcategory(sc.tempId)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            Label
                          </label>
                          <input
                            type="text"
                            value={sc.label}
                            onChange={(e) =>
                              updateSubcategory(sc.tempId, 'label', e.target.value)
                            }
                            placeholder="e.g. Roadway Safety Improvements"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            Cap Amount ($)
                          </label>
                          <input
                            type="number"
                            value={sc.cap}
                            onChange={(e) =>
                              updateSubcategory(sc.tempId, 'cap', e.target.value)
                            }
                            placeholder="e.g. 500000000"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Qualitative Rules (one per line)
                        </label>
                        <textarea
                          value={sc.rules}
                          onChange={(e) =>
                            updateSubcategory(sc.tempId, 'rules', e.target.value)
                          }
                          rows={3}
                          placeholder="Enter qualitative rules, one per line..."
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Running total */}
              {subcategories.length > 0 && (
                <div
                  className={`mt-4 flex items-center justify-between rounded-lg px-4 py-3 border ${
                    withinCap
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Subcategory Caps Total
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        withinCap ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {formatCurrency(subCapsTotal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Authorization Cap</p>
                    <p className="text-lg font-bold text-slate-700">
                      {selectedAuth.amountCap != null
                        ? formatCurrency(selectedAuth.amountCap)
                        : 'Unlimited'}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      withinCap ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              )}
            </section>

            {/* Multi-signature section */}
            <section>
              <h3 className="text-lg font-bold text-[#0f172a] mb-4">
                Multi-Signature Approval
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Committee Name
                  </label>
                  <input
                    type="text"
                    value={committeeName}
                    onChange={(e) => setCommitteeName(e.target.value)}
                    placeholder="e.g. Senate Appropriations Committee"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Required Signatures
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={requiredSigs}
                    onChange={(e) =>
                      setRequiredSigs(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Add signatory */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSignatoryName}
                  onChange={(e) => setNewSignatoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSignatory()}
                  placeholder="Signatory name"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addSignatory}
                  className="px-4 py-2 text-sm font-medium bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors"
                >
                  Add Signatory
                </button>
              </div>

              {/* Signatory list */}
              {signatories.length > 0 && (
                <div className="space-y-2 mb-4">
                  {signatories.map((s, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 px-4 py-2 rounded border cursor-pointer transition-colors ${
                        s.signed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={s.signed}
                        onChange={() => toggleSignatory(i)}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700">{s.name}</span>
                      {s.signed && (
                        <span className="ml-auto text-xs font-medium text-green-600">
                          Signed
                        </span>
                      )}
                    </label>
                  ))}
                  <p className="text-xs text-slate-500 mt-1">
                    {signedCount} of {requiredSigs} required signatures collected
                  </p>
                </div>
              )}
            </section>

            {/* Compliance & submit */}
            <section className="space-y-4 pb-8">
              <div className="flex gap-3">
                <button
                  onClick={runComplianceCheck}
                  disabled={subcategories.length === 0}
                  className="px-5 py-2.5 text-sm font-semibold rounded transition-colors bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Run Compliance Check
                </button>

                <button
                  onClick={submitRefinement}
                  disabled={
                    !complianceResult?.passed || !allRequiredSigned || subcategories.length === 0
                  }
                  className="px-5 py-2.5 text-sm font-semibold rounded transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit Refinement
                </button>
              </div>

              {/* Compliance result banner */}
              {complianceResult && (
                <div
                  className={`rounded-lg p-4 border ${
                    complianceResult.passed
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <p
                    className={`font-bold text-sm ${
                      complianceResult.passed ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {complianceResult.passed
                      ? 'PASS -- Refinement is compliant'
                      : 'FAIL -- Compliance violations detected'}
                  </p>

                  {!complianceResult.passed && (
                    <ul className="mt-2 space-y-1">
                      {complianceResult.violations.map((v, i) => (
                        <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                          <span className="mt-0.5 text-red-400">&bull;</span>
                          {v}
                        </li>
                      ))}
                    </ul>
                  )}

                  {complianceResult.checkedAgainst.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Checked Against:
                      </p>
                      <ul className="text-xs text-slate-500 space-y-0.5">
                        {complianceResult.checkedAgainst.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
