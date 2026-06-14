"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { uploadProofImageAction } from "@/app/actions/payment";

interface ProofUploaderProps {
  paymentId: string;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

/**
 * ProofUploader Component
 * Task 15.1: File upload with validation, progress, preview, and success/error messages
 * Validates Requirements 10.1, 10.2, 10.3, 10.6
 */
export default function ProofUploader({
  paymentId,
  onSuccess,
  onError,
}: ProofUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Requirement 10.2: Validate file is an image format (JPEG, PNG, or WebP)
  // Requirement 10.3: Validate file size is less than 5 MB
  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      return "Hanya file JPEG, PNG, atau WebP yang diperbolehkan.";
    }

    if (file.size > maxSize) {
      return "Ukuran file harus kurang dari 5 MB.";
    }

    return null;
  };

  // Requirement 10.1: Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (onError) onError(validationError);
      return;
    }

    // Clear previous errors
    setErrorMessage(null);
    setUploadSuccess(false);

    // Set selected file
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Silakan pilih file terlebih dahulu.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("proof", selectedFile);

      // Simulate progress (since we don't have real-time upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Call server action
      const result = await uploadProofImageAction(paymentId, formData);

      clearInterval(progressInterval);

      if (result.success && result.data) {
        setUploadProgress(100);
        setUploadSuccess(true);
        if (onSuccess) onSuccess(result.data.proofImageUrl);
      } else {
        throw new Error(result.message || "Gagal mengunggah bukti pembayaran.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Terjadi kesalahan saat mengunggah.");
      if (onError) onError(error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(245, 240, 232, 0.05)",
        border: "1px solid rgba(245, 240, 232, 0.15)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header */}
      <div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--color-gold-light)",
            marginBottom: "4px",
            fontFamily: "var(--font-subheading)",
          }}
        >
          Upload Bukti Pembayaran
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(245, 240, 232, 0.5)",
          }}
        >
          Format: JPEG, PNG, atau WebP. Maksimal 5 MB
        </p>
      </div>

      {/* File input */}
      {!selectedFile && !uploadSuccess && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id={`proof-input-${paymentId}`}
          />
          <label
            htmlFor={`proof-input-${paymentId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "rgba(245, 240, 232, 0.08)",
              border: "2px dashed rgba(245, 240, 232, 0.25)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "rgba(245, 240, 232, 0.7)",
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245, 240, 232, 0.12)";
              e.currentTarget.style.borderColor = "var(--color-gold-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(245, 240, 232, 0.08)";
              e.currentTarget.style.borderColor = "rgba(245, 240, 232, 0.25)";
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Pilih File
          </label>
        </div>
      )}

      {/* Image preview */}
      {previewUrl && !uploadSuccess && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "300px",
              aspectRatio: "4/3",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgba(245, 240, 232, 0.2)",
            }}
          >
            <img
              src={previewUrl}
              alt="Preview bukti pembayaran"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(245, 240, 232, 0.6)",
            }}
          >
            {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(2)} KB)
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "rgba(245, 240, 232, 0.6)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Mengunggah...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${uploadProgress}%`,
                background: "var(--color-gold)",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Success message */}
      {uploadSuccess && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "var(--color-emerald-primary)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M22 11.08V12C21.99 17.52 17.52 22 12 22C6.48 22 2.01 17.52 2 12C1.99 6.48 6.48 2 12 2C13.61 2 15.14 2.37 16.53 3.04M22 4L12 14.01L9 11.01"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>
            Bukti pembayaran berhasil diunggah!
          </span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(220, 38, 38, 0.12)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#dc2626",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 8V12M12 16H12.01M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: "14px" }}>{errorMessage}</span>
        </div>
      )}

      {/* Action buttons */}
      {selectedFile && !uploadSuccess && (
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: uploading
                ? "rgba(245, 240, 232, 0.2)"
                : "var(--color-gold)",
              color: uploading ? "rgba(245, 240, 232, 0.4)" : "#050508",
              border: "none",
              borderRadius: "8px",
              cursor: uploading ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            {uploading ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    animation: "spin 1s linear infinite",
                  }}
                >
                  <path
                    d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Mengunggah...
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Upload Bukti
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={uploading}
            style={{
              padding: "12px 20px",
              background: "transparent",
              color: "rgba(245, 240, 232, 0.6)",
              border: "1px solid rgba(245, 240, 232, 0.2)",
              borderRadius: "8px",
              cursor: uploading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
          >
            Batal
          </button>
        </div>
      )}

      {/* Upload another button */}
      {uploadSuccess && (
        <button
          onClick={handleClear}
          style={{
            padding: "10px 16px",
            background: "rgba(245, 240, 232, 0.08)",
            color: "rgba(245, 240, 232, 0.7)",
            border: "1px solid rgba(245, 240, 232, 0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            transition: "all 0.2s ease",
          }}
        >
          Upload File Lain
        </button>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
