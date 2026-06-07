import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function generateRoomId() {
  const seg = () => Math.random().toString(36).slice(2, 6);
  return `${seg()}-${seg()}-${seg()}`;
}

function extractRoomId(input) {
  try {
    const url = new URL(input);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || input.trim();
  } catch {
    return input.trim();
  }
}

const DEFAULT_RECENT = [
  { id: "team-standup-2025", name: "Team Standup", time: "Today, 9:00 AM", participants: 5 },
  { id: "design-review-xyz", name: "Design Review", time: "Yesterday, 3:30 PM", participants: 3 },
  { id: "client-call-abc", name: "Client Call", time: "Mon, 2:00 PM", participants: 2 },
];

export default function Dashboard() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [joinLink, setJoinLink] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copying, setCopying] = useState(false);
  const [newRoomId] = useState(() => generateRoomId());
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ title: "", date: "" });
  const [scheduledLink, setScheduledLink] = useState("");

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsData, setSettingsData] = useState({ name: user?.name || "" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const [recentMeetings, setRecentMeetings] = useState(() => {
    const saved = localStorage.getItem("recentMeetings");
    if (saved) return JSON.parse(saved);
    localStorage.setItem("recentMeetings", JSON.stringify(DEFAULT_RECENT));
    return DEFAULT_RECENT;
  });

  function handleNewMeeting() {
    navigate(`/room/${newRoomId}`);
  }

  function handleOpenSettings() {
    setSettingsData({ name: user?.name || "" });
    setSettingsError("");
    setShowSettingsModal(true);
  }

  function handleCloseSettings() {
    setShowSettingsModal(false);
  }

  async function handleSaveSettings() {
    if (!settingsData.name.trim()) {
      setSettingsError("Name cannot be empty.");
      return;
    }
    setSavingSettings(true);
    setSettingsError("");
    
    // If it's a demo user, skip backend update
    if (token === "demo-token") {
       updateUser({ ...user, name: settingsData.name });
       setSavingSettings(false);
       handleCloseSettings();
       return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}/api/auth/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: settingsData.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      
      updateUser(data);
      handleCloseSettings();
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  function handleOpenSchedule() {
    setShowScheduleModal(true);
    setScheduledLink(`${window.location.origin}/room/${generateRoomId()}`);
  }

  function handleCloseSchedule() {
    setShowScheduleModal(false);
    setScheduleData({ title: "", date: "" });
    setScheduledLink("");
  }

  async function handleSaveSchedule() {
    if (!scheduleData.title || !scheduleData.date) {
      alert("Please enter a title and date/time.");
      return;
    }
    
    // Add to recent meetings
    const d = new Date(scheduleData.date);
    const formattedTime = `${d.toLocaleDateString("en-US", { weekday: "short" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    const newMeeting = {
      id: extractRoomId(scheduledLink),
      name: scheduleData.title,
      time: formattedTime,
      participants: 0
    };
    
    const updatedMeetings = [newMeeting, ...recentMeetings].slice(0, 5); // Keep top 5
    setRecentMeetings(updatedMeetings);
    localStorage.setItem("recentMeetings", JSON.stringify(updatedMeetings));

    await navigator.clipboard.writeText(scheduledLink);
    alert("Meeting scheduled and link copied to clipboard!\n" + scheduledLink);
    handleCloseSchedule();
  }

  function handleJoin(e) {
    e.preventDefault();
    setJoinError("");
    const roomId = extractRoomId(joinLink);
    if (!roomId) {
      setJoinError("Please enter a valid meeting link or ID");
      return;
    }
    navigate(`/room/${roomId}`);
  }

  async function copyLink(roomId) {
    const link = `${window.location.origin}/room/${roomId}`;
    await navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">nexmeet</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            <span>Meetings</span>
          </button>
          <button className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Contacts</span>
          </button>
          <button className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Messages</span>
          </button>
          <button className="nav-item" onClick={handleOpenSettings}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="btn-logout" onClick={logout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-greeting">Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="dash-date">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
        </header>

        {/* Action cards */}
        <div className="action-grid">
          <div className="action-card new-meeting" onClick={handleNewMeeting}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.893L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <h3>New meeting</h3>
            <p>Start an instant meeting</p>
            <div className="action-pill">+ Start now</div>
          </div>

          <div className="action-card schedule-card" onClick={handleOpenSchedule}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>Schedule</h3>
            <p>Plan a future meeting</p>
            <div className="action-pill">+ Schedule</div>
          </div>

          <div className="action-card share-card" onClick={() => copyLink(newRoomId)}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <h3>{copying ? "Copied!" : "Share link"}</h3>
            <p>Invite others instantly</p>
            <div className="action-pill">{copying ? "✓ Done" : "Copy link"}</div>
          </div>
        </div>

        {/* Join meeting */}
        <section className="join-section">
          <h2 className="section-title">Join a meeting</h2>
          <form onSubmit={handleJoin} className="join-form">
            <div className="join-input-wrap">
              <svg className="join-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <input
                type="text"
                className="join-input"
                placeholder="Paste meeting link or enter room ID  (e.g. abcd-efgh-ijkl)"
                value={joinLink}
                onChange={(e) => { setJoinLink(e.target.value); setJoinError(""); }}
              />
            </div>
            {joinError && <p className="join-error">{joinError}</p>}
            <button type="submit" className="btn-join">Join meeting</button>
          </form>
        </section>

        {/* Recent meetings */}
        <section className="recent-section">
          <h2 className="section-title">Recent meetings</h2>
          <div className="recent-list">
            {recentMeetings.map((m) => (
              <div key={m.id} className="recent-item">
                <div className="recent-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.893L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                </div>
                <div className="recent-info">
                  <span className="recent-name">{m.name}</span>
                  <span className="recent-time">{m.time} · {m.participants} participants</span>
                </div>
                <div className="recent-actions">
                  <button className="btn-sm" onClick={() => copyLink(m.id)}>Copy link</button>
                  <button className="btn-sm btn-sm-primary" onClick={() => navigate(`/room/${m.id}`)}>Rejoin</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={handleCloseSchedule}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Schedule Meeting</h2>
              <button className="modal-close" onClick={handleCloseSchedule}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="field-group">
                <label className="field-label">Meeting Title</label>
                <input 
                  className="field-input" 
                  placeholder="e.g. Project Sync"
                  value={scheduleData.title}
                  onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Date & Time</label>
                <input 
                  type="datetime-local"
                  className="field-input" 
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Meeting Link (auto-generated)</label>
                <input 
                  className="field-input" 
                  value={scheduledLink}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" style={{ width: 'auto' }} onClick={handleCloseSchedule}>Cancel</button>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={handleSaveSchedule}>Save & Copy Link</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={handleCloseSettings}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Settings</h2>
              <button className="modal-close" onClick={handleCloseSettings}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {settingsError && <div className="auth-error">{settingsError}</div>}
              <div className="field-group">
                <label className="field-label">Display Name</label>
                <input 
                  className="field-input" 
                  placeholder="Your Name"
                  value={settingsData.name}
                  onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" style={{ width: 'auto' }} onClick={handleCloseSettings} disabled={savingSettings}>Cancel</button>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={handleSaveSettings} disabled={savingSettings}>
                {savingSettings ? <span className="spinner" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
