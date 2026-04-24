import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, FileText, X } from "lucide-react";

const DisputeForm = ({ onSubmit }) => {
    const [issueType, setIssueType] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!issueType) {
            setError("Please select an issue type.");
            return;
        }

        if (!description.trim()) {
            setError("Please provide a description of the issue.");
            return;
        }

        onSubmit({ issueType, description, files });
    };

    return (
        <div className="dispute-card">
            <h3 className="dispute-card-title">Dispute Form</h3>
            
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Issue Type</label>
                    <select 
                        className="form-select" 
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                    >
                        <option value="">Select an issue</option>
                        <option value="Payment Delay">Payment Delay</option>
                        <option value="Work Not Completed">Work Not Completed</option>
                        <option value="Quality Issue">Quality Issue</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                        className="form-textarea"
                        placeholder="Describe the issue in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label">Upload Evidence</label>
                    
                    <div 
                        className="upload-area"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="upload-icon" size={32} />
                        <div className="upload-text">
                            Drag & drop files here, or click to browse
                        </div>
                        <input 
                            type="file" 
                            multiple 
                            ref={fileInputRef} 
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, .pdf, .doc, .docx"
                        />
                        
                        <div className="upload-buttons" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={16} />
                                Attach Screenshot
                            </button>
                            <button type="button" className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                                <FileText size={16} />
                                Attach File
                            </button>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="file-preview">
                            {files.map((file, idx) => (
                                <div key={idx} className="file-item">
                                    <span>{file.name}</span>
                                    <X className="file-remove" size={14} onClick={() => handleRemoveFile(idx)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="submit-dispute-btn">
                    Submit Dispute
                </button>
            </form>
        </div>
    );
};

export default DisputeForm;
