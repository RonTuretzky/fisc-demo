# Congressional Fiscal Ledger — an NDFR demo

A single-file, zero-dependency HTML demo of the **New Digital Fiscal Regime (NDFR)** proposed in Rohan Grey, *Digitizing the Fisc* (SSRN 5239760): a "centralized legislature, decentralized executive" redesign of US fiscal infrastructure in which Congress — not the Treasury/Fed payment stack — hosts the systems that turn law into spendable money.

Open `index.html` in a browser (no build step, state persists in `localStorage`) and click **Guided Demo**.

## What it models

The paper's five phases of fiscal administration, end to end:

| Phase | In the demo |
|---|---|
| **1. Appropriating** | Bills establish **Public Credit lines** on the Congressional Fiscal Record — delegations of spending *power*, not transfers of dollars. Amendments are diffs with version history. Passage takes a majority of Members present and voting; a veto is overridden by 2/3 of those voting in each chamber (the Record's two-tier "Budget Key" edit rule). |
| **2. Drawing** | Congress issues the agency a **Public Credit Card** ("Purse Key"): negotiated Terms & Conditions subcategories, checked against the statutory line by the **ATM Access Protocol**, co-signed with Budget Keys. No Card, no ATM access. |
| **3. Coining** | The agency draws at **Congress's Treasury ATM**. Draws create eCoins *de novo* onto the agency's **ePurse** — this, not enactment, is when money comes into existence. The ATM enforces the Card, the cap, the period of availability, and the financing handbrake. |
| **4. Spending** | Spending comes out of the ePurse balance only (the Antideficiency Act analogue, 31 U.S.C. 1341), must match a Card T&C purpose (the purpose statute analogue, 31 U.S.C. 1301(a)), and respects per-subcategory caps. |
| **5. Publishing** | Agency ledger nodes sync to Congress's **Public Statement and Account** (Art. I, § 9, cl. 7 as a live dashboard): appropriated / drawn / held / spent / collected / outstanding. |

Also modeled:

- **Financing handbrake** — Congress can freeze a credit line by Joint Resolution, suspending *new* draws (eCoins already held remain spendable). This is the paper's replacement for the debt ceiling: the "parliamentary finger on the button."
- **Collections** — tax receipts *delete* eCoins from outstanding money rather than "funding" spending.

## Deliberate simplifications

This is a toy: one Card per line, no committee referral/markup stage before floor votes, no reconciliation/cloture procedure (noted in the UI where relevant), no Fed "silver eCoin" securities layer, no oracles/smart-contract conditionality, no offline P2P ePurse transfers, and instant single-actor "votes" for card issuance and handbrake resolutions. Legal citations in the UI are analogues, not claims that the NDFR is current law — under *today's* law, post-enactment subdivision of appropriations is OMB apportionment (31 U.S.C. 1512–1514), and a bill saying only "there is authorized to be appropriated" confers no budget authority at all.
