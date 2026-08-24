import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import AcrReport from './tabs/AcrReport';

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-main">
        <AcrReport />
      </main>
      <Footer />
      <VercelAnalytics />
    </div>
  );
}
