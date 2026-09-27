import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getCollections, uploadDocument } from '../api/ragApi';
import { useAuth } from '../context/AuthContext';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  DropZone,
  EmptyState,
  FormField,
  PageContainer,
  PageHeader,
  Section,
  SegmentedControl,
  SkeletonRows,
  toast,
} from './ui';
import { TrashIcon, UploadIcon } from './icons';

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'html', 'csv', 'xlsx', 'xls', 'docx'];

const DATABASES = [
  { value: 'mongo', label: 'MongoDB' },
  { value: 'postgres', label: 'PostgreSQL' },
];

const DB_LABELS = { mongo: 'MongoDB', postgres: 'PostgreSQL' };

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function DocumentIndexer() {
  const { user, isAuthenticated, isAdmin, openLogin } = useAuth();
  const [file, setFile] = useState(null);
  const [database, setDatabase] = useState('postgres');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  // Indexed sources, loaded from the collections endpoint
  const [sources, setSources] = useState(null); // null = loading
  const [sourcesError, setSourcesError] = useState(null);

  const loadSources = useCallback(async () => {
    setSourcesError(null);
    try {
      const cols = await getCollections();
      setSources({
        mongo: (cols.mongo || []).map((name) => ({ name, db: 'mongo' })),
        postgres: (cols.postgres || []).map((name) => ({ name, db: 'postgres' })),
      });
    } catch (err) {
      setSourcesError(err.message || 'Could not load the list of indexed documents.');
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources, user]);

  function acceptFile(selectedFile) {
    const fileExt = selectedFile?.name.split('.').pop().toLowerCase();
    if (selectedFile && ALLOWED_EXTENSIONS.includes(fileExt)) {
      setFile(selectedFile);
      setStatus({ type: '', message: '' });
    } else if (selectedFile) {
      setFile(null);
      setStatus({
        type: 'error',
        message: 'Unsupported file type. Allowed: PDF, TXT, HTML, CSV, Excel, Word.',
      });
    }
  }

  function handleFileChange(e) {
    acceptFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function clearFile() {
    setFile(null);
    setStatus({ type: '', message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setStatus({
      type: 'info',
      message: 'Indexing document. This can take up to a minute for large files.',
    });

    try {
      const response = await uploadDocument(file, database);
      setStatus({
        type: 'success',
        message: response.message || 'Document indexed successfully.',
      });
      toast.success(response.message || 'Document indexed successfully.');
      clearFile();
      loadSources();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Indexing failed.' });
      toast.error(err.message || 'Indexing failed.');
    } finally {
      setIsUploading(false);
    }
  }

  const sourceRows = sources ? [...sources.mongo, ...sources.postgres] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <PageHeader
        title="Indexer"
        description="Upload documents to make them searchable in either knowledge base."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            leftIcon={<UploadIcon size={14} />}
          >
            Upload document
          </Button>
        }
      />

      <PageContainer className="space-y-8">
        {/* Authorization / RBAC status alert */}
        {!isAuthenticated ? (
          <Alert variant="info" title="Authentication Required">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span>
                You must be signed in to upload and index documents into your private knowledge base.
              </span>
              <Button variant="primary" size="xs" onClick={openLogin}>
                Sign In / Register
              </Button>
            </div>
          </Alert>
        ) : null}

        {/* Upload form */}
        <Card>
          <CardHeader
            title="Upload a document"
            description="Supported formats: PDF, TXT, HTML, CSV, Excel, Word."
          />
          <form onSubmit={handleUpload} className="space-y-5 p-6">
            <input
              type="file"
              accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
            />

            <div className="grid gap-6 sm:grid-cols-3">
              <FormField label="Target knowledge base" required htmlFor="database-picker">
                <div id="database-picker">
                  <SegmentedControl
                    name="database"
                    options={DATABASES}
                    value={database}
                    onChange={setDatabase}
                  />
                </div>
              </FormField>

              <div className="sm:col-span-2">
                <FormField
                  label="Document"
                  required
                  htmlFor="file-upload"
                  error={status.type === 'error' ? status.message : undefined}
                  hint="Larger files can take up to a minute to index."
                >
                  {!file ? (
                    <label htmlFor="file-upload" className="block cursor-pointer">
                      <DropZone
                        isDragging={isDragging}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={() => setIsDragging(false)}
                      >
                        <UploadIcon size={22} className="text-primary mb-2" />
                        <p className="text-sm font-semibold text-text-primary">
                          {isDragging ? 'Drop file to attach' : 'Drag a file here or browse'}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          PDF, TXT, HTML, CSV, Excel, Word
                        </p>
                      </DropZone>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-soft p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{file.name}</p>
                        <p className="text-xs text-text-muted">{formatSize(file.size)}</p>
                      </div>
                      <Button size="xs" variant="secondary" onClick={clearFile} disabled={isUploading} leftIcon={<TrashIcon size={12} />}>
                        Remove
                      </Button>
                    </div>
                  )}
                </FormField>
              </div>
            </div>

            {status.message && status.type !== 'error' && (
              <Alert variant={status.type === 'success' ? 'success' : 'info'}>
                {status.message}
              </Alert>
            )}

            <div className="flex items-center justify-end gap-2.5 border-t border-border-light pt-4">
              <Button type="button" variant="secondary" size="sm" onClick={clearFile} disabled={!file || isUploading}>
                Reset
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={!file || isUploading} loading={isUploading}>
                {isUploading ? 'Indexing…' : 'Index document'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Indexed sources */}
        <Section
          title="Indexed documents"
          description="Documents currently stored and searchable in vector databases"
          actions={
            <Button size="sm" variant="secondary" onClick={loadSources}>
              Refresh list
            </Button>
          }
        >
          <Card>
            {sourcesError ? (
              <EmptyState
                compact
                title="Couldn’t load indexed documents"
                description={sourcesError}
                action={<Button size="xs" variant="primary" onClick={loadSources}>Retry</Button>}
              />
            ) : sources === null ? (
              <SkeletonRows rows={3} cols={3} />
            ) : sourceRows.length === 0 ? (
              <EmptyState
                compact
                title="No documents indexed yet"
                description="Upload your first document above. It will appear here once indexing completes."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface-soft">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Document
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">
                        Knowledge base
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted md:table-cell">
                        Indexed
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {sourceRows.map((row) => (
                      <tr key={`${row.db}-${row.name}`} className="transition-colors hover:bg-surface-hover/50">
                        <td className="px-5 py-3 font-medium text-text-primary">{row.name}</td>
                        <td className="hidden px-5 py-3 text-xs text-text-muted sm:table-cell">
                          {DB_LABELS[row.db]}
                        </td>
                        <td className="hidden px-5 py-3 text-xs text-text-muted md:table-cell">—</td>
                        <td className="px-5 py-3 text-right">
                          <Badge variant="success">Indexed</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {!sourcesError && sources !== null && sourceRows.length > 0 && (
            <p className="text-xs text-text-muted">
              {sourceRows.length} document{sourceRows.length === 1 ? '' : 's'} across{' '}
              {new Set(sourceRows.map((r) => r.db)).size} knowledge base
              {new Set(sourceRows.map((r) => r.db)).size === 1 ? '' : 's'}.
            </p>
          )}
        </Section>
      </PageContainer>
    </div>
  );
}

export default DocumentIndexer;
