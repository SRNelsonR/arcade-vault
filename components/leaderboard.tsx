"use client";

import { useMemo } from "react";
import { mergeScores, seededScores } from "@/lib/scores";
import { useSession } from "@/lib/session";

const TOP_CLASS = ["top1", "top2", "top3"];

export function Leaderboard({ gameId }: { gameId: string }) {
  const { scores } = useSession();

  const rows = useMemo(
    () =>
      mergeScores(seededScores(gameId.length * 17 + 3, 10), scores, gameId).slice(0, 10),
    [gameId, scores],
  );

  return (
    <div className="leaderboard">
      <h3>MEJORES PUNTUACIONES</h3>
      {rows.map((r, i) => (
        <div key={`${r.name}-${r.score}-${i}`} className={"lb-row" + (i < 3 ? " " + TOP_CLASS[i] : "")}>
          <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
          <div className="pl">
            {r.name}
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em" }}>
              {r.date}
            </div>
          </div>
          <div className="sc">{r.score.toLocaleString("es-ES")}</div>
        </div>
      ))}
    </div>
  );
}
