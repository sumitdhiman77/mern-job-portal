import { useState, type FormEvent } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthMode = "login" | "register";
type UserRole = "job seeker" | "employer";

type AuthResponse = {
  success: boolean;
  message?: string;
  accessToken?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  errors?: unknown;
};

type AuthFormProps = {
  onAuthenticated: (accessToken: string, user: NonNullable<AuthResponse["user"]>) => void;
  onCancel: () => void;
};

export default function AuthForm({ onAuthenticated, onCancel }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("job seeker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!API_BASE_URL) {
      setError("API URL is not configured. Check frontend/.env.local.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "login" : "register";
      const payload =
        mode === "login"
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password, role };

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Request failed (${response.status}).`);
      }

      if (!data.accessToken || !data.user) {
        throw new Error("The API response is missing the access token or user.");
      }

      onAuthenticated(data.accessToken, data.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <button className="auth-back" type="button" onClick={onCancel}>
        ← Back to jobs
      </button>

      <div className="auth-card">
        <p className="eyebrow">WELCOME TO HIREHUB</p>
        <h2 id="auth-title">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="auth-description">
          {mode === "login"
            ? "Sign in to continue your career journey."
            : "Connect with opportunities and employers."}
        </p>

        <div className="auth-tabs" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
              setMessage("");
            }}
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
                minLength={2}
                maxLength={100}
                required
                placeholder="Your full name"
              />

              <label htmlFor="auth-role">I want to join as</label>
              <select
                id="auth-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                <option value="job seeker">Job seeker</option>
                <option value="employer">Employer</option>
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
            required
            placeholder="you@example.com"
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
            placeholder="At least 8 characters"
          />

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
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
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setMessage("");
            }}
          >
            {mode === "login" ? "Create an account" : "Login"}
          </button>
        </p>
      </div>
    </section>
  );
}