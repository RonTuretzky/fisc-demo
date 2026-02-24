# Congressional Fiscal Ledger — Static Frontend Demo

A static single-page application demonstrating how a direct congressional-to-agency fiscal ledger would work, without requiring any backend infrastructure. Built for presentation to legislative offices and media.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in a modern browser.

## Three-Phase Demo Flow

1. **Legislative Dashboard** — Create bills, add spending authorizations, propose wiki-style amendments, and simulate House/Senate votes with real-time animated tallies. Presidential sign/veto with override flow.

2. **Committee Refinement** — Break down broad enacted authorizations into specific spending subcategories with compliance checking and multi-signature approval.

3. **Agency Spending** — View agency credit limits, initiate transactions with automated compliance validation, and review the full audit trail.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- localStorage for all state persistence (no backend)

## Build

```bash
npm run build    # Output in dist/
npm run preview  # Preview production build
```
