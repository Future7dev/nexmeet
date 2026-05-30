import { useRef, useState, useEffect, useCallback } from "react";
import { socket } from "../pages/socket";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC(roomId, user) {
  const [peers, setPeers] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [mediaState, setMediaState] = useState({ video: true, audio: true });
  const [remoteMediaStates, setRemoteMediaStates] = useState({});

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});

  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Media error:", err);
      // Try audio only fallback
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      } catch {
        return null;
      }
    }
  }, []);

  const createPeerConnection = useCallback((targetSocketId, targetName) => {
    if (peerConnections.current[targetSocketId]) return peerConnections.current[targetSocketId];

    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    pc.ontrack = ({ streams }) => {
      setPeers((prev) => ({
        ...prev,
        [targetSocketId]: { ...prev[targetSocketId], stream: streams[0], name: targetName },
      }));
    };

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("ice-candidate", { target: targetSocketId, candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setPeers((prev) => {
          const copy = { ...prev };
          delete copy[targetSocketId];
          return copy;
        });
        delete peerConnections.current[targetSocketId];
      }
    };

    peerConnections.current[targetSocketId] = pc;

    // Drain any buffered candidates
    if (pendingCandidates.current[targetSocketId]) {
      pendingCandidates.current[targetSocketId].forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
      delete pendingCandidates.current[targetSocketId];
    }

    return pc;
  }, []);

  const makeOffer = useCallback(async (targetSocketId, targetName) => {
    const pc = createPeerConnection(targetSocketId, targetName);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { target: targetSocketId, sdp: pc.localDescription, name: user?.name });
  }, [createPeerConnection, user]);

  useEffect(() => {
    if (!roomId || !user) return;

    socket.connect();
    socket.emit("join-room", { roomId, userId: user._id || user.id, userName: user.name });

    socket.on("room-users", (users) => {
      users.forEach(({ socketId, userName }) => {
        setPeers((prev) => ({ ...prev, [socketId]: { name: userName, stream: null } }));
        makeOffer(socketId, userName);
      });
    });

    socket.on("user-joined", ({ socketId, userName }) => {
      setPeers((prev) => ({ ...prev, [socketId]: { name: userName, stream: null } }));
    });

    socket.on("offer", async ({ sdp, from, name: senderName }) => {
      const pc = createPeerConnection(from, senderName);
      setPeers((prev) => ({ ...prev, [from]: { ...prev[from], name: senderName } }));
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { target: from, sdp: pc.localDescription });
    });

    socket.on("answer", async ({ sdp, from }) => {
      const pc = peerConnections.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", ({ candidate, from }) => {
      const pc = peerConnections.current[from];
      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!pendingCandidates.current[from]) pendingCandidates.current[from] = [];
        pendingCandidates.current[from].push(candidate);
      }
    });

    socket.on("user-left", ({ socketId }) => {
      peerConnections.current[socketId]?.close();
      delete peerConnections.current[socketId];
      setPeers((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    socket.on("toggle-media", ({ socketId, kind, enabled }) => {
      setRemoteMediaStates((prev) => ({
        ...prev,
        [socketId]: { ...prev[socketId], [kind]: enabled },
      }));
    });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.removeAllListeners();
      socket.disconnect();
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [roomId, user, createPeerConnection, makeOffer]);

  const toggleTrack = useCallback((kind) => {
    const tracks = localStreamRef.current?.getTracks().filter((t) => t.kind === kind);
    if (!tracks) return;
    const newEnabled = !tracks[0]?.enabled;
    tracks.forEach((t) => (t.enabled = newEnabled));
    setMediaState((prev) => ({ ...prev, [kind]: newEnabled }));
    socket.emit("toggle-media", { kind, enabled: newEnabled });
  }, []);

  const shareScreen = useCallback(async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      // Restore camera
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        });
      }
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(display);
      const screenTrack = display.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });
      screenTrack.onended = () => shareScreen();
    } catch {}
  }, [screenStream]);

  return {
    peers,
    localStream,
    screenStream,
    mediaState,
    remoteMediaStates,
    toggleTrack,
    shareScreen,
    startMedia,
  };
}
