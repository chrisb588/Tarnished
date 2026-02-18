import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'

import './AuthForm.css'

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Decide which Supabase function to call
    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (isSignUp && !data.session) {
        alert("Check your email for a confirmation link!");
      } else {
        alert("Success!");
      }
    }
    setLoading(false);
  };

    return (
      <div>
          <h1>{isSignUp ? "Create Account" : "Sign In"}</h1>
          <form className = "auth-form" onSubmit={handleSubmit}>
            {/*for signing up*/}
            {isSignUp ? (
                <>
                  <p>first name*</p>
                  <input 
                    type="text" 
                    placeholder="First name"
                    required
                  />
                  <p>last name*</p>
                  <input 
                    type="text" 
                    placeholder="Last name"
                    required
                  />
                  <p>email address*</p>
                  <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                  />
                  <p>password*</p>
                  <input
                      type="password"
                      placeholder="Your password"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                  />
                  <>
                    <p>confirm password*</p>
                    <input 
                      type="password" 
                      placeholder="Confirm password"
                      required
                    />

                  </>
                </>
              ) : (
                <>
                  <p>email address</p>
                  <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                  />
                  <p>password</p>
                  <input
                      type="password"
                      placeholder="Your password"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="forgot-password-container">
                    <button 
                      className = "forgot-password"
                    >
                      forgot your password?
                    </button>
                  </div>
                </>
              )
              }


              <button disabled={loading} className = "auth-buttons">
                  {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
              </button>

              <button 
                type="button"
                className = "auth-buttons"
                onClick={() => setIsSignUp(!isSignUp)} 
              >
                {isSignUp ? "Switch to Log In" : "Switch to Sign Up"}
              </button>

          </form>
          

      </div>
  );
}