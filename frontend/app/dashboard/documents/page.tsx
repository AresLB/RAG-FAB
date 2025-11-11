'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface Document {
  _id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  chunkCount: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data.data.documents || []);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError('Fehler beim Laden der Dokumente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Nur PDF, DOCX und TXT Dateien werden unterstützt');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Datei ist zu groß. Maximale Größe: 10MB');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setError('');
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage(`"${file.name}" erfolgreich hochgeladen!`);
      fetchDocuments();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Fehler beim Hochladen der Datei');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);
      setSuccessMessage('Dokument gelöscht');
      fetchDocuments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError('Fehler beim Löschen des Dokuments');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dokumente</h1>
        <p className="text-slate-600">
          Laden Sie Ihre Dokumente hoch - PDF, DOCX oder TXT
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-8 mb-8 text-center hover:border-blue-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt"
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div>
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
            <p className="text-slate-600">Dokument wird hochgeladen...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-6xl">📄</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors mb-3"
            >
              Dokument hochladen
            </button>
            <p className="text-sm text-slate-500">
              Unterstützte Formate: PDF, DOCX, TXT (max. 10MB)
            </p>
          </>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Ihre Dokumente ({documents.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>Noch keine Dokumente hochgeladen</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {documents.map((doc) => (
              <div key={doc._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {doc.type === 'pdf' && <span className="text-3xl">📕</span>}
                    {doc.type === 'docx' && <span className="text-3xl">📘</span>}
                    {doc.type === 'txt' && <span className="text-3xl">📄</span>}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{doc.name}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-slate-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>{doc.chunkCount} Chunks</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
