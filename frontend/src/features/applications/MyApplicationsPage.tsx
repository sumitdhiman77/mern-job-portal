import { useEffect, useState } from "react";
import { getMyApplications } from "./application.api";
import type { MyApplication, ApplicationsPagination } from "./application.api";
import "./MyApplicationsPage.css";

type MyApplicationsPageProps = {
  accessToken: string;
  onBack: () => void;
};

const initialPagination: ApplicationsPagination = {
  currentPage: 1,
  limit: 10,
  totalApplications: 0,
  totalPages: 0,
};

function formatSalary(salary?: { min?: number; max?: number }): string {
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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyApplicationsPage({
  accessToken,
  onBack,
}: MyApplicationsPageProps) {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [pagination, setPagination] =
    useState<ApplicationsPagination>(initialPagination);
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchApplications() {
      try {
        setLoading(true);
        setError("");

        const result = await getMyApplications(accessToken, page);

        if (ignore) return;

        setApplications(result.applications);
        setPagination(result.pagination);
      } catch (err) {
        if (ignore) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your applications.",
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchApplications();

    return () => {
      ignore = true;
    };
  }, [accessToken, page, retryCount]);

  return (
    <main className="applications-page">
      <header className="applications-header">
        <button type="button" onClick={onBack}>
          ← Back to jobs
        </button>

        <div>
          <p className="eyebrow">YOUR ACTIVITY</p>
          <h1>My Applications</h1>
          <p>Track the jobs you've applied for.</p>
        </div>
      </header>

      <section className="applications-content">
        {!loading && !error && (
          <p className="applications-count">
            {pagination.totalApplications} application(s) submitted
          </p>
        )}

        {loading && <p>Loading your applications...</p>}

        {!loading && error && (
          <div className="applications-empty">
            <h2>Unable to load applications</h2>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="applications-empty">
            <h2>No applications yet</h2>
            <p>Explore available jobs and submit your first application.</p>
            <button type="button" onClick={onBack}>
              Explore jobs
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          applications.map((application) => (
            <article className="application-card" key={application._id}>
              <div className="application-card-header">
                <div>
                  <h2>{application.jobId.title}</h2>
                  <p>{application.jobId.location}</p>
                </div>

                <span
                  className={`application-status status-${application.status}`}
                >
                  {application.status}
                </span>
              </div>

              <div className="application-details">
                <p>
                  <strong>Salary:</strong>{" "}
                  {formatSalary(application.jobId.salary)}
                </p>

                <p>
                  <strong>Applied on:</strong>{" "}
                  {formatDate(application.createdAt)}
                </p>

                <p>
                  <strong>Application deadline:</strong>{" "}
                  {formatDate(application.jobId.lastDate)}
                </p>

                <p>
                  <strong>Resume:</strong>{" "}
                  <a
                    href={application.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {application.resume.originalName}
                  </a>
                </p>
              </div>

              {application.coverLetter && (
                <div className="application-cover-letter">
                  <strong>Cover letter</strong>
                  <p>{application.coverLetter}</p>
                </div>
              )}
            </article>
          ))}

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="applications-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((previous) => previous - 1)}
            >
              Previous
            </button>

            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
