import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

import "./AuthForm.css";

export default function AuthForm({ onSuccess, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!supabase) {
      alert("Supabase not configured. Please check environment variables.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="sign-in-label">{t("sign_in")}</h1>
        <p>email address</p>
        <input
          type="email"
          placeholder={t("email_placeholder")}
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <p>password</p>
        <input
          type="password"
          placeholder={t("password_placeholder")}
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="forgot-password-container">
          <button type="button" className="forgot-password">
            {t("forgot_password")}
          </button>
        </div>

        <button disabled={loading} className="auth-buttons">
          {loading ? t("processing") : t("log_in")}
        </button>

        <button
          type="button"
          className="admin-login"
          onClick={() => {
            onClose?.();
            navigate("/adminLoginPage");
          }}
        >
          {t("admin_login")}
        </button>
      </form>
    </div>
  );
}
