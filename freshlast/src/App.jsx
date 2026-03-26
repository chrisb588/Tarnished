import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import OfferList from './pages/OfferList/OfferList';
import Home from './pages/Home/Home';
import CreateListing from './pages/CreateListing/CreateListing';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import EditProfile from './pages/EditProfile/EditProfile';
import CreateProfile from './pages/CreateProfile/CreateProfile';

import "./App.css";


export default function App() {
    const [session, setSession] = useState(undefined);
    const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [authError, setAuthError] = useState(null);

    const checkPasswordFlag = (user) => {
        if (user?.user_metadata?.password_changed === false) {
            setNeedsPasswordChange(true);
        } else {
          setNeedsPasswordChange(false);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, []);
<<<<<<< HEAD

    const checkProfileComplete = async (user) => {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('stall_name, market_location, phone_number')
            .eq('id', user.id)
            .single();

        const isComplete = !!(data?.stall_name && data?.market_location && data?.phone_number);
        setProfileComplete(isComplete);
    };

    useEffect(() => {
        if (!supabase) {
            setSession(null);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");
        const type = params.get("type");

        if (token_hash) {
            setVerifying(true);
            supabase.auth.verifyOtp({ token_hash, type: type || "email" })
                .then(({ error }) => {
                    if (error) setAuthError(error.message);
                    else window.history.replaceState({}, document.title, "/");
                })
                .finally(() => setVerifying(false));
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session ?? null);
            if (session?.user) {
                checkPasswordFlag(session.user);
                checkProfileComplete(session.user);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session ?? null);
            if (session?.user) {
                checkPasswordFlag(session.user);
                checkProfileComplete(session.user);
            } else {
                setNeedsPasswordChange(false);
                setProfileComplete(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setNeedsPasswordChange(false);
        setProfileComplete(false);
    };

    if (session === undefined || verifying) {
        return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (authError) {
        return (
            <div>
                <p>Authentication failed: {authError}</p>
                <button onClick={() => { setAuthError(null); window.history.replaceState({}, document.title, "/"); }}>
                    Return
                </button>
            </div>
        );
=======

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
>>>>>>> brillos-image-upload-on-listings
    }
    setClaims(null);
    setNeedsPasswordChange(false);
  };
<<<<<<< HEAD

    if (session && needsPasswordChange) {
        return <ChangePassword />;
    }

    const isLoggedIn = !!session;

    
    /* //TEMP - remove when done testing
    return (
        <BrowserRouter>
            <EditProfile onSave={() => {}} onLogout={() => {}} />
        </BrowserRouter>
    );
    */
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateListing />} />
                <Route path="/edit/:id" element={<CreateListing />} />
                <Route path="/changePass" element={<ChangePassword />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/createProfile" element={<CreateProfile />} />
                {/* PUBLIC */}
                <Route path="/" element={<OfferList />} />

                {/* VENDOR DASHBOARD */}
                <Route
                    path="/dashboard"
                    element={
                        !isLoggedIn
                            ? <Navigate to="/" replace />
                            : !profileComplete
                                ? <Navigate to="/profile" replace />
                                : <Home onLogout={handleLogout} />
                    }
                />

                {/* EDIT PROFILE */}
                <Route
                    path="/profile"
                    element={
                        !isLoggedIn
                            ? <Navigate to="/" replace />
                            : <EditProfile
                                onSave={() => setProfileComplete(true)}
                                onLogout={handleLogout}
                              />
                    }
                />

                {/* CREATE / EDIT LISTING */}
                <Route
                    path="/create"
                    element={
                        !isLoggedIn
                            ? <Navigate to="/" replace />
                            : !profileComplete
                                ? <Navigate to="/profile" replace />
                                : <CreateListing />
                    }
                />
                <Route
                    path="/edit/:id"
                    element={
                        !isLoggedIn
                            ? <Navigate to="/" replace />
                            : !profileComplete
                                ? <Navigate to="/profile" replace />
                                : <CreateListing />
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
=======

  if (verifying) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>Confirming your magic link...</p>
        <p>Loading...</p>
      </div>
>>>>>>> brillos-image-upload-on-listings
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
  // if (claims) {
  //     return (
  //         <div>
  //             <h1>Welcome!</h1>
  //             <p>You are logged in as: {claims.email}</p>
  //             <button onClick={handleLogout}>
  //                 Sign Out
  //             </button>
  //         </div>
  //     );
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/edit/:id" element={<CreateListing />} />
      </Routes>
    </BrowserRouter>
  );
}
