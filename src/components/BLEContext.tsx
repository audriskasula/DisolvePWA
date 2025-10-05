import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const CHAR_CMD_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // write
export const CHAR_NOTIFY_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notify

type MsgHandler = (msg: string) => void;

interface BLEContextType {
  isConnected: boolean;
  lastMessage: string;
  connect: (opts?: { namePrefix?: string }) => Promise<void>;
  disconnect: () => void;
  send: (msg: string) => Promise<void>;
  subscribe: (handler: MsgHandler) => () => void;
}

const BLEContext = createContext<BLEContextType>({
  isConnected: false,
  lastMessage: "",
  connect: async () => {},
  disconnect: () => {},
  send: async () => {},
  subscribe: () => () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useBLE = () => useContext(BLEContext);

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const cmdCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const notifyCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const subscribersRef = useRef<Set<MsgHandler>>(new Set());

  // ✅ Kirim pesan ke semua subscriber
  const broadcast = (msg: string) => {
    for (const fn of subscribersRef.current) {
      try {
        fn(msg);
      } catch (err) {
        console.warn("Subscriber error:", err);
      }
    }
  };

  // ✅ Handle data masuk
  const handleNotify = (event: Event) => {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    if (!target?.value) return;

    const decoder = new TextDecoder();
    const text = decoder.decode(target.value).trim();
    console.log("📩 Diterima dari alat:", text);

    const msg = `${text}#${Date.now()}`;
    setLastMessage(msg);
    broadcast(text);
  };

  const send = async (msg: string) => {
    if (!msg.trim()) return;
    if (!cmdCharRef.current) {
      console.warn("⚠️ Belum ada koneksi BLE");
      return;
    }
    try {
      const enc = new TextEncoder().encode(msg);
      await cmdCharRef.current.writeValue(enc);
      console.log("📤 Dikirim ke alat:", msg);
    } catch (err) {
      console.error("❌ Gagal kirim:", err);
    }
  };

  const subscribe = (handler: MsgHandler) => {
    subscribersRef.current.add(handler);
    return () => subscribersRef.current.delete(handler);
  };

  const disconnect = () => {
    try {
      notifyCharRef.current?.removeEventListener(
        "characteristicvaluechanged",
        handleNotify
      );
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    } catch (err) {
      console.warn("❌ Gagal disconnect:", err);
    }
    deviceRef.current = null;
    cmdCharRef.current = null;
    notifyCharRef.current = null;
    setIsConnected(false);
    console.warn("🔌 BLE disconnected");
  };

  // ✅ Reconnect otomatis
  const reconnect = async (device: BluetoothDevice) => {
    try {
      if (!device.gatt) {
        console.error("GATT server tidak tersedia untuk reconnect");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const server = await device.gatt.connect();
      console.log("🔁 Berhasil reconnect ke:", device.name);
      const service = await server.getPrimaryService(SERVICE_UUID);
      const cmdChar = await service.getCharacteristic(CHAR_CMD_UUID);
      const notifyChar = await service.getCharacteristic(CHAR_NOTIFY_UUID);

      cmdCharRef.current = cmdChar;
      notifyCharRef.current = notifyChar;

      await notifyChar.startNotifications();
      notifyChar.addEventListener("characteristicvaluechanged", handleNotify);

      setIsConnected(true);
    } catch (err) {
      console.error("Gagal reconnect:", err);
      setTimeout(() => reconnect(device), 5000);
    }
  };

  // ✅ Connect BLE
  const connect = async () => {
    try {
      const options = {
        filters: [{ name: "Dissolve" }], // 🎯 hanya perangkat bernama Dissolve
        optionalServices: [SERVICE_UUID],
      } as RequestDeviceOptions;

      const device = await navigator.bluetooth.requestDevice(options);
      console.log("Perangkat ditemukan:", device.name);

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_UUID);
      const cmdChar = await service?.getCharacteristic(CHAR_CMD_UUID);
      const notifyChar = await service?.getCharacteristic(CHAR_NOTIFY_UUID);

      cmdCharRef.current = cmdChar!;
      notifyCharRef.current = notifyChar!;
      deviceRef.current = device;

      await notifyChar?.startNotifications();
      notifyChar?.addEventListener("characteristicvaluechanged", handleNotify);

      // Tambahkan event listener disconnect
      device.addEventListener("gattserverdisconnected", () => {
        console.warn("⚠️ BLE terputus otomatis");
        setIsConnected(false);
        reconnect(device); // 🔁 Coba reconnect otomatis
      });

      setIsConnected(true);
      console.log("✅ BLE berhasil terhubung ke:", device.name);
    } catch (err) {
      console.error("💥 Gagal konek BLE:", err);
      setIsConnected(false);
      throw err;
    }
  };

  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <BLEContext.Provider
      value={{ isConnected, lastMessage, connect, disconnect, send, subscribe }}
    >
      {children}
    </BLEContext.Provider>
  );
};
