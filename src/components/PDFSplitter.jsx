import React, { useState, useEffect, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

// Set up worker for pdfjs-dist using local file
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const PDFSplitter = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [ranges, setRanges] = useState([
    { startPage: "", endPage: "", fileName: "" },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const [mode, setMode] = useState("single"); // "single" or "multiple"
  const canvasRef = useRef(null);

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      await loadPdfInfo(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      await loadPdfInfo(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const loadPdfInfo = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      setTotalPages(pageCount);
      setRanges([
        {
          startPage: "",
          endPage: "",
          fileName: "",
        },
      ]);

      // Load PDF for preview
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDocument(pdf);
      setCurrentPreviewPage(1);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF. Please try a different file.");
    }
  };

  const renderPreviewPage = async (pageNum) => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const viewport = page.getViewport({ scale: 1.0 });
      const scale = Math.min(400 / viewport.width, 500 / viewport.height);
      const scaledViewport = page.getViewport({ scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  useEffect(() => {
    if (pdfDocument && currentPreviewPage) {
      renderPreviewPage(currentPreviewPage);
    }
  }, [pdfDocument, currentPreviewPage]);

  const addRange = () => {
    setRanges((prev) => [
      ...prev,
      { startPage: "", endPage: "", fileName: "" },
    ]);
  };

  const removeRange = (index) => {
    if (ranges.length > 1) {
      setRanges((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateRange = (index, field, value) => {
    setRanges((prev) => {
      const newRanges = [...prev];
      newRanges[index][field] = value;
      return newRanges;
    });
  };

  const getDuplicateNames = () => {
    const nonEmptyNames = ranges
      .map((r) => r.fileName.trim())
      .filter((name) => name !== "");

    return nonEmptyNames.filter(
      (name, index) => nonEmptyNames.indexOf(name) !== index
    );
  };

  const hasDuplicateName = (fileName) => {
    if (!fileName.trim()) return false;
    return getDuplicateNames().includes(fileName.trim());
  };

  const splitPDF = async () => {
    if (!pdfFile) return;

    // Check for duplicate file names (only for non-empty names)
    const nonEmptyNames = ranges
      .map((r) => r.fileName.trim())
      .filter((name) => name !== "");

    const duplicateNames = nonEmptyNames.filter(
      (name, index) => nonEmptyNames.indexOf(name) !== index
    );

    if (duplicateNames.length > 0) {
      alert(
        `Duplicate file names found: ${[...new Set(duplicateNames)].join(
          ", "
        )}. Please use unique names.`
      );
      return;
    }

    // Validate all ranges
    const validatedRanges = [];
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const start = parseInt(range.startPage);
      const end = parseInt(range.endPage);

      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 1 ||
        end > totalPages ||
        start > end
      ) {
        alert(`Please enter valid page numbers for range ${i + 1}.`);
        return;
      }

      // Use provided name or default to page range
      const fileName = range.fileName.trim() || `pages_${start}_to_${end}`;
      validatedRanges.push({ start, end, fileName });
    }

    setIsProcessing(true);

    try {
      const originalPdfBytes = await pdfFile.arrayBuffer();
      const generatedFiles = [];

      // Generate each PDF file
      for (let i = 0; i < validatedRanges.length; i++) {
        const { start, end, fileName } = validatedRanges[i];

        const pdfDoc = await PDFDocument.create();
        const srcDoc = await PDFDocument.load(originalPdfBytes);

        const pageIndices = [];
        for (let pageNum = start; pageNum <= end; pageNum++) {
          pageIndices.push(pageNum - 1);
        }

        const copiedPages = await pdfDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach((page) => pdfDoc.addPage(page));

        const pdfBytes = await pdfDoc.save();
        generatedFiles.push({
          name: `${fileName}.pdf`,
          data: pdfBytes,
          range: `${start}-${end}`,
        });
      }

      // If only one file, download directly
      if (generatedFiles.length === 1) {
        const file = generatedFiles[0];
        const blob = new Blob([file.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(`Successfully extracted pages ${file.range}!`);
      } else {
        // Multiple files - create zip
        const zip = new JSZip();

        generatedFiles.forEach((file) => {
          zip.file(file.name, file.data);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pdfFile.name.replace(".pdf", "")}_extracted_pages.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(
          `Successfully created ${generatedFiles.length} PDF files and downloaded as ZIP!`
        );
      }
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Error splitting PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">✂️ Extract PDF Pages</h2>
        <p className="card-description">
          Upload a PDF and extract specific page ranges as a new file
        </p>
      </div>

      {!pdfFile ? (
        <div>
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById("pdfInput").click()}
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
                📄
              </div>
              <h3>Drag & Drop PDF Here</h3>
              <p style={{ color: "#888" }}>Or click to browse your PDF files</p>
              <button className="button button-outline">
                📁 Select PDF File
              </button>
            </div>
          </div>
          <input
            id="pdfInput"
            type="file"
            accept="application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div
          style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}
          className="pdf-splitter-layout"
        >
          {/* Left side - Controls */}
          <div style={{ flex: "1" }}>
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
                  <p style={{ fontWeight: "500" }}>{pdfFile.name}</p>
                  <p className="text-sm" style={{ color: "#888" }}>
                    {Math.round(pdfFile.size / 1024)} KB • {totalPages} pages
                  </p>
                </div>
                <button
                  className="button button-outline"
                  onClick={() => {
                    setPdfFile(null);
                    setTotalPages(0);
                    setRanges([{ startPage: "", endPage: "", fileName: "" }]);
                    setPdfDocument(null);
                    setMode("single");
                  }}
                  disabled={isProcessing}
                >
                  Change
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3>Extract Page Range(s)</h3>
                <div className="flex gap-2">
                  <button
                    className={`button ${
                      mode === "single" ? "" : "button-outline"
                    }`}
                    onClick={() => {
                      setMode("single");
                      setRanges([
                        {
                          startPage: "",
                          endPage: "",
                          fileName: "",
                        },
                      ]);
                    }}
                    disabled={isProcessing}
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                  >
                    Single Range
                  </button>
                  <button
                    className={`button ${
                      mode === "multiple" ? "" : "button-outline"
                    }`}
                    onClick={() => {
                      setMode("multiple");
                      if (
                        ranges.length === 1 &&
                        !ranges[0].startPage &&
                        !ranges[0].endPage
                      ) {
                        setRanges([
                          {
                            startPage: "",
                            endPage: "",
                            fileName: "",
                          },
                          {
                            startPage: "",
                            endPage: "",
                            fileName: "",
                          },
                        ]);
                      }
                    }}
                    disabled={isProcessing}
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                  >
                    Multiple Ranges
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {ranges.map((range, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      border: "1px solid #3a3a3a",
                      borderRadius: "8px",
                    }}
                  >
                    {mode === "multiple" && (
                      <div className="flex justify-between items-center mb-2">
                        <h4 style={{ fontSize: "0.9rem", color: "#8b5cf6" }}>
                          Range {index + 1}
                        </h4>
                        <button
                          className="button"
                          style={{
                            backgroundColor: "#dc2626",
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.75rem",
                          }}
                          onClick={() => removeRange(index)}
                          disabled={ranges.length <= 1 || isProcessing}
                        >
                          🗑️
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label
                          className="text-xs"
                          style={{
                            color: "#888",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Start Page
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={totalPages}
                          value={range.startPage}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            if (inputValue === "") {
                              updateRange(index, "startPage", "");
                              return;
                            }
                            // Allow the user to type without forcing validation until they're done
                            const numValue = parseInt(inputValue);
                            if (!isNaN(numValue)) {
                              updateRange(index, "startPage", numValue);
                            }
                          }}
                          onBlur={(e) => {
                            // Only apply validation if the value is actually invalid
                            const inputValue = e.target.value;
                            if (inputValue !== "") {
                              const numValue = parseInt(inputValue);

                              // Only change the value if it's actually outside valid bounds
                              if (numValue < 1 || numValue > totalPages) {
                                const correctedValue = Math.max(
                                  1,
                                  Math.min(totalPages, numValue)
                                );
                                updateRange(index, "startPage", correctedValue);
                              }

                              // Only auto-adjust end page if start page is valid and end page is less than start
                              const currentEndPage = parseInt(
                                ranges[index].endPage
                              );
                              if (
                                !isNaN(currentEndPage) &&
                                !isNaN(numValue) &&
                                numValue >= 1 &&
                                numValue <= totalPages &&
                                currentEndPage < numValue
                              ) {
                                updateRange(index, "endPage", numValue);
                              }
                            }
                          }}
                          disabled={isProcessing}
                          className="input"
                        />
                      </div>
                      <div>
                        <label
                          className="text-xs"
                          style={{
                            color: "#888",
                            display: "block",
                            marginBottom: "0.25rem",
                          }}
                        >
                          End Page
                        </label>
                        <input
                          type="number"
                          min={range.startPage || 1}
                          max={totalPages}
                          value={range.endPage}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            if (inputValue === "") {
                              updateRange(index, "endPage", "");
                              return;
                            }
                            // Allow the user to type without forcing validation until they're done
                            const numValue = parseInt(inputValue);
                            if (!isNaN(numValue)) {
                              updateRange(index, "endPage", numValue);
                            }
                          }}
                          onBlur={(e) => {
                            // Only apply validation if the value is actually invalid
                            const inputValue = e.target.value;
                            if (inputValue !== "") {
                              const numValue = parseInt(inputValue);
                              const minValue = range.startPage || 1;

                              // Only change the value if it's actually outside valid bounds
                              if (
                                numValue < minValue ||
                                numValue > totalPages
                              ) {
                                const correctedValue = Math.max(
                                  minValue,
                                  Math.min(totalPages, numValue)
                                );
                                updateRange(index, "endPage", correctedValue);
                              }
                              // If the value is within bounds, keep it as is (don't force any changes)
                            }
                          }}
                          disabled={isProcessing}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="text-xs"
                        style={{
                          color: "#888",
                          display: "block",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Output File Name{" "}
                        <span style={{ color: "#888", fontStyle: "italic" }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder={`Leave empty for: pages_${
                          range.startPage || "?"
                        }_to_${range.endPage || "?"}`}
                        value={range.fileName}
                        onChange={(e) =>
                          updateRange(index, "fileName", e.target.value)
                        }
                        disabled={isProcessing}
                        className="input"
                        style={{
                          borderColor: hasDuplicateName(range.fileName)
                            ? "#dc2626"
                            : "#3a3a3a",
                          backgroundColor: hasDuplicateName(range.fileName)
                            ? "rgba(220, 38, 38, 0.1)"
                            : "#1a1a1a",
                        }}
                      />
                      {hasDuplicateName(range.fileName) && (
                        <p
                          style={{
                            color: "#dc2626",
                            fontSize: "0.75rem",
                            marginTop: "0.25rem",
                            fontWeight: "500",
                          }}
                        >
                          ⚠️ Duplicate file name! Please use a unique name.
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {mode === "multiple" && (
                  <button
                    className="button button-outline"
                    onClick={addRange}
                    disabled={isProcessing}
                    style={{ marginBottom: "1rem", width: "100%" }}
                  >
                    ➕ Add Another Range
                  </button>
                )}

                <button
                  className="button"
                  onClick={splitPDF}
                  disabled={
                    isProcessing ||
                    ranges.some(
                      (r) => r.startPage === "" || r.endPage === ""
                    ) ||
                    getDuplicateNames().length > 0
                  }
                  style={{ width: "100%" }}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : mode === "single" ? (
                    `✂️ Extract Pages ${ranges[0]?.startPage || "?"}-${
                      ranges[0]?.endPage || "?"
                    }`
                  ) : (
                    `✂️ Split into ${ranges.length} Files${
                      ranges.length > 1 ? " (ZIP)" : ""
                    }`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right side - PDF Preview */}
          <div style={{ flex: "1", maxWidth: "400px" }}>
            <div
              style={{
                border: "1px solid #3a3a3a",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "#1a1a1a",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h4>PDF Preview</h4>
                <div className="flex items-center gap-2">
                  <button
                    className="button button-outline"
                    onClick={() =>
                      setCurrentPreviewPage(Math.max(1, currentPreviewPage - 1))
                    }
                    disabled={currentPreviewPage <= 1}
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                  >
                    ←
                  </button>
                  <span style={{ fontSize: "0.875rem", color: "#888" }}>
                    {currentPreviewPage} / {totalPages}
                  </span>
                  <button
                    className="button button-outline"
                    onClick={() =>
                      setCurrentPreviewPage(
                        Math.min(totalPages, currentPreviewPage + 1)
                      )
                    }
                    disabled={currentPreviewPage >= totalPages}
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                  >
                    →
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    border: "1px solid #3a3a3a",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div style={{ textAlign: "center" }}>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPreviewPage}
                  onChange={(e) => {
                    const value = Math.max(
                      1,
                      Math.min(totalPages, parseInt(e.target.value) || 1)
                    );
                    setCurrentPreviewPage(value);
                  }}
                  style={{
                    width: "80px",
                    textAlign: "center",
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #3a3a3a",
                    borderRadius: "4px",
                    padding: "0.25rem",
                    color: "#fff",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#888",
                    marginTop: "0.5rem",
                  }}
                >
                  Go to page
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFSplitter;
