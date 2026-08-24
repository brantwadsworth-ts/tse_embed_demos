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
    } catch {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dphhs-login-page">
      {/* Left panel — navy brand */}
      <div className="dphhs-login-left">
        <img
          src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg"
          alt="Montana DPHHS"
          className="dphhs-login-logo"
        />
        <div className="dphhs-login-brand">
          <p className="dphhs-login-state">STATE OF MONTANA</p>
          <h1 className="dphhs-login-dept">Department of Public Health &amp; Human Services</h1>
          <p className="dphhs-login-portal">MIDIS Disease Surveillance Portal</p>
        </div>
        <div className="dphhs-login-tagline">
          <p>Secure access to reconciliation data, completeness metrics, and AI-powered disease surveillance insights.</p>
        </div>
      </div>

      {/* Right panel — sign-in form */}
      <div className="dphhs-login-right">
        <div className="dphhs-login-card">
          <div className="dphhs-login-card-header">
            <img
              src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg"
              alt=""
              className="dphhs-login-card-logo"
            />
            <h2 className="dphhs-login-card-title">Sign in</h2>
            <p className="dphhs-login-card-sub">Enter your MIDIS credentials to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label htmlFor="username" className="login-label">Username</label>
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
              <label htmlFor="password" className="login-label">Password</label>
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
              className="dphhs-login-submit"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? <span className="login-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="dphhs-login-footer">Powered by ThoughtSpot</p>
        </div>
      </div>
    </div>
  );
}
