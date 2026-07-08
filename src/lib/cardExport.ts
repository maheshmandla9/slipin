import { APP_NAME } from '../config/app';
import { moduleMeta, traitById } from '../content';
import type { Persona } from '../types';

/** Renders a shareable 1080×1350 persona card to PNG (canvas — no DOM capture dependency). */
export function exportPersonaCard(persona: Persona, streak: number, evidenceCount: number): void {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const meta = moduleMeta(persona.module);

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1c1a2e');
  bg.addColorStop(1, '#3b2d73');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // glow orb
  const orb = ctx.createRadialGradient(W / 2, 380, 40, W / 2, 380, 320);
  orb.addColorStop(0, 'rgba(255,181,71,0.55)');
  orb.addColorStop(1, 'rgba(255,181,71,0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // module emoji
  ctx.font = '160px serif';
  ctx.fillText(meta.emoji, W / 2, 440);

  // "I am becoming"
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '38px Georgia, serif';
  ctx.fillText('I am becoming', W / 2, 560);

  // persona name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 88px Georgia, serif';
  ctx.fillText(persona.name, W / 2, 665);

  // trait chips
  const traits = persona.traitIds.map((id) => traitById(id)?.name).filter((x): x is string => !!x).slice(0, 5);
  ctx.font = '34px system-ui, sans-serif';
  let y = 780;
  for (const t of traits) {
    const w = ctx.measureText(t).width + 60;
    ctx.fillStyle = 'rgba(124,92,255,0.35)';
    roundRect(ctx, W / 2 - w / 2, y - 40, w, 58, 29);
    ctx.fill();
    ctx.fillStyle = '#e8e2ff';
    ctx.fillText(t, W / 2, y);
    y += 82;
  }

  // stats
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '36px system-ui, sans-serif';
  const stats: string[] = [];
  if (streak > 0) stats.push(`🔥 ${streak}-day streak`);
  if (evidenceCount > 0) stats.push(`📜 ${evidenceCount} pieces of proof`);
  if (stats.length) ctx.fillText(stats.join('   ·   '), W / 2, y + 40);

  // footer
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '30px system-ui, sans-serif';
  ctx.fillText(`designed on ${APP_NAME}`, W / 2, H - 70);

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `${persona.name.replaceAll(/[^\w-]+/g, '-').toLowerCase()}-card.png`;
  a.click();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
