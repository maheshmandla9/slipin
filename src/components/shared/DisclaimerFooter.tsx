import { Link } from 'react-router-dom';
import { APP_NAME } from '../../config/app';

export default function DisclaimerFooter() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-paper px-4 py-3 text-center text-xs text-ink/60">
      <p>
        {APP_NAME} is a self-development practice tool — not therapy, medical care, or a substitute
        for professional support.{' '}
        <Link to="/crisis" className="underline hover:text-accent">
          If you're struggling, find real help here
        </Link>
        .
      </p>
    </footer>
  );
}
