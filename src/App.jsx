import { useState, useRef } from "react";
import "./index.css";

function App() {

    const [files, setFiles] = useState([]);
    const [zipName, setZipName] = useState("");
    const [result, setResult] = useState(null);
    const inputRef = useRef();
    const [dragging, setDragging] = useState(false);
    const [copiedType, setCopiedType] = useState("");
    const [openCopyMenu, setOpenCopyMenu] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("Please select at least one file!");
            return;
        }
        setError("");
        setUploading(true);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("file", file);
        });
        formData.append("zipName", zipName);

        try {
            const response = await fetch("https://fadelink-backend-production.up.railway.app/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setResult(data);
            setFiles([]);
            setZipName("");
        } catch (error) {
            console.log("Error:", error);
        } finally {
            setUploading(false);
        }
    };

    const formatExpiry = (isoString) => {
        const dateObj = new Date(isoString);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        return {
            date: `${day}/${month}/${year}`,
            time: dateObj.toLocaleTimeString(),
        };
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="page">

            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="left-col">
                <div className="stats-row">
                    <span className="stat-pill">100% Free</span>
                    <span className="stat-pill">No Signup</span>
                    <span className="stat-pill">Auto Expires</span>
                </div>
                <p className="left-tag">FadeLink</p>
                <p className="left-tag subtitle">Fast · Free · Temporary</p>
                <h2 className="left-title">Share files<br />instantly</h2>
                <p className="left-desc">Upload any file, get a shareable link in seconds. Links expire automatically — no clutter, no signup.</p>

                <div className="left-features">
                    <div className="feature">⚡ Upload in seconds</div>
                    <div className="feature">🔒 Auto expires in 3 hours</div>
                    <div className="feature">📦 Download as ZIP</div>
                    <div className="feature">📄 Download individually</div>
                </div>
            </div>

            <div className="right-col">
                <div className="card">


                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                    />

                    <div
                        className={`drop-zone ${dragging ? "dragging" : ""}`}
                        onClick={() => inputRef.current.click()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            setFiles(Array.from(e.dataTransfer.files));
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                    >
                        <span>☁️</span>
                        <p>Drop files here</p>
                        <p>or click to browse</p>
                    </div>

                    {files.length > 0 && (
                        <>
                            <div className="chips">
                                {files.map((f) => (
                                    <div className="chip" key={f.name}>
                                        {f.name} <span className="file-size">({formatFileSize(f.size)})</span>
                                        <button className="chip-remove" onClick={() =>
                                            setFiles(files.filter(x => x.name !== f.name))
                                        }>×</button>
                                    </div>
                                ))}
                            </div>
                            <div className="total-size-info">
                                Total Size: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                            </div>
                        </>
                    )}

                    <input
                        className="text-input"
                        type="text"
                        placeholder="Enter ZIP name"
                        value={zipName}
                        onChange={(e) => setZipName(e.target.value)}
                    />

                    {error && <p className="error-msg">{error}</p>}

                    <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Uploading…" : "Upload"}
                    </button>

                    {result && (
                        <div className="result">

                            <p className="result-label">Share link</p>

                            <div className="copy-wrapper">
                                <button
                                    className="copy-btn-big"
                                    onClick={() => setOpenCopyMenu(!openCopyMenu)}
                                >
                                    COPY LINK
                                </button>

                                {openCopyMenu && (
                                    <div className="copy-menu">
                                        <button
                                            className="copy-item"
                                            onClick={() => {
                                                navigator.clipboard.writeText(result.downloadZip);
                                                setCopiedType("zip");
                                                setOpenCopyMenu(false);
                                                setTimeout(() => setCopiedType(""), 2000);
                                            }}
                                        >
                                            COPY ZIP LINK
                                        </button>
                                        <button
                                            className="copy-item"
                                            onClick={() => {
                                                navigator.clipboard.writeText(result.viewLink);
                                                setCopiedType("individual");
                                                setOpenCopyMenu(false);
                                                setTimeout(() => setCopiedType(""), 2000);
                                            }}
                                        >
                                            COPY INDIVIDUAL LINK
                                        </button>
                                    </div>
                                )}

                                {copiedType === "zip" && (
                                    <p className="copied-msg">✓ ZIP LINK COPIED</p>
                                )}
                                {copiedType === "individual" && (
                                    <p className="copied-msg">✓ INDIVIDUAL LINK COPIED</p>
                                )}
                            </div>

                            <a href={result.downloadZip} download className="download-btn">
                                ↓ Download ZIP File ({result.files?.length ?? 0} files)
                            </a>

                            <a href={result.viewLink} target="_blank" className="download-btn">
                                ↗ Download Individual Files
                            </a>

                            <p className="expiry">
                                ⏱ Expires — {formatExpiry(result.expiresAt).date} at{" "}
                                {formatExpiry(result.expiresAt).time}
                            </p>

                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}

export default App;