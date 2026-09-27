import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { askRagAppQuestion, getCollections } from '../api/ragApi';
import ChatPage from './ChatPage';
import { Select } from './ui';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Neutral formatting — section headings and page references */
function formatText(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    const safe = escapeHtml(trimmed);

    if (/^[A-Z][A-Z\s]+:/.test(trimmed)) {
      return `<h3 class="mt-3.5 mb-1.5 text-sm font-semibold tracking-tight text-text-primary">${safe}</h3>`;
    }

    if (/^[-•*]\s/.test(trimmed)) {
      return `<span class="block pl-4 text-text-secondary">• ${safe.slice(2)}</span>`;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      return `<span class="block pl-4 text-text-secondary">${safe}</span>`;
    }

    let formatted = safe.replace(
      /\[Source:[^\]]+\]/g,
      '<span class="rounded-md bg-primary-soft border border-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">$&</span>'
    );

    formatted = formatted.replace(
      /Page:\s*\d+/g,
      '<span class="text-xs font-semibold text-text-primary">$&</span>'
    );

    return trimmed ? `<p class="mb-2 leading-relaxed text-text-secondary">${formatted}</p>` : '';
  });

  return formattedLines.join('');
}

export function RagAppChat() {
  const { user } = useAuth();
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');

  useEffect(() => {
    async function loadCollections() {
      try {
        const cols = await getCollections();
        const pgCols = cols.postgres || [];
        setAvailableDocs(pgCols);
        if (pgCols.length > 0) {
          setSelectedDoc((prev) => (pgCols.includes(prev) ? prev : pgCols[0]));
        } else {
          setSelectedDoc('');
        }
      } catch (err) {
        console.error('Failed to load collections:', err);
      }
    }
    loadCollections();
  }, [user]);

  const hasDocs = availableDocs.length > 0;

  const options = hasDocs ? (
    <div className="flex items-center gap-2.5">
      <label htmlFor="document-select" className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-text-muted">
        Document
      </label>
      <div className="w-72">
        <Select
          id="document-select"
          size="sm"
          value={selectedDoc}
          onChange={(e) => setSelectedDoc(e.target.value)}
        >
          {availableDocs.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  ) : null;

  return (
    <ChatPage
      title="PostgreSQL Search"
      description={hasDocs ? 'Ask questions about a single indexed document. Answers cite page-level sources.' : undefined}
      statusLabel="Connected"
      sendDisabled={!hasDocs}
      emptyState={
        hasDocs
          ? {
              title: 'No search query yet',
              description: 'Choose a document below, then ask a question about it.',
              placeholder: 'Type a question about the selected document…',
            }
          : {
              title: 'No documents indexed',
              description: 'Upload a document in the Indexer to make it searchable here.',
              placeholder: 'Type a question…',
            }
      }
      suggestions={
        hasDocs
          ? ['Summarize this document', 'What are the key takeaways?', 'List the main sections']
          : []
      }
      formatAnswer={formatText}
      sourcesLabel="Sources referenced"
      contextValue={selectedDoc || null}
      onSend={(query, { signal }) => askRagAppQuestion(query, selectedDoc, { signal })}
      options={options}
    />
  );
}

export default RagAppChat;
