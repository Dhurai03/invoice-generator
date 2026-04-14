import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, X } from 'lucide-react';
import './FileDropzone.css';

export default function FileDropzone({ onFileSelect, accept, maxSize = 10, file, onRemove }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) onFileSelect(acceptedFiles[0]);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: accept || {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'text/html': ['.html'],
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
  });

  const getFileIcon = (file) => {
    if (!file) return null;
    if (file.type === 'application/pdf') return <FileText size={28} />;
    if (file.type.startsWith('image/')) return <Image size={28} />;
    return <FileText size={28} />;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (file) {
    return (
      <div className="dropzone-file-preview animate-fadeInUp">
        <div className="file-preview-icon">{getFileIcon(file)}</div>
        <div className="file-preview-info">
          <span className="file-preview-name">{file.name}</span>
          <span className="file-preview-size">{formatSize(file.size)}</span>
        </div>
        <button className="file-preview-remove btn btn-icon btn-danger btn-sm" onClick={onRemove} type="button">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${isDragReject ? 'dropzone--reject' : ''}`}
      id="file-dropzone"
    >
      <input {...getInputProps()} />
      <div className="dropzone-icon">
        <Upload size={28} />
      </div>
      <div className="dropzone-content">
        {isDragActive ? (
          <p className="dropzone-text">Drop it here!</p>
        ) : isDragReject ? (
          <p className="dropzone-text dropzone-text--error">File type not supported</p>
        ) : (
          <>
            <p className="dropzone-text">Drag & drop your template here</p>
            <p className="dropzone-subtext">or <span className="dropzone-link">browse files</span></p>
            <p className="dropzone-hint">Supports PDF, JPG, PNG, HTML • Max {maxSize}MB</p>
          </>
        )}
      </div>
    </div>
  );
}
