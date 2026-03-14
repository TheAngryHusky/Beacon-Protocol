interface Entry {
  address: string;
  score: number;
}

interface Props {
  entries: Entry[];
  loading: boolean;
  walletAddress?: string;
}

function getRank(score: number): { label: string; color: string; icon: string } {
  if (score >= 1000) return { label: "Pillar of Civilization", color: "var(--gold)",   icon: "◈" };
  if (score >= 100)  return { label: "Guardian",               color: "var(--text)",   icon: "◆" };
  if (score >= 10)   return { label: "Helper",                 color: "var(--orange)", icon: "◇" };
  return                    { label: "Explorer",               color: "var(--text-muted)", icon: "·" };
}

const POSITION_COLORS = ["var(--gold)", "var(--silver)", "var(--bronze)"];

export function Leaderboard({ entries, loading, walletAddress }: Props) {
  return (
    <div>
      <div className="section-heading">Reputation Leaderboard</div>

      <div className="leaderboard-card">
        {loading ? (
          <div className="empty-state">
            <div className="empty-title">Scanning network...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">◈</span>
            <div className="empty-title">No donors recorded</div>
            <div className="empty-desc">
              Be the first pilot to stock a rescue beacon and earn reputation
              across the frontier.
            </div>
          </div>
        ) : (
          <>
            <div className="leaderboard-header">
              <div>Rank</div>
              <div>Pilot</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Rep</div>
            </div>
            {entries.map((entry, i) => {
              const rank = getRank(entry.score);
              const isMe = entry.address === walletAddress;
              return (
                <div key={entry.address} className={`leaderboard-row${isMe ? " is-me" : ""}`}>
                  <div
                    className="rank-number"
                    style={{ color: POSITION_COLORS[i] ?? "var(--text-dim)" }}
                  >
                    #{i + 1}
                  </div>
                  <div>
                    <span className="pilot-address">
                      {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </span>
                    {isMe && <span className="you-tag">← you</span>}
                  </div>
                  <div className="rank-badge" style={{ color: rank.color }}>
                    <span>{rank.icon}</span>
                    <span>{rank.label}</span>
                  </div>
                  <div className="rep-score" style={{ color: rank.color }}>
                    {entry.score}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
