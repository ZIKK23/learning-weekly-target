// src/pages/Login.jsx
import React, { useState } from "react";
import { login } from "../api";
import "./Login.css";

export default function Login({ onSuccess, onRegister, onClose, asModal }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email);   
      onSuccess?.();
      // Only reload if NOT in a modal (full page login), otherwise let dashboard update state
      if (!asModal) {
         window.location.reload(); 
      }
    } catch (err) {
      setError(err?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const Wrapper = asModal ? React.Fragment : "div";
  const wrapperProps = asModal ? {} : { className: "dc-auth-page" };

  return (
    <Wrapper {...wrapperProps}>
      <main className={asModal ? "dc-modal-content" : "dc-auth-content"}>
        <section className="dc-auth-card">
          <div className="dc-modal-head">
            <h2 className="dc-auth-title">Masuk</h2>
            <p className="dc-auth-subtitle">Masuk untuk lihat progress & streak kamu</p>
            {asModal && (
              <button className="dc-x" type="button" onClick={onClose} aria-label="Close">
                ×
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="dc-form">
            <div className="dc-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="dc-error">{error}</div>}

            <button className="dc-submit" type="submit" disabled={loading}>
              {loading ? "Masuk..." : "Masuk"}
            </button>

            <div className="dc-sep">
              <span />
              <p>atau</p>
              <span />
            </div>

            <button className="dc-google" type="button" disabled>
              <span className="dc-google-badge">G</span>
              Masuk dengan Google
            </button>

            <div className="dc-foot">
              Belum punya akun?{" "}
              <button type="button" className="dc-link-btn" onClick={onRegister} disabled={loading}>
                Daftar
              </button>
            </div>
          </form>
        </section>
      </main>
    </Wrapper>
  );
}
