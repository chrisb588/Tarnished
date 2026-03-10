import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import CreateListing from './pages/CreateListing/CreateListing';
import ChangePassword from './pages/ChangePassword/ChangePassword';

import './App.css'

export default function App() {

    const [isAuthOpen, setIsAuthOpen] = useState(false)
    const [claims, setClaims] = useState(null);
    const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

    const params = new URLSearchParams(window.location.search);
    const hasTokenHash = params.get("token_hash");

    const [verifying, setVerifying] = useState(!!hasTokenHash);
    const [authError, setAuthError] = useState(null);
    const [authSuccess, setAuthSuccess] = useState(false);

    const checkPasswordFlag = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata?.password_changed === false) {
            setNeedsPasswordChange(true);
        } else {
            setNeedsPasswordChange(false);
        }
    };

    useEffect(() => {
        if (!supabase) return; // Skip auth if Supabase not configured
        
        // Check if we have token_hash in URL (magic link callback)
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");
        const type = params.get("type");
        if (token_hash) {
            supabase.auth.verifyOtp({
                token_hash,
                type: type || "email",
            }).then(({ error }) => {
                if (error) {
                    setAuthError(error.message);
                } else {
                    setAuthSuccess(true);
                    window.history.replaceState({}, document.title, "/");
                }
                setVerifying(false);
            });
        }

        supabase.auth.getClaims().then(({ data: { claims } }) => {
            setClaims(claims);
            if (claims) checkPasswordFlag();
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            supabase.auth.getClaims().then(({ data: { claims } }) => {
                setClaims(claims);
                if (claims) {
                    setIsAuthOpen(false);
                    checkPasswordFlag();
                } else {
                    setNeedsPasswordChange(false);
                }
            });
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setClaims(null);
        setNeedsPasswordChange(false);
    };

    if (verifying) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>Confirming your magic link...</p>
                <p>Loading...</p>
            </div>
        );
    }
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
    if (authSuccess && !claims) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>✓ Authentication successful!</p>
                <p>Loading your account...</p>
            </div>
        );
    }
    if (claims && needsPasswordChange) {
        return <ChangePassword />;
    }
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

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateListing />} />
            </Routes>
        </BrowserRouter>
    );
}
