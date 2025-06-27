import React, { useState } from "react";
import { jsPDF } from "jspdf";

const ImageToPDF = () => {
  const [images, setImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setImages((prev) => [...prev, ...imageFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setImages((prev) => [...prev, ...imageFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    setProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
      });

      let isFirstPage = true;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const img = new Image();
        img.src = URL.createObjectURL(image);

        await new Promise((resolve) => {
          img.onload = () => {
            const needsLandscape = img.width > img.height;

            if (!isFirstPage) {
              pdf.addPage(needsLandscape ? "landscape" : "portrait");
            } else {
              if (needsLandscape) {
                pdf.deletePage(1);
                pdf.addPage("landscape");
              }
              isFirstPage = false;
            }

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            let imgWidth = img.width;
            let imgHeight = img.height;

            const ratio =
              Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.9;
            imgWidth *= ratio;
            imgHeight *= ratio;

            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            pdf.addImage(img.src, "JPEG", x, y, imgWidth, imgHeight);

            setProgress(((i + 1) / images.length) * 100);
            resolve();
          };
        });
      }

      pdf.save("converted-images.pdf");
      alert("PDF created successfully!");
    } catch (error) {
      console.error("Error converting to PDF:", error);
      alert("Error creating PDF. Please try again.");
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🖼️ Images to PDF Converter</h2>
        <p className="card-description">
          Convert your images to a single PDF file with ease
        </p>
      </div>

      <div>
        <h3 className="mb-2">Upload Images</h3>
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("imageInput").click()}
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
              📁
            </div>
            <h3>Drag & Drop Images Here</h3>
            <p style={{ color: "#888" }}>Or click to browse your files</p>
            <button className="button button-outline">📁 Select Images</button>
          </div>
        </div>
        <input
          id="imageInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div className="flex justify-between items-center mb-4">
            <h3>Selected Images ({images.length})</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="image-preview">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                />
                <div className="image-controls">
                  <span className="text-xs">
                    {index + 1}/{images.length}
                  </span>
                  <button
                    className="button"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    onClick={() => removeImage(index)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isConverting && (
            <div className="mb-4">
              <p className="text-sm mb-2">
                Creating your PDF... {Math.round(progress)}%
              </p>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            className="button"
            onClick={convertToPDF}
            disabled={isConverting}
            style={{ width: "100%" }}
          >
            {isConverting ? (
              <>
                <span className="spinner"></span>
                Converting...
              </>
            ) : (
              <>📄 Convert to PDF</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageToPDF;
