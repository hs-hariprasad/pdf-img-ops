import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

const Compression = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(""); // "image" or "pdf"
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [targetSize, setTargetSize] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const canvasRef = useRef(null);

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const processFile = (selectedFile) => {
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    const imageFormats = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];

    if (imageFormats.includes(fileExtension)) {
      setFileType("image");
      setOutputFormat(fileExtension === "jpg" ? "jpeg" : fileExtension);
    } else if (fileExtension === "pdf") {
      setFileType("pdf");
      setOutputFormat("pdf");
    } else {
      alert(
        "Unsupported file format. Please select an image (JPG, PNG, GIF, BMP, WEBP) or PDF file."
      );
      return;
    }

    setFile(selectedFile);
    setTargetSize("");
    setCompressionQuality(0.8);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const parseTargetSize = (input) => {
    if (!input || input.trim() === "") return 0;

    const cleanInput = input.trim().toLowerCase();
    const numberMatch = cleanInput.match(/^(\d+(?:\.\d+)?)/);

    if (!numberMatch) return 0;

    const value = parseFloat(numberMatch[1]);
    if (isNaN(value) || value <= 0) return 0;

    // Check for unit at the end
    if (cleanInput.includes("gb")) return value * 1024 * 1024 * 1024;
    if (cleanInput.includes("mb")) return value * 1024 * 1024;
    if (cleanInput.includes("kb")) return value * 1024;
    if (
      cleanInput.includes("b") &&
      !cleanInput.includes("kb") &&
      !cleanInput.includes("mb") &&
      !cleanInput.includes("gb")
    ) {
      return value;
    }

    // Default to KB if no unit specified and value is reasonable for KB
    if (value < 1000) return value * 1024;

    // Otherwise assume bytes
    return value;
  };

  const compressImage = async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const targetSizeBytes = parseTargetSize(targetSize);

        // If no target size specified, use quality-based compression
        if (targetSizeBytes === 0) {
          const result = await compressWithQuality(img, compressionQuality);
          resolve(result);
          return;
        }

        // Use binary search to find optimal settings for target size
        const result = await compressToTargetSize(img, targetSizeBytes);
        resolve(result);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const compressWithQuality = async (img, quality) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const mimeType =
        outputFormat === "jpeg"
          ? "image/jpeg"
          : outputFormat === "png"
          ? "image/png"
          : outputFormat === "webp"
          ? "image/webp"
          : `image/${outputFormat}`;

      canvas.toBlob(resolve, mimeType, quality);
    });
  };

  const compressToTargetSize = async (img, targetSizeBytes) => {
    const tolerance = 0.05; // 5% tolerance
    const maxIterations = 20;
    let iteration = 0;

    // Start with binary search bounds
    let minQuality = 0.1;
    let maxQuality = 1.0;
    let minScale = 0.1;
    let maxScale = 1.0;

    let bestBlob = null;
    let bestSize = Infinity;

    while (iteration < maxIterations) {
      iteration++;
      setProgress(25 + (iteration / maxIterations) * 50);

      // Try current settings
      const currentQuality = (minQuality + maxQuality) / 2;
      const currentScale = (minScale + maxScale) / 2;

      const blob = await compressWithSettings(
        img,
        currentQuality,
        currentScale
      );
      const currentSize = blob.size;

      // Update best result if this is closer to target
      if (
        Math.abs(currentSize - targetSizeBytes) <
        Math.abs(bestSize - targetSizeBytes)
      ) {
        bestBlob = blob;
        bestSize = currentSize;
      }

      // Check if we're within tolerance
      const sizeRatio = currentSize / targetSizeBytes;
      if (sizeRatio >= 1 - tolerance && sizeRatio <= 1 + tolerance) {
        return blob;
      }

      // Adjust search bounds
      if (currentSize > targetSizeBytes) {
        // File too large, reduce quality or scale
        if (currentQuality > 0.5) {
          maxQuality = currentQuality;
        } else {
          maxScale = currentScale;
        }
      } else {
        // File too small, increase quality or scale
        if (currentScale < 0.8) {
          minScale = currentScale;
        } else {
          minQuality = currentQuality;
        }
      }

      // Prevent infinite loops
      if (maxQuality - minQuality < 0.01 && maxScale - minScale < 0.01) {
        break;
      }
    }

    return bestBlob;
  };

  const compressWithSettings = async (img, quality, scale) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const newWidth = Math.floor(img.width * scale);
      const newHeight = Math.floor(img.height * scale);

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const mimeType =
        outputFormat === "jpeg"
          ? "image/jpeg"
          : outputFormat === "png"
          ? "image/png"
          : outputFormat === "webp"
          ? "image/webp"
          : `image/${outputFormat}`;

      canvas.toBlob(resolve, mimeType, quality);
    });
  };

  const compressPDF = async () => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Basic PDF compression by removing unnecessary data
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      });

      return new Blob([pdfBytes], { type: "application/pdf" });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      throw error;
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    // Validate target size if specified
    const targetSizeBytes = parseTargetSize(targetSize);
    if (targetSize.trim() !== "" && targetSizeBytes === 0) {
      alert(
        "Invalid target size format. Please use formats like '500KB', '2MB', '1.5GB', or leave empty."
      );
      return;
    }

    if (targetSizeBytes > 0 && targetSizeBytes >= file.size) {
      alert(
        `Target size (${formatFileSize(
          targetSizeBytes
        )}) should be smaller than the original file size (${formatFileSize(
          file.size
        )}). Please enter a smaller target size.`
      );
      return;
    }

    setIsCompressing(true);
    setProgress(0);

    try {
      let compressedBlob;

      setProgress(10);

      if (fileType === "image") {
        compressedBlob = await compressImage();
      } else if (fileType === "pdf") {
        setProgress(25);
        compressedBlob = await compressPDF();
        setProgress(75);
      }

      setProgress(90);

      // Download the compressed file
      const url = URL.createObjectURL(compressedBlob);
      const a = document.createElement("a");
      a.href = url;

      const originalName = file.name.split(".")[0];
      const extension = fileType === "image" ? outputFormat : "pdf";
      a.download = `${originalName}_compressed.${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);

      const compressionRatio = (
        ((file.size - compressedBlob.size) / file.size) *
        100
      ).toFixed(1);

      const targetAchieved =
        targetSizeBytes > 0
          ? `\nTarget: ${formatFileSize(
              targetSizeBytes
            )} | Achieved: ${formatFileSize(compressedBlob.size)}`
          : "";

      alert(
        `Compression successful! File reduced by ${compressionRatio}%\n${formatFileSize(
          file.size
        )} → ${formatFileSize(compressedBlob.size)}${targetAchieved}`
      );
    } catch (error) {
      console.error("Error during compression:", error);
      alert("Error during compression. Please try again.");
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  };

  const resetFile = () => {
    setFile(null);
    setFileType("");
    setTargetSize("");
    setOutputFormat("");
    setCompressionQuality(0.8);
    setProgress(0);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🗜️ File Compression</h2>
        <p className="card-description">
          Compress images and PDF files to reduce their size
        </p>
      </div>

      {!file ? (
        <div>
          <h3 className="mb-2">Upload File to Compress</h3>
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById("compressionInput").click()}
          >
            <div className="drop-zone-content">
              <div
                style={{
                  backgroundColor: "#8b5cf6",
                  borderRadius: "50%",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                🗜️
              </div>
              <h3>Drag & Drop File Here</h3>
              <p style={{ color: "#888" }}>
                Supports images (JPG, PNG, GIF, BMP, WEBP) and PDF files
              </p>
              <button className="button button-outline">📁 Select File</button>
            </div>
          </div>
          <input
            id="compressionInput"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div>
          {/* File Info */}
          <div
            style={{
              border: "1px solid #3a3a3a",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p style={{ fontWeight: "500" }}>{file.name}</p>
                <p className="text-sm" style={{ color: "#888" }}>
                  {formatFileSize(file.size)} • {fileType.toUpperCase()} file
                </p>
              </div>
              <button
                className="button button-outline"
                onClick={resetFile}
                disabled={isCompressing}
              >
                Change File
              </button>
            </div>
          </div>

          {/* Compression Settings */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 className="mb-4">Compression Settings</h3>

            {/* Target Size Input */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                className="text-sm"
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Target Size (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 500KB, 2MB, or leave empty for quality-based compression"
                value={targetSize}
                onChange={(e) => setTargetSize(e.target.value)}
                disabled={isCompressing}
                className="input"
                style={{ marginBottom: "0.25rem" }}
              />
              <div className="text-xs" style={{ color: "#666" }}>
                <p>Current size: {formatFileSize(file.size)}</p>
                {targetSize && parseTargetSize(targetSize) > 0 && (
                  <p style={{ color: "#8b5cf6", marginTop: "0.25rem" }}>
                    Target: {formatFileSize(parseTargetSize(targetSize))}(
                    {((parseTargetSize(targetSize) / file.size) * 100).toFixed(
                      1
                    )}
                    % of original)
                  </p>
                )}
                {targetSize &&
                  parseTargetSize(targetSize) === 0 &&
                  targetSize.trim() !== "" && (
                    <p style={{ color: "#dc2626", marginTop: "0.25rem" }}>
                      ⚠️ Invalid format. Use: 500KB, 2MB, 1.5GB
                    </p>
                  )}
              </div>
            </div>

            {/* Quality Slider */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                className="text-sm"
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {targetSize && parseTargetSize(targetSize) > 0
                  ? `Starting Quality: ${Math.round(
                      compressionQuality * 100
                    )}% (will adjust to reach target)`
                  : `Compression Quality: ${Math.round(
                      compressionQuality * 100
                    )}%`}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={compressionQuality}
                onChange={(e) =>
                  setCompressionQuality(parseFloat(e.target.value))
                }
                disabled={isCompressing}
                style={{
                  width: "100%",
                  marginBottom: "0.25rem",
                }}
              />
              <p className="text-xs" style={{ color: "#666" }}>
                {targetSize && parseTargetSize(targetSize) > 0
                  ? "When target size is set, quality will be automatically adjusted to achieve the target"
                  : "Higher quality = larger file size, Lower quality = smaller file size"}
              </p>
            </div>

            {/* Output Format (for images only) */}
            {fileType === "image" && (
              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="text-sm"
                  style={{
                    color: "#888",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  disabled={isCompressing}
                  className="input"
                  style={{ marginBottom: "0.25rem" }}
                >
                  <option value="jpeg">JPEG (Best for photos)</option>
                  <option value="png">
                    PNG (Best for graphics with transparency)
                  </option>
                  <option value="webp">
                    WebP (Modern format, smaller size)
                  </option>
                </select>
                <p className="text-xs" style={{ color: "#666" }}>
                  Choose the output format for your compressed image
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isCompressing && (
            <div className="mb-4">
              <p className="text-sm mb-2">
                Compressing your file... {Math.round(progress)}%
              </p>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Compress Button */}
          <button
            className="button"
            onClick={handleCompress}
            disabled={isCompressing}
            style={{ width: "100%" }}
          >
            {isCompressing ? (
              <>
                <span className="spinner"></span>
                Compressing...
              </>
            ) : (
              <>🗜️ Compress {fileType === "image" ? "Image" : "PDF"}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Compression;
