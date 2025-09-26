// client/src/components/ImageDetect.tsx
import { useState } from "react";
import axios from "axios";

export default function ImageDetect() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await toBase64(file);
      const { data } = await axios.post("/api/detect", { imageBase64: base64 });
      setResult(data);
    } catch (err: any) {
      console.error("Upload error:", err.message);
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">🌱 Crop Disease Detection</h2>

      {/* ✅ Accessible label + id/name */}
      <label
        htmlFor="upload-image"
        className="block text-sm font-medium text-gray-700"
      >
        Upload an image
      </label>
      <input
        id="upload-image"
        name="upload-image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-1"
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-64 mt-2 rounded shadow border"
        />
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Detecting..." : "Run Detection"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
