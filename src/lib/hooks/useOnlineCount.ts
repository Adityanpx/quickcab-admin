import { useEffect, useState, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { tokenStorage } from "@/lib/api/client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.quickcabservices.com";

/**
 * Live "X online" count for the admin Dashboard. Starts from the REST
 * dashboard-stats value (so it's never blank/0 on first paint), then
 * switches to live push updates the moment the socket connects and the
 * server sends a fresher count — from then on it updates in real time as
 * partners/providers connect and disconnect, no polling needed.
 */
export function useOnlineCount(initialCount: number | undefined) {
  const [count, setCount] = useState<number | undefined>(initialCount);
  const [isLive, setIsLive] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Keep showing the latest REST value until the socket has actually
  // delivered its first live update.
  useEffect(() => {
    if (!isLive && initialCount !== undefined) {
      setCount(initialCount);
    }
  }, [initialCount, isLive]);

  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token, isAdmin: true },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on("presence:count", (payload: { count: number }) => {
      setCount(payload.count);
      setIsLive(true);
    });

    socket.on("connect", () => {
      // Reconnect (e.g. after a tab was backgrounded) — presence:count will
      // arrive again shortly since the server sends it once on every admin
      // connect; nothing else to do here beyond letting it re-establish.
    });

    socket.on("disconnect", () => {
      setIsLive(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { count, isLive };
}
