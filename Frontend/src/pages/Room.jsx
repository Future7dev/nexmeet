import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebRTC } from "../hooks/useWebRTC";
import VideoTile from "../components/VideoTile";
import ChatPanel from "../components/ChatPanel";

function pad2(n) { return n.toString().padStart(2, "0"); }

export default function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasJoined, setHasJoined] = useState(false);

  const {
    peers, localStream, screenStream,
    mediaState, remoteMediaStates,
    toggleTrack, shareScreen, startMedia,
  } = useWebRTC(roomId, user, hasJoined);

  const [showChat, setShowChat] = useState(false);
  const [unread, setUnread] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const timerRef = useRef(null);

  // Start local camera
  useEffect(() => {
    startMedia().catch(console.warn);
  }, []);

  // Start timer when joined
  useEffect(() => {
    if (hasJoined) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [hasJoined]);

  // Unread count when chat is closed
  useEffect(() => {
    if (!showChat) {
      const handler = () => setUnread((u) => u + 1);
      // listen to a custom event from ChatPanel parent sync
      window.addEventListener("new-chat-message", handler);
      return () => window.removeEventListener("new-chat-message", handler);
    } else {
      setUnread(0);
    }
  }, [showChat]);

  function handleLeave() {
    localStream?.getTracks().forEach((t) => t.stop());
    navigate("/");
  }

  async function copyRoomLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const peerEntries = Object.entries(peers);
  const totalParticipants = 1 + peerEntries.length;

  const hh = Math.floor(elapsed / 3600);
  const mm = Math.floor((elapsed % 3600) / 60);
  const ss = elapsed % 60;
  const timer = hh > 0 ? `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}` : `${pad2(mm)}:${pad2(ss)}`;

  if (!hasJoined) {
    return (
      <div className="prejoin-page">
        <div className="prejoin-box">
          <h2 className="prejoin-title">Ready to join?</h2>
          <div className="prejoin-video-wrapper">
            <VideoTile
              stream={localStream}
              name={user?.name}
              muted
              isLocal
              videoOff={!mediaState.video}
              audioOff={!mediaState.audio}
            />
            <div className="prejoin-controls-overlay">
              <button
                className={`ctrl-btn ${!mediaState.audio ? "ctrl-off" : ""}`}
                onClick={() => toggleTrack("audio")}
                title={mediaState.audio ? "Mute" : "Unmute"}
              >
                {mediaState.audio ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                    <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
              <button
                className={`ctrl-btn ${!mediaState.video ? "ctrl-off" : ""}`}
                onClick={() => toggleTrack("video")}
                title={mediaState.video ? "Stop video" : "Start video"}
              >
                {mediaState.video ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.893L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="prejoin-actions">
            <button className="btn-join-now" onClick={() => setHasJoined(true)}>Join Now</button>
            <button className="btn-cancel" onClick={() => navigate("/")}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      {/* Top bar */}
      <div className="room-topbar">
        <div className="room-logo">
          <span className="logo-icon small">◈</span>
          <span className="logo-text">nexmeet</span>
        </div>
        <div className="room-meta">
          <span className="room-timer">{timer}</span>
          <span className="room-id-badge" onClick={copyRoomLink} title="Click to copy link">
            {copied ? "✓ Copied!" : roomId}
          </span>
        </div>
        <div className="room-topbar-actions">
          <button
            className={`topbar-btn ${showParticipants ? "active" : ""}`}
            onClick={() => setShowParticipants((s) => !s)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{totalParticipants}</span>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="room-content">
        {/* Participants panel */}
        {showParticipants && (
          <div className="participants-panel">
            <div className="panel-header">
              <span>Participants ({totalParticipants})</span>
              <button className="chat-close" onClick={() => setShowParticipants(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="participants-list">
              <div className="participant-item">
                <div className="p-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <span>{user?.name} (You)</span>
                <div className="p-status">
                  {!mediaState.audio && <span className="p-badge muted">Muted</span>}
                  {!mediaState.video && <span className="p-badge cam-off">Cam off</span>}
                </div>
              </div>
              {peerEntries.map(([sid, peer]) => (
                <div key={sid} className="participant-item">
                  <div className="p-avatar">{peer.name?.charAt(0).toUpperCase() || "?"}</div>
                  <span>{peer.name || "Guest"}</span>
                  <div className="p-status">
                    {remoteMediaStates[sid]?.audio === false && <span className="p-badge muted">Muted</span>}
                    {remoteMediaStates[sid]?.video === false && <span className="p-badge cam-off">Cam off</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video grid */}
        <div className={`video-grid-area ${showChat || showParticipants ? "shrink" : ""}`}>
          <div className={`video-grid count-${Math.min(totalParticipants, 9)}`}>
            {/* Local tile */}
            <VideoTile
              stream={screenStream || localStream}
              name={user?.name}
              muted
              isLocal
              videoOff={!mediaState.video && !screenStream}
              audioOff={!mediaState.audio}
            />
            {/* Remote tiles */}
            {peerEntries.map(([sid, peer]) => (
              <VideoTile
                key={sid}
                stream={peer.stream}
                name={peer.name}
                videoOff={remoteMediaStates[sid]?.video === false}
                audioOff={remoteMediaStates[sid]?.audio === false}
              />
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <ChatPanel
          roomId={roomId}
          user={user}
          onClose={() => { setShowChat(false); }}
          show={showChat}
        />
      </div>

      {/* Controls bar */}
      <div className="controls-bar">
        <div className="controls-left">
          <span className="ctrl-info">
            {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="controls-center">
          {/* Mic */}
          <button
            className={`ctrl-btn ${!mediaState.audio ? "ctrl-off" : ""}`}
            onClick={() => toggleTrack("audio")}
            title={mediaState.audio ? "Mute" : "Unmute"}
          >
            {mediaState.audio ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
            <span>{mediaState.audio ? "Mute" : "Unmute"}</span>
          </button>

          {/* Camera */}
          <button
            className={`ctrl-btn ${!mediaState.video ? "ctrl-off" : ""}`}
            onClick={() => toggleTrack("video")}
            title={mediaState.video ? "Stop video" : "Start video"}
          >
            {mediaState.video ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.893L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            )}
            <span>{mediaState.video ? "Stop video" : "Start video"}</span>
          </button>

          {/* Screen share */}
          <button
            className={`ctrl-btn ${screenStream ? "ctrl-active" : ""}`}
            onClick={shareScreen}
            title={screenStream ? "Stop sharing" : "Share screen"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <polyline points="8 21 12 17 16 21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>{screenStream ? "Stop share" : "Share screen"}</span>
          </button>

          {/* Chat */}
          <button
            className={`ctrl-btn ${showChat ? "ctrl-active" : ""}`}
            onClick={() => { setShowChat((s) => !s); setUnread(0); }}
          >
            <span className="ctrl-badge-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {unread > 0 && <span className="ctrl-badge">{unread}</span>}
            </span>
            <span>Chat</span>
          </button>

          {/* End call */}
          <button className="ctrl-btn ctrl-end" onClick={handleLeave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 17.29 7.76 15.19 6.12 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 5 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.18 8.89a12 12 0 0 0-.5.42"/>
              <line x1="23" y1="1" x2="1" y2="23"/>
            </svg>
            <span>Leave</span>
          </button>
        </div>

        <div className="controls-right">
          <button className="ctrl-btn-sm" onClick={copyRoomLink} title="Copy invite link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {copied ? "Copied!" : "Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
