import type {
  Agency,
  AppState,
  Authorization,
  Bill,
  VoteCount,
  VoteRecord,
} from '../types/index';

// ---------------------------------------------------------------------------
// Congress Members
// ---------------------------------------------------------------------------

export interface CongressMember {
  id: string;
  name: string;
  party: 'D' | 'R' | 'I';
  state: string;
}

export const HOUSE_MEMBERS: CongressMember[] = [
  { id: 'house-001', name: 'Hakeem Jeffries', party: 'D', state: 'NY' },
  { id: 'house-002', name: 'Mike Johnson', party: 'R', state: 'LA' },
  { id: 'house-003', name: 'Katherine Clark', party: 'D', state: 'MA' },
  { id: 'house-004', name: 'Steve Scalise', party: 'R', state: 'LA' },
  { id: 'house-005', name: 'Pete Aguilar', party: 'D', state: 'CA' },
  { id: 'house-006', name: 'Tom Emmer', party: 'R', state: 'MN' },
  { id: 'house-007', name: 'Jim Clyburn', party: 'D', state: 'SC' },
  { id: 'house-008', name: 'Elise Stefanik', party: 'R', state: 'NY' },
  { id: 'house-009', name: 'Alexandria Ocasio-Cortez', party: 'D', state: 'NY' },
  { id: 'house-010', name: 'Marjorie Taylor Greene', party: 'R', state: 'GA' },
  { id: 'house-011', name: 'Nancy Pelosi', party: 'D', state: 'CA' },
  { id: 'house-012', name: 'Kevin McCarthy', party: 'R', state: 'CA' },
  { id: 'house-013', name: 'Adam Schiff', party: 'D', state: 'CA' },
  { id: 'house-014', name: 'Jim Jordan', party: 'R', state: 'OH' },
  { id: 'house-015', name: 'Rosa DeLauro', party: 'D', state: 'CT' },
  { id: 'house-016', name: 'Patrick McHenry', party: 'R', state: 'NC' },
  { id: 'house-017', name: 'Pramila Jayapal', party: 'D', state: 'WA' },
  { id: 'house-018', name: 'Chip Roy', party: 'R', state: 'TX' },
  { id: 'house-019', name: 'Jamie Raskin', party: 'D', state: 'MD' },
  { id: 'house-020', name: 'Matt Gaetz', party: 'R', state: 'FL' },
  { id: 'house-021', name: 'Ro Khanna', party: 'D', state: 'CA' },
  { id: 'house-022', name: 'Dan Crenshaw', party: 'R', state: 'TX' },
  { id: 'house-023', name: 'Ilhan Omar', party: 'D', state: 'MN' },
  { id: 'house-024', name: 'Lauren Boebert', party: 'R', state: 'CO' },
  { id: 'house-025', name: 'Ayanna Pressley', party: 'D', state: 'MA' },
  { id: 'house-026', name: 'Byron Donalds', party: 'R', state: 'FL' },
  { id: 'house-027', name: 'Greg Casar', party: 'D', state: 'TX' },
  { id: 'house-028', name: 'Mike Gallagher', party: 'R', state: 'WI' },
  { id: 'house-029', name: 'Maxwell Frost', party: 'D', state: 'FL' },
  { id: 'house-030', name: 'Nancy Mace', party: 'R', state: 'SC' },
  { id: 'house-031', name: 'Rashida Tlaib', party: 'D', state: 'MI' },
  { id: 'house-032', name: 'Andy Biggs', party: 'R', state: 'AZ' },
  { id: 'house-033', name: 'Cori Bush', party: 'D', state: 'MO' },
  { id: 'house-034', name: 'Scott Perry', party: 'R', state: 'PA' },
  { id: 'house-035', name: 'Mark Takano', party: 'D', state: 'CA' },
  { id: 'house-036', name: 'Mike Turner', party: 'R', state: 'OH' },
  { id: 'house-037', name: 'Veronica Escobar', party: 'D', state: 'TX' },
  { id: 'house-038', name: 'Brian Fitzpatrick', party: 'R', state: 'PA' },
  { id: 'house-039', name: 'Judy Chu', party: 'D', state: 'CA' },
  { id: 'house-040', name: 'Maria Salazar', party: 'R', state: 'FL' },
  { id: 'house-041', name: 'Val Demings', party: 'D', state: 'FL' },
  { id: 'house-042', name: 'John Curtis', party: 'R', state: 'UT' },
  { id: 'house-043', name: 'Joaquin Castro', party: 'D', state: 'TX' },
  { id: 'house-044', name: 'Don Bacon', party: 'R', state: 'NE' },
  { id: 'house-045', name: 'Katie Porter', party: 'D', state: 'CA' },
  { id: 'house-046', name: 'Michael Waltz', party: 'R', state: 'FL' },
  { id: 'house-047', name: 'Sara Jacobs', party: 'D', state: 'CA' },
  { id: 'house-048', name: 'Young Kim', party: 'R', state: 'CA' },
  { id: 'house-049', name: 'Robert Garcia', party: 'D', state: 'CA' },
  { id: 'house-050', name: 'Carlos Gimenez', party: 'R', state: 'FL' },
];

export const SENATE_MEMBERS: CongressMember[] = [
  { id: 'senate-001', name: 'Chuck Schumer', party: 'D', state: 'NY' },
  { id: 'senate-002', name: 'Mitch McConnell', party: 'R', state: 'KY' },
  { id: 'senate-003', name: 'Dick Durbin', party: 'D', state: 'IL' },
  { id: 'senate-004', name: 'John Thune', party: 'R', state: 'SD' },
  { id: 'senate-005', name: 'Patty Murray', party: 'D', state: 'WA' },
  { id: 'senate-006', name: 'John Cornyn', party: 'R', state: 'TX' },
  { id: 'senate-007', name: 'Bernie Sanders', party: 'I', state: 'VT' },
  { id: 'senate-008', name: 'Ted Cruz', party: 'R', state: 'TX' },
  { id: 'senate-009', name: 'Elizabeth Warren', party: 'D', state: 'MA' },
  { id: 'senate-010', name: 'Marco Rubio', party: 'R', state: 'FL' },
  { id: 'senate-011', name: 'Amy Klobuchar', party: 'D', state: 'MN' },
  { id: 'senate-012', name: 'Lindsey Graham', party: 'R', state: 'SC' },
  { id: 'senate-013', name: 'Cory Booker', party: 'D', state: 'NJ' },
  { id: 'senate-014', name: 'Tim Scott', party: 'R', state: 'SC' },
  { id: 'senate-015', name: 'Mark Warner', party: 'D', state: 'VA' },
  { id: 'senate-016', name: 'Susan Collins', party: 'R', state: 'ME' },
  { id: 'senate-017', name: 'Tammy Duckworth', party: 'D', state: 'IL' },
  { id: 'senate-018', name: 'Mitt Romney', party: 'R', state: 'UT' },
  { id: 'senate-019', name: 'Jon Ossoff', party: 'D', state: 'GA' },
  { id: 'senate-020', name: 'Josh Hawley', party: 'R', state: 'MO' },
  { id: 'senate-021', name: 'Alex Padilla', party: 'D', state: 'CA' },
  { id: 'senate-022', name: 'Tom Cotton', party: 'R', state: 'AR' },
  { id: 'senate-023', name: 'Raphael Warnock', party: 'D', state: 'GA' },
  { id: 'senate-024', name: 'Rick Scott', party: 'R', state: 'FL' },
  { id: 'senate-025', name: 'Chris Murphy', party: 'D', state: 'CT' },
  { id: 'senate-026', name: 'Bill Cassidy', party: 'R', state: 'LA' },
  { id: 'senate-027', name: 'John Fetterman', party: 'D', state: 'PA' },
  { id: 'senate-028', name: 'J.D. Vance', party: 'R', state: 'OH' },
  { id: 'senate-029', name: 'Peter Welch', party: 'D', state: 'VT' },
  { id: 'senate-030', name: 'Lisa Murkowski', party: 'R', state: 'AK' },
];

// ---------------------------------------------------------------------------
// Agencies
// ---------------------------------------------------------------------------

export const AGENCIES: Agency[] = [
  {
    id: 'agency-epa',
    name: 'Environmental Protection Agency',
    abbreviation: 'EPA',
    creditLimit: 0,
    authorizations: [],
    transactions: [],
  },
  {
    id: 'agency-doe',
    name: 'Department of Energy',
    abbreviation: 'DOE',
    creditLimit: 0,
    authorizations: [],
    transactions: [],
  },
  {
    id: 'agency-hhs',
    name: 'Department of Health and Human Services',
    abbreviation: 'HHS',
    creditLimit: 0,
    authorizations: [],
    transactions: [],
  },
  {
    id: 'agency-dot',
    name: 'Department of Transportation',
    abbreviation: 'DOT',
    creditLimit: 0,
    authorizations: [],
    transactions: [],
  },
  {
    id: 'agency-nsf',
    name: 'National Science Foundation',
    abbreviation: 'NSF',
    creditLimit: 0,
    authorizations: [],
    transactions: [],
  },
  {
    id: 'agency-nasa',
    name: 'National Aeronautics and Space Administration',
    abbreviation: 'NASA',
    creditLimit: 0,
    authorizations: [],
    transactions: [],
  },
];

// ---------------------------------------------------------------------------
// Authorizations for Bill 1 - Congressional Infrastructure & Innovation Act
// ---------------------------------------------------------------------------

const bill1AuthDOT: Authorization = {
  id: 'auth-001',
  billId: 'bill-001',
  agencyId: 'agency-dot',
  type: 'both',
  amountCap: 5_000_000_000,
  timeLimit: '2031-09-30',
  restrictions: [
    'Funds shall not be used for cosmetic improvements to facilities not classified as structurally deficient',
    'A minimum of 40% of allocated funds must be directed toward rural infrastructure projects',
    'All contracted work must comply with Davis-Bacon prevailing wage requirements',
    'No single project may receive more than 15% of the total authorization',
  ],
  categories: [
    {
      id: 'cat-001',
      label: 'Bridge Repair & Replacement',
      parentCategory: null,
      quantitativeCap: 2_000_000_000,
      qualitativeRules: [
        'Priority shall be given to bridges rated structurally deficient by FHWA',
        'Projects must include a 20-year maintenance plan',
      ],
    },
    {
      id: 'cat-002',
      label: 'Highway Modernization',
      parentCategory: null,
      quantitativeCap: 1_500_000_000,
      qualitativeRules: [
        'Must incorporate smart-traffic management systems',
        'Environmental impact assessments required for projects exceeding $50M',
      ],
    },
    {
      id: 'cat-003',
      label: 'Public Transit Expansion',
      parentCategory: null,
      quantitativeCap: 1_000_000_000,
      qualitativeRules: [
        'Projects must demonstrate ridership increase projections of at least 15%',
        'Accessibility compliance with ADA standards required for all new stations',
      ],
    },
    {
      id: 'cat-004',
      label: 'Freight & Rail Corridors',
      parentCategory: null,
      quantitativeCap: 500_000_000,
      qualitativeRules: [
        'Must support intermodal connectivity between at least two transport modes',
      ],
    },
  ],
  color: '#2563eb', // blue
};

const bill1AuthDOE: Authorization = {
  id: 'auth-002',
  billId: 'bill-001',
  agencyId: 'agency-doe',
  type: 'both',
  amountCap: 3_000_000_000,
  timeLimit: '2031-09-30',
  restrictions: [
    'No funds shall be used for fossil fuel extraction or exploration',
    'At least 25% of funds must support projects in economically disadvantaged communities',
    'All funded research must be published in open-access journals within 24 months of completion',
    'Technology transfer plans required for all grants exceeding $10M',
  ],
  categories: [
    {
      id: 'cat-005',
      label: 'Solar & Wind Energy Research',
      parentCategory: null,
      quantitativeCap: 1_200_000_000,
      qualitativeRules: [
        'Research must target grid-scale storage or generation efficiency improvements',
        'Partnerships with at least one accredited university required per grant',
      ],
    },
    {
      id: 'cat-006',
      label: 'Grid Modernization',
      parentCategory: null,
      quantitativeCap: 1_000_000_000,
      qualitativeRules: [
        'Projects must demonstrate measurable improvement in grid resilience metrics',
        'Cybersecurity assessment required for all smart-grid components',
      ],
    },
    {
      id: 'cat-007',
      label: 'Energy Efficiency Programs',
      parentCategory: null,
      quantitativeCap: 800_000_000,
      qualitativeRules: [
        'Programs must target at least 20% reduction in energy consumption for participating facilities',
        'Workforce development component required for all state-level programs',
      ],
    },
  ],
  color: '#16a34a', // green
};

const bill1AuthNSF: Authorization = {
  id: 'auth-003',
  billId: 'bill-001',
  agencyId: 'agency-nsf',
  type: 'both',
  amountCap: 2_000_000_000,
  timeLimit: '2031-09-30',
  restrictions: [
    'Grants must undergo independent peer review prior to award',
    'No single institution may receive more than 5% of total authorization',
    'Annual progress reports required for all multi-year grants',
    'Indirect cost rates capped at 30% of modified total direct costs',
  ],
  categories: [
    {
      id: 'cat-008',
      label: 'STEM Workforce Development',
      parentCategory: null,
      quantitativeCap: 800_000_000,
      qualitativeRules: [
        'Programs must include measurable outcomes for underrepresented populations in STEM',
        'Industry partnership required demonstrating clear workforce pipeline',
      ],
    },
    {
      id: 'cat-009',
      label: 'Advanced Materials Research',
      parentCategory: null,
      quantitativeCap: 700_000_000,
      qualitativeRules: [
        'Research must have documented applications in infrastructure or energy sectors',
      ],
    },
    {
      id: 'cat-010',
      label: 'AI & Computing Infrastructure',
      parentCategory: null,
      quantitativeCap: 500_000_000,
      qualitativeRules: [
        'Projects must include responsible AI governance frameworks',
        'Open-source software deliverables required for publicly funded computing tools',
      ],
    },
  ],
  color: '#f97316', // orange
};

// ---------------------------------------------------------------------------
// Authorizations for Bill 2 - Public Health Emergency Preparedness Act
// ---------------------------------------------------------------------------

const bill2AuthHHS: Authorization = {
  id: 'auth-004',
  billId: 'bill-002',
  agencyId: 'agency-hhs',
  type: 'both',
  amountCap: 5_000_000_000,
  timeLimit: '2030-09-30',
  restrictions: [
    'Funds may not be used for capital construction of non-health-related facilities',
    'A minimum of 30% of funds must be allocated to state and local health departments',
    'All funded programs must report outcomes using standardized HHS performance metrics',
    'Procurement of medical countermeasures must comply with FDA emergency use guidance',
  ],
  categories: [
    {
      id: 'cat-011',
      label: 'Emergency Stockpile Replenishment',
      parentCategory: null,
      quantitativeCap: 2_000_000_000,
      qualitativeRules: [
        'Stockpile items must be rotated on a schedule not exceeding their shelf life minus 12 months',
        'Domestic manufacturing sources preferred; foreign sources require supply chain risk assessment',
      ],
    },
    {
      id: 'cat-012',
      label: 'Hospital Surge Capacity',
      parentCategory: null,
      quantitativeCap: 1_500_000_000,
      qualitativeRules: [
        'Funded facilities must demonstrate ability to expand capacity by at least 20% within 72 hours',
        'Investments must include interoperable health IT systems',
      ],
    },
    {
      id: 'cat-013',
      label: 'Public Health Workforce',
      parentCategory: null,
      quantitativeCap: 1_000_000_000,
      qualitativeRules: [
        'Training programs must be accredited by recognized public health bodies',
        'Loan repayment incentives for service in underserved areas required',
      ],
    },
    {
      id: 'cat-014',
      label: 'Disease Surveillance & Data Systems',
      parentCategory: null,
      quantitativeCap: 500_000_000,
      qualitativeRules: [
        'Systems must achieve real-time reporting capability within 24 months of funding',
        'Data privacy protections must comply with HIPAA and applicable state laws',
      ],
    },
  ],
  color: '#dc2626', // red
};

const bill2AuthEPA: Authorization = {
  id: 'auth-005',
  billId: 'bill-002',
  agencyId: 'agency-epa',
  type: 'both',
  amountCap: 2_500_000_000,
  timeLimit: '2030-09-30',
  restrictions: [
    'Funds shall be used exclusively for environmental health hazard mitigation and monitoring',
    'At least 50% of funds must target communities scoring above the 80th percentile on the EJScreen index',
    'All water quality projects must meet or exceed Safe Drinking Water Act standards',
    'Environmental monitoring equipment must be calibrated to EPA-approved reference methods',
  ],
  categories: [
    {
      id: 'cat-015',
      label: 'Drinking Water Contaminant Remediation',
      parentCategory: null,
      quantitativeCap: 1_200_000_000,
      qualitativeRules: [
        'Priority given to communities with documented PFAS or lead contamination above action levels',
        'Remediation plans must include long-term monitoring for at least 10 years post-treatment',
      ],
    },
    {
      id: 'cat-016',
      label: 'Air Quality Monitoring Networks',
      parentCategory: null,
      quantitativeCap: 800_000_000,
      qualitativeRules: [
        'Monitoring stations must report data to EPA AirNow system within 1 hour of measurement',
        'Networks must cover at least 90% of the population within 25 miles of a monitoring station',
      ],
    },
    {
      id: 'cat-017',
      label: 'Environmental Health Research',
      parentCategory: null,
      quantitativeCap: 500_000_000,
      qualitativeRules: [
        'Research must address health impacts of emerging environmental contaminants',
        'Community engagement plans required for all studies involving human subjects',
      ],
    },
  ],
  color: '#7c3aed', // purple
};

// ---------------------------------------------------------------------------
// Helper: zero-initialized VoteCount and VoteRecord
// ---------------------------------------------------------------------------

function emptyVoteCount(): VoteCount {
  return { yea: 0, nay: 0, present: 0, absent: 0 };
}

function emptyVoteRecord(billId: string): VoteRecord {
  return {
    billId,
    houseVotes: [],
    senateVotes: [],
    houseCount: emptyVoteCount(),
    senateCount: emptyVoteCount(),
    presidentialAction: null,
    vetoOverrideHouse: null,
    vetoOverrideSenate: null,
  };
}

// ---------------------------------------------------------------------------
// Sample Bills
// ---------------------------------------------------------------------------

export const SAMPLE_BILLS: Bill[] = [
  {
    id: 'bill-001',
    title: 'Congressional Infrastructure & Innovation Act',
    status: 'draft',
    sponsor: 'Rep. Hakeem Jeffries [D-NY]',
    introducedDate: '2026-02-10',
    text: `CONGRESSIONAL INFRASTRUCTURE & INNOVATION ACT
H.R. 2026-001

A BILL

To authorize appropriations for critical infrastructure repair, clean energy research and development, and scientific innovation programs across federal agencies, and for other purposes.

Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,

SECTION 1. SHORT TITLE.
This Act may be cited as the "Congressional Infrastructure & Innovation Act of 2026".

SECTION 2. FINDINGS.
Congress finds the following:
(1) The American Society of Civil Engineers has consistently rated the nation's infrastructure at a grade of C- or below, with an estimated $2.6 trillion in needed investment over the next decade.
(2) Federal investment in clean energy research and development is essential to maintaining economic competitiveness, reducing greenhouse gas emissions, and achieving energy independence.
(3) The National Science Foundation plays a critical role in advancing fundamental research that drives technological breakthroughs and sustains a globally competitive STEM workforce.
(4) Strategic, well-targeted federal spending can catalyze private investment, create high-quality jobs, and deliver measurable improvements in public safety and quality of life.

SECTION 3. AUTHORIZATION OF APPROPRIATIONS.
(a) DEPARTMENT OF TRANSPORTATION.--There is authorized to be appropriated to the Department of Transportation $5,000,000,000 for fiscal years 2026 through 2031 for infrastructure modernization, including bridge repair, highway improvement, public transit expansion, and freight corridor development.
(b) DEPARTMENT OF ENERGY.--There is authorized to be appropriated to the Department of Energy $3,000,000,000 for fiscal years 2026 through 2031 for clean energy research, grid modernization, and energy efficiency programs.
(c) NATIONAL SCIENCE FOUNDATION.--There is authorized to be appropriated to the National Science Foundation $2,000,000,000 for fiscal years 2026 through 2031 for STEM workforce development, advanced materials research, and AI and computing infrastructure.

SECTION 4. RESTRICTIONS AND ACCOUNTABILITY.
(a) Each agency receiving appropriations under this Act shall submit quarterly reports to the relevant congressional committees detailing expenditure status, project milestones, and performance metrics.
(b) The Government Accountability Office shall conduct an independent audit of all programs funded under this Act not later than 3 years after the date of enactment.
(c) Funds not obligated within the authorized period shall be returned to the Treasury.`,
    authorizations: [bill1AuthDOT, bill1AuthDOE, bill1AuthNSF],
    amendments: [],
    votes: emptyVoteRecord('bill-001'),
  },
  {
    id: 'bill-002',
    title: 'Public Health Emergency Preparedness Act',
    status: 'draft',
    sponsor: 'Rep. Rosa DeLauro [D-CT]',
    introducedDate: '2026-02-14',
    text: `PUBLIC HEALTH EMERGENCY PREPAREDNESS ACT
H.R. 2026-002

A BILL

To strengthen the nation's public health emergency preparedness and response capabilities, to authorize appropriations for critical health infrastructure and environmental health protections, and for other purposes.

Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,

SECTION 1. SHORT TITLE.
This Act may be cited as the "Public Health Emergency Preparedness Act of 2026".

SECTION 2. FINDINGS.
Congress finds the following:
(1) The COVID-19 pandemic exposed significant vulnerabilities in the nation's public health infrastructure, including inadequate medical supply stockpiles, insufficient hospital surge capacity, and fragmented disease surveillance systems.
(2) Environmental health hazards, including contaminated drinking water, degraded air quality, and exposure to emerging contaminants such as per- and polyfluoroalkyl substances (PFAS), pose ongoing threats to public health, disproportionately affecting low-income communities and communities of color.
(3) A well-trained, adequately staffed public health workforce is essential for effective emergency response, routine disease prevention, and health equity.
(4) Proactive investment in preparedness is significantly more cost-effective than reactive spending during public health emergencies.

SECTION 3. AUTHORIZATION OF APPROPRIATIONS.
(a) DEPARTMENT OF HEALTH AND HUMAN SERVICES.--There is authorized to be appropriated to the Department of Health and Human Services $5,000,000,000 for fiscal years 2026 through 2030 for emergency stockpile replenishment, hospital surge capacity improvements, public health workforce development, and disease surveillance and data system modernization.
(b) ENVIRONMENTAL PROTECTION AGENCY.--There is authorized to be appropriated to the Environmental Protection Agency $2,500,000,000 for fiscal years 2026 through 2030 for drinking water contaminant remediation, air quality monitoring network expansion, and environmental health research.

SECTION 4. REPORTING AND OVERSIGHT.
(a) The Secretary of Health and Human Services and the Administrator of the Environmental Protection Agency shall each submit biannual reports to the Committees on Appropriations and the Committees on Energy and Commerce detailing program implementation, expenditure summaries, and outcome metrics.
(b) The Inspector General of each respective agency shall conduct annual audits of programs funded under this Act.
(c) Not later than 2 years after enactment, the Government Accountability Office shall report to Congress on the effectiveness of funded programs in measurably improving public health preparedness and environmental health outcomes.`,
    authorizations: [bill2AuthHHS, bill2AuthEPA],
    amendments: [],
    votes: emptyVoteRecord('bill-002'),
  },
];

// ---------------------------------------------------------------------------
// Initial Application State
// ---------------------------------------------------------------------------

export function getInitialState(): AppState {
  return {
    bills: SAMPLE_BILLS,
    agencies: AGENCIES,
    refinements: [],
    transactions: [],
    currentView: 'legislative',
    selectedBillId: null,
    selectedAgencyId: null,
  };
}
