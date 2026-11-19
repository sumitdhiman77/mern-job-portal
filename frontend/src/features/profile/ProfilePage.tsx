import { useEffect, useState, type SyntheticEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  getMyProfile,
  uploadResume,
  type Resume,
} from "./profile.api";
import "./ProfilePage.css";

type ProfilePageProps = {
  accessToken: string;
  onBack: () => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ProfilePage({
  accessToken,
  onBack,
}: ProfilePageProps) {
  const {user}=useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState<Resume | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const result = await getMyProfile(accessToken);

        if (!isMounted) return;

        setName(result.user.name);
        setEmail(result.user.email);
        setResume(result.user.profile?.resume ?? null);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  function handleFileChange(file: File | undefined) {
    setError("");
    setMessage("");
    setSelectedFile(null);

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must not exceed 5 MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || uploading) return;

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const result = await uploadResume(selectedFile, accessToken);

      setResume(result.resume);
      setSelectedFile(null);
      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload your resume. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <p className="profile-status">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <button
          type="button"
          className="profile-back-button"
          onClick={onBack}
        >
          ← Back to HireHub
        </button>

        <header className="profile-header">
          <p className="profile-eyebrow">ACCOUNT SETTINGS</p>
          <h1>My Profile</h1>
          {
            user?.role === "job seeker" && <p>Manage your profile and keep your resume up to date.</p>
          }
        </header>

        {error && (
          <p className="profile-message profile-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="profile-message profile-success" role="status">
            {message}
          </p>
        )}

        <section className="profile-card">
          <h2>Personal information</h2>

          <div className="profile-info">
            <div>
              <span>Name</span>
              <p>{name}</p>
            </div>

            <div>
              <span>Email</span>
              <p>{email}</p>
            </div>
          </div>
        </section>

{user?.role==="job seeker" &&   <section className="profile-card">
          <h2>My resume</h2>

          {resume ? (
            <div className="current-resume">
              <div className="resume-icon">PDF</div>

              <div className="resume-details">
                <strong>{resume.originalName}</strong>
                <span>Your current uploaded resume</span>
                <a
                  href={resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View resume
                </a>
              </div>
            </div>
          ) : (
            <p className="no-resume">
              You haven't uploaded a resume yet.
            </p>
          )}

          <form className="resume-upload-form" onSubmit={handleSubmit}>
            <label htmlFor="resume-file">
              {resume ? "Replace your resume" : "Choose your resume"}
            </label>

            <input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={uploading}
              onChange={(event) =>
                handleFileChange(event.target.files?.[0])
              }
            />

            <p className="file-hint">
              PDF, DOC or DOCX. Maximum file size: 5 MB.
            </p>

            {selectedFile && (
              <p className="selected-file">
                Selected: {selectedFile.name}
              </p>
            )}

            <button
              type="submit"
              className="resume-upload-button"
              disabled={!selectedFile || uploading}
            >
              {uploading
                ? "Uploading..."
                : resume
                  ? "Replace resume"
                  : "Upload resume"}
            </button>
          </form>
        </section>}
      
      </div>
    </main>
  );
}