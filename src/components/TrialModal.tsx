// Pervasive trial / upgrade prompt shown as a centered modal after the user's
// second Salesloft AI question. The payment CTA is a clearly clickable button.
import { X, CreditCard, Sparkles } from 'lucide-react';
import { SALESLOFT_UPGRADE_URL } from '../config';

interface Props {
  open: boolean;
  remaining: number;
  onClose: () => void;
}

export default function TrialModal({ open, remaining, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="sl-trial-overlay" onClick={onClose}>
      <div className="sl-trial-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="sl-trial-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="sl-trial-icon">
          <Sparkles size={26} />
        </div>
        <h2 className="sl-trial-title">You're on the Salesloft AI trial</h2>
        <p className="sl-trial-sub">
          You have <strong>{remaining} question{remaining === 1 ? '' : 's'}</strong> left in your
          trial. Upgrade now to keep asking Salesloft AI unlimited questions across your data.
        </p>
        <a
          className="sl-trial-cta"
          href={SALESLOFT_UPGRADE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CreditCard size={18} /> Add payment method &amp; upgrade
        </a>
        <button className="sl-trial-dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
