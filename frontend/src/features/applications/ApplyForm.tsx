import { useState, type SyntheticEvent } from "react";
import { applyForJob } from "./application.api";

type ApplyFormProps = {
  jobId: string;
  accessToken: string;
  onSuccess: (message: string) => void;
  onCancel: () => void;
};

export default function ApplyForm({
  jobId,
  accessToken,
  onSuccess,
  onCancel,
}: ApplyFormProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
     const result = await applyForJob(
  jobId,
  { coverLetter: coverLetter.trim() },
  accessToken,
);

      onSuccess(result.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="apply-form">
      <h2>Apply for this job</h2>

      <label htmlFor="coverLetter">Cover letter (optional)</label>
      <textarea
        id="coverLetter"
        value={coverLetter}
        onChange={(event) => setCoverLetter(event.target.value)}
        maxLength={2000}
        rows={6}
        placeholder="Introduce yourself and explain why you're a good fit..."
      />

      <p>{coverLetter.length}/2000 characters</p>

      {error && <p role="alert" className="form-error">{error}</p>}

      <div className="apply-form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit application"}
        </button>

        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}