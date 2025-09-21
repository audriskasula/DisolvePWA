  import { useState, useRef } from "react";

  // Konst UUID
  export const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  export const CHAR_CMD_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // kirim data
  export const CHAR_NOTIFY_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // terima data

  // Define prop types
  interface BLEProps {
    onData?: (msg: string) => void;
    onReady?: (sendFn: (msg: string) => Promise<void>) => void;
  }

  export default function BLE({ onData, onReady }: BLEProps) {
    const [data, setData] = useState<string>("No data yet");
    const [isConnected, setIsConnected] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const cmdCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

    const connectBLE = async () => {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ namePrefix: "Dissolve" }],
          optionalServices: [SERVICE_UUID],
        });

        const server = await device.gatt.connect();
        setIsConnected(true);

        const service = await server.getPrimaryService(SERVICE_UUID);

        // CMD characteristic untuk kirim data
        cmdCharRef.current = await service.getCharacteristic(CHAR_CMD_UUID);

        // Notify characteristic untuk terima data NFC
        const notifyCharacteristic = await service.getCharacteristic(CHAR_NOTIFY_UUID);
        await notifyCharacteristic.startNotifications();

        notifyCharacteristic.addEventListener(
          "characteristicvaluechanged",
          (event: any) => {
            const value = event.target.value;
            const decoder = new TextDecoder("utf-8");
            const decoded = decoder.decode(value);

            // update state lokal
            setData(decoded);

            // lempar ke parent (Level1.tsx)
            if (onData) onData(decoded);
          }
        );
        if (onReady) {
          onReady(sendData);
        }
      } catch (err) {
        console.error("BLE error:", err);
        setErrorMsg("Gagal koneksi ke ESP32");
      }
    };

    const sendData = async (msg: string) => {
      try {
        if (!cmdCharRef.current) {
          setErrorMsg("Belum siap mengirim data");
          return;
        }
        const encoder = new TextEncoder();
        await cmdCharRef.current.writeValue(encoder.encode(msg));
        console.log("✅ Data terkirim:", msg);
      } catch (err) {
        console.error("❌ Gagal kirim data:", err);
        setErrorMsg("Gagal kirim data ke ESP32");
      }
    };

    return (
      <div>
        <button onClick={connectBLE}>Connect ESP32</button>
        <p>Status: {isConnected ? "Connected ✅" : "Disconnected ❌"}</p>
        <p>Data dari ESP32: {data}</p>
        {errorMsg && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
      </div>
    );
  }
