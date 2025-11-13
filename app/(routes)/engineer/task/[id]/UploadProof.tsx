import React, { useRef, useState } from "react";

type UploadProofProps = {
  onSuccess: (base64: string, file: File) => void;
};

export default function UploadProof({ onSuccess }: UploadProofProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(false);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setUploading(false);
        setSuccess(true);
        onSuccess(reader.result as string, file);
      }, 1200); // fake upload delay
    };
    reader.onerror = () => {
      setUploading(false);
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  return (
    <div className="w-full flex flex-col items-center gap-2 py-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-zenith-accent-500 to-zenith-accent-600 text-white font-semibold shadow-lg hover:from-zenith-accent-600 hover:to-zenith-accent-700 transition-all disabled:opacity-60"
        aria-label="Upload proof photo"
      >
        {uploading ? "Uploading..." : "Upload Proof Photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      {success && (
        <div className="text-green-700 text-sm mt-1">Upload successful!</div>
      )}
      {/* <div className="text-xs text-slate-400 mt-1">
        Camera or device storage
      </div> */}
    </div>
  );
}
