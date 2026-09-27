import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { askBackendQuestion, getCollections } from '../api/ragApi';
import ChatPage from './ChatPage';
import { Select } from './ui';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Neutral answer formatting */
function formatText(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    const safe = escapeHtml(trimmed);

    if (/^[-•*]\s/.test(trimmed)) {
      return `<span class="block pl-4 text-text-secondary">• ${safe.slice(2)}</span>`;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      return `<span class="block pl-4 text-text-secondary">${safe}</span>`;
    }

    let formatted = safe.replace(
      /(\+?\d[\d\-\s]{9,})/g,
      '<span class="rounded-md bg-surface-soft border border-border px-1.5 py-0.5 font-mono text-xs text-text-primary">$1</span>'
    );

    return trimmed ? `<p class="mb-2.5 leading-relaxed text-text-secondary">${formatted}</p>` : '';
  });

  return formattedLines.join('');
}

export function BackendChat() {
  const { user } = useAuth();
  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');

  useEffect(() => {
    async function loadCollections() {
      try {
        const cols = await getCollections();
        const mongoCols = cols.mongo || [];
        setAvailableCollections(mongoCols);
        setSelectedCollection((prev) => (prev === 'all' || mongoCols.includes(prev) ? prev : 'all'));
      } catch (err) {
        console.error('Failed to load collections:', err);
      }
    }
    loadCollections();
  }, [user]);

  const options = (
    <div className="flex items-center gap-2.5">
      <label htmlFor="collection-select" className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-text-muted">
        Scope
      </label>
      <div className="w-64">
        <Select
          id="collection-select"
          size="sm"
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
        >
          <option value="all">All collections</option>
          {availableCollections.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );

  return (
    <ChatPage
      title="MongoDB Search"
      description="Search across every indexed collection, or scope to a single collection."
      statusLabel="Connected"
      emptyState={{
        title: 'No search query yet',
        description: 'Ask a question to search the indexed MongoDB collections. Answers cite the records they were built from.',
        placeholder: 'Type a question, e.g. “List all phone numbers found in records”',
      }}
      suggestions={[
        'What are the most recent records?',
        'Summarize the key topics across documents',
        'List all phone numbers you can find',
      ]}
      formatAnswer={formatText}
      sourcesLabel="Sources found"
      contextValue={selectedCollection === 'all' ? null : selectedCollection}
      onSend={(question, { signal }) =>
        askBackendQuestion(
          question,
          selectedCollection === 'all' ? null : selectedCollection,
          { signal }
        )
      }
      options={options}
    />
  );
}

export default BackendChat;
