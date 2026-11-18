/* eslint-disable react-hooks/set-state-in-effect */
import MyJobsPage from "./features/jobs/MyJobsPage";
import ApplyForm from "./features/applications/ApplyForm";
import MyApplicationsPage from "./features/applications/MyApplicationsPage";
import ApplicantsPage from "./features/applications/ApplicantsPage";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AuthPage from "./features/auth/AuthPage";
import { useAuth } from "./features/auth/AuthContext";
import ProfilePage from "./features/profile/ProfilePage";
type Job = {
  _id: string;
  title: string;
  location: string;
  description: string;
  requiredSkills: string[];
  salary?: {
    min?: number;
    max?: number;
  };
};

type JobsResponse = {
  success: boolean;
  jobs: Job[];
  message?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatSalary(salary?: Job["salary"]): string {
  if (salary?.min == null && salary?.max == null) {
    return "Salary not specified";
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (salary.min != null && salary.max != null) {
    return `${formatAmount(salary.min)} – ${formatAmount(salary.max)}`;
  }

  return formatAmount(salary.min ?? salary.max!);
}

function App() {
  const { user, accessToken, login, isAuthLoading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<
    "home" | "profile" | "applications" | "my-jobs" | "applicants"
  >("home");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyMessage, setApplyMessage] = useState("");

  
useEffect(() => {
  // Employers use the private My Jobs endpoint instead.
  if (user?.role === "employer") {
    setJobs([]);
    setError("");
    setLoading(false);
    return;
  }

  const controller = new AbortController();

  const fetchJobs = async () => {
    if (!API_BASE_URL) {
      setError(
        "API URL is missing. Configure VITE_API_BASE_URL in .env.local.",
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/jobs?page=1&limit=50`,
        { signal: controller.signal },
      );

      const data = (await response.json()) as JobsResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Unable to load jobs (${response.status}).`,
        );
      }

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      if (controller.signal.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading jobs.",
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  void fetchJobs();

  return () => controller.abort();
}, [user?.role]);
  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.requiredSkills.some((skill) =>
          skill.toLowerCase().includes(normalizedSearch),
        );

      const matchesLocation =
        !normalizedLocation ||
        job.location.toLowerCase().includes(normalizedLocation);

      return matchesSearch && matchesLocation;
    });
  }, [jobs, search, location]);
  if (isAuthLoading) {
    return <p>Restoring your session...</p>;
  }
  if (authMode) {
    return (
      <AuthPage
        initialMode={authMode}
        onCancel={() => setAuthMode(null)}
        onAuthenticated={(result) => {
          login(result);
          setAuthMode(null);
        }}
      />
    );
  }

  if (
    currentPage === "applications" &&
    user?.role === "job seeker" &&
    accessToken
  ) {
    return (
      <MyApplicationsPage
        accessToken={accessToken}
        onBack={() => setCurrentPage("home")}
      />
    );
  }
  if (currentPage === "profile" && user && accessToken) {
    return (
      <ProfilePage
        accessToken={accessToken}
        onBack={() => setCurrentPage("home")}
      />
    );
  }

  return (
    <main className="app">
      <nav className="navbar">
        <a className="brand" href="#">
          HireHub<span>.</span>
        </a>

       
{user?.role !== "employer" && (
  <>
    <a href="#jobs">Find Jobs</a>
    <a href="#employers">For Employers</a>
  </>
)}

{user ? (
  <>
    <span>{user.name}</span>

    <button onClick={() => setCurrentPage("profile")}>
      My Profile
    </button>

    {user.role === "employer" ? (
      <button onClick={() => setCurrentPage("my-jobs")}>
        My Jobs
      </button>
    ) : (
      <button onClick={() => setCurrentPage("applications")}>
        My Applications
      </button>
    )}

    <button onClick={logout}>Logout</button>
  </>
) : (
  <>
    <button onClick={() => setAuthMode("login")}>Login</button>
    <button onClick={() => setAuthMode("register")}>
      Get Started
    </button>
  </>
)}
      </nav>

      {user?.role === "employer" ? (
        !accessToken ? (
          <p>Your session has expired. Please log in again.</p>
        ) : currentPage === "applicants" && selectedJobId ? (
          <section className="my-jobs-page">
            <ApplicantsPage
  jobId={selectedJobId}
  accessToken={accessToken}
  onBack={() => {
    setSelectedJobId(null);
    setCurrentPage("my-jobs");
  }}
/>
          </section>
        ) : (
          <MyJobsPage
            accessToken={accessToken}
            onViewApplicants={(jobId) => {
              setSelectedJobId(jobId);
              setCurrentPage("applicants");
            }}
          />
        )
      ) : (
        <>
          {
            <section className="hero">
              <p className="eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</p>

              <h1>
                Find work that
                <br />
                <span>moves you forward.</span>
              </h1>

              <p className="hero-description">
                Discover opportunities, connect with employers, and take the
                next step in your career.
              </p>

              <form
                className="search-form"
                onSubmit={(event) => {
                  event.preventDefault();

                  document.getElementById("jobs")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <input
                  aria-label="Job title or skill"
                  placeholder="Job title or skill"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <input
                  aria-label="Location"
                  placeholder="City or location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />

                <button type="submit">Find Jobs</button>
              </form>
            </section>
          }

          {
            <section className="jobs-section" id="jobs">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">EXPLORE OPPORTUNITIES</p>
                  <h2>Find your next role</h2>
                </div>
                {applyMessage && (
                  <p role="status" className="status-message">
                    {applyMessage}
                  </p>
                )}

                {selectedJob && accessToken && (
                  <ApplyForm
                    jobId={selectedJob._id}
                    accessToken={accessToken}
                    onSuccess={(message) => {
                      setApplyMessage(message);
                      setSelectedJob(null);
                    }}
                    onCancel={() => setSelectedJob(null)}
                  />
                )}

                <span>
                  {loading
                    ? "Loading jobs…"
                    : `${filteredJobs.length} jobs found`}
                </span>
              </div>

              {loading && (
                <p className="status-message">Loading opportunities…</p>
              )}

              {!loading && error && (
                <div className="status-message error-state">
                  <h3>We couldn't load the jobs.</h3>
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && filteredJobs.length === 0 && (
                <div className="empty-state">
                  <h3>No matching jobs found.</h3>
                  <p>Try another job title, skill, or location.</p>
                </div>
              )}

              {!loading && !error && filteredJobs.length > 0 && (
                <div className="jobs-grid">
                  {filteredJobs.map((job) => (
                    <article className="job-card" key={job._id}>
                      <p className="job-location">{job.location}</p>

                      <h3>{job.title}</h3>

                      <p className="job-description">{job.description}</p>

                      <p className="job-salary">{formatSalary(job.salary)}</p>

                      <div className="skills-list">
                        {job.requiredSkills.map((skill) => (
                          <span className="skill-tag" key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="apply-button"
                        onClick={() => {
                          setApplyMessage("");

                          if (!user) {
                            setAuthMode("login");
                            return;
                          }

                          if (user.role !== "job seeker") {
                            setApplyMessage(
                              "Only job seekers can apply for jobs.",
                            );
                            return;
                          }

                          if (!accessToken) {
                            setApplyMessage(
                              "Your session has expired. Please log in again.",
                            );
                            setAuthMode("login");
                            return;
                          }

                          setSelectedJob(job);
                        }}
                      >
                        {!user
                          ? "Login to apply"
                          : user.role === "employer"
                            ? "Job seekers only"
                            : "Apply Now"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          }

          {
            <section className="employer-section" id="employers">
              <p className="eyebrow">FOR EMPLOYERS</p>

              <h2>Find the right people for your team.</h2>

              <p>Create job listings and manage applications from one place.</p>

              <button
                type="button"
                className="nav-button"
                onClick={() => setAuthMode("register")}
              >
                Get started
              </button>
            </section>
          }
        </>
      )}

      <footer>
        <a className="brand" href="#">
          HireHub<span>.</span>
        </a>

        <p>Connecting talent with opportunity.</p>
      </footer>
    </main>
  );
}

export default App;
