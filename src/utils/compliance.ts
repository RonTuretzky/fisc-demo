import type {
  Transaction,
  Authorization,
  Agency,
  ComplianceResult,
  SpendingCategory,
  VoteRecord,
} from '../types';

/**
 * Check whether a proposed transaction complies with its authorization,
 * the agency's credit limit, and all quantitative / qualitative rules.
 */
export function checkTransactionCompliance(
  transaction: Omit<Transaction, 'id' | 'status' | 'complianceCheck' | 'timestamp'>,
  authorization: Authorization,
  agency: Agency,
  allTransactions: Transaction[],
): ComplianceResult {
  const violations: string[] = [];
  const checkedAgainst: string[] = [];

  // --- Quantitative cap ---
  if (authorization.amountCap !== null) {
    checkedAgainst.push(`Authorization cap: $${authorization.amountCap.toLocaleString()}`);

    const approvedTotal = allTransactions
      .filter(
        (t) =>
          t.authorizationId === authorization.id &&
          t.status === 'approved',
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const projectedTotal = approvedTotal + transaction.amount;

    if (projectedTotal > authorization.amountCap) {
      violations.push(
        `Transaction would exceed authorization cap. ` +
          `Approved so far: $${approvedTotal.toLocaleString()}, ` +
          `requested: $${transaction.amount.toLocaleString()}, ` +
          `cap: $${authorization.amountCap.toLocaleString()}.`,
      );
    }
  }

  // --- Time limit ---
  if (authorization.timeLimit !== null) {
    checkedAgainst.push(`Time limit: ${authorization.timeLimit}`);

    const limitDate = new Date(authorization.timeLimit);
    const now = new Date();

    if (now > limitDate) {
      violations.push(
        `Authorization time limit has expired (${authorization.timeLimit}).`,
      );
    }
  }

  // --- Qualitative restrictions: category must be listed ---
  const categoryIds = authorization.categories.map((c) => c.id);
  const categoryLabels = authorization.categories.map((c) => c.label);
  checkedAgainst.push(
    `Allowed categories: ${categoryLabels.join(', ') || '(none)'}`,
  );

  if (
    !categoryIds.includes(transaction.category) &&
    !categoryLabels.includes(transaction.category)
  ) {
    violations.push(
      `Transaction category "${transaction.category}" is not among the authorized categories.`,
    );
  }

  // --- Agency credit limit ---
  checkedAgainst.push(
    `Agency credit limit: $${agency.creditLimit.toLocaleString()}`,
  );

  const agencyApprovedTotal = allTransactions
    .filter((t) => t.agencyId === agency.id && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  if (agencyApprovedTotal + transaction.amount > agency.creditLimit) {
    violations.push(
      `Transaction would exceed agency credit limit of $${agency.creditLimit.toLocaleString()}.`,
    );
  }

  return {
    passed: violations.length === 0,
    violations,
    checkedAgainst,
  };
}

/**
 * Check whether a committee refinement's subcategories are consistent
 * with the original authorization.
 */
export function checkRefinementCompliance(
  subcategories: SpendingCategory[],
  originalAuth: Authorization,
): ComplianceResult {
  const violations: string[] = [];
  const checkedAgainst: string[] = [];

  // --- Quantitative: sum of sub-caps must not exceed auth cap ---
  if (originalAuth.amountCap !== null) {
    checkedAgainst.push(
      `Original authorization cap: $${originalAuth.amountCap.toLocaleString()}`,
    );

    const subCapTotal = subcategories.reduce(
      (sum, sc) => sum + (sc.quantitativeCap ?? 0),
      0,
    );

    if (subCapTotal > originalAuth.amountCap) {
      violations.push(
        `Sum of subcategory caps ($${subCapTotal.toLocaleString()}) ` +
          `exceeds the original authorization cap ($${originalAuth.amountCap.toLocaleString()}).`,
      );
    }
  }

  // --- Qualitative: subcategory rules must not contradict restrictions ---
  if (originalAuth.restrictions.length > 0) {
    checkedAgainst.push(
      `Original restrictions: ${originalAuth.restrictions.join('; ')}`,
    );

    for (const sub of subcategories) {
      for (const rule of sub.qualitativeRules) {
        for (const restriction of originalAuth.restrictions) {
          // A contradiction is detected when a subcategory rule explicitly
          // negates an original restriction (e.g. "allow X" vs "no X").
          const ruleNorm = rule.toLowerCase().trim();
          const restrictionNorm = restriction.toLowerCase().trim();

          const contradicts =
            (ruleNorm.startsWith('allow ') &&
              restrictionNorm.startsWith('no ') &&
              ruleNorm.slice(6) === restrictionNorm.slice(3)) ||
            (ruleNorm.startsWith('no ') &&
              restrictionNorm.startsWith('allow ') &&
              ruleNorm.slice(3) === restrictionNorm.slice(6)) ||
            (ruleNorm === restrictionNorm.replace(/^no /, '') &&
              restrictionNorm.startsWith('no '));

          if (contradicts) {
            violations.push(
              `Subcategory "${sub.label}" rule "${rule}" contradicts ` +
                `authorization restriction "${restriction}".`,
            );
          }
        }
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    checkedAgainst,
  };
}

/**
 * Determine whether a bill has passed through the full legislative process.
 *
 * A bill passes if:
 *   (House yea >= 218 AND Senate yea >= 51 AND president signed)
 *   OR the veto was overridden in both chambers.
 */
export function isPassed(votes: VoteRecord): boolean {
  const houseApproved = votes.houseCount.yea >= 218;
  const senateApproved = votes.senateCount.yea >= 51;
  const signed = votes.presidentialAction === 'signed';

  if (houseApproved && senateApproved && signed) {
    return true;
  }

  // Check veto override path
  if (votes.presidentialAction === 'vetoed') {
    return isVetoOverridden(votes);
  }

  return false;
}

/**
 * Check whether a presidential veto has been overridden by both chambers.
 * Override requires >= 2/3 of voting members (yea + nay + present) in each chamber.
 */
export function isVetoOverridden(votes: VoteRecord): boolean {
  if (!votes.vetoOverrideHouse || !votes.vetoOverrideSenate) {
    return false;
  }

  const houseVoting =
    votes.vetoOverrideHouse.yea +
    votes.vetoOverrideHouse.nay +
    votes.vetoOverrideHouse.present;
  const houseOverridden =
    houseVoting > 0 && votes.vetoOverrideHouse.yea >= (2 / 3) * houseVoting;

  const senateVoting =
    votes.vetoOverrideSenate.yea +
    votes.vetoOverrideSenate.nay +
    votes.vetoOverrideSenate.present;
  const senateOverridden =
    senateVoting > 0 && votes.vetoOverrideSenate.yea >= (2 / 3) * senateVoting;

  return houseOverridden && senateOverridden;
}
