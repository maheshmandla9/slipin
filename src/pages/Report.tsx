import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { track } from '../lib/analytics';
import { exportPersonaCard } from '../lib/cardExport';
import { exportData, importData } from '../lib/exportImport';
import { useActivePersona, useAppStore } from '../store/appStore';

/** 30-day "then vs now" report — proof of change, and the shareable moment (PRD F7/F10). */
export default function Report() {
  const persona = useActivePersona();
  const { logs, evidence, streak } = useAppStore();
  const [importNote, setImportNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (persona) track('report_viewed');
  }, [persona]);

  if (!persona) {
    return (
      <main className="p-10 text-center">
        <p className="text-ink/60">Create a persona first.</p>
        <Link to="/" className="mt-2 inline-block text-accent underline">Start →</Link>
      </main>
    );
  }

  const mine = logs.filter((l) => l.personaId === persona.id && l.debrief).sort((a, b) => a.date.localeCompare(b.date));
  const myEvidence = evidence.filter((e) => e.personaId === persona.id).sort((a, b) => a.date.localeCompare(b.date));
  const missionsDone = logs.filter((l) => l.personaId === persona.id).reduce((n, l) => n + l.missionsDone.length, 0);
  const wearSessions = logs.filter((l) => l.personaId === persona.id && l.wearDone).length;

  const firstWeek = mine.slice(0, 7);
  const lastWeek = mine.slice(-7);
  const avg = (xs: typeof mine) => (xs.length ? xs.reduce((n, l) => n + l.debrief!.score, 0) / xs.length : 0);
  const thenScore = avg(firstWeek);
  const nowScore = avg(lastWeek);
  const delta = nowScore - thenScore;

  const daysSinceStart = Math.floor((Date.now() - new Date(persona.createdAt).getTime()) / 86400000);
  const enough = mine.length >= 2;

  const share = () => {
    exportPersonaCard(persona, streak, myEvidence.length);
    track('card_shared');
  };

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-ink/10 bg-white p-4 text-center">
      <div className="text-2xl font-extrabold text-accent">{value}</div>
      <div className="mt-1 text-xs text-ink/60">{label}</div>
    </div>
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold">Then vs now — {persona.name}</h1>
      <p className="text-sm text-ink/60">Day {Math.max(1, daysSinceStart + 1)} of the transformation{daysSinceStart < 29 ? ` · full report unlocks over 30 days` : ''}</p>

      {!enough ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink/60">
          Close at least two days with an evening debrief and your trend appears here. Today counts —{' '}
          <Link className="text-accent underline" to="/today">go live one</Link>.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="in-character (first week)" value={thenScore.toFixed(1)} />
            <Stat label="in-character (latest week)" value={nowScore.toFixed(1)} />
            <Stat label="wear sessions" value={String(wearSessions)} />
            <Stat label="missions done" value={String(missionsDone)} />
          </div>
          <p className="mt-3 rounded-xl bg-accent-soft/60 p-3 text-center text-sm">
            {delta > 0.4
              ? `📈 You're showing up ${delta.toFixed(1)} points more in character than when you started. That's not a mood — that's a pattern.`
              : delta < -0.4
                ? `The scores dipped — that usually means the missions got harder, not that you did worse. Keep the streak.`
                : `Holding steady. Consistency is the transformation — the scores follow.`}
          </p>

          {/* score trend bars */}
          <div className="mt-5 flex h-24 items-end gap-1 rounded-xl border border-ink/10 bg-white p-3" aria-label="Debrief scores over time">
            {mine.slice(-30).map((l) => (
              <div
                key={l.date}
                title={`${l.date}: ${l.debrief!.score}/10`}
                className="flex-1 rounded-t bg-accent/70"
                style={{ height: `${l.debrief!.score * 10}%` }}
              />
            ))}
          </div>
        </>
      )}

      {myEvidence.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">Proof highlights</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="rounded-lg border border-ink/10 bg-white p-3">
              <span className="text-xs text-ink/40">first · {myEvidence[0].date}</span>
              <p>{myEvidence[0].text}</p>
            </li>
            {myEvidence.length > 1 && (
              <li className="rounded-lg border border-glow/50 bg-glow/10 p-3">
                <span className="text-xs text-ink/40">latest · {myEvidence[myEvidence.length - 1].date}</span>
                <p>{myEvidence[myEvidence.length - 1].text}</p>
              </li>
            )}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <button onClick={share} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/85">
          🖼️ Share persona card
        </button>
        <button onClick={exportData} className="rounded-lg border border-ink/20 px-4 py-2.5 text-sm hover:border-accent">
          ⬇️ Export my data
        </button>
        <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-ink/20 px-4 py-2.5 text-sm hover:border-accent">
          ⬆️ Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setImportNote((await importData(f)).message);
            e.target.value = '';
          }}
        />
      </div>
      {importNote && <p className="mt-2 text-sm text-ink/60">{importNote}</p>}
      <p className="mt-2 text-xs text-ink/40">Your data lives only in this browser — export it to move or back it up.</p>
    </main>
  );
}
