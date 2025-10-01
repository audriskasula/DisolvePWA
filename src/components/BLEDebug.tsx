// BLEDebug.tsx

import { useEffect, useState } from "react";
import { useBLE } from "./BLEContext";

export default function BLEDebug() {
  const { lastMessage, send, subscribe, isConnected } = useBLE();
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const unsub = subscribe((m) => setLog((s) => [new Date().toLocaleTimeString() + " <- " + m, ...s].slice(0, 200)));
    return unsub;
  }, [subscribe]);

  const onSend = async () => {
    if (!input) return;
    try {
      await send(input);
      setLog((s) => [new Date().toLocaleTimeString() + " -> " + input, ...s].slice(0, 200));
      setInput("");
    } catch (e) {
      setLog((s) => ["ERR send: " + String(e), ...s].slice(0, 200));
    }
  };

  return (
    <div style={{ marginTop: 12, border: "1px solid #ddd", padding: 10 }}>
      <h4>BLE Debug</h4>
      <div>Connected: {isConnected ? "✅" : "❌"}</div>
      <div style={{ marginTop: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message to device" />
        <button onClick={onSend} style={{ marginLeft: 8 }}>
          Send
        </button>
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>Last msg:</strong> {lastMessage}
      </div>
      <div style={{ marginTop: 8, maxHeight: 200, overflow: "auto", background: "#fafafa", padding: 8 }}>
        {log.map((l, i) => (
          <div key={i} style={{ fontSize: 12 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
