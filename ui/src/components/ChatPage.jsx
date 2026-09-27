import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  EmptyState,
  Spinner,
  StatusDot,
  Alert,
  Card,
  toast,
} from './ui';
import { CopyIcon, SearchIcon, SendIcon, XIcon } from './icons.jsx';
import { useAuth } from '../context/AuthContext';

/**
 * Shared chat layout used by the MongoDB and PostgreSQL workspaces.
 * Built on design system layout and message presentation components.
 */
export default function ChatPage({
  title,
  description,
  statusLabel = 'Ready',
  emptyState,
  suggestions = [],
  options = null,
  formatAnswer = (text) => text,
  sourcesLabel = 'Sources',
  renderSource = null,
  contextValue = null,
  sendDisabled = false,
  onSend,
}) {
  const { isAuthenticated, openLogin } = useAuth();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const canSubmit = useMemo(
    () => query.trim().length > 0 && !isLoading && !sendDisabled,
    [query, isLoading, sendDisabled]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  useEffect(() => {
    return () => abortRef.current?.abort?.();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const trimmed = query.trim();
    setIsLoading(true);
    setQuery('');

    try {
      const data = await onSend(trimmed, { signal: controller.signal });
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          question: trimmed,
          answer: data.answer,
          sources: data.sources || [],
          context: contextValue,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Something went wrong.');
      setQuery(trimmed); // restore the draft so the user can retry
    } finally {
      setIsLoading(false);
    }
  }

  function clearChat() {
    abortRef.current?.abort?.();
    setHistory([]);
    setError('');
  }

  function applySuggestion(text) {
    setQuery(text);
    inputRef.current?.focus();
  }

  const showEmptyState = history.length === 0 && !isLoading;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background lg:h-screen">
      {/* Page header */}
      <header className="shrink-0 border-b border-border bg-surface px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-end justify-between gap-3 py-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary">{title}</h1>
            {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <StatusDot tone={isLoading ? 'warning' : 'success'}>
              {isLoading ? 'Searching…' : statusLabel}
            </StatusDot>
            {history.length > 0 && (
              <Button size="xs" variant="secondary" onClick={clearChat}>
                Clear chat
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Transcript */}
      <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {showEmptyState && emptyState && (
            <div className="py-16">
              <EmptyState
                icon={<SearchIcon size={24} />}
                title={emptyState.title}
                description={emptyState.description}
                action={
                  suggestions.length > 0 && !sendDisabled ? (
                    <div className="flex max-w-md flex-wrap justify-center gap-2">
                      {suggestions.map((s) => (
                        <Button key={s} size="xs" variant="secondary" onClick={() => applySuggestion(s)}>
                          {s}
                        </Button>
                      ))}
                    </div>
                  ) : null
                }
              />
            </div>
          )}

          <div className="space-y-6 py-6">
            {history.map((item) => (
              <MessageItem
                key={item.id}
                item={item}
                formatAnswer={formatAnswer}
                sourcesLabel={sourcesLabel}
                renderSource={renderSource}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-text-muted shadow-sm animate-fade-in">
                <Spinner size={14} className="text-primary" />
                <span>Searching vector sources and generating answer…</span>
              </div>
            )}

            {error && (
              <Alert variant="danger" onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}
          </div>
        </div>
      </main>

      {/* Composer */}
      <footer className="shrink-0 border-t border-border bg-surface px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-3 py-3.5">
          {!isAuthenticated && (
            <Alert variant="info">
              <div className="flex items-center justify-between gap-3">
                <span>Sign in with an account to query the RAG knowledge base.</span>
                <Button size="xs" variant="primary" onClick={openLogin}>
                  Sign In / Register
                </Button>
              </div>
            </Alert>
          )}

          {options}

          <form className="flex items-end gap-2" onSubmit={onSubmit}>
            <div className="flex-1">
              <textarea
                ref={inputRef}
                rows={1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={emptyState?.placeholder ?? 'Type a question…'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                className="max-h-40 min-h-9 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-surface-soft"
                disabled={sendDisabled}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!canSubmit}
              loading={isLoading}
              rightIcon={!isLoading ? <SendIcon size={14} /> : null}
            >
              {isLoading ? 'Searching' : 'Search'}
            </Button>
          </form>
          <p className="text-xs text-text-muted">Enter to search · Shift+Enter for a new line</p>
        </div>
      </footer>
    </div>
  );
}

function MessageItem({ item, formatAnswer, sourcesLabel, renderSource }) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const hasSources = Array.isArray(item.sources) && item.sources.length > 0;

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(item.answer);
      setCopied(true);
      toast.success('Answer copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Card className="p-5 space-y-4 animate-fade-in shadow-sm">
      {/* Question */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Question</p>
        <p className="mt-1 font-semibold text-text-primary text-sm sm:text-base">{item.question}</p>
      </div>

      {/* Answer */}
      <div className="border-t border-border-light pt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Answer</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Button variant="ghost" size="xs" onClick={copyAnswer} leftIcon={<CopyIcon size={12} />}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        <div className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          <div dangerouslySetInnerHTML={{ __html: formatAnswer(item.answer) }} />
        </div>
      </div>

      {/* Sources */}
      {hasSources && (
        <div className="border-t border-border-light pt-3">
          <button
            type="button"
            onClick={() => setShowSources((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            <span>{sourcesLabel} ({item.sources.length})</span>
            <span className={`transition-transform duration-150 ${showSources ? 'rotate-90' : ''}`}>›</span>
          </button>
          {showSources && (
            <ul className="mt-2.5 space-y-2">
              {item.sources.map((src, i) => (
                <li
                  key={i}
                  className="rounded-md border border-border bg-surface-soft p-3 text-xs leading-relaxed text-text-secondary"
                >
                  {renderSource ? (
                    renderSource(src, i)
                  ) : (
                    <>
                      <p className="italic text-text-primary">"{src.content}"</p>
                      {src.metadata && (
                        <p className="mt-1.5 text-xs font-medium text-text-muted">
                          Source: {src.metadata.source || src.metadata.partner || 'Unknown document'}
                        </p>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
