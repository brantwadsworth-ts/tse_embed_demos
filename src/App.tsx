import { useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import TopBar, { TabId } from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';
import SpendAnalytics from './tabs/SpendAnalytics';
import AskMerlin from './tabs/AskMerlin';
import MyReports from './tabs/MyReports';
import { WORKSHEET_ID, CHATBOT_WELCOME } from './config';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<TabId>('analytics');

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <Sidebar active={tab} onChange={setTab} />
      <div className="app-body">
        <TopBar />
        <main className="app-main">
          {tab === 'analytics' && <SpendAnalytics />}
          {tab === 'ask' && <AskMerlin />}
          {tab === 'my-reports' && <MyReports />}
        </main>
      </div>
      <ChatBot
        worksheetId={WORKSHEET_ID}
        greeting={CHATBOT_WELCOME}
      />
      <VercelAnalytics />
    </div>
  );
}
