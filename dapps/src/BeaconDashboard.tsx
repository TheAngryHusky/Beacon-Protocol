import { useCurrentClient } from "@mysten/dapp-kit-react";
import { useQuery } from "@tanstack/react-query";
import { Leaderboard } from "./Leaderboard";

const BEACON_STATE_ID = import.meta.env.VITE_BEACON_STATE_ID;
const STORAGE_UNIT_ID = import.meta.env.VITE_STORAGE_UNIT_ID;

function getRank(score: number): { label: string; color: string } {
  if (score >= 1000) return { label: "Pillar of Civilization", color: "var(--gold)" };
  if (score >= 100)  return { label: "Guardian",               color: "var(--text)" };
  if (score >= 10)   return { label: "Helper",                 color: "var(--orange)" };
  return                    { label: "Explorer",               color: "var(--text-muted)" };
}

interface Props {
  walletAddress?: string;
}

export function BeaconDashboard({ walletAddress }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = useCurrentClient() as any;

  const { data: repEntries, isLoading: repLoading } = useQuery({
    queryKey: ["beacon-reputation", BEACON_STATE_ID],
    queryFn: async () => {
      const fields = await client.getDynamicFields({ parentId: BEACON_STATE_ID });
      const entries: { address: string; score: number }[] = [];
      for (const field of fields.data) {
        const obj = await client.getDynamicFieldObject({
          parentId: BEACON_STATE_ID,
          name: field.name,
        });
        const content = obj.data?.content;
        if (content && "fields" in content) {
          const f = content.fields as { name?: string; value?: string };
          if (f.name && f.value) entries.push({ address: f.name, score: Number(f.value) });
        }
      }
      return entries.sort((a, b) => b.score - a.score);
    },
    refetchInterval: 10000,
  });

  const myEntry = repEntries?.find((e) => e.address === walletAddress);
  const myScore = myEntry?.score ?? 0;
  const myRank  = getRank(myScore);

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">EVE Frontier · Civilization Initiative</div>
        <div className="hero-title">RESCUE <span>NETWORK</span></div>
        <div className="hero-sub">
          Stock emergency beacons across the frontier. Save stranded pilots.
          Earn reputation. Build civilization together.
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="section-heading">Network Status</div>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Active Beacons</div>
            <div className="stat-value orange">1</div>
            <div className="stat-sub">
              <span className="online-dot" />online
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Helpers</div>
            <div className="stat-value">{repLoading ? "—" : repEntries?.length ?? 0}</div>
            <div className="stat-sub">unique donors</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Your Reputation</div>
            <div className="stat-value" style={{ color: myRank.color }}>{myScore}</div>
            <div className="stat-sub" style={{ color: myRank.color }}>
              {walletAddress ? myRank.label : "Connect wallet"}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Max Withdrawal</div>
            <div className="stat-value">10</div>
            <div className="stat-sub">items per visit</div>
          </div>
        </div>
      </div>

      {/* Active Beacons */}
      <div>
        <div className="section-heading">Active Beacons</div>
        <div className="beacon-card">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="online-dot" />
              <span className="beacon-name">Beacon Alpha-1</span>
            </div>
            <div className="beacon-id">
              {STORAGE_UNIT_ID.slice(0, 16)}...{STORAGE_UNIT_ID.slice(-8)}
            </div>
            <div className="beacon-meta">
              Open to all pilots · 5 REP per donation · Max 10 items/visit
            </div>
          </div>
          <div className="badge-online">
            <span className="online-dot" />Online
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard entries={repEntries ?? []} loading={repLoading} walletAddress={walletAddress} />
    </>
  );
}
