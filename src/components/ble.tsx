import { useState } from "react";

// 🔗 UUID konstanta (bisa diimport dari file lain juga)
export const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const CHAR_CMD_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export const CHAR_NOTIFY_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

// 🎯 Komponen utama BLE
export default function BLE() {
  const [data, setData] = useState<string>("No data yet");
  const [isConnected, setIsConnected] = useState(false);

  const connectBLE = async () => {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ name: "ESP32_Puzzle_BLE" }],
        optionalServices: [SERVICE_UUID],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);

      // 👉 biasanya CMD dipakai untuk kirim data, Notify untuk terima data
      const notifyCharacteristic = await service.getCharacteristic(CHAR_NOTIFY_UUID);

      await notifyCharacteristic.startNotifications();
      notifyCharacteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder("utf-8");
        setData(decoder.decode(value));
      });

      setIsConnected(true);
    } catch (err) {
      console.error("BLE error:", err);
    }
  };

  return (
    <div>
      <button onClick={connectBLE}>Connect ESP32</button>
      <p>Status: {isConnected ? "Connected ✅" : "Disconnected ❌"}</p>
      <p>Data: {data}</p>
    </div>
  );
}
