import { Link, Route, Routes } from 'react-router-dom';
import { APP_NAME } from './config/app';
import DisclaimerFooter from './components/shared/DisclaimerFooter';
import Home from './pages/Home';
import Builder from './pages/Builder';
import PersonaPage from './pages/PersonaPage';
import Crisis from './pages/Crisis';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-ink/10 bg-white/80 px-4 py-3 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-lg font-extrabold tracking-tight">
            <span className="text-accent">{APP_NAME}</span>
          </Link>
          <div className="flex gap-4 text-sm font-medium text-ink/70">
            <Link to="/persona" className="hover:text-accent">My persona</Link>
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/build/:moduleId" element={<Builder />} />
        <Route path="/persona" element={<PersonaPage />} />
        <Route path="/crisis" element={<Crisis />} />
      </Routes>

      <DisclaimerFooter />
    </div>
  );
}
