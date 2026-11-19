import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { createJob } from "./job.api";
import "./CreateJobPage.css";

type CreateJobPageProps = {
  accessToken: string;
  onBack: () => void;
  onSuccess: () => void;
};

type JobForm = {
  title: string;
  description: string;
  minSalary: string;
  maxSalary: string;
  location: string;
  skills: string;
  lastDate: string;
};

const initialForm: JobForm = {
  title: "",
  description: "",
  minSalary: "",
  maxSalary: "",
  location: "",
  skills: "",
  lastDate: "",
};

function getTomorrowDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CreateJobPage({
  accessToken,
  onBack,
  onSuccess,
}: CreateJobPageProps) {
  const [form, setForm] = useState<JobForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

 const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();
    setError("");
    
if (!form.minSalary.trim() || !form.maxSalary.trim()) {
  setError("Please enter both minimum and maximum salaries.");
  return;
}

    const minSalary = Number(form.minSalary);
    const maxSalary = Number(form.maxSalary);

    if (
      !Number.isFinite(minSalary) ||
      !Number.isFinite(maxSalary) ||
      minSalary < 0 ||
      maxSalary < 0
    ) {
      setError("Please enter valid salary amounts.");
      return;
    }

    if (minSalary > maxSalary) {
      setError("Minimum salary cannot exceed maximum salary.");
      return;
    }

    const requiredSkills = [
      ...new Set(
        form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      ),
    ];

    if (requiredSkills.length === 0) {
      setError("Please enter at least one required skill.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Keep the selected deadline valid for the entire selected day.
      const deadline = new Date(
        `${form.lastDate}T23:59:59`,
      ).toISOString();

      await createJob(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          salary: {
            min: minSalary,
            max: maxSalary,
          },
          location: form.location.trim(),
          requiredSkills,
          lastDate: deadline,
        },
        accessToken,
      );

      onSuccess();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create the job. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="create-job-page">
      <div className="create-job-header">
        <button
          type="button"
          className="create-job-back"
          onClick={onBack}
          disabled={isSubmitting}
        >
          ← Back to My Jobs
        </button>

        <h1>Post a New Job</h1>
        <p>Provide the details of the opportunity you are offering.</p>
      </div>

      <form className="create-job-form" onSubmit={handleSubmit}>
        <div className="create-job-field">
          <label htmlFor="title">Job Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            minLength={3}
            maxLength={100}
            placeholder="e.g. Node.js Backend Developer"
            required
          />
        </div>

        <div className="create-job-field">
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            minLength={20}
            maxLength={5000}
            rows={6}
            placeholder="Describe the role, responsibilities and requirements..."
            required
          />
          <small>{form.description.length}/5000 characters</small>
        </div>

        <div className="create-job-field">
          <label>Salary Range (INR per month)</label>

          <div className="create-job-salary">
            <input
              aria-label="Minimum salary"
              name="minSalary"
              type="number"
              min="0"
              step="1"
              value={form.minSalary}
              onChange={handleChange}
              placeholder="Minimum salary"
              required
            />

            <input
              aria-label="Maximum salary"
              name="maxSalary"
              type="number"
              min="0"
              step="1"
              value={form.maxSalary}
              onChange={handleChange}
              placeholder="Maximum salary"
              required
            />
          </div>
        </div>

        <div className="create-job-field">
          <label htmlFor="location">Job Location</label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            placeholder="e.g. Mohali, Chandigarh"
            required
          />
        </div>

        <div className="create-job-field">
          <label htmlFor="skills">Required Skills</label>
          <input
            id="skills"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Node.js, Express, TypeScript, MongoDB"
            required
          />
          <small>Separate skills using commas.</small>
        </div>

        <div className="create-job-field">
          <label htmlFor="lastDate">Application Deadline</label>
          <input
            id="lastDate"
            name="lastDate"
            type="date"
            min={getTomorrowDate()}
            value={form.lastDate}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <p className="create-job-error" role="alert">
            {error}
          </p>
        )}

        <div className="create-job-actions">
          <button
            type="button"
            className="create-job-cancel"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish Job"}
          </button>
        </div>
      </form>
    </section>
  );
}