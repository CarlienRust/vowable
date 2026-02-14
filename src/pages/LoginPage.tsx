import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Footer } from '../components/ui/Footer';
import { theme } from '../styles/theme';
import newspaperBg from '../assets/backgrounds/newspaper.png';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authService.signUp(email, password, fullName);
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        // After signup, user is automatically signed in
        navigate(from, { replace: true });
      } else {
        const { error } = await authService.signIn(email, password);
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        backgroundImage: `linear-gradient(rgba(250,250,250,0.9), rgba(250,250,250,0.9)), url(${newspaperBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
        }}
      >
        <Card style={{ maxWidth: '400px', width: '100%' }}>
        <h1
          style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.lg,
            textAlign: 'center',
            color: theme.colors.text.primary,
          }}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h1>

        {error && (
          <div
            style={{
              padding: theme.spacing.md,
              backgroundColor: '#FFEBEE',
              color: theme.colors.error,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.md,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ marginBottom: theme.spacing.md }}
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginBottom: theme.spacing.md }}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginBottom: theme.spacing.md }}
          />
          <Button
            type="submit"
            size="lg"
            style={{ width: '100%', marginBottom: theme.spacing.md }}
            disabled={loading}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.accent.primary,
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              textDecoration: 'underline',
            }}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </Card>
      </div>
      <Footer />
    </div>
  );
};
