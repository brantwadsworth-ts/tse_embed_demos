import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { X, Wand2 } from 'lucide-react';
import { WORKSHEET_ID, SPOTTER_EMBED_FLAGS } from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';

// Cast to allow the extra spotter flags from salesloft_fin.json that aren't in
// the published prop types (updatedSpotterChatPrompt, spotterSidebarConfig).
const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SpotterModal({ open, onClose }: Props) {
  const { theme } = useTheme();
  if (!open) return null;
  return (
    <div className="spotter-modal-overlay" onClick={onClose}>
      <div className="spotter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="spotter-modal-header">
          <div className="spotter-modal-title">
            <Wand2 size={18} />
            <span>Salesloft AI</span>
          </div>
          <button className="spotter-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="spotter-modal-body">
          <Spotter
            key={theme}
            worksheetId={WORKSHEET_ID}
            frameParams={{ width: '100%', height: '100%' }}
            customizations={tsCustomizations(theme, true)}
            {...SPOTTER_EMBED_FLAGS}
          />
        </div>
      </div>
    </div>
  );
}
