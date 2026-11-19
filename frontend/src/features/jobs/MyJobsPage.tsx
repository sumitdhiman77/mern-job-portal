import { useEffect, useState } from "react";
import { getMyJobs, type Job } from "./job.api";
import "./MyJobsPage.css";
type MyJobsPageProps = {
  accessToken: string;
  onViewApplicants: (jobId: string) => void;
  onCreateJob: () => void;
};

export default function MyJobsPage({
  accessToken,
  onViewApplicants,
  onCreateJob,
}: MyJobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchMyJobs() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getMyJobs(accessToken, currentPage, 10);

        if (!isMounted) return;

        setJobs(response.jobs);
        setTotalPages(response.pagination.totalPages);
      } catch (error: unknown) {
        if (!isMounted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your jobs. Please try again.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMyJobs();

    return () => {
      isMounted = false;
    };
  }, [accessToken, currentPage,retryCount]);

  const formatSalary = (min: number, max: number) => {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <section className="my-jobs-page">
        <p className="my-jobs-message">Loading your jobs...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-jobs-page">
        <p className="my-jobs-error">{error}</p>
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="my-jobs-page">
     <div className="my-jobs-header">
  <div>
    <h1>My Jobs</h1>
    <p>Manage your job listings and review applicants.</p>
  </div>

  <button type="button" onClick={onCreateJob}>
    + Post a New Job
  </button>
</div>

      {jobs.length === 0 ? (
        <div className="my-jobs-empty">
          <h2>No jobs found</h2>
          <p>You haven't posted any jobs yet.</p>
        </div>
      ) : (
        <>
          <div className="my-jobs-list">
            {jobs.map((job) => (
              <article className="my-job-card" key={job._id}>
                <div className="my-job-details">
                  <div className="my-job-title-row">
                    <h2>{job.title}</h2>
                    <span
                      className={`my-job-status ${
                        job.isActive ? "active" : "inactive"
                      }`}
                    >
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="my-job-location">{job.location}</p>

                  <p>
                    <strong>Salary:</strong>{" "}
                    {formatSalary(job.salary.min, job.salary.max)}
                  </p>

                  <p>
                    <strong>Application deadline:</strong>{" "}
                    {formatDate(job.lastDate)}
                  </p>

                  <div className="my-job-skills">
                    {job.requiredSkills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="my-job-actions">
                  <button
                    type="button"
                    onClick={() => onViewApplicants(job._id)}
                  >
                    Applicants
                  </button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="my-jobs-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
