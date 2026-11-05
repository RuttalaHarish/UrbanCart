import { useAuth } from '../context/AuthContext';

/**
 * AuthGate — Renders a full-screen splash loader while the AuthContext
 * is restoring the session from localStorage (the initial app load).
 *
 * This prevents the brief "flash of blank screen" / redirect loop that
 * happens when ProtectedRoute checks `isAuthenticated` before the token
 * has been read from localStorage.
 */
function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.logoBox}>
          <span style={styles.logo}>
            Urban<span style={styles.logoAccent}>Cart</span>
          </span>
          <div style={styles.spinnerWrap}>
            <div style={styles.spinner} />
          </div>
          <p style={styles.hint}>Loading your store...</p>
        </div>
        <style>{spinnerKeyframes}</style>
      </div>
    );
  }

  return children;
}

const spinnerKeyframes = `
@keyframes authgate-spin {
  to { transform: rotate(360deg); }
}
`;

const styles = {
  wrapper: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    zIndex: 9999,
  },
  logoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#1e293b',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  logoAccent: {
    color: '#2563eb',
  },
  spinnerWrap: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid rgba(37, 99, 235, 0.15)',
    borderTopColor: '#2563eb',
    animation: 'authgate-spin 0.8s linear infinite',
  },
  hint: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
};

export default AuthGate;

