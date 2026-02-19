import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsAPI } from '../lib/api';
import PageHeader from '../components/PageHeader';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const DocumentUpload = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentFileName, setCurrentFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type || 'unknown'}" not supported. Please upload PDF, JPEG, PNG, TIFF, or TXT files.`
      };
    }
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File "${file.name}" (${formatFileSize(file.size)}) exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please compress the file or split it into smaller documents.`
      };
    }
    
    return { valid: true };
  };

  const handleFiles = async (files) => {
    setError('');

    for (let file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    setUploading(true);

    for (let file of files) {
      setCurrentFileName(file.name);
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      try {
        const response = await documentsAPI.upload(file, claimId, (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
          }
        });
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          ...response.data
        }]);
      } catch (err) {
        const errorData = err.response?.data;
        
        if (err.response?.status === 413) {
          setError(
            errorData?.detail || 
            `File "${file.name}" is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB. ${errorData?.suggestion || ''}`
          );
        } else if (errorData?.error === 'File Too Large') {
          setError(errorData.detail || `File "${file.name}" exceeds the size limit.`);
        } else {
          setError(`Failed to upload "${file.name}". ${err.response?.data?.detail || err.message || 'Please try again.'}`);
        }
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }

    setCurrentFileName('');
    setUploading(false);
  };

  const handleContinue = () => {
    navigate(`/claim/${claimId}`);
  };

  const renderProgressBar = (fileName, progress) => {
    if (progress === undefined || progress === 100) return null;
    
    return (
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)' }}>
            Uploading {fileName}...
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            {progress}%
          </span>
        </div>
        <div 
          style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: 'var(--border)', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Uploading ${fileName}: ${progress}%`}
        >
          <div 
            style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: 'var(--primary)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Upload Medical Documents"
        subtitle="Upload your medical records, service records, and supporting documents"
        backTo={claimId ? `/claim/${claimId}` : '/dashboard'}
      />
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      {error && (
        <div role="alert" className="alert alert-error" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">⚠️</span>
            <div>
              <p style={{ margin: 0 }}>{error}</p>
              {error.includes('size') && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                  Tip: You can compress PDFs using online tools or split large documents into multiple files.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className="card"
        role="button"
        tabIndex={0}
        aria-label="Upload documents. Drag and drop files here or press Enter to browse"
        style={{
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
          backgroundColor: dragActive ? 'var(--primary)' + '05' : 'var(--surface)',
          padding: '3rem',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          marginBottom: '2rem',
          opacity: uploading ? 0.7 : 1
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={uploading ? undefined : handleDrop}
        onClick={uploading ? undefined : () => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (!uploading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fileInputRef.current?.click(); } }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">
          {uploading ? '⏳' : '📄'}
        </div>
        <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
          {uploading ? `Uploading ${currentFileName}...` : 'Drag & drop files here'}
        </h3>
        <p style={{ color: 'var(--neutral-gray)', marginBottom: '1rem' }}>
          {uploading ? 'Please wait while your document is being uploaded' : 'or click to browse'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)' }}>
          Supported: PDF, JPEG, PNG, TIFF, TXT (max {MAX_FILE_SIZE_MB}MB)
        </p>
        
        {uploading && currentFileName && uploadProgress[currentFileName] !== undefined && (
          <div style={{ marginTop: '1.5rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            {renderProgressBar(currentFileName, uploadProgress[currentFileName])}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.txt"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          aria-label="Select files to upload"
          disabled={uploading}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
            Uploaded Documents ({uploadedFiles.length})
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--background)',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    {file.name}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)' }}>
                    {file.size && `${formatFileSize(file.size)} | `}
                    Category: {file.category} |
                    {file.phi_detected && <span style={{ color: 'var(--accent)', fontWeight: 600 }}><span aria-hidden="true"> 🔒</span> Contains PHI (Securely Encrypted)</span>}
                  </p>
                </div>
                <span style={{ color: 'var(--success)', fontSize: '1.5rem' }} aria-hidden="true">✓</span>
                <span className="sr-only">Upload complete</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--background)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>What documents should I upload?</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Medical Records</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-gray)' }}>Diagnosis records, treatment history, current medical documentation</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Service Records</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-gray)' }}>DD-214, service treatment records, personnel files</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Supporting Evidence</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-gray)' }}>Nexus letters, buddy statements, personal statements</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>VA Documents</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-gray)' }}>C&P exam results, rating decisions, VA correspondence</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(`/claim/${claimId}`)}
          className="btn btn-secondary"
          style={{ minHeight: '44px', padding: '0.75rem 1.5rem' }}
          disabled={uploading}
        >
          <span aria-hidden="true">←</span> Back to Claim
        </button>
        <button
          onClick={handleContinue}
          className="btn btn-accent"
          disabled={uploadedFiles.length === 0 || uploading}
          style={{ opacity: (uploadedFiles.length === 0 || uploading) ? 0.5 : 1, minHeight: '44px', padding: '0.75rem 1.5rem' }}
          aria-disabled={uploadedFiles.length === 0 || uploading}
        >
          Continue to AI Analysis <span aria-hidden="true">→</span>
        </button>
      </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
