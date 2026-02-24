export type BillStatus =
  | 'draft'
  | 'house_floor'
  | 'house_voting'
  | 'house_passed'
  | 'house_failed'
  | 'senate_floor'
  | 'senate_voting'
  | 'senate_passed'
  | 'senate_failed'
  | 'presidential_review'
  | 'signed'
  | 'vetoed'
  | 'veto_override_house'
  | 'veto_override_senate'
  | 'enacted'
  | 'failed';

export interface VoteCount {
  yea: number;
  nay: number;
  present: number;
  absent: number;
}

export interface Vote {
  memberId: string;
  memberName: string;
  chamber: 'house' | 'senate';
  vote: 'yea' | 'nay' | 'present' | 'absent';
  timestamp: string;
}

export interface VoteRecord {
  billId: string;
  houseVotes: Vote[];
  senateVotes: Vote[];
  houseCount: VoteCount;
  senateCount: VoteCount;
  presidentialAction: 'signed' | 'vetoed' | 'pending' | null;
  vetoOverrideHouse: VoteCount | null;
  vetoOverrideSenate: VoteCount | null;
}

export interface SpendingCategory {
  id: string;
  label: string;
  parentCategory: string | null;
  quantitativeCap: number | null;
  qualitativeRules: string[];
}

export interface Authorization {
  id: string;
  billId: string;
  agencyId: string;
  type: 'quantitative' | 'qualitative' | 'both';
  amountCap: number | null;
  timeLimit: string | null;
  restrictions: string[];
  categories: SpendingCategory[];
  color: string;
}

export interface DiffEntry {
  lineNumber: number;
  oldText: string;
  newText: string;
}

export interface Amendment {
  id: string;
  billId: string;
  author: string;
  timestamp: string;
  description: string;
  changes: DiffEntry[];
  status: 'proposed' | 'adopted' | 'rejected';
}

export interface Bill {
  id: string;
  title: string;
  status: BillStatus;
  sponsor: string;
  introducedDate: string;
  text: string;
  authorizations: Authorization[];
  amendments: Amendment[];
  votes: VoteRecord;
}

export interface ComplianceResult {
  passed: boolean;
  violations: string[];
  checkedAgainst: string[];
}

export interface Transaction {
  id: string;
  agencyId: string;
  authorizationId: string;
  amount: number;
  category: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  complianceCheck: ComplianceResult;
}

export interface Agency {
  id: string;
  name: string;
  abbreviation: string;
  creditLimit: number;
  authorizations: Authorization[];
  transactions: Transaction[];
}

export interface CommitteeRefinement {
  id: string;
  authorizationId: string;
  committeeId: string;
  committeeName: string;
  subcategories: SpendingCategory[];
  signatories: string[];
  requiredSignatures: number;
  status: 'draft' | 'approved' | 'rejected';
}

export interface AppState {
  bills: Bill[];
  agencies: Agency[];
  refinements: CommitteeRefinement[];
  transactions: Transaction[];
  currentView: 'legislative' | 'committee' | 'agency';
  selectedBillId: string | null;
  selectedAgencyId: string | null;
}
