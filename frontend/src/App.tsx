import { useEffect, useMemo, useState } from "react";
import "./App.css";

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
  if (!salary?.min && !salary?.max) return "Salary not specified";

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      if (!API_BASE_URL) {
        setError("API URL is missing. Configure VITE_API_BASE_URL in .env.local.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL.replace(/\/+$/, "")}/jobs?page=1&limit=50`,
        );

        const data = (await response.json()) as JobsResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.message || `Unable to load jobs (${response.status}).`);
        }

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading jobs.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchJobs();
  }, []);

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

  return (
    <main className="app">
      <nav className="navbar">
        <a className="brand" href="#">
          HireHub<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#jobs">Find Jobs</a>
          <a href="#employers">For Employers</a>
          <a href="#login">Login</a>
          <a className="nav-button" href="#register">
            Get Started
          </a>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</p>

        <h1>
          Find work that
          <br />
          <span>moves you forward.</span>
        </h1>

        <p className="hero-description">
          Discover opportunities, connect with employers, and take the next
          step in your career.
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

      <section className="jobs-section" id="jobs">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORE OPPORTUNITIES</p>
            <h2>Find your next role</h2>
          </div>
          <span>{loading ? "Loading jobs…" : `${filteredJobs.length} jobs found`}</span>
        </div>

        {loading && <p className="status-message">Loading opportunities…</p>}

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
                    window.location.hash = "login";
                  }}
                >
                  Login to apply
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="employer-section" id="employers">
        <p className="eyebrow">FOR EMPLOYERS</p>
        <h2>Find the right people for your team.</h2>
        <p>Create job listings and manage applications from one place.</p>
        <a className="nav-button" href="#login">
          Get started
        </a>
      </section>

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