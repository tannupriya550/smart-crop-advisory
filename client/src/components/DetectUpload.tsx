import React, { useState } from "react";
import axios from "axios";

export default function DetectUpload() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    // Use FormData for file upload
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("/api/detect/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        console.error("Upload error:", err);
        setResult({ error: err.message });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🌱 Crop Disease Detection</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {loading && <p>Detecting...</p>}
      {result && (
        <pre style={{ background: "#eee", padding: "1rem" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
