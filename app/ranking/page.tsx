"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Team } from "@/lib/types";
import { mockTeams } from "@/lib/mock-data";

export default function RankingPage() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topThree = teams.slice(0, 3);
  const remaining = teams.slice(3);

  return (
    <div className="space-y-8">
      {/* Folio Masthead */}
      <section className="border-b-3 border-[var(--border-black)] pb-4">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
          ACES PVGCOET · DEPARTMENT OF COMPUTER ENGINEERING
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase text-[var(--text-main)] leading-none">
          Campus Engineering Leaderboard
        </h1>
        <p className="font-serif text-sm text-[var(--text-muted)] mt-2 max-w-2xl">
          Technical rankings for engineering pods, research cells, and systems guilds based on
          verified dispatches, peer code audits, and compiler contributions.
        </p>
      </section>

      {/* Podium for Top 3 */}
      <section className="space-y-4">
        <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)]">
          THE PODIUM DIVISIONS (RANKS 1 TO 3)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 flex flex-col justify-between order-2 md:order-1 h-80">
              <div className="flex items-center justify-between font-mono text-xs font-black uppercase">
                <span className="px-2 py-0.5 border border-[var(--border-black)] bg-[var(--bg-muted)] text-[var(--text-main)]">
                  RANK 2 · SILVER
                </span>
              </div>
              <div className="text-center py-4">
                <span className="font-heading text-6xl font-black text-[var(--text-main)] block">
                  #2
                </span>
                <h3 className="font-heading text-2xl font-black uppercase text-[var(--text-main)] mt-1">
                  {topThree[1].name}
                </h3>
              </div>
              <div className="border-t-2 border-[var(--border-black)] pt-3 text-center font-mono text-xs font-black uppercase">
                <span className="text-2xl font-black text-[var(--text-main)]">
                  {topThree[1].points}
                </span>{" "}
                <span className="text-[var(--text-muted)]">POINTS</span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {topThree[0] && (
            <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 flex flex-col justify-between order-1 md:order-2 h-96 relative shadow-[8px_8px_0px_var(--border-black)]">
              <div className="flex items-center justify-between font-mono text-xs font-black uppercase mt-2">
                <span className="px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-canvas)]">
                  RANK 1 · GOLD
                </span>
              </div>
              <div className="text-center py-4">
                <span className="font-heading text-7xl font-black text-[var(--text-main)] block">
                  #1
                </span>
                <h3 className="font-heading text-3xl font-black uppercase text-[var(--text-main)] mt-1">
                  {topThree[0].name}
                </h3>
              </div>
              <div className="border-t-3 border-[var(--border-black)] pt-3 text-center font-mono text-xs font-black uppercase">
                <span className="text-3xl font-black text-[var(--text-main)]">
                  {topThree[0].points}
                </span>{" "}
                <span className="text-[var(--text-muted)]">POINTS</span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 flex flex-col justify-between order-3 md:order-3 h-72">
              <div className="flex items-center justify-between font-mono text-xs font-black uppercase">
                <span className="px-2 py-0.5 border border-[var(--border-black)] bg-[var(--bg-muted)] text-[var(--text-main)]">
                  RANK 3 · BRONZE
                </span>
              </div>
              <div className="text-center py-4">
                <span className="font-heading text-5xl font-black text-[var(--text-main)] block">
                  #3
                </span>
                <h3 className="font-heading text-xl font-black uppercase text-[var(--text-main)] mt-1">
                  {topThree[2].name}
                </h3>
              </div>
              <div className="border-t-2 border-[var(--border-black)] pt-3 text-center font-mono text-xs font-black uppercase">
                <span className="text-xl font-black text-[var(--text-main)]">
                  {topThree[2].points}
                </span>{" "}
                <span className="text-[var(--text-muted)]">POINTS</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ranks 4 to 8 Table */}
      <section className="space-y-4">
        <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)]">
          CAMPUS STANDINGS (RANKS 4 TO {teams.length})
        </div>

        <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs uppercase border-collapse">
            <thead>
              <tr className="border-b-3 border-[var(--border-black)] bg-[var(--bg-muted)]">
                <th className="p-3 w-16 text-center font-black">RANK</th>
                <th className="p-3 font-black">ENGINEERING DIVISION / RESEARCH POD</th>
                <th className="p-3 font-black text-right">TOTAL POINTS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--border-black)]">
              {remaining.map((team) => (
                <tr key={team.id} className="hover:bg-[var(--bg-subtle)]">
                  <td className="p-3 text-center font-heading text-lg font-black text-[var(--text-main)]">
                    #{team.rank}
                  </td>
                  <td className="p-3 font-bold text-[var(--text-main)]">
                    {team.name}
                  </td>
                  <td className="p-3 text-right font-black text-sm text-[var(--text-main)]">
                    {team.points.toLocaleString()} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Scoring Protocol Colophon Box */}
      <div className="border-3 border-dashed border-[var(--border-black)] p-6 bg-[var(--bg-muted)] space-y-2">
        <h4 className="font-heading text-lg font-black uppercase text-[var(--text-main)]">
          ACES Ranking Scoring Protocol
        </h4>
        <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)]">
          Points are awarded for published research dispatches, passing faculty
          peer accreditation, and conducting architectural reviews on student submissions.
        </p>
        <div className="pt-2">
          <Link href="/editor" className="btn-broadsheet text-xs">
            ➔ SUBMIT DISPATCH TO EARN POD POINTS
          </Link>
        </div>
      </div>
    </div>
  );
}
