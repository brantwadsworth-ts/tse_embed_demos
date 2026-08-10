// Gloriously over-the-top trial / upgrade prompt shown once (on the 3rd
// Salesloft AI question). Urgency banner + live countdown, a giant PAY NOW,
// fake social proof, and a joke disclaimer. Themed to the app; the payment CTA
// is a clearly clickable button.
import { useEffect, useState } from 'react';
import { X, CreditCard, Rocket, Clock, Star } from 'lucide-react';
import { SALESLOFT_UPGRADE_URL, SALESLOFT_TRIAL_QUESTIONS } from '../config';

interface Props {
  open: boolean;
  remaining: number;
  onClose: () => void;
}

const pad = (n: number) => (n < 10 ? '0' : '') + n;

export default function TrialModal({ open, remaining, onClose }: Props) {
  const [left, setLeft] = useState('6d 23:59:59');

  // Live (and, let's be honest, entirely fake) 7-day urgency countdown.
  useEffect(() => {
    if (!open) return;
    const end = Date.now() + 7 * 24 * 3600 * 1000 - 1000;
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      setLeft(`${d}d ${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const askedSoFar = Math.max(3, SALESLOFT_TRIAL_QUESTIONS - remaining);

  return (
    <div className="sl-trial-overlay" onClick={onClose}>
      <div className="sl-trial-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="sl-trial-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="sl-trial-urgency">
          <Clock size={14} />
          <span>Offer expires in</span>
          <span className="sl-trial-count">{left}</span>
        </div>

        <div className="sl-trial-body">
          <div className="sl-trial-icon">
            <Rocket size={28} />
          </div>
          <div className="sl-trial-eyebrow">A personal message from Salesloft AI</div>
          <h2 className="sl-trial-title">
            You&rsquo;ve asked {askedSoFar} questions. Frankly, that&rsquo;s PhD-level curiosity. &#127891;
          </h2>
          <p className="sl-trial-pitch">
            Look &mdash; we weren&rsquo;t going to say anything, but you are{' '}
            <b>clearly too powerful</b> for a free trial. Unlock <b>UNLIMITED</b> galaxy-brained
            answers before your genius goes to waste and your competitors out-dial you in their
            sleep. &#128564;&#128201;
          </p>

          <div className="sl-trial-price">
            <span className="sl-trial-was">$4,999/mo</span>
            <span className="sl-trial-now">today: a suspiciously reasonable amount</span>
          </div>
          <div className="sl-trial-pricenote">
            A price this good should honestly be illegal (it&rsquo;s not &mdash; we checked).
          </div>

          <a className="sl-trial-cta" href={SALESLOFT_UPGRADE_URL} target="_blank" rel="noopener noreferrer">
            <CreditCard size={20} /> Pay now
          </a>
          <p className="sl-trial-ctasub">one click &middot; instant genius &middot; zero regrets (probably)</p>
          <button className="sl-trial-dismiss" onClick={onClose}>
            no thanks, i enjoy having limits
          </button>

          <div className="sl-trial-social">
            <span>&#128293; 12 reps eyeing this deal</span>
            <span className="sl-trial-stars">
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
            </span>
            <span>4.9 from people who caved</span>
          </div>
          <p className="sl-trial-fine">
            *Countdown is 100% real.* (*it is not). This is a demo &mdash; no card will be charged,
            no genius guaranteed. Possible side effects: closing more deals, mild smugness, and an
            inexplicable urge to say &ldquo;let&rsquo;s circle back.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
