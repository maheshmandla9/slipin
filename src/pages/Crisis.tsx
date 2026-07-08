import { Link } from 'react-router-dom';
import { APP_NAME } from '../config/app';

export default function Crisis() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">You deserve real support</h1>
      <p className="mt-4 text-ink/80">
        {APP_NAME} is a self-development practice tool. It is not therapy, counseling, or crisis
        support, and it can't help with mental-health emergencies. If you're going through
        something serious, please reach out to people trained for exactly that:
      </p>
      <ul className="mt-6 space-y-4">
        <li className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="font-semibold">🌍 International — find a helpline</p>
          <p className="text-sm text-ink/70">
            <a className="underline" href="https://findahelpline.com" target="_blank" rel="noreferrer">findahelpline.com</a>{' '}
            — free, confidential support lines in 130+ countries.
          </p>
        </li>
        <li className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="font-semibold">🇺🇸 United States — 988</p>
          <p className="text-sm text-ink/70">Call or text <strong>988</strong> (Suicide & Crisis Lifeline), 24/7.</p>
        </li>
        <li className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="font-semibold">🇬🇧 UK & ROI — Samaritans</p>
          <p className="text-sm text-ink/70">Call <strong>116 123</strong>, free, 24/7.</p>
        </li>
        <li className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="font-semibold">🇮🇳 India — Tele-MANAS</p>
          <p className="text-sm text-ink/70">Call <strong>14416</strong>, free, 24/7, multiple languages.</p>
        </li>
        <li className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="font-semibold">🚨 Immediate danger</p>
          <p className="text-sm text-ink/70">Contact your local emergency number right away.</p>
        </li>
      </ul>
      <Link to="/" className="mt-8 inline-block text-sm text-accent underline">← Back home</Link>
    </main>
  );
}
