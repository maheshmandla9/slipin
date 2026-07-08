import { Link } from 'react-router-dom';
import { APP_NAME } from '../config/app';
import { MODULES } from '../content';
import { useAppStore } from '../store/appStore';

export default function Home() {
  const personas = useAppStore((s) => s.personas);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Design who you're <span className="text-accent">becoming</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink/70">
          {APP_NAME} lets you build your target personality on a living avatar, feel it in a
          conversation, and practice being it — a few real-world minutes a day.
        </p>
      </section>

      {personas.length > 0 && (
        <section className="mt-8 rounded-xl border border-accent/30 bg-accent-soft/50 p-4 text-center">
          <Link to="/persona" className="font-semibold text-accent underline">
            Continue with your persona →
          </Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold">Pick your path</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Link
              key={m.id}
              to={`/build/${m.id}`}
              className="group rounded-xl border border-ink/10 bg-white p-4 shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <div className="text-3xl">{m.emoji}</div>
              <div className="mt-2 font-semibold group-hover:text-accent">{m.name}</div>
              <p className="mt-1 text-xs text-ink/60">{m.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
