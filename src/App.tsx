import { useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import TopBar, { TabId } from './components/TopBar';
import ChatBot from './components/ChatBot';
import MyAnalytics from './tabs/MyAnalytics';
import Analytics from './tabs/Analytics';
import Cadences from './tabs/Cadences';
import Signals from './tabs/Signals';
import AskSalesloft from './tabs/AskSalesloft';
import {
  WORKSHEET_ID,
  CADENCE_WORKSHEET_ID,
  CHATBOT_WELCOME,
  CHATBOT_CADENCES_WELCOME,
} from './config';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<TabId>('analytics');

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <TopBar active={tab} onChange={setTab} />
      <main className="app-main">
        {tab === 'my-analytics' && <MyAnalytics />}
        {tab === 'analytics' && <Analytics />}
        {tab === 'cadences' && <Cadences />}
        {tab === 'signals' && <Signals />}
        {tab === 'ask' && <AskSalesloft />}
      </main>
      <ChatBot
        worksheetId={tab === 'cadences' ? CADENCE_WORKSHEET_ID : WORKSHEET_ID}
        greeting={tab === 'cadences' ? CHATBOT_CADENCES_WELCOME : CHATBOT_WELCOME}
      />
      <VercelAnalytics />
    </div>
  );
}
