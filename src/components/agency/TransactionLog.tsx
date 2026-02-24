import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Transaction, Authorization } from '../../types';

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<Transaction['status'], string> = {
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  flagged: 'bg-orange-100 text-orange-800',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TransactionLogProps {
  transactions: Transaction[];
  authorizations: Authorization[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TransactionLog({ transactions, authorizations }: TransactionLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const authMap = new Map(authorizations.map((a) => [a.id, a]));

  // Sort by timestamp descending (newest first)
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No transactions recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">
              Timestamp
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">
              Authorization
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">
              Category
            </th>
            <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">
              Amount
            </th>
            <th className="text-center py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((tx) => {
            const auth = authMap.get(tx.authorizationId);
            const isExpanded = expandedId === tx.id;
            const hasDetails =
              tx.complianceCheck &&
              (tx.complianceCheck.violations.length > 0 ||
                tx.complianceCheck.checkedAgainst.length > 0);

            return (
              <React.Fragment key={tx.id}>
                <tr
                  onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                  className={`border-b border-slate-100 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {auth ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: auth.color }}
                        />
                        {auth.categories[0]?.label
                          ? auth.agencyId.replace('agency-', '').toUpperCase()
                          : auth.id}
                      </span>
                    ) : (
                      tx.authorizationId
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{tx.category}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        STATUS_STYLES[tx.status]
                      }`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {tx.description}
                    {hasDetails && (
                      <span className="ml-2 text-xs text-slate-400">
                        {isExpanded ? '\u25B2' : '\u25BC'}
                      </span>
                    )}
                  </td>
                </tr>

                {/* Expandable compliance detail row */}
                {isExpanded && hasDetails && (
                  <tr className="bg-slate-50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="ml-4 space-y-3">
                        {tx.complianceCheck.violations.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-600 mb-1">
                              Violations
                            </p>
                            <ul className="space-y-0.5">
                              {tx.complianceCheck.violations.map((v, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-red-500 flex items-start gap-1.5"
                                >
                                  <span className="mt-0.5">&bull;</span>
                                  {v}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {tx.complianceCheck.checkedAgainst.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1">
                              Checked Against
                            </p>
                            <ul className="space-y-0.5">
                              {tx.complianceCheck.checkedAgainst.map((c, i) => (
                                <li key={i} className="text-xs text-slate-400">
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
