import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { traitById } from '../content';
import { buildPlan, currentWeek, todaysMissions } from '../engine/planEngine';
import { computeStreak } from '../engine/streaks';
import { newId, todayStr, useActivePersona, useAppStore, usePlanFor, useTodayLog } from '../store/appStore';
import { polishPlan } from '../lib/api';
import { track } from '../lib/analytics';
import type { DailyLog } from '../types';

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children?: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${done ? 'border-accent/40 bg-accent-soft/40' : 'border-ink/10 bg-white'}`}
    >
      <h2 className="flex items-center gap-2 font-semibold">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-accent text-white' : 'bg-ink/10 text-ink/60'}`}>
          {done ? '✓' : n}
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export default function Today() {
  const persona = useActivePersona();
  const plan = usePlanFor(persona?.id);
  const log = useTodayLog(persona?.id);
  const { addPlan, upsertLog, setStreak, logs, streak, addEvidence } = useAppStore();

  // Deterministic + offline: auto-generate the template plan when missing.
  useEffect(() => {
    if (persona && !plan) {
      addPlan(buildPlan(persona));
      track('plan_generated', { module: persona.module });
    }
  }, [persona, plan, addPlan]);

  const [score, setScore] = useState(7);
  const [win, setWin] = useState('');
  const [slip, setSlip] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [polishNote, setPolishNote] = useState<string | null>(null);

  const doPolish = async () => {
    if (!persona || !plan || polishing) return;
    setPolishing(true);
    setPolishNote(null);
    const res = await polishPlan(persona, plan);
    setPolishing(false);
    if (!res.ok || !res.weeks) {
      setPolishNote(res.message ?? 'Polish unavailable — template plan kept.');
      if (res.errorCode === 'llm_error') track('llm_error', { fn: 'plan' });
      return;
    }
    track('plan_polished', { module: persona.module });
    addPlan({
      ...plan,
      polished: true,
      weeks: plan.weeks.map((w, i) => ({
        ...w,
        wearScript: res.weeks![i].wearScript,
        missions: w.missions.map((m, j) => ({ ...m, text: res.weeks![i].missions[j].text })),
      })),
    });
    setPolishNote(`✨ Rewritten in ${persona.name}'s voice.`);
  };

  const emptyLog = (): DailyLog => ({
    date: todayStr(),
    personaId: persona?.id ?? '',
    intentDone: false,
    wearDone: false,
    missionsDone: [],
  });
  const baseLog: DailyLog = useMemo(() => log ?? emptyLog(), [log, persona?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Always patch on top of the CURRENT stored log (not a render-time snapshot),
  // so rapid successive writes never overwrite each other.
  const currentLog = (): DailyLog =>
    useAppStore.getState().logs.find((l) => l.date === todayStr() && l.personaId === persona?.id) ??
    emptyLog();

  if (!persona) {
    return (
      <main className="p-10 text-center">
        <p className="text-ink/60">Create a persona first.</p>
        <Link to="/" className="mt-2 inline-block text-accent underline">Start →</Link>
      </main>
    );
  }
  if (!plan) return <main className="p-10 text-center text-ink/50">Building your plan…</main>;

  const { week, weekIdx } = currentWeek(plan);
  const focus = traitById(week.focusTraitId);
  const missions = todaysMissions(plan);
  const debriefed = !!baseLog.debrief;

  const save = (patch: Partial<DailyLog>) => upsertLog({ ...currentLog(), ...patch });

  const toggleMission = (id: string) => {
    const cur = currentLog();
    const done = cur.missionsDone.includes(id);
    if (!done) track('mission_done');
    upsertLog({
      ...cur,
      missionsDone: done ? cur.missionsDone.filter((x) => x !== id) : [...cur.missionsDone, id],
    });
  };

  const submitDebrief = () => {
    const finished: DailyLog = { ...currentLog(), debrief: { score, win: win.trim(), slip: slip.trim() } };
    upsertLog(finished);
    setStreak(computeStreak([...logs.filter((l) => !(l.date === finished.date && l.personaId === finished.personaId)), finished]));
    if (win.trim()) {
      addEvidence({ id: newId(), date: todayStr(), personaId: persona.id, text: win.trim() });
    }
    track('debrief_done', { score });
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-bold">Today as {persona.name}</h1>
          <p className="text-sm text-ink/60">
            Week {weekIdx + 1}: {plan.weeks.length > weekIdx ? '' : ''}{focus?.name} · {streak > 0 ? `🔥 ${streak}-day streak` : 'start your streak today'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!plan.polished && (
            <button
              onClick={() => void doPolish()}
              disabled={polishing}
              className="rounded-lg border border-accent/40 px-3 py-1 text-xs font-medium text-accent hover:bg-accent-soft disabled:opacity-50"
              title="Rewrite missions & scripts in your persona's voice (3/day)"
            >
              {polishing ? 'Polishing…' : '✨ Polish wording'}
            </button>
          )}
          <Link to="/persona" className="text-sm text-ink/50 underline">persona</Link>
        </div>
      </div>
      {polishNote && <p className="mt-2 rounded-lg bg-accent-soft/60 px-3 py-1.5 text-xs text-ink/70">{polishNote}</p>}

      <div className="mt-5 space-y-4">
        {/* 1 — Morning intent */}
        <Step n={1} title="Who do I want to be today?" done={baseLog.intentDone}>
          {!baseLog.intentDone ? (
            <div className="mt-3">
              <blockquote className="border-l-4 border-accent pl-3 text-sm italic text-ink/80">
                “{persona.identityScript}”
              </blockquote>
              <button
                onClick={() => save({ intentDone: true })}
                className="mt-3 rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-accent/85"
              >
                Today, I am {persona.name}
              </button>
            </div>
          ) : (
            <p className="mt-1 pl-8 text-sm text-ink/60">Intent set. This week's focus: <strong>{focus?.name}</strong>.</p>
          )}
        </Step>

        {/* 2 — Wear session */}
        <Step n={2} title="Wear session (3–5 min)" done={baseLog.wearDone}>
          {baseLog.intentDone && !baseLog.wearDone && (
            <div className="mt-3">
              <pre className="whitespace-pre-wrap rounded-lg bg-paper p-3 font-sans text-sm leading-relaxed text-ink/85">{week.wearScript}</pre>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-accent">Today's if-then armor ({week.ifThens.length})</summary>
                <ul className="mt-2 space-y-1 text-ink/75">
                  {week.ifThens.map((it, i) => (
                    <li key={i} className="rounded bg-paper p-2">
                      <strong>IF</strong> {it.trigger}, <strong>THEN</strong> {it.response}.
                    </li>
                  ))}
                </ul>
              </details>
              <button
                onClick={() => {
                  save({ wearDone: true });
                  track('wear_session_done');
                }}
                className="mt-3 rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-accent/85"
              >
                It's on — I'm wearing it
              </button>
            </div>
          )}
          {baseLog.wearDone && <p className="mt-1 pl-8 text-sm text-ink/60">Worn. Carry the gesture: {persona.gesture.toLowerCase()}.</p>}
        </Step>

        {/* 3 — Missions */}
        <Step n={3} title="Micro-missions (out in the real world)" done={missions.every((m) => baseLog.missionsDone.includes(m.id))}>
          {baseLog.wearDone && (
            <ul className="mt-3 space-y-2">
              {missions.map((m) => {
                const done = baseLog.missionsDone.includes(m.id);
                return (
                  <li key={m.id}>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${done ? 'border-accent/40 bg-accent-soft/50' : 'border-ink/10'}`}>
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleMission(m.id)}
                        className="mt-0.5 accent-accent"
                      />
                      <span className={done ? 'line-through opacity-60' : ''}>
                        {m.text} <span className="text-xs text-ink/40">· {'▲'.repeat(m.difficulty)}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </Step>

        {/* 4 — Evening debrief */}
        <Step n={4} title="Evening debrief" done={debriefed}>
          {baseLog.wearDone && !debriefed && (
            <div className="mt-3 space-y-3 text-sm">
              <label className="block">
                How in-character were you today? <strong className="text-accent">{score}/10</strong>
                <input type="range" min={1} max={10} value={score} onChange={(e) => setScore(Number(e.target.value))} className="mt-1 w-full accent-accent" />
              </label>
              <label className="block">
                One win as {persona.name} <span className="text-ink/40">(goes into your evidence log)</span>
                <input value={win} onChange={(e) => setWin(e.target.value)} maxLength={200} className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2" placeholder="e.g. Spoke up in the meeting without rehearsing it twice" />
              </label>
              <label className="block">
                One slip into the old pattern <span className="text-ink/40">(data, not judgment)</span>
                <input value={slip} onChange={(e) => setSlip(e.target.value)} maxLength={200} className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2" placeholder="e.g. Went quiet when Alex pushed back" />
              </label>
              <button onClick={submitDebrief} className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-accent/85">
                Close the day
              </button>
            </div>
          )}
          {debriefed && (
            <p className="mt-1 pl-8 text-sm text-ink/60">
              Day closed at {baseLog.debrief!.score}/10. 🔥 Streak: {streak}. See you tomorrow — week {weekIdx + 1} keeps working on {focus?.name}.
            </p>
          )}
        </Step>
      </div>
    </main>
  );
}
