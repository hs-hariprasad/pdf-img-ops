# 📄 PDF Operations Tool

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF.svg)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

A powerful, **100% client-side** PDF manipulation tool that allows you to convert images to PDF, split PDF files, and compress images and PDFs - all without uploading your files to any server! Your data stays private and secure on your device.

## ✨ Features

### 🖼️ **Images to PDF Converter**

- 📁 **Drag & Drop Support** - Simply drag your images into the browser
- 🔄 **Auto-Rotation** - Automatically detects and handles landscape/portrait images
- 📱 **Multiple Formats** - Supports JPG, PNG, GIF, BMP, and more
- 🎯 **Smart Sizing** - Automatically fits images to page size
- 📑 **Batch Processing** - Convert multiple images into one PDF
- 🚀 **Real-time Preview** - See your images before conversion

### ✂️ **PDF Splitter**

- 📖 **Visual Preview** - See PDF pages before splitting
- 🎯 **Flexible Range Selection** - Split by specific page ranges
- 📄 **Single Page Extraction** - Extract individual pages
- 📦 **Batch Download** - Download multiple split files as ZIP
- 🏷️ **Custom Naming** - Name your split files as you want
- 📊 **Progress Tracking** - Real-time processing progress

### 🗜️ **File Compression**

- 📷 **Image Compression** - Reduce image file sizes while maintaining quality
- 📄 **PDF Compression** - Compress PDF files to save storage space
- 🎯 **Target Size Control** - Specify desired file size with ±5% tolerance (e.g., 500KB target = 475-525KB result)
- 🎨 **Format Conversion** - Convert between image formats during compression
- ⚙️ **Quality Control** - Adjust compression quality from 10% to 100%
- 📊 **Real-time Size Preview** - See original and target file sizes
- 🔄 **Multiple Format Support** - JPEG, PNG, WebP output options
- 🧠 **Smart Algorithm** - Uses binary search to find optimal compression settings
- ⚠️ **Note**: Target size compression has approximately 5% tolerance due to technical limitations

## 🔒 Privacy & Security

- ✅ **100% Client-Side Processing** - No files are uploaded to any server
- 🔐 **Your Data Stays Local** - All operations happen in your browser
- 🚫 **No Registration Required** - Use immediately without signing up
- 💾 **No Data Collection** - We don't store or track your files

## � What Gets Installed?

When you run `npm install`, the following components are automatically downloaded and set up:

### 🔧 **Core PDF Libraries** (Essential for functionality)

- **jsPDF** - Converts your images into PDF format
- **PDF-lib** - Splits and manipulates existing PDF files
- **PDF.js** - Displays PDF previews in the browser
- **JSZip** - Creates ZIP files when downloading multiple PDFs

### ⚛️ **User Interface Libraries**

- **React** - Creates the interactive web interface
- **React-DOM** - Renders the interface in your browser

### 🛠️ **Development Tools**

- **Vite** - Fast development server and build tool
- **@vitejs/plugin-react** - Enables React support in Vite

**🎯 Total download size:** ~15-25 MB (depending on your system)  
**💾 Storage needed:** ~100 MB after installation  
**⏱️ Installation time:** 1-3 minutes (depending on internet speed)

## �🚀 Quick Start

### Option 1: Direct Use (Recommended for Non-Programmers)

1. **Download the Tool**

   - Click the green "Code" button above
   - Select "Download ZIP"
   - Extract the ZIP file to a folder on your computer

2. **Install Node.js** (One-time setup)

   - Visit [nodejs.org](https://nodejs.org/)
   - Download the **LTS version** (recommended for most users)
   - Run the installer and follow the setup wizard
   - ✅ This installs both Node.js and npm (package manager)

3. **Set Up the Tool**

   - Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux)
   - Navigate to your extracted folder:
     ```bash
     cd path/to/pdf-ops
     ```
   - Install ALL required packages with one command:
     ```bash
     npm install
     ```
   - ⏳ This automatically downloads ALL necessary components:
     - ✅ **jsPDF** (for converting images to PDF)
     - ✅ **PDF-lib** (for splitting and manipulating PDFs)
     - ✅ **PDF.js** (for previewing PDF pages)
     - ✅ **JSZip** (for creating ZIP files)
     - ✅ **React & Vite** (for the user interface)
     - ✅ **All other dependencies** (takes 1-2 minutes)

4. **Run the Tool**
   ```bash
   npm run dev
   ```
   - 🎉 The tool will open in your browser automatically
   - Usually available at: `http://localhost:5173`

### Option 2: For Developers

```bash
# Clone the repository
cd pdf-ops
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

```

## 📋 System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **RAM**: 4GB minimum (8GB recommended for large files)
- **Storage**: 100MB free space for installation
- **Internet**: Required only for initial setup (downloading Node.js and packages)

## 🎯 How to Use

### 🖼️ Converting Images to PDF

1. **Select the Images Tab**

   - Click on "🖼️ Images to PDF" at the top

2. **Upload Your Images**

   - **Method 1**: Drag and drop image files into the upload area
   - **Method 2**: Click "📁 Select Images" and choose files

3. **Review Your Images**

   - See thumbnail previews of all selected images
   - Remove unwanted images using the 🗑️ button
   - Images will appear in PDF in the order shown

4. **Convert to PDF**
   - Click "📄 Convert to PDF"
   - Wait for processing (progress bar shows status)
   - PDF will automatically download when ready

**💡 Pro Tips:**

- Supported formats: JPG, PNG, GIF, BMP, WEBP
- No limit on number of images (limited by device memory)
- Landscape images auto-rotate for better fit

### ✂️ Splitting PDF Files

1. **Select the Split PDF Tab**

   - Click on "✂️ Split PDF" at the top

2. **Upload Your PDF**

   - Drag and drop a PDF file or click to browse
   - Preview will show the first page

3. **Choose Split Method**

   - **Single Pages**: Extract individual pages
   - **Page Ranges**: Split into specific page ranges

4. **Configure Splits**

   - Enter page numbers (e.g., "1-5" for pages 1 through 5)
   - Give each split file a custom name
   - Use "+" button to add more ranges

5. **Process & Download**
   - Click "Split PDF" to process
   - Files download as individual PDFs or ZIP archive

**💡 Pro Tips:**

- Page numbers start from 1
- Use "1-3,7-9" format for multiple ranges
- Preview different pages using navigation arrows

### 🗜️ Compressing Files

1. **Select the Compression Tab**

   - Click on "🗜️ Compression" at the top

2. **Upload Your File**

   - Drag and drop an image or PDF file
   - Supports: JPG, PNG, GIF, BMP, WEBP, PDF
   - View original file size instantly

3. **Set Compression Options**

   - **Target Size**: Specify desired file size (e.g., "500KB", "2MB")
   - **Quality**: Adjust compression quality (10%-100%)
   - **Output Format** (Images only): Choose JPEG, PNG, or WebP

4. **Compress & Download**
   - Click "🗜️ Compress Image/PDF"
   - Wait for processing
   - File downloads automatically with compression stats

**💡 Pro Tips:**

- ⚠️ **Important**: Target size compression has approximately **5% tolerance** - this means a 500KB target may result in files between 475KB-525KB due to technical compression limitations
- JPEG: Best for photos, smallest file sizes
- PNG: Best for graphics, supports transparency
- WebP: Modern format with excellent compression
- Algorithm automatically adjusts quality and dimensions
- Use target size for precise file size requirements
- If exact file size is critical, manually adjust the target size to account for the tolerance

## 🛠️ Technical Details

### Built With

- **⚛️ React 18** - Modern UI framework for interactive components
- **⚡ Vite** - Lightning-fast build tool and development server
- **📄 PDF-lib** - Advanced PDF manipulation and splitting library
- **🖼️ jsPDF** - PDF generation from images with auto-rotation
- **📦 JSZip** - ZIP file creation for batch downloads
- **👁️ PDF.js** - PDF preview and rendering (Mozilla's PDF viewer)
- **🎨 Custom CSS** - Modern dark theme with responsive design

### Key Packages (Automatically Installed)

When you run `npm install`, these essential packages are automatically downloaded:

```json
{
  "jspdf": "^2.5.1", // 📄 PDF creation from images
  "pdf-lib": "^1.17.1", // ✂️ PDF manipulation and splitting
  "pdfjs-dist": "^5.3.31", // 👁️ PDF rendering and preview
  "jszip": "^3.10.1", // 📦 ZIP file creation for batch downloads
  "react": "^18.2.0", // ⚛️ User interface framework
  "react-dom": "^18.2.0", // 🎨 DOM rendering for React
  "@vitejs/plugin-react": "^4.0.3", // 🔧 Vite React plugin (dev)
  "vite": "^4.4.5" // ⚡ Build tool and dev server (dev)
}
```

**✅ All packages install automatically** - You don't need to install them individually!

## 🔧 Troubleshooting

### Common Issues

**❌ "npm: command not found"**

- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart Command Prompt/Terminal after installation

**❌ Tool won't start after `npm run dev`**

- Try deleting `node_modules` folder and running `npm install` again
- Check if port 5173 is already in use

**❌ Missing package errors (like "Cannot find module...")**

- **Solution**: Run `npm install` again to ensure all packages are downloaded
- If still having issues, delete the `node_modules` folder and run `npm install`

**❌ PDF processing fails with large files**

- **Large PDFs**: Try splitting into smaller chunks first
- **Memory Issues**: Close other browser tabs and applications

**❌ Images not converting properly**

- Ensure images are in supported formats (JPG, PNG, GIF, BMP, WEBP)
- Try reducing image file sizes if very large

### Getting Help

1. **Check Browser Console**: Press F12 → Console tab for error details
2. **File Size Limits**: Browser memory limits apply (typically 1-2GB)
3. **Browser Compatibility**: Use latest Chrome, Firefox, Safari, or Edge

## 📄 File Structure

```
pdf-ops/
├── 📁 public/
│   └── pdf.worker.min.js     # PDF.js worker file
├── 📁 src/
│   ├── 📁 components/
│   │   ├── ImageToPDF.jsx    # Image to PDF converter
│   │   ├── PDFSplitter.jsx   # PDF splitting functionality
│   │   └── Compression.jsx   # Image and PDF compression
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Styling
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── vite.config.js            # Build configuration
└── README.md                 # This file
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🐛 Report Bugs**: Open an issue describing the problem
2. **💡 Suggest Features**: Share your ideas for improvements
3. **🔧 Submit Code**: Fork the repo and create a pull request
4. **📖 Improve Docs**: Help make instructions clearer

## 🙏 Acknowledgments

- **PDF.js** team for the excellent PDF rendering library
- **PDF-lib** creators for powerful PDF manipulation tools
- **React** team for the amazing framework
- **Vite** team for the blazing-fast build tool

---

## 🚀 Ready to Get Started?

1. **Download Node.js** from [nodejs.org](https://nodejs.org/)
2. **Download this tool** using the blue "Code" button above
3. **Follow the Quick Start guide** above
4. **Start converting and splitting PDFs!** 🎉

**Need help?** Open an issue above or check the troubleshooting section!

---

<div align="center">

**Easing your Job working with PDF's**

[⬆️ Back to Top](#-pdf-operations-tool)

</div>
