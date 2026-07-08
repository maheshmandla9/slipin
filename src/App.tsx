import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { APP_NAME } from './config/app';
import DisclaimerFooter from './components/shared/DisclaimerFooter';
import { corruptBackup, dismissCorruptBackup, downloadCorruptBackup } from './lib/recovery';
import Home from './pages/Home';
import Builder from './pages/Builder';
import PersonaPage from './pages/PersonaPage';
import Today from './pages/Today';
import Chat from './pages/Chat';
import Evidence from './pages/Evidence';
import Report from './pages/Report';
import Crisis from './pages/Crisis';
import ModuleLanding from './pages/ModuleLanding';

function RecoveryBanner() {
  const [visible, setVisible] = useState(!!corruptBackup);
  if (!visible) return null;
  return (
    <div className="bg-glow/20 px-4 py-2 text-center text-sm text-ink/80">
      Your saved data couldn't be read, so the app started fresh.{' '}
      <button className="font-semibold text-accent underline" onClick={downloadCorruptBackup}>
        Download the backup
      </button>{' '}
      in case it can be recovered.{' '}
      <button
        className="text-ink/50 underline"
        onClick={() => {
          dismissCorruptBackup();
          setVisible(false);
        }}
      >
        dismiss
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-ink/10 bg-white/80 px-4 py-3 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-lg font-extrabold tracking-tight">
            <span className="text-accent">{APP_NAME}</span>
          </Link>
          <div className="flex gap-4 text-sm font-medium text-ink/70">
            <Link to="/today" className="hover:text-accent">Today</Link>
            <Link to="/evidence" className="hover:text-accent">Evidence</Link>
            <Link to="/report" className="hover:text-accent">Report</Link>
            <Link to="/persona" className="hover:text-accent">Persona</Link>
          </div>
        </nav>
      </header>
      <RecoveryBanner />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/build/:moduleId" element={<Builder />} />
        <Route path="/persona" element={<PersonaPage />} />
        <Route path="/today" element={<Today />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/report" element={<Report />} />
        <Route path="/crisis" element={<Crisis />} />
        <Route path="/m/:moduleId" element={<ModuleLanding />} />
      </Routes>

      <DisclaimerFooter />
    </div>
  );
}
