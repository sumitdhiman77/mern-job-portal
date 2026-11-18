import { useEffect, useState } from "react";
import {
  getApplicationsForJob,
  updateApplicationStatus,
  type ApplicationStatus,
  type EmployerApplication,
} from "./application.api";
import type { ApplicationsPagination } from "./application.api";
import "./ApplicantsPage.css";

type ApplicantsPageProps = {
  jobId: string;
  accessToken: string;
  onBack: () => void;
};

const allowedTransitions: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  pending: ["reviewed", "rejected"],
  reviewed: ["shortlisted", "rejected"],
  shortlisted: ["selected", "rejected"],
  rejected: [],
  selected: [],
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  selected: "Selected",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ApplicantsPage({
  jobId,
  accessToken,
  onBack,
}: ApplicantsPageProps) {
  const [applications, setApplications] = useState<
    EmployerApplication[]
  >([]);
  const [pagination, setPagination] =
    useState<ApplicationsPagination | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  const [statusSelections, setStatusSelections] = useState<
    Record<string, ApplicationStatus>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchApplicants() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getApplicationsForJob(
          jobId,
          accessToken,
          currentPage,
          10,
        );

        if (!isMounted) return;

        setApplications(response.applications);
        setPagination(response.pagination);

        setStatusSelections({});
      } catch (error: unknown) {
        if (!isMounted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load applicants. Please try again.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchApplicants();

    return () => {
      isMounted = false;
    };
  }, [jobId, accessToken, currentPage, retryCount]);

  const handleStatusUpdate = async (
    applicationId: string,
    status: ApplicationStatus,
  ) => {
    try {
      setSavingId(applicationId);
      setError("");
      setActionMessage("");

      const response = await updateApplicationStatus(
        applicationId,
        status,
        accessToken,
      );

     setApplications((currentApplications) =>
  currentApplications.map((application) =>
    application._id === applicationId
      ? {
          ...application,
          status: response.application.status,
        }
      : application,
  ),
);

      setStatusSelections((currentSelections) => ({
        ...currentSelections,
        [applicationId]: response.application.status,
      }));

      setActionMessage(response.message);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update application status.",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="applicants-page">
      <div className="applicants-header">
        <div>
          <h1>Applicants</h1>
          <p>Review candidates who applied for this job.</p>
        </div>

        <button
          type="button"
          className="applicants-back-button"
          onClick={onBack}
        >
          Back to My Jobs
        </button>
      </div>

      {actionMessage && (
        <p className="applicants-success" role="status">
          {actionMessage}
        </p>
      )}

      {error && (
        <div className="applicants-error" role="alert">
          <p>{error}</p>

          {!isLoading && (
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="applicants-message">Loading applicants...</p>
      ) : applications.length === 0 && !error ? (
        <div className="applicants-empty">
          <h2>No applicants yet</h2>
          <p>Applicants will appear here when someone applies.</p>
        </div>
      ) : (
        <>
          {pagination && (
            <p className="applicants-count">
              {pagination.totalApplications} applicant(s) found
            </p>
          )}

          <div className="applicants-list">
            {applications.map((application) => {
              const currentStatus = application.status;

              const selectedStatus =
                statusSelections[application._id] ?? currentStatus;

              const availableStatuses =
                allowedTransitions[currentStatus];

              const isSaving = savingId === application._id;

              return (
                <article
                  className="applicant-card"
                  key={application._id}
                >
                  <div className="applicant-heading">
                    <div>
                      <h2>{application.applicantId.name}</h2>
                      <p>{application.applicantId.email}</p>

                      {application.applicantId.profile?.location && (
                        <p>
                          {application.applicantId.profile.location}
                        </p>
                      )}
                    </div>

                    <span
                      className={`application-status ${currentStatus}`}
                    >
                      {statusLabels[currentStatus]}
                    </span>
                  </div>

                  <div className="applicant-information">
                    <p>
                      <strong>Applied:</strong>{" "}
                      {formatDate(application.createdAt)}
                    </p>

                    <p>
                      <strong>Resume:</strong>{" "}
                      <a
                        href={application.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View {application.resume.originalName}
                      </a>
                    </p>
                  </div>

                  {application.coverLetter && (
                    <div className="applicant-cover-letter">
                      <h3>Cover Letter</h3>
                      <p>{application.coverLetter}</p>
                    </div>
                  )}

                  {availableStatuses.length > 0 && (
                    <div className="applicant-status-actions">
                      <label htmlFor={`status-${application._id}`}>
                        Update status
                      </label>

                      <select
                        id={`status-${application._id}`}
                        value={selectedStatus}
                        disabled={isSaving}
                        onChange={(event) =>
                          setStatusSelections((currentSelections) => ({
                            ...currentSelections,
                            [application._id]: event.target
                              .value as ApplicationStatus,
                          }))
                        }
                      >
                        <option value={currentStatus}>
                          {statusLabels[currentStatus]} (Current)
                        </option>

                        {availableStatuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={
                          isSaving || selectedStatus === currentStatus
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            application._id,
                            selectedStatus,
                          )
                        }
                      >
                        {isSaving ? "Updating..." : "Update Status"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="applicants-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>

              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= pagination.totalPages}
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