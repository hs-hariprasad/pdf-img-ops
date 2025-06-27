import React, { useState } from "react";
import ImageToPDF from "./components/ImageToPDF";
import PDFSplitter from "./components/PDFSplitter";
import "./index.css";

const FEATURES = {
  IMAGE_TO_PDF: "image-to-pdf",
  SPLIT_PDF: "split-pdf",
};

const App = () => {
  const [activeFeature, setActiveFeature] = useState(FEATURES.IMAGE_TO_PDF);

  return (
    <div className="container">
      <header className="header">
        <h1>📄 PDF Operations Tool</h1>
        <p style={{ color: "#888", marginTop: "0.5rem" }}>
          Convert images to PDF and split PDF files - All processing happens
          locally
        </p>
      </header>

      <div className="tab-buttons">
        <button
          className={`tab-button ${
            activeFeature === FEATURES.IMAGE_TO_PDF ? "active" : ""
          }`}
          onClick={() => setActiveFeature(FEATURES.IMAGE_TO_PDF)}
        >
          🖼️ Images to PDF
        </button>
        <button
          className={`tab-button ${
            activeFeature === FEATURES.SPLIT_PDF ? "active" : ""
          }`}
          onClick={() => setActiveFeature(FEATURES.SPLIT_PDF)}
        >
          ✂️ Split PDF
        </button>
      </div>

      {activeFeature === FEATURES.IMAGE_TO_PDF && <ImageToPDF />}
      {activeFeature === FEATURES.SPLIT_PDF && <PDFSplitter />}
    </div>
  );
};

export default App;
