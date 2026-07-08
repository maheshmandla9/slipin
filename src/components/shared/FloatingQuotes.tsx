import { motion } from 'framer-motion';
import { quotesForPage } from '../../content';
import type { Quote } from '../../types';

// Testimonial-style quotes floating in the margins beside the centered page
// content. Purely decorative (aria-hidden, pointer-events-none) and only shown
// where there's room for them (xl+ viewports) — content itself never shifts.
// To add more: append entries to src/content/quotes.json with the target
// page key(s) in `pages`; no code changes needed for new quotes, only for new
// pages (call <FloatingQuotes page="..."/> once on that page).

const card = (q: Quote, i: number, side: 'left' | 'right') => (
  <motion.blockquote
    key={q.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: [0, -10, 0] }}
    transition={{
      opacity: { duration: 0.6, delay: i * 0.15 },
      y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 },
    }}
    className={`max-w-[220px] rounded-2xl border border-accent/20 bg-white/80 p-4 text-sm italic text-ink/70 shadow-sm backdrop-blur-sm ${
      side === 'left' ? '-rotate-2' : 'rotate-2'
    }`}
  >
    “{q.text}”
    {q.author && <footer className="mt-1.5 text-xs not-italic text-ink/40">— {q.author}</footer>}
  </motion.blockquote>
);

export default function FloatingQuotes({ page }: { page: string }) {
  const quotes = quotesForPage(page);
  if (!quotes.length) return null;

  const left: Quote[] = [];
  const right: Quote[] = [];
  quotes.forEach((q, i) => ((q.side ?? (i % 2 === 0 ? 'left' : 'right')) === 'left' ? left : right).push(q));

  return (
    <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
      <div className="absolute left-6 top-40 flex flex-col gap-6">{left.map((q, i) => card(q, i, 'left'))}</div>
      <div className="absolute right-6 top-40 flex flex-col gap-6">{right.map((q, i) => card(q, i, 'right'))}</div>
    </div>
  );
}
