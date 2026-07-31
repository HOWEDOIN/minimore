"use client";

import { useEffect, useState } from "react";
import "./admin.css";

interface Settings {
  hide_prices: boolean;
  disable_checkout: boolean;
}

export default function GlobalSettingsPage() {
  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [settings, setSettings] = useState<Settings>({ hide_prices: false, disable_checkout: true });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [authError, setAuthError] = useState("");

  // Try to load token from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("minimore_admin_token");
    if (saved) {
      setToken(saved);
      fetchSettings(saved);
    }
  }, []);

  async function fetchSettings(t: string) {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { "x-admin-token": t },
      });
      if (!res.ok) {
        setIsAuthed(false);
        setAuthError("Incorrect admin token.");
        return;
      }
      const data = await res.json();
      setSettings(data);
      setIsAuthed(true);
      setAuthError("");
    } catch {
      setAuthError("Could not connect to settings API.");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    await fetchSettings(inputToken);
    if (!authError) {
      sessionStorage.setItem("minimore_admin_token", inputToken);
      setToken(inputToken);
    }
  }

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Unauthorized");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("minimore_admin_token");
    setIsAuthed(false);
    setToken("");
    setInputToken("");
  }

  // — Login screen —
  if (!isAuthed) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <div className="admin-logo">
            <span className="admin-logo-m">M</span>
            <span className="admin-logo-text">inimore</span>
          </div>
          <h1 className="admin-login-title">Global Settings</h1>
          <p className="admin-login-sub">Enter your admin token to continue</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              className="admin-input"
              placeholder="Admin token"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              required
              autoFocus
            />
            {authError && <p className="admin-error">{authError}</p>}
            <button type="submit" className="admin-btn-primary">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // — Settings panel —
  return (
    <div className="admin-page">
      <div className="admin-panel">
        {/* Header */}
        <div className="admin-header">
          <div>
            <div className="admin-logo">
              <span className="admin-logo-m">M</span>
              <span className="admin-logo-text">inimore</span>
            </div>
            <p className="admin-header-sub">Global Settings</p>
          </div>
          <button onClick={handleLogout} className="admin-btn-ghost">
            Log out
          </button>
        </div>

        {/* Settings group */}
        <div className="admin-card">
          <h2 className="admin-section-title">Store Visibility</h2>
          <p className="admin-section-desc">
            Control what customers see across the entire storefront.
          </p>

          <div className="admin-toggle-row">
            <div className="admin-toggle-info">
              <span className="admin-toggle-label">Hide All Prices</span>
              <span className="admin-toggle-desc">
                Removes prices from product cards, product detail pages, and related products. Customers can still browse and add items to cart.
              </span>
            </div>
            <button
              id="toggle-hide-prices"
              className={`admin-toggle ${settings.hide_prices ? "admin-toggle--on" : ""}`}
              onClick={() => setSettings((s) => ({ ...s, hide_prices: !s.hide_prices }))}
              aria-pressed={settings.hide_prices}
              role="switch"
            >
              <span className="admin-toggle-knob" />
            </button>
          </div>

          <div className="admin-divider" />

          <div className="admin-toggle-row">
            <div className="admin-toggle-info">
              <span className="admin-toggle-label">Disable Checkout</span>
              <span className="admin-toggle-desc">
                Greys out the "Go to Checkout" button and prevents customers from completing purchases.
              </span>
            </div>
            <button
              id="toggle-disable-checkout"
              className={`admin-toggle ${settings.disable_checkout ? "admin-toggle--on" : ""}`}
              onClick={() => setSettings((s) => ({ ...s, disable_checkout: !s.disable_checkout }))}
              aria-pressed={settings.disable_checkout}
              role="switch"
            >
              <span className="admin-toggle-knob" />
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="admin-footer">
          <div className="admin-status">
            {status === "saved" && <span className="admin-status--saved">✓ Settings saved</span>}
            {status === "error" && <span className="admin-status--error">⚠ Failed to save — check your token</span>}
          </div>
          <button
            className="admin-btn-primary"
            onClick={handleSave}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
