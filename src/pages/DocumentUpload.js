import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsAPI } from '../lib/api';
import api from '../lib/api';
import VeteranLayout from '../components/VeteranLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  CheckCircle2,
  Upload,
  Sparkles,
  AlertCircle,
  Trash2,
  RefreshCw,
  Eye
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const DOC_TYPE_LABELS = {
  dd214: 'DD-214',
  medical_records: 'Medical Records',
  service_treatment_records: 'Service Treatment Records',
  nexus_letter: 'Nexus Letter',
  buddy_statements: 'Buddy Statements',
  va_medical: 'VA Medical Records',
  private_medical: 'Private Medical Records',
  document: 'Document',
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const DocumentUpload = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // newly uploaded this session
  const [existingDocs, setExistingDocs] = useState([]);   // already in DB
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentFileName, setCurrentFileName] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const loadExistingDocs = useCallback(async () => {
    if (!claimId) return;
    try {
      const res = await api.get(`/documents/claim/${claimId}`);
      setExistingDocs(res.data?.documents || []);
    } catch {
      setExistingDocs([]);
    }
  }, [claimId]);

  useEffect(() => { loadExistingDocs(); }, [loadExistingDocs]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) handleFiles(e.target.files);
  };

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'text/plain'];
    if (!validTypes.includes(file.type))
      return { valid: false, error: `"${file.type || 'unknown'}" not supported. Use PDF, JPEG, PNG, TIFF, or TXT.` };
    if (file.size > MAX_FILE_SIZE_BYTES)
      return { valid: false, error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the ${MAX_FILE_SIZE_MB}MB limit.` };
    return { valid: true };
  };

  const handleFiles = async (files) => {
    setError('');
    for (let file of files) {
      const v = validateFile(file);
      if (!v.valid) { setError(v.error); return; }
    }

    setUploading(true);
    for (let file of files) {
      setCurrentFileName(file.name);
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      try {
        const response = await documentsAPI.upload(file, claimId, (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: pct }));
          }
        });
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, ...response.data }]);
        // Refresh existing docs list after upload
        await loadExistingDocs();
      } catch (err) {
        const data = err.response?.data;
        if (err.response?.status === 413) {
          setError(data?.detail || `"${file.name}" is too large. Max ${MAX_FILE_SIZE_MB}MB.`);
        } else {
          setError(`Failed to upload "${file.name}". ${data?.detail || err.message || 'Please try again.'}`);
        }
        setUploadProgress(prev => { const n = { ...prev }; delete n[file.name]; return n; });
      }
    }
    setCurrentFileName('');
    setUploading(false);
  };

  const handleDelete = async (docId) => {
    setDeletingId(docId);
    try {
      await api.delete(`/documents/${docId}`);
      setExistingDocs(prev => prev.filter(d => d.id !== docId));
      setUploadedFiles(prev => prev.filter(f => f.id !== docId));
    } catch {
      setError('Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalDocs = existingDocs.length;
  const canContinue = totalDocs > 0 && !uploading;

  const handleContinue = () => {
    navigate(`/claim/${claimId}/intake`);
  };

  return (
    <VeteranLayout>
      <div className="w-full px-6 sm:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Upload Medical Documents</h1>
            <p className="text-slate-500 text-sm mt-0.5">Upload your medical records, service records, and supporting documents</p>
          </div>
          {totalDocs > 0 && (
            <Badge className="ml-auto bg-green-100 text-green-700 px-3 py-1 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              {totalDocs} document{totalDocs !== 1 ? 's' : ''} uploaded
            </Badge>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{error}</p>
              {error.includes('large') && (
                <p className="text-xs text-red-500 mt-1">Tip: Compress PDFs online or split into smaller files.</p>
              )}
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload documents. Drag and drop files here or press Enter to browse"
          className={`w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer mb-6 ${
            dragActive
              ? 'border-[#1B3A5F] bg-blue-50'
              : uploading
              ? 'border-slate-200 bg-slate-50 cursor-wait'
              : 'border-slate-300 bg-white hover:border-[#1B3A5F] hover:bg-blue-50/30'
          }`}
          style={{ padding: '3.5rem 2rem' }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={uploading ? undefined : handleDrop}
          onClick={uploading ? undefined : () => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (!uploading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fileInputRef.current?.click(); } }}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              dragActive ? 'bg-[#1B3A5F]/10' : 'bg-slate-100'
            }`}>
              {uploading
                ? <div className="animate-spin w-7 h-7 border-2 border-[#1B3A5F] border-t-transparent rounded-full" />
                : <FileText className={`w-7 h-7 ${dragActive ? 'text-[#1B3A5F]' : 'text-slate-400'}`} />
              }
            </div>

            <h3 className={`text-lg font-semibold mb-1 ${dragActive ? 'text-[#1B3A5F]' : 'text-slate-700'}`}>
              {uploading ? `Uploading ${currentFileName}...` : dragActive ? 'Drop files to upload' : 'Drag & drop files here'}
            </h3>
            <p className="text-slate-400 text-sm mb-3">
              {uploading ? 'Please wait…' : 'or click to browse'}
            </p>
            <p className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              Supported: PDF, JPEG, PNG, TIFF, TXT &nbsp;·&nbsp; max {MAX_FILE_SIZE_MB}MB
            </p>

            {uploading && currentFileName && uploadProgress[currentFileName] !== undefined && (
              <div className="mt-5 w-full max-w-xs">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Uploading…</span>
                  <span className="font-semibold text-[#1B3A5F]">{uploadProgress[currentFileName]}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1B3A5F] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[currentFileName]}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.txt"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select files to upload"
            disabled={uploading}
          />
        </div>

        {/* Existing Documents List */}
        {existingDocs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                Uploaded Documents ({existingDocs.length})
              </h3>
              <button
                onClick={loadExistingDocs}
                className="text-xs text-slate-500 hover:text-[#1B3A5F] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {existingDocs.map((doc) => {
                const docId = doc.id;
                const name = doc.fileName || doc.filename || doc.file_name || 'Unknown file';
                const size = doc.fileSize || doc.file_size || 0;
                const type = doc.documentType || doc.document_type || doc.category || 'document';
                const typeLabel = DOC_TYPE_LABELS[type] || type;
                return (
                  <div
                    key={docId}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {typeLabel}
                          </span>
                          {size > 0 && (
                            <span className="text-xs text-slate-400">{formatFileSize(size)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(docId)}
                      disabled={deletingId === docId}
                      className="ml-3 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                      aria-label={`Remove ${name}`}
                    >
                      {deletingId === docId
                        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* What to upload guide */}
        <div className="mb-8 border border-slate-200 rounded-xl bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">What documents should I upload?</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: 'Medical Records', desc: 'Diagnosis records, treatment history, current medical documentation' },
              { title: 'Service Records', desc: 'DD-214, service treatment records, personnel files' },
              { title: 'Supporting Evidence', desc: 'Nexus letters, buddy statements, personal statements' },
              { title: 'VA Documents', desc: 'C&P exam results, rating decisions, VA correspondence' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1B3A5F] mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/claim/${claimId}`)}
            disabled={uploading}
            className="flex-1 sm:flex-none sm:min-w-[160px] border-slate-300 text-slate-700 hover:bg-slate-50 h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Claim
          </Button>

          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex-1 sm:flex-none sm:min-w-[220px] bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white h-12 shadow-md disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Continue to AI Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {!canContinue && !uploading && totalDocs === 0 && (
          <p className="text-xs text-slate-400 mt-3 text-center">
            Upload at least one document to continue to AI analysis.
          </p>
        )}
      </div>
    </VeteranLayout>
  );
};

export default DocumentUpload;
