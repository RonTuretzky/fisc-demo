import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  AppState,
  Bill,
  BillStatus,
  VoteRecord,
  Amendment,
  Authorization,
  CommitteeRefinement,
  Transaction,
} from '../types';
import { getInitialState } from '../data/mockData';

// ---------------------------------------------------------------------------
// Actions – discriminated union
// ---------------------------------------------------------------------------

export type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'SELECT_BILL'; payload: string | null }
  | { type: 'SELECT_AGENCY'; payload: string | null }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL'; payload: { id: string; updates: Partial<Bill> } }
  | { type: 'UPDATE_BILL_STATUS'; payload: { id: string; status: BillStatus } }
  | { type: 'UPDATE_VOTES'; payload: { billId: string; votes: Partial<VoteRecord> } }
  | { type: 'ADD_AMENDMENT'; payload: { billId: string; amendment: Amendment } }
  | { type: 'UPDATE_AMENDMENT_STATUS'; payload: { billId: string; amendmentId: string; status: Amendment['status'] } }
  | { type: 'ADD_AUTHORIZATION'; payload: { billId: string; authorization: Authorization } }
  | { type: 'ENACT_BILL'; payload: { billId: string } }
  | { type: 'ADD_REFINEMENT'; payload: CommitteeRefinement }
  | { type: 'UPDATE_REFINEMENT'; payload: { id: string; updates: Partial<CommitteeRefinement> } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION_STATUS'; payload: { id: string; status: Transaction['status'] } };

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'fiscal-ledger-state';

function loadState(): AppState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized) {
      return JSON.parse(serialized) as AppState;
    }
  } catch {
    // Corrupt or unavailable storage – fall through to defaults.
  }
  return getInitialState();
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable – silently ignore.
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_VIEW':
      return { ...state, currentView: action.payload };

    case 'SELECT_BILL':
      return { ...state, selectedBillId: action.payload };

    case 'SELECT_AGENCY':
      return { ...state, selectedAgencyId: action.payload };

    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] };

    case 'UPDATE_BILL':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.id ? { ...b, ...action.payload.updates } : b,
        ),
      };

    case 'UPDATE_BILL_STATUS':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.id ? { ...b, status: action.payload.status } : b,
        ),
      };

    case 'UPDATE_VOTES':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.billId
            ? { ...b, votes: { ...b.votes, ...action.payload.votes } }
            : b,
        ),
      };

    case 'ADD_AMENDMENT':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.billId
            ? { ...b, amendments: [...b.amendments, action.payload.amendment] }
            : b,
        ),
      };

    case 'UPDATE_AMENDMENT_STATUS':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.billId
            ? {
                ...b,
                amendments: b.amendments.map((a) =>
                  a.id === action.payload.amendmentId
                    ? { ...a, status: action.payload.status }
                    : a,
                ),
              }
            : b,
        ),
      };

    case 'ADD_AUTHORIZATION':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.billId
            ? {
                ...b,
                authorizations: [...b.authorizations, action.payload.authorization],
              }
            : b,
        ),
      };

    case 'ENACT_BILL': {
      const bill = state.bills.find((b) => b.id === action.payload.billId);
      if (!bill) return state;

      // Update bill status
      const updatedBills = state.bills.map((b) =>
        b.id === action.payload.billId ? { ...b, status: 'enacted' as BillStatus } : b,
      );

      // Push authorizations into their respective agencies and update credit limits
      const updatedAgencies = state.agencies.map((agency) => {
        const agencyAuths = bill.authorizations.filter(
          (auth) => auth.agencyId === agency.id,
        );
        if (agencyAuths.length === 0) return agency;

        const additionalCredit = agencyAuths.reduce(
          (sum, auth) => sum + (auth.amountCap ?? 0),
          0,
        );

        return {
          ...agency,
          authorizations: [...agency.authorizations, ...agencyAuths],
          creditLimit: agency.creditLimit + additionalCredit,
        };
      });

      return { ...state, bills: updatedBills, agencies: updatedAgencies };
    }

    case 'ADD_REFINEMENT':
      return {
        ...state,
        refinements: [...state.refinements, action.payload],
      };

    case 'UPDATE_REFINEMENT':
      return {
        ...state,
        refinements: state.refinements.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r,
        ),
      };

    case 'ADD_TRANSACTION': {
      const tx = action.payload;

      // Add to global transactions list
      const newTransactions = [...state.transactions, tx];

      // Also add to the matching agency's transactions
      const agenciesWithTx = state.agencies.map((agency) =>
        agency.id === tx.agencyId
          ? { ...agency, transactions: [...agency.transactions, tx] }
          : agency,
      );

      return { ...state, transactions: newTransactions, agencies: agenciesWithTx };
    }

    case 'UPDATE_TRANSACTION_STATUS': {
      const updateTx = (t: Transaction) =>
        t.id === action.payload.id ? { ...t, status: action.payload.status } : t;

      return {
        ...state,
        transactions: state.transactions.map(updateTx),
        agencies: state.agencies.map((agency) => ({
          ...agency,
          transactions: agency.transactions.map(updateTx),
        })),
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type StoreContextValue = [AppState, React.Dispatch<Action>];

const StoreContext = createContext<StoreContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Persist every state change to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const value: StoreContextValue = React.useMemo(() => [state, dispatch], [state]);

  return React.createElement(StoreContext.Provider, { value }, children);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppState(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useAppState must be used within a <StoreProvider>.');
  }
  return ctx;
}
