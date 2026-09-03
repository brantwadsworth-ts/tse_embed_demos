import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('TS_AUTH_SECRET_KEARNEY')) {
        setError('Server configuration error — the ThoughtSpot secret key is not set in Vercel environment variables.');
      } else if (msg.includes('401') || msg.includes('Invalid credentials')) {
        setError('Invalid username or password. Check your ThoughtSpot credentials.');
      } else {
        setError(msg || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-name">Kearney</span>
          <span className="login-brand-product">SpendPro</span>
        </div>
        <div className="login-hero-content">
          <h1 className="login-hero-title">
            Smarter spend.<br />Faster decisions.
          </h1>
          <p className="login-hero-subtitle">
            Procurement analytics, supplier insights, and AI-powered answers —
            all in one place, powered by ThoughtSpot.
          </p>
          <div className="login-stats">
            <div className="login-stat">
              <span className="login-stat-value">90k+</span>
              <span className="login-stat-label">Transactions</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">4</span>
              <span className="login-stat-label">Category Levels</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">AI</span>
              <span className="login-stat-label">Powered by Merlin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Sign in</h2>
            <p className="login-card-subtitle">
              Enter your ThoughtSpot credentials to continue
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="login-input"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="login-input login-input-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? <span className="login-spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <span>Powered by</span>
            <span className="login-ts-badge">ThoughtSpot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
