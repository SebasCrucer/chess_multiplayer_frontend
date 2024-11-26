import { useEffect, useRef, useState, useCallback } from "react";

type WebSocketStatus = "connecting" | "open" | "closing" | "closed" | "error";

interface UseConnectionOptions {
  url?: string;
  onMessage?: (message: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseConnectionReturn {
  status: WebSocketStatus;
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<string> | null;
  error: Event | null;
}

export function useConnection(
  options: UseConnectionOptions
): UseConnectionReturn {
  const {
    url = "ws://localhost:8080",
    onMessage,
    onOpen,
    protocols,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>("connecting");
  const [lastMessage, setLastMessage] = useState<MessageEvent<string> | null>(
    null
  );
  const [error, setError] = useState<Event | null>(null);

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const shouldReconnectRef = useRef<boolean>(true);

  const sendMessage = useCallback((message: string) => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send(message);
    } else {
      console.warn(
        "WebSocket is not open. Ready state:",
        websocketRef.current?.readyState
      );
    }
  }, []);

  useEffect(() => {
    function connect() {
      setStatus("connecting");

      const ws = new WebSocket(url, protocols);

      ws.onopen = () => {
        setStatus("open");
        reconnectAttemptsRef.current = 0;
        console.log("WebSocket connected");
        onOpen && onOpen();
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        setLastMessage(event);
        onMessage && onMessage(event.data);
      };

      ws.onerror = (event: Event) => {
        setError(event);
        setStatus("error");
        console.error("WebSocket error:", event);
        options.onError && options.onError(event);
      };

      ws.onclose = (event: CloseEvent) => {
        setStatus("closed");
        console.log("WebSocket closed:", event.reason);
        options.onClose && options.onClose();

        if (
          shouldReconnectRef.current &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1;
          setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      websocketRef.current = ws;
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        websocketRef.current.close();
      }
    };
  }, [url, protocols, reconnectInterval, maxReconnectAttempts]);

  return {
    status,
    sendMessage,
    lastMessage,
    error,
  };
}
