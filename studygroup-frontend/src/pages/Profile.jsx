import { useEffect, useState } from "react";
import { getMe, updateProfile, deleteAccount, uploadAvatar } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getMe();
      setProfile(res.data);
    } catch  {
      setError("Failed to load profile");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        academic_details: profile.academic_details,
      };
      await updateProfile(payload);
      setEditing(false);
    } catch  {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (file) => {
    try {
      await uploadAvatar(file);
      await load();
    } catch {
      setError("Avatar upload failed");
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    try {
      await deleteAccount();
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/register");
    } catch {
      setError("Failed to delete account");
    }
  };

  if (!profile) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div className="auth-container">
      <style>{`
      .profile-card { width: 100%; max-width: 720px; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 28px; margin: 0 auto; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .full { grid-column: span 2; }
      .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
      .input { width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; }
      .btns { display: flex; gap: 10px; margin-top: 14px; }
      .btn { border: none; padding: 10px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; }
      .save { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; }
      .edit { background: #e5e7eb; }
      .danger { background: #ef4444; color: #fff; }
      .avatar { width: 84px; height: 84px; border-radius: 999px; object-fit: cover; border: 2px solid #e5e7eb; }
      `}</style>
      <div className="profile-card">
        <h2 className="auth-title" style={{ marginBottom: 6 }}>Profile</h2>
        {error && <p className="auth-error">{error}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <img className="avatar" src={profile.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name || profile.email)} alt="avatar" />
          <label className="btn edit">
            <input style={{ display: 'none' }} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])} />
            Change avatar
          </label>
        </div>

        <form onSubmit={onSave} className="row">
          <div>
            <div className="label">Name</div>
            <input className="input" disabled={!editing} value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <div className="label">Email</div>
            <input className="input" type="email" disabled={!editing} value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div className="full">
            <div className="label">Academic details</div>
            <input className="input" disabled={!editing} value={profile.academic_details || ""} onChange={(e) => setProfile({ ...profile, academic_details: e.target.value })} />
          </div>
          <div className="btns full">
            {!editing ? (
              <>
                <button type="button" className="btn edit" onClick={() => setEditing(true)}>Edit</button>
                <button type="button" className="btn danger" onClick={onDelete}>Delete account</button>
              </>
            ) : (
              <>
                <button disabled={saving} className="btn save" type="submit">{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="btn edit" onClick={() => setEditing(false)}>Cancel</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}


