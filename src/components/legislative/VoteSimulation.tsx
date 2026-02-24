import { Fragment, useState, useRef, useCallback } from 'react';
import { useAppState } from '../../store/useStore';
import { HOUSE_MEMBERS, SENATE_MEMBERS } from '../../data/mockData';
import type { Bill, Vote, VoteCount } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateMemberName(chamber: 'house' | 'senate', index: number): { id: string; name: string } {
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  const state = states[index % states.length];
  const prefix = chamber === 'house' ? 'Rep.' : 'Sen.';
  return {
    id: `${chamber}-gen-${index}`,
    name: `${prefix} Member ${index + 1} (${state})`,
  };
}

function buildMembers(chamber: 'house' | 'senate', total: number) {
  const known = chamber === 'house' ? HOUSE_MEMBERS : SENATE_MEMBERS;
  const members: { id: string; name: string }[] = [];

  for (let i = 0; i < total; i++) {
    if (i < known.length) {
      members.push({ id: known[i].id, name: known[i].name });
    } else {
      members.push(generateMemberName(chamber, i));
    }
  }
  return members;
}

function generateVoteOutcome(yeaTarget: number, total: number): ('yea' | 'nay' | 'present' | 'absent')[] {
  // Spread target with some variance
  const variance = Math.floor(Math.random() * 20) - 10;
  const targetYea = Math.min(total, Math.max(0, yeaTarget + variance));

  const votes: ('yea' | 'nay' | 'present' | 'absent')[] = [];
  for (let i = 0; i < total; i++) {
    if (i < targetYea) {
      votes.push('yea');
    } else if (i < total - Math.floor(total * 0.02)) {
      votes.push('nay');
    } else if (Math.random() > 0.5) {
      votes.push('present');
    } else {
      votes.push('absent');
    }
  }

  // Shuffle
  for (let i = votes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [votes[i], votes[j]] = [votes[j], votes[i]];
  }
  return votes;
}

// ---------------------------------------------------------------------------
// Progress Stepper
// ---------------------------------------------------------------------------

interface StepperProps {
  stages: { label: string; done: boolean; active: boolean; failed: boolean }[];
}

function Stepper({ stages }: StepperProps) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {stages.map((stage, i) => (
        <Fragment key={stage.label}>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                stage.failed
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : stage.done
                  ? 'border-green-500 bg-green-500 text-white'
                  : stage.active
                  ? 'border-blue-500 bg-blue-50 text-blue-600 animate-pulse'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}
            >
              {stage.failed ? '!' : stage.done ? '\u2713' : i + 1}
            </div>
            <span
              className={`mt-1 text-[10px] font-medium text-center leading-tight ${
                stage.failed
                  ? 'text-red-600'
                  : stage.done
                  ? 'text-green-700'
                  : stage.active
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              {stage.label}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`h-0.5 flex-1 mt-[-16px] ${
                stage.done ? 'bg-green-400' : 'bg-gray-200'
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vote Tally Bar
// ---------------------------------------------------------------------------

interface TallyBarProps {
  count: VoteCount;
  total: number;
  threshold: number;
  label: string;
}

function TallyBar({ count, total, threshold, label }: TallyBarProps) {
  const voted = count.yea + count.nay + count.present + count.absent;
  const yeaPct = total > 0 ? (count.yea / total) * 100 : 0;
  const nayPct = total > 0 ? (count.nay / total) * 100 : 0;
  const presentPct = total > 0 ? ((count.present + count.absent) / total) * 100 : 0;
  const thresholdPct = (threshold / total) * 100;
  const passed = count.yea >= threshold && voted === total;
  const failed = voted === total && count.yea < threshold;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-700 font-semibold">Yea: {count.yea}</span>
          <span className="text-red-600 font-semibold">Nay: {count.nay}</span>
          <span className="text-gray-500">Other: {count.present + count.absent}</span>
          {passed && (
            <span className="text-green-600 font-bold">PASSED</span>
          )}
          {failed && (
            <span className="text-red-600 font-bold">FAILED</span>
          )}
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-7 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-75"
          style={{ width: `${yeaPct}%` }}
        />
        <div
          className="absolute inset-y-0 bg-red-500 transition-all duration-75"
          style={{ left: `${yeaPct}%`, width: `${nayPct}%` }}
        />
        <div
          className="absolute inset-y-0 bg-gray-400 transition-all duration-75"
          style={{ left: `${yeaPct + nayPct}%`, width: `${presentPct}%` }}
        />

        {/* Threshold marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-yellow-500 z-10"
          style={{ left: `${thresholdPct}%` }}
        />
        <div
          className="absolute top-0 text-[9px] font-bold text-yellow-700 z-10 -translate-x-1/2"
          style={{ left: `${thresholdPct}%` }}
        >
          {threshold}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>0</span>
        <span>{voted} / {total} votes cast</span>
        <span>{total}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface VoteSimulationProps {
  bill: Bill;
}

export default function VoteSimulation({ bill }: VoteSimulationProps) {
  const [, dispatch] = useAppState();
  const [animating, setAnimating] = useState(false);
  const [liveHouseCount, setLiveHouseCount] = useState<VoteCount>(bill.votes.houseCount);
  const [liveSenateCount, setLiveSenateCount] = useState<VoteCount>(bill.votes.senateCount);
  const [liveOverrideHouse, setLiveOverrideHouse] = useState<VoteCount | null>(bill.votes.vetoOverrideHouse);
  const [liveOverrideSenate, setLiveOverrideSenate] = useState<VoteCount | null>(bill.votes.vetoOverrideSenate);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine current pipeline position
  const votes = bill.votes;
  const houseDone = votes.houseVotes.length === 435;
  const housePassed = votes.houseCount.yea >= 218;
  const senateDone = votes.senateVotes.length === 100;
  const senatePassed = votes.senateCount.yea >= 51;
  const presAction = votes.presidentialAction;
  const vetoed = presAction === 'vetoed';
  const signed = presAction === 'signed';
  const overrideHouseDone = votes.vetoOverrideHouse !== null && (votes.vetoOverrideHouse.yea + votes.vetoOverrideHouse.nay + votes.vetoOverrideHouse.present + votes.vetoOverrideHouse.absent) === 435;
  const overrideSenateDone = votes.vetoOverrideSenate !== null && (votes.vetoOverrideSenate.yea + votes.vetoOverrideSenate.nay + votes.vetoOverrideSenate.present + votes.vetoOverrideSenate.absent) === 100;
  const overrideHousePassed = votes.vetoOverrideHouse ? votes.vetoOverrideHouse.yea >= 290 : false;
  const overrideSenatePassed = votes.vetoOverrideSenate ? votes.vetoOverrideSenate.yea >= 67 : false;

  const canEnact =
    (housePassed && senatePassed && signed) ||
    (vetoed && overrideHousePassed && overrideSenatePassed);

  // Build stepper stages
  const stages = [
    {
      label: 'House Vote',
      done: houseDone && housePassed,
      active: !houseDone && !animating ? bill.status === 'draft' || bill.status === 'house_floor' || bill.status === 'house_voting' : false,
      failed: houseDone && !housePassed,
    },
    {
      label: 'Senate Vote',
      done: senateDone && senatePassed,
      active: housePassed && !senateDone,
      failed: senateDone && !senatePassed,
    },
    {
      label: 'Presidential Action',
      done: signed || (vetoed && overrideHousePassed && overrideSenatePassed),
      active: housePassed && senatePassed && presAction === null,
      failed: vetoed && !(overrideHousePassed && overrideSenatePassed) && (overrideHouseDone || overrideSenateDone),
    },
    {
      label: 'Enacted',
      done: bill.status === 'enacted',
      active: canEnact && bill.status !== 'enacted',
      failed: false,
    },
  ];

  // --- Animate vote ---
  const simulateVote = useCallback(
    (
      chamber: 'house' | 'senate',
      total: number,
      yeaTarget: number,
      isOverride: boolean,
    ) => {
      if (animating) return;
      setAnimating(true);

      const members = buildMembers(chamber, total);
      const outcomes = generateVoteOutcome(yeaTarget, total);
      const voteRecords: Vote[] = [];
      const runningCount: VoteCount = { yea: 0, nay: 0, present: 0, absent: 0 };

      let i = 0;
      intervalRef.current = setInterval(() => {
        if (i >= total) {
          clearInterval(intervalRef.current!);
          setAnimating(false);

          // Dispatch the final result
          const votesCopy = [...voteRecords];
          const countCopy = { ...runningCount };

          if (isOverride) {
            if (chamber === 'house') {
              dispatch({
                type: 'UPDATE_VOTES',
                payload: { billId: bill.id, votes: { vetoOverrideHouse: countCopy } },
              });
              const passed = countCopy.yea >= 290;
              if (passed) {
                dispatch({
                  type: 'UPDATE_BILL_STATUS',
                  payload: { id: bill.id, status: 'veto_override_house' },
                });
              }
            } else {
              dispatch({
                type: 'UPDATE_VOTES',
                payload: { billId: bill.id, votes: { vetoOverrideSenate: countCopy } },
              });
              const passed = countCopy.yea >= 67;
              if (passed) {
                dispatch({
                  type: 'UPDATE_BILL_STATUS',
                  payload: { id: bill.id, status: 'veto_override_senate' },
                });
              }
            }
          } else {
            if (chamber === 'house') {
              dispatch({
                type: 'UPDATE_VOTES',
                payload: { billId: bill.id, votes: { houseVotes: votesCopy, houseCount: countCopy } },
              });
              const passed = countCopy.yea >= 218;
              dispatch({
                type: 'UPDATE_BILL_STATUS',
                payload: { id: bill.id, status: passed ? 'house_passed' : 'house_failed' },
              });
            } else {
              dispatch({
                type: 'UPDATE_VOTES',
                payload: { billId: bill.id, votes: { senateVotes: votesCopy, senateCount: countCopy } },
              });
              const passed = countCopy.yea >= 51;
              dispatch({
                type: 'UPDATE_BILL_STATUS',
                payload: { id: bill.id, status: passed ? 'senate_passed' : 'senate_failed' },
              });
            }
          }
          return;
        }

        const member = members[i];
        const outcome = outcomes[i];
        runningCount[outcome]++;

        voteRecords.push({
          memberId: member.id,
          memberName: member.name,
          chamber,
          vote: outcome,
          timestamp: new Date().toISOString(),
        });

        const snapshot = { ...runningCount };

        if (isOverride) {
          if (chamber === 'house') setLiveOverrideHouse(snapshot);
          else setLiveOverrideSenate(snapshot);
        } else {
          if (chamber === 'house') setLiveHouseCount(snapshot);
          else setLiveSenateCount(snapshot);
        }

        i++;
      }, 7);
    },
    [animating, bill.id, dispatch],
  );

  const handleHouseVote = () => {
    dispatch({ type: 'UPDATE_BILL_STATUS', payload: { id: bill.id, status: 'house_voting' } });
    simulateVote('house', 435, 237, false);
  };

  const handleSenateVote = () => {
    dispatch({ type: 'UPDATE_BILL_STATUS', payload: { id: bill.id, status: 'senate_voting' } });
    simulateVote('senate', 100, 55, false);
  };

  const handleSign = () => {
    dispatch({
      type: 'UPDATE_VOTES',
      payload: { billId: bill.id, votes: { presidentialAction: 'signed' } },
    });
    dispatch({
      type: 'UPDATE_BILL_STATUS',
      payload: { id: bill.id, status: 'signed' },
    });
  };

  const handleVeto = () => {
    dispatch({
      type: 'UPDATE_VOTES',
      payload: { billId: bill.id, votes: { presidentialAction: 'vetoed' } },
    });
    dispatch({
      type: 'UPDATE_BILL_STATUS',
      payload: { id: bill.id, status: 'vetoed' },
    });
  };

  const handleOverrideHouse = () => {
    setLiveOverrideHouse({ yea: 0, nay: 0, present: 0, absent: 0 });
    simulateVote('house', 435, 300, true);
  };

  const handleOverrideSenate = () => {
    setLiveOverrideSenate({ yea: 0, nay: 0, present: 0, absent: 0 });
    simulateVote('senate', 100, 70, true);
  };

  const handleEnact = () => {
    dispatch({ type: 'ENACT_BILL', payload: { billId: bill.id } });
  };

  // Sync live state when bill prop changes
  const displayHouseCount = animating && !houseDone ? liveHouseCount : bill.votes.houseCount;
  const displaySenateCount = animating && !senateDone ? liveSenateCount : bill.votes.senateCount;
  const displayOverrideHouse = animating ? liveOverrideHouse : bill.votes.vetoOverrideHouse;
  const displayOverrideSenate = animating ? liveOverrideSenate : bill.votes.vetoOverrideSenate;

  return (
    <div className="space-y-6">
      {/* Pipeline stepper */}
      <Stepper stages={stages} />

      {/* House Vote */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <TallyBar
          count={displayHouseCount}
          total={435}
          threshold={218}
          label="House of Representatives"
        />
        {!houseDone && (
          <button
            onClick={handleHouseVote}
            disabled={animating}
            className="mt-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {animating ? 'Voting in progress...' : 'Simulate House Vote'}
          </button>
        )}
      </div>

      {/* Senate Vote */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <TallyBar
          count={displaySenateCount}
          total={100}
          threshold={51}
          label="Senate"
        />
        {!senateDone && (
          <button
            onClick={handleSenateVote}
            disabled={animating || !housePassed}
            className="mt-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {animating ? 'Voting in progress...' : 'Simulate Senate Vote'}
          </button>
        )}
        {!housePassed && !houseDone && (
          <p className="mt-1 text-xs text-gray-400 italic">House must vote first</p>
        )}
      </div>

      {/* Presidential Action */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Presidential Action</h3>

        {presAction === null && housePassed && senatePassed && (
          <div className="flex gap-3">
            <button
              onClick={handleSign}
              disabled={animating}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Sign into Law
            </button>
            <button
              onClick={handleVeto}
              disabled={animating}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Veto
            </button>
          </div>
        )}

        {presAction === null && !(housePassed && senatePassed) && (
          <p className="text-xs text-gray-400 italic">
            Both chambers must pass the bill before presidential action
          </p>
        )}

        {signed && (
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-medium">
            The President has signed this bill.
          </div>
        )}

        {vetoed && (
          <div className="space-y-4">
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-medium">
              The President has vetoed this bill.
            </div>

            {/* House Override */}
            <div className="pl-4 border-l-2 border-orange-300">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">House Veto Override (2/3 = 290 needed)</h4>
              {displayOverrideHouse && (
                <TallyBar
                  count={displayOverrideHouse}
                  total={435}
                  threshold={290}
                  label="House Override"
                />
              )}
              {!overrideHouseDone && (
                <button
                  onClick={handleOverrideHouse}
                  disabled={animating}
                  className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {animating ? 'Override in progress...' : 'Trigger House Override'}
                </button>
              )}
            </div>

            {/* Senate Override */}
            <div className="pl-4 border-l-2 border-orange-300">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Senate Veto Override (2/3 = 67 needed)</h4>
              {displayOverrideSenate && (
                <TallyBar
                  count={displayOverrideSenate}
                  total={100}
                  threshold={67}
                  label="Senate Override"
                />
              )}
              {!overrideSenateDone && (
                <button
                  onClick={handleOverrideSenate}
                  disabled={animating || !overrideHousePassed}
                  className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {animating ? 'Override in progress...' : 'Trigger Senate Override'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enact */}
      {canEnact && bill.status !== 'enacted' && (
        <button
          onClick={handleEnact}
          className="w-full py-3 text-base font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Enact Bill into Law
        </button>
      )}

      {bill.status === 'enacted' && (
        <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg text-center">
          <p className="text-lg font-bold text-green-800">This bill has been enacted into law.</p>
          <p className="text-sm text-green-600 mt-1">Authorizations have been distributed to agencies.</p>
        </div>
      )}
    </div>
  );
}
