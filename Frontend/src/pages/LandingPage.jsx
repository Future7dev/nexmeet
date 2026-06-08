import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Lightfall from "./LightFall";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-deep: #0A29FF;
    --blue-light: #A6C8FF;
    --violet: #5227FF;
    --pink: #FF9FFC;
    --white: #FFFFFF;
    --white-dim: rgba(255,255,255,0.7);
    --white-dimmer: rgba(255,255,255,0.35);
    --white-ghost: rgba(255,255,255,0.08);
    --glass: rgba(255,255,255,0.06);
    --glass-border: rgba(255,255,255,0.15);
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #050818;
    color: #fff;
    overflow-x: hidden;
    min-height: 100vh;
  }

  .nm-page {
    position: relative;
    z-index: 1;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
  }

  /* NAV */
  .nm-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 56px;
    background: rgba(5,8,24,0.35);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--glass-border);
  }

  .nm-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 22px;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
  }

  .nm-logo-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--pink);
    box-shadow: 0 0 10px var(--pink);
    animation: nm-pulse 2s ease-in-out infinite;
  }

  @keyframes nm-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .nm-nav-links {
    display: flex;
    align-items: center;
    gap: 36px;
    list-style: none;
  }

  .nm-nav-links a {
    color: var(--white-dim);
    text-decoration: none;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.2px;
    transition: color 0.2s;
  }

  .nm-nav-links a:hover { color: #fff; }

  .nm-nav-cta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nm-btn-ghost {
    background: transparent;
    border: 1px solid var(--glass-border);
    color: #fff;
    padding: 9px 22px;
    border-radius: 100px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nm-btn-ghost:hover {
    border-color: rgba(255,255,255,0.4);
    background: var(--white-ghost);
  }

  .nm-btn-primary {
    background: #fff;
    color: #050818;
    border: none;
    padding: 10px 24px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nm-btn-primary:hover {
    background: var(--blue-light);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(166,200,255,0.3);
  }

  /* HERO */
  .nm-hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    position: relative;
  }

  .nm-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 100px;
    padding: 6px 16px 6px 8px;
    font-size: 12px;
    color: var(--white-dim);
    margin-bottom: 36px;
    backdrop-filter: blur(10px);
    animation: nm-fadeUp 0.8s ease both;
  }

  .nm-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #22ff88;
    box-shadow: 0 0 8px #22ff88;
  }

  .nm-hero h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(48px, 8vw, 100px);
    line-height: 1.0;
    letter-spacing: -3px;
    max-width: 900px;
    animation: nm-fadeUp 0.8s ease 0.1s both;
  }

  .nm-hero h1 .nm-accent {
    background: linear-gradient(135deg, var(--blue-light), var(--pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nm-hero-sub {
    font-size: 18px;
    line-height: 1.6;
    color: var(--white-dim);
    max-width: 520px;
    margin: 28px auto 0;
    font-weight: 300;
    animation: nm-fadeUp 0.8s ease 0.2s both;
  }

  .nm-hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 44px;
    animation: nm-fadeUp 0.8s ease 0.3s both;
  }

  .nm-btn-launch {
    background: linear-gradient(135deg, var(--blue-deep), var(--violet));
    color: white;
    border: none;
    padding: 14px 36px;
    border-radius: 100px;
    font-size: 16px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 0 40px rgba(82,39,255,0.5);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nm-btn-launch:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 0 60px rgba(82,39,255,0.7);
  }

  .nm-btn-launch svg { transition: transform 0.2s; }
  .nm-btn-launch:hover svg { transform: translateX(3px); }

  .nm-btn-watch {
    background: transparent;
    border: 1px solid var(--glass-border);
    color: var(--white-dim);
    padding: 14px 28px;
    border-radius: 100px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;
  }

  .nm-btn-watch:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.3);
  }

  .nm-play-icon {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--white-ghost);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* PREVIEW WINDOW */
  .nm-hero-preview {
    margin-top: 72px;
    width: 100%;
    max-width: 900px;
    animation: nm-fadeUp 0.9s ease 0.4s both;
  }

  .nm-preview-window {
    background: rgba(10,14,40,0.85);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 20px;
    backdrop-filter: blur(20px);
    box-shadow: 0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset;
    overflow: hidden;
  }

  .nm-preview-topbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .nm-tl { width: 10px; height: 10px; border-radius: 50%; }
  .nm-tl-red { background: #FF5F57; }
  .nm-tl-yellow { background: #FEBC2E; }
  .nm-tl-green { background: #28C840; }

  .nm-preview-url {
    margin-left: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 4px 14px;
    font-size: 12px;
    color: var(--white-dimmer);
    font-family: monospace;
  }

  .nm-video-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    aspect-ratio: 16/7;
  }

  .nm-video-tile {
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    padding: 10px;
  }

  .nm-video-tile.nm-large { grid-column: span 2; }

  .nm-avatar-blob {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nm-avatar-circle {
    width: 56px; height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: white;
  }

  .nm-a1 { background: linear-gradient(135deg, #0A29FF, #5227FF); }
  .nm-a2 { background: linear-gradient(135deg, #FF9FFC, #5227FF); }
  .nm-a3 { background: linear-gradient(135deg, #A6C8FF, #0A29FF); }

  .nm-tile-name {
    font-size: 11px;
    color: var(--white-dim);
    background: rgba(0,0,0,0.4);
    padding: 3px 8px;
    border-radius: 4px;
    position: relative;
    z-index: 1;
  }

  .nm-tile-live {
    position: absolute;
    top: 10px; right: 10px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #22ff88;
    box-shadow: 0 0 8px #22ff88;
    animation: nm-pulse 1.5s ease infinite;
  }

  .nm-preview-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;
  }

  .nm-ctrl-btn {
    width: 42px; height: 42px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--white-dim);
  }

  .nm-ctrl-btn:hover { background: rgba(255,255,255,0.12); color: white; }

  .nm-ctrl-end {
    background: #FF3B3B !important;
    border-color: #FF3B3B !important;
    color: white !important;
    padding: 0 20px !important;
    border-radius: 100px !important;
    width: auto !important;
    font-size: 13px;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
  }

  .nm-ctrl-end:hover { background: #e02f2f !important; }

  /* FEATURES */
  .nm-features {
    padding: 120px 56px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .nm-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--blue-light);
    margin-bottom: 16px;
  }

  .nm-section-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: clamp(32px, 4vw, 52px);
    line-height: 1.1;
    letter-spacing: -1.5px;
    max-width: 560px;
  }

  .nm-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 56px;
  }

  .nm-feature-card {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    cursor: default;
  }

  .nm-feature-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }

  .nm-feature-card:hover {
    border-color: rgba(255,255,255,0.25);
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }

  .nm-feature-card.nm-wide { grid-column: span 2; }

  .nm-feature-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 20px;
  }

  .nm-fi-blue { background: rgba(10,41,255,0.2); border: 1px solid rgba(10,41,255,0.3); }
  .nm-fi-pink { background: rgba(255,159,252,0.1); border: 1px solid rgba(255,159,252,0.2); }
  .nm-fi-violet { background: rgba(82,39,255,0.2); border: 1px solid rgba(82,39,255,0.3); }
  .nm-fi-teal { background: rgba(34,255,136,0.1); border: 1px solid rgba(34,255,136,0.2); }

  .nm-feature-card h3 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 10px;
    letter-spacing: -0.3px;
  }

  .nm-feature-card p {
    color: var(--white-dim);
    font-size: 14px;
    line-height: 1.7;
    font-weight: 300;
  }

  /* STATS */
  .nm-stats {
    padding: 0 56px 120px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .nm-stats-inner {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 56px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .nm-stats-inner::before {
    content: '';
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 300px; height: 120px;
    background: radial-gradient(ellipse, rgba(82,39,255,0.3), transparent);
    pointer-events: none;
  }

  .nm-stat-val {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 44px;
    letter-spacing: -2px;
    background: linear-gradient(135deg, white, var(--blue-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nm-stat-label {
    font-size: 13px;
    color: var(--white-dimmer);
    margin-top: 6px;
    font-weight: 300;
    letter-spacing: 0.3px;
  }

  /* CTA */
  .nm-cta-section {
    padding: 80px 56px 120px;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .nm-cta-section h2 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(36px, 5vw, 64px);
    letter-spacing: -2px;
    line-height: 1.05;
    margin-bottom: 20px;
  }

  .nm-cta-section p {
    color: var(--white-dim);
    font-size: 17px;
    font-weight: 300;
    line-height: 1.6;
    margin-bottom: 40px;
  }

  .nm-cta-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .nm-cta-accent {
    background: linear-gradient(135deg, var(--blue-light), var(--pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* FOOTER */
  .nm-footer {
    border-top: 1px solid var(--glass-border);
    padding: 32px 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--white-dimmer);
    font-size: 13px;
  }

  .nm-footer a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
  }

  .nm-footer a:hover { color: #fff; }

  .nm-footer-links {
    display: flex;
    gap: 24px;
  }

  /* ANIMATIONS */
  @keyframes nm-fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .nm-reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }

  .nm-reveal.nm-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* BACKGROUND */
  .nm-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
`;

// ── Icons ──
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
    <path d="M1 1L9 6L1 11V1Z" />
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const CamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const ScreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 16.29 7.62 14.48 6.46 12.32A19.79 19.79 0 0 1 3.39 3.68 2 2 0 0 1 5.41 1.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.4 9.41" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

// ── useReveal hook ──
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ── Sub-components ──
function Navbar() {
  return (
    <nav className="nm-nav">
      <div className="nm-logo">
        <div className="nm-logo-dot" />
        NexMeet
      </div>
      <ul className="nm-nav-links">
        <li><a href="#">Features</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Enterprise</a></li>
        <li><a href="#">Developers</a></li>
      </ul>
      <div className="nm-nav-cta">
        <Link to="/login" className="nm-btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>Sign in</Link>
        <Link to="/signup" className="nm-btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Get started free</Link>
      </div>
    </nav>
  );
}

function PreviewWindow() {
  return (
    <div className="nm-hero-preview">
      <div className="nm-preview-window">
        <div className="nm-preview-topbar">
          <div className="nm-tl nm-tl-red" />
          <div className="nm-tl nm-tl-yellow" />
          <div className="nm-tl nm-tl-green" />
          <div className="nm-preview-url">meet.nexmeet.io/x9k2-plxq</div>
        </div>
        <div className="nm-video-grid">
          <div className="nm-video-tile nm-large">
            <div className="nm-avatar-blob">
              <div className="nm-avatar-circle nm-a1">A</div>
            </div>
            <div className="nm-tile-live" />
            <div className="nm-tile-name">Alex P. (you)</div>
          </div>
          <div className="nm-video-tile">
            <div className="nm-avatar-blob">
              <div className="nm-avatar-circle nm-a2">S</div>
            </div>
            <div className="nm-tile-name">Sarah M.</div>
          </div>
          <div className="nm-video-tile">
            <div className="nm-avatar-blob">
              <div className="nm-avatar-circle nm-a3">R</div>
            </div>
            <div className="nm-tile-name">Raj K.</div>
          </div>
          <div className="nm-video-tile">
            <div className="nm-avatar-blob" style={{ fontSize: 24, color: "#fff" }}>+4</div>
            <div className="nm-tile-name">more</div>
          </div>
        </div>
        <div className="nm-preview-controls">
          <button className="nm-ctrl-btn" title="Mute"><MicIcon /></button>
          <button className="nm-ctrl-btn" title="Camera"><CamIcon /></button>
          <button className="nm-ctrl-btn" title="Screen share"><ScreenIcon /></button>
          <button className="nm-ctrl-btn" title="Chat"><ChatIcon /></button>
          <button className="nm-ctrl-btn nm-ctrl-end" style={{ display: "flex", alignItems: "center" }}>
            <PhoneOffIcon /> End call
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="nm-hero">
      <div className="nm-hero-badge">
        <div className="nm-badge-dot" />
        Now with AI-powered meeting summaries
      </div>
      <h1>Meet beyond<br /><span className="nm-accent">boundaries.</span></h1>
      <p className="nm-hero-sub">
        Crystal-clear video, zero latency, and collaboration tools that actually work.
        NexMeet is the conferencing platform built for what&rsquo;s next.
      </p>
      <div className="nm-hero-actions">
        <Link to="/login" className="nm-btn-launch" style={{ textDecoration: 'none' }}>
          Start a meeting <ArrowRightIcon />
        </Link>
        <button className="nm-btn-watch">
          <div className="nm-play-icon"><PlayIcon /></div>
          Watch demo
        </button>
      </div>
      <PreviewWindow />
    </section>
  );
}

const FEATURES = [
  {
    icon: "🎥", iconClass: "nm-fi-blue", wide: false,
    title: "HD Video & Audio",
    desc: "Crystal-clear 1080p video with noise cancellation and adaptive bitrate streaming that adjusts to your connection.",
  },
  {
    icon: "⚡", iconClass: "nm-fi-pink", wide: false,
    title: "Ultra-Low Latency",
    desc: "Sub-50ms latency globally with our edge network spanning 40+ regions. Real conversations, not buffering.",
  },
  {
    icon: "🤖", iconClass: "nm-fi-violet", wide: false,
    title: "AI Meeting Assistant",
    desc: "Automatic transcription, smart summaries, action items extraction, and follow-up drafting — all powered by AI.",
  },
  {
    icon: "🔒", iconClass: "nm-fi-teal", wide: false,
    title: "End-to-End Encrypted",
    desc: "Your conversations stay private with AES-256 encryption. Zero-knowledge architecture means even we can't see your calls.",
  },
  {
    icon: "🖥️", iconClass: "nm-fi-blue", wide: true,
    title: "Collaborative Workspace",
    desc: "Share screens, annotate together, work on documents in real time, and use the built-in whiteboard — all without leaving the call.",
  },
];

function FeaturesSection() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className={`nm-features nm-reveal${visible ? " nm-visible" : ""}`}>
      <div className="nm-section-label">Everything you need</div>
      <h2 className="nm-section-title">Built for teams that move fast</h2>
      <div className="nm-features-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className={`nm-feature-card${f.wide ? " nm-wide" : ""}`}>
            <div className={`nm-feature-icon ${f.iconClass}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STATS = [
  { val: "98.9%", label: "Uptime SLA" },
  { val: "40ms",  label: "Avg. latency" },
  { val: "2M+",   label: "Active users" },
  { val: "150+",  label: "Countries" },
];

function StatsSection() {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`nm-stats nm-reveal${visible ? " nm-visible" : ""}`}>
      <div className="nm-stats-inner">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="nm-stat-val">{s.val}</div>
            <div className="nm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaSection() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className={`nm-cta-section nm-reveal${visible ? " nm-visible" : ""}`}>
      <h2>
        Ready to <span className="nm-cta-accent">NexMeet?</span>
      </h2>
      <p>
        Join millions of teams already meeting smarter.
        Free forever for individuals, no credit card required.
      </p>
      <div className="nm-cta-buttons">
        <Link to="/signup" className="nm-btn-launch" style={{ textDecoration: 'none' }}>Start for free →</Link>
        <button className="nm-btn-ghost">Talk to sales</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="nm-footer">
      <div className="nm-logo" style={{ fontSize: 16 }}>
        <div className="nm-logo-dot" />
        NexMeet
      </div>
      <div>© 2026 NexMeet, Inc. All rights reserved.</div>
      <div className="nm-footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
      </div>
    </footer>
  );
}

// ── Main Component ──
export default function LandingPage() {
  return (
    <div style={{ height: '100%', width: '100%', overflowY: 'auto', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
      {/* Inject styles */}
      <style>{styles}</style>

      {/* Lightfall Background */}
      <div className="nm-bg">
        <Lightfall
          colors={["#A6C8FF", "#5227FF", "#FF9FFC"]}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction
          mouseStrength={0.5}
          mouseRadius={1}
          color1="#A6C8FF"
          color2="#5227FF"
          color3="#FF9FFC"
        />
      </div>

      {/* Page Content */}
      <div className="nm-page">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}
