import { useState,type SyntheticEvent } from "react";
import {
  loginUser,
  registerUser,
  type AuthResponse,
  type UserRole,
} from "./auth.api";
import "./AuthPage.css";

type AuthPageProps = {
  initialMode?: "login" | "register";
  onAuthenticated: (result: AuthResponse) => void;
  onCancel?: () => void;
};

export default function AuthPage({
  initialMode = "login",
  onAuthenticated,
  onCancel,
}: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("job seeker");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>,) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result =
        mode === "register"
          ? await registerUser({
              name: name.trim(),
              email: email.trim(),
              password,
              role,
            })
          : await loginUser({
              email: email.trim(),
              password,
            });

      onAuthenticated(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setError("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="auth-brand" href="/" onClick={onCancel}>
          HireHub<span>.</span>
        </a>

        <p className="auth-eyebrow">
          {mode === "login" ? "WELCOME BACK" : "START YOUR NEXT CHAPTER"}
        </p>

        <h1 id="auth-title">
          {mode === "login" ? "Sign in to HireHub" : "Create your account"}
        </h1>

        <p className="auth-subtitle">
          {mode === "login"
            ? "Continue your job search or manage your hiring."
            : "Join job seekers and employers finding the right fit."}
        </p>

        <div className="auth-tabs" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            aria-pressed={mode === "login"}
            onClick={() => changeMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            aria-pressed={mode === "register"}
            onClick={() => changeMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={3}
                maxLength={50}
                required
              />

              <label htmlFor="auth-role">I want to</label>
              <select
                id="auth-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                <option value="job seeker">Find a job</option>
                <option value="employer">Hire candidates</option>
              </select>
            </>
          )}

          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? "Please wait…"
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "New to HireHub?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() =>
              changeMode(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login" ? "Create an account" : "Login instead"}
          </button>
        </p>

        {onCancel && (
          <button className="auth-back" type="button" onClick={onCancel}>
            Back to jobs
          </button>
        )}
      </section>
    </main>
  );
}