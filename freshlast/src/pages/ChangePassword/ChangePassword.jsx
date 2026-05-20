import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

import "./ChangePassword.css";
import { useLanguage } from "../../context/languageContext";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert(t("passwords_no_match"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { password_changed: true },
    });
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="password-root-wrapper">
      <div className="password-div">
        <h1>{t("change_pass_title")}</h1>
        <p>{t("change_pass_sub")}</p>
        <form onSubmit={handleSubmit} className="change-pass-form">
          <label for="newpass">{t("new_password")}</label>
          <input
            type="password"
            id="newpass"
            placeholder={t("new_password_placeholder")}
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <label for="confirmpass">{t("confirm_password")}</label>
          <input
            type="password"
            placeholder={t("confirm_password_placeholder")}
            id="confirmpass"
            value={confirm}
            required
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button disabled={loading}>
            {loading ? t("saving") : t("set_password")}
          </button>
        </form>
      </div>
    </div>
  );
}
