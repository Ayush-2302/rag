import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCollections } from '../api/ragApi';
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatusBadge,
  StatusDot,
  SkeletonRows,
  SkeletonCard,
  Alert,
  PageContainer,
  PageHeader,
  Section,
  ContentGrid,
  Button,
} from './ui';
import { ChevronRightIcon, DatabaseIcon, FileTextIcon, UploadIcon } from './icons';

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return '—';
  }
}

export function Overview() {
  const [collections, setCollections] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function load() {
      try {
        const data = await getCollections();
        if (!alive) return;
        setCollections(data);
        setLastChecked(new Date().toISOString());
        setError(null);
      } catch {
        if (alive) setError('Could not reach the indexing service.');
      }
    }

    load();
    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  const mongo = collections?.mongo ?? [];
  const postgres = collections?.postgres ?? [];
  const totalIndexed = mongo.length + postgres.length;
  const isLoading = collections === null && !error;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <PageHeader
        title="Overview"
        description="Index documents, then search across them with source-grounded answers."
        actions={
          <div className="flex items-center gap-3">
            <StatusDot tone={isLoading ? 'warning' : error ? 'danger' : 'success'}>
              {isLoading
                ? 'Checking connection…'
                : error
                ? 'Service unavailable'
                : 'All systems operational'}
            </StatusDot>
            {lastChecked && (
              <span className="hidden text-xs text-text-muted sm:inline">
                Checked {formatDateTime(lastChecked)}
              </span>
            )}
          </div>
        }
      />

      <PageContainer className="space-y-8">
        {error && (
          <Alert
            variant="danger"
            title="Service Unreachable"
            className="mb-2"
          >
            <div className="flex items-center justify-between gap-4">
              <span>{error} Check that the backend server is running and accessible.</span>
              <Link to="/indexer">
                <Button size="xs" variant="danger">
                  Go to Indexer
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        {/* 1) What needs attention */}
        <Section
          title="Needs attention"
          description="Status of vector stores and ingestion capacity"
        >
          <ContentGrid columns={2}>
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <AttentionCard
                  tone={mongo.length === 0 ? 'warning' : 'success'}
                  title={
                    mongo.length === 0
                      ? 'MongoDB has no indexed collections'
                      : `${mongo.length} MongoDB collection${mongo.length === 1 ? '' : 's'} indexed`
                  }
                  body={
                    mongo.length === 0
                      ? 'Upload a document to the MongoDB workspace to enable unified multi-collection search.'
                      : 'Available for cross-collection search.'
                  }
                  to="/backend"
                  icon={<DatabaseIcon size={18} />}
                  linkLabel="Open MongoDB search"
                />
                <AttentionCard
                  tone={postgres.length === 0 ? 'warning' : 'success'}
                  title={
                    postgres.length === 0
                      ? 'PostgreSQL has no indexed documents'
                      : `${postgres.length} PostgreSQL document${postgres.length === 1 ? '' : 's'} indexed`
                  }
                  body={
                    postgres.length === 0
                      ? 'Upload a PDF or text document to make it searchable in pgvector.'
                      : 'Available for single-document search.'
                  }
                  to="/rag-app"
                  icon={<FileTextIcon size={18} />}
                  linkLabel="Open PostgreSQL search"
                />
              </>
            )}
          </ContentGrid>
        </Section>

        {/* 2) Indexed knowledge bases */}
        <Section
          title="Indexed knowledge bases"
          description="Active vector storage engines"
          actions={
            <Link to="/indexer">
              <Button size="sm" variant="outline" leftIcon={<UploadIcon size={13} />}>
                Upload in Indexer
              </Button>
            </Link>
          }
        >
          <Card>
            {isLoading ? (
              <SkeletonRows rows={2} cols={4} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface-soft">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Name
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">
                        Pipeline Type
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted md:table-cell">
                        Entries
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    <KnowledgeBaseRow
                      name="MongoDB"
                      type="Unified search across collections"
                      count={mongo.length}
                      countLabel={mongo.length === 1 ? 'collection' : 'collections'}
                      to="/backend"
                    />
                    <KnowledgeBaseRow
                      name="PostgreSQL"
                      type="Single-document pgvector search"
                      count={postgres.length}
                      countLabel={postgres.length === 1 ? 'document' : 'documents'}
                      to="/rag-app"
                    />
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Section>

        {/* 3) How search works */}
        <Section
          title="How search works"
          description="Overview of the chunking, embedding, and retrieval pipeline"
        >
          <Card>
            <ol className="divide-y divide-border-light text-sm">
              {[
                {
                  title: 'Index a document',
                  body: 'Upload PDF, TXT, HTML, CSV, Excel or Word files. Content is chunked and embedded on ingest.',
                },
                {
                  title: 'Search across collections',
                  body: 'MongoDB search queries every indexed collection at once and returns matching sources.',
                },
                {
                  title: 'Search within one document',
                  body: 'PostgreSQL search is scoped to a single document you choose and cites page-level sources.',
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-surface-hover/30">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary-soft text-xs font-bold text-primary border border-primary/20">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary text-xs sm:text-sm">{step.title}</p>
                    <p className="text-xs text-text-muted leading-relaxed mt-0.5">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </Section>

        {/* Summary note */}
        <p className="text-xs text-text-muted">
          {error
            ? 'Counts are unavailable until the indexing service responds.'
            : isLoading
            ? 'Fetching current counts…'
            : `${totalIndexed} indexed item${totalIndexed === 1 ? '' : 's'} across 2 knowledge bases.`}
        </p>
      </PageContainer>
    </div>
  );
}

function AttentionCard({ tone, title, body, to, icon, linkLabel }) {
  const badgeStatus = tone === 'warning' ? 'SUGGESTED' : tone === 'danger' ? 'UNAVAILABLE' : 'READY';

  return (
    <Card className="p-5 flex flex-col justify-between transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-text-muted shrink-0">{icon}</span>}
            <p className="text-sm font-semibold text-text-primary tracking-tight">{title}</p>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">{body}</p>
        </div>
        <StatusBadge status={badgeStatus} />
      </div>

      <div className="mt-4 pt-3 border-t border-border-light">
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-xs font-semibold text-link hover:text-link-hover transition-colors"
        >
          <span>{linkLabel}</span>
          <ChevronRightIcon size={12} />
        </Link>
      </div>
    </Card>
  );
}

function KnowledgeBaseRow({ name, type, count, countLabel, to }) {
  const empty = count === 0;
  return (
    <tr className="transition-colors hover:bg-surface-hover/50">
      <td className="px-5 py-3">
        <Link to={to} className="font-semibold text-text-primary hover:text-link hover:underline">
          {name}
        </Link>
        <span className="ml-2 text-xs text-text-muted">{type}</span>
      </td>
      <td className="hidden px-5 py-3 sm:table-cell text-xs text-text-muted">Knowledge base</td>
      <td className="hidden px-5 py-3 md:table-cell text-xs font-medium text-text-secondary">
        {count > 0 ? `${count} ${countLabel}` : '—'}
      </td>
      <td className="px-5 py-3 text-right">
        <StatusBadge status={empty ? 'EMPTY' : 'READY'} />
      </td>
    </tr>
  );
}

export default Overview;
