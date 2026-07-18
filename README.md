# The E-FISCAL Machine — Phase 1 demo

A single-file, zero-dependency demo of the **E-FISCAL Act** (discussion draft, July 2026): *Electronic Fiscal Information, Statutory Codification and Automated Legislation*. Phase 1 only — the intra-congressional machine, on Congress's own money, over today's payment rails. Expressly no CBDC, no new rails, no executive funds.

Open `index.html` in a browser and click **Guided Demo** (41 steps). Append `?smoke=1` to the URL to run the built-in 38-assertion test suite.

## The architectural commitment

**The Journal is the single source of truth.** Every fiscal event — the law itself, commitments, requests, checks, warrants, payments, adjudications, brake pulls, requisitions, reconciliations — is an append-only Journal entry with two dates (written/entered), a version number, and a 24-hour publication clock. **The Ledger is a pure function of the Journal** — literally the Act's "published recipe" — and the *Outside Reconstruction* button just runs it again and compares to the penny. The demo's architecture is itself the argument: you don't have to trust the office or the software; you can check.

## What it models

| Piece | In the demo |
|---|---|
| **The problem** | Today's 7-step prose→payment chain; the corrected **8-component TAS** (SP/ATA/AID/BPOA/EPOA/Type/MAIN/SUB, assigned by Treasury in CARS *after* enactment); the USLM gap (bill XML since the 113th Congress — with **no fiscal elements**); the Comparative Print Suite precedent; the two existing exceptions (31 U.S.C. §1511(b)(3); CFPB) |
| **The bill** | Curated pilot bill: prose sections + the **Annex** (five formalized lines, [$15M DRAFT] over 3 years) with green **mechanical fields** and amber **judgment fields** (named officer + 3-business-day clock), installments (one unlocked by a GAO milestone — a condition that executes itself), a no-year line (Type X), and the **fingerprint printed in the statute** |
| **Enactment** | Committee → House (majority of those voting) → cloture (60) → Senate → President (sign / veto+override / 10-day rule) → **Clerk + Secretary certify the file into the Journal** |
| **Payments** | Commit (checked at contract-signing) → request (declares its commitment) → **conformity check** (enough left, right purpose, inside the window, eligible recipient, no duplicate) → **PASS** (warrant auto-issues; no human touches it) / **CLEAR VIOLATION** (refused citing the exact enacted term; fixable, never waivable) / **JUDGMENT FLAG** (named GAO adjudicator, 3 business days, written reasons, **silence deems approval**, large amounts ping the overseers without pausing the clock) → payment on **Rail A** (chambers' officers certify — the House CAO is a statutory disbursing officer today, 2 U.S.C. §5309 — Treasury processes as-is, pay only against a warrant) or **Rail B** (the Bank pays from the Congressional General Account) → **public in 24 hours** |
| **The Account** | Council requisition (3 of 4 votes) → special obligation arises **by operation of statute** — general obligation, coins-and-U.S.-notes family, expressly not a Fed note or Treasury security — outside the debt limit, Fed-rate-neutral, accounted only in the Journal. Modeled on the CFPB's standing draw (12 U.S.C. §5497, upheld 2024), with the 2025–26 "combined earnings" failure mode designed out |
| **Safeguards** | **Shadow-first** (lines run under ordinary process until Director + Comptroller General certify, line by line); the **brake** (3 of 4 Appropriations principals, new requests only, reasons published instantly, 72h unless renewed, in-flight payments untouched); the **floor** (system down → payments proceed the old way and reconcile after); claims reserve; **no clawback switch** |
| **Study copies** | Real FY2024 Legislative Branch appropriations prose (Office of the Clerk; Capitol maintenance) rendered NON-OPERATIVE into the grammar, each with a **discrepancy report** — what couldn't be made mechanical and the judgment field used instead |

## Honest simplifications

The **demo clock** moves only when clicked (one clock serves the 3-business-day, 72-hour, and 24-hour rules; weekends skipped, holidays not). The **fingerprint** is FNV-1a, badged as a stand-in for SHA-256. **Shadow mode** and the quarantined trial are annotations, not a parallel simulator. The **rails are labels**, not payment plumbing — which matches the Act's own limit: *not a payment system; builds no rails*. Governance depth (Council ties, Archives custody, three-copies-two-decide) is copy, not mechanics. All dollar amounts are bracketed **DRAFT** placeholders; TAS digits are illustrative — real TAS assignment is Treasury's, post-enactment, which is the point being made. The $500k oversight-ping threshold is illustrative; a line may enact its own.

## Where the old demo went

The previous demo on this repo modeled the full NDFR of Rohan Grey's *Digitizing the Fisc* — Public Credit Cards, Congress's Treasury ATM, eCoins on agency ePurses. Under the two-round strategy that is now **Phase 2 / round 2** (future law only); that demo is preserved intact on the [`RonTuretzky/fiscal-ledger-html`](../../tree/RonTuretzky/fiscal-ledger-html) branch.
