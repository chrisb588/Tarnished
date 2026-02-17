import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

import './App.css'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

export default function App() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [claims, setClaims] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const hasTokenHash = params.get("token_hash");

  const [verifying, setVerifying] = useState(!!hasTokenHash);
    const [authError, setAuthError] = useState(null);
    const [authSuccess, setAuthSuccess] = useState(false);
    useEffect(() => {
        // Check if we have token_hash in URL (magic link callback)
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");
        const type = params.get("type");
        if (token_hash) {
            // Verify the OTP token
            supabase.auth.verifyOtp({
                token_hash,
                type: type || "email",
            }).then(({ error }) => {
                if (error) {
                    setAuthError(error.message);
                } else {
                    setAuthSuccess(true);
                    // Clear URL params
                    window.history.replaceState({}, document.title, "/");
                }
                setVerifying(false);
            });
        }
        // Check for existing session using getClaims
        supabase.auth.getClaims().then(({ data: { claims } }) => {
            setClaims(claims);
        });
        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            supabase.auth.getClaims().then(({ data: { claims } }) => {
                setClaims(claims);
            });
        });
        return () => subscription.unsubscribe();
    }, []);
    const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (isSignUp && !data.session) {
        alert("Check your email for a confirmation link!");
      } 
    }
    setLoading(false);
  };
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setClaims(null);
    };
    // Show verification state
    if (verifying) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>Confirming your magic link...</p>
                <p>Loading...</p>
            </div>
        );
    }
    // Show auth error
    if (authError) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>✗ Authentication failed</p>
                <p>{authError}</p>
                <button
                    onClick={() => {
                        setAuthError(null);
                        window.history.replaceState({}, document.title, "/");
                    }}
                >
                    Return to login
                </button>
            </div>
        );
    }
    // Show auth success (briefly before claims load)
    if (authSuccess && !claims) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>✓ Authentication successful!</p>
                <p>Loading your account...</p>
            </div>
        );
    }
    // If user is logged in, show welcome screen
    if (claims) {
        return (
            <div>
                <h1>Welcome!</h1>
                <p>You are logged in as: {claims.email}</p>
                <button onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        );
    }
    // Show login form
    return (
      <div>
          <h1>{isSignUp ? "Create Account" : "Sign In"}</h1>
          <p>
              {isSignUp 
                  ? "Enter an email and password to get started." 
                  : "Enter your credentials to access your account."}
          </p>

          <form onSubmit={handleSubmit}>
              <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
              />
              <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
              />
              
              <button disabled={loading}>
                  {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
              </button>
          </form>

          <hr />
          
          <p>{isSignUp ? "Already have an account?" : "Don't have an account?"}</p>
          <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)} 
              style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
          >
              {isSignUp ? "Switch to Log In" : "Switch to Sign Up"}
          </button>
      </div>
  );
}