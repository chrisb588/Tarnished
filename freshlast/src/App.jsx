import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { getProfile } from "./api/profile";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import OfferList from "./pages/OfferList/OfferList";
import Home from "./pages/Home/Home";
import CreateListing from "./pages/CreateListing/CreateListing";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import EditProfile from "./pages/EditProfile/EditProfile";
import CreateProfile from "./pages/CreateProfile/CreateProfile";
import ViewListing from "./pages/ViewListing/ViewListing"

import "./App.css";

export default function App() {
  const [session, setSession] = useState(undefined);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [profileComplete, setProfileComplete] = useState(null); // null = still checking
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkPasswordFlag = (user) => {
    if (user?.user_metadata?.password_changed === false) {
      setNeedsPasswordChange(true);
    } else {
      setNeedsPasswordChange(false);
    }
  };

  const checkProfileComplete = async (user) => {
    if (!user) return;
    try {
      const response = await getProfile(user.id);
      const data = response?.data;
      const isComplete = !!(data?.name && data?.location);
      setProfileComplete(isComplete);
    } catch {
      // On API error, leave profileComplete unchanged to avoid spurious redirects
    }
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
      supabase.auth
        .verifyOtp({ token_hash, type: type || "email" })
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      if (session?.user) {
        checkPasswordFlag(session.user);
        checkProfileComplete(session.user);
      } else {
        setNeedsPasswordChange(false);
        setProfileComplete(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setNeedsPasswordChange(false);
    setProfileComplete(null);
  };

  if (session === undefined || verifying) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  if (authError) {
    return (
      <div>
        <p>Authentication failed: {authError}</p>
        <button
          onClick={() => {
            setAuthError(null);
            window.history.replaceState({}, document.title, "/");
          }}
        >
          Return
        </button>
      </div>
    );
  }

  if (session && needsPasswordChange) {
    return <ChangePassword />;
  }

  const isLoggedIn = !!session;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OfferList session={session} onLogout={handleLogout} />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/edit/:id" element={<CreateListing />} />
        <Route path="/viewListing/:id" element={<ViewListing/>} />
        <Route path="/changePass" element={<ChangePassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/editProfile/:id"
          element={
            !isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <EditProfile />
            )
          }
        />
        <Route path="/createProfile" element={<CreateProfile />} />

        {/* PUBLIC */}
        <Route path="/offers" element={<OfferList session={session} onLogout={handleLogout} />} />

        {/* VENDOR DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            !isLoggedIn ? (
              <Navigate to="/" replace />
            ) : profileComplete === null ? (
              <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>Loading...</div>
            ) : !profileComplete ? (
              <Navigate to="/profile" replace />
            ) : (
              <Home onLogout={handleLogout} />
            )
          }
        />

        {/* EDIT PROFILE */}
        <Route
          path="/profile"
          element={
            !isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <EditProfile
                onSave={() => setProfileComplete(true)}
                onLogout={handleLogout}
              />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
