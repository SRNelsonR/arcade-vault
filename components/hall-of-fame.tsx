"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GAMES } from "@/lib/games";
import { formatDate, mergeScores, seededScores, type ScoreRow } from "@/lib/scores";
import { useSession } from "@/lib/session";

const TOP_CLASS = ["top1", "top2", "top3"];
const fmt = (n: number) => n.toLocaleString("es-ES");
const pad = (n: number) => String(n).padStart(2, "0");

function PodiumSlot({ row, className, place }: { row: ScoreRow; className: string; place: string }) {
  return (
    <div className={"podium-slot " + className}>
      <div className="rank-num">{place}</div>
      <div className="name">{row.name}</div>
      <div className="score">{fmt(row.score)}</div>
      <div className="date">{row.date}</div>
    </div>
  );
}

export function HallOfFame() {
  const { user, scores } = useSession();
  const [tab, setTab] = useState(GAMES[0].id);
  const game = GAMES.find((g) => g.id === tab) ?? GAMES[0];

  const mock = useMemo(() => seededScores(tab.length * 23 + 7, 12), [tab]);
  const rows = useMemo(() => mergeScores(mock, scores, tab).slice(0, 12), [mock, scores, tab]);

  // Mejor marca del usuario en este juego (puntajes guardados con su nombre).
  const best = useMemo(() => {
    if (!user) return null;
    return (
      scores
        .filter((s) => s.game === tab && s.name === user.name)
        .sort((a, b) => b.score - a.score)[0] ?? null
    );
  }, [user, scores, tab]);

  const bestRank = useMemo(() => {
    if (!best) return null;
    const all = [
      ...mock.map((r) => r.score),
      ...scores.filter((s) => s.game === tab).map((s) => s.score),
    ];
    return all.filter((s) => s > best.score).length + 1;
  }, [best, mock, scores, tab]);

  const [first, second, third] = rows;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (tab === g.id ? " active" : "")}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <PodiumSlot row={second} className="silver" place="02" />
        <div className="podium-slot gold">
          <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>
            CAMPEÓN
          </div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>01</div>
          <div className="name">{first.name}</div>
          <div className="score" style={{ fontSize: 20 }}>{fmt(first.score)}</div>
          <div className="date">{first.date}</div>
        </div>
        <PodiumSlot row={third} className="bronze" place="03" />
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={`${r.name}-${r.score}-${i}`}
            className={"tr" + (i < 3 ? " " + TOP_CLASS[i] : "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{pad(r.rank)}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{fmt(r.score)}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div className="tr you" style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
              <div className="rk" style={{ color: "var(--yellow)" }}>
                {bestRank ? `#${pad(bestRank)}` : "—"}
              </div>
              <div className="pl" style={{ color: "var(--yellow)" }}>{user.name}</div>
              <div className="sc" style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}>
                {best ? fmt(best.score) : "—"}
              </div>
              <div className="dt">{best ? formatDate(best.at) : "SIN MARCA AÚN"}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
