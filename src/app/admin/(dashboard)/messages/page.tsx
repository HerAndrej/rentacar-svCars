'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { ContactMessage } from '@/types';
import { Mail, Phone, Clock, Check, Trash2, Download, MessageSquare, User, Bot, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadCSV } from '@/lib/export-csv';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  platform: string;
  external_user_id: string;
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

type Tab = 'contact' | 'chat';

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>('contact');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (tab === 'contact') loadMessages();
    else loadSessions();
  }, [tab, filter]);

  async function loadMessages() {
    setLoading(true);
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === 'unread') {
      query = query.eq('is_read', false);
    }

    const { data } = await query;
    setMessages(data || []);
    setLoading(false);
  }

  async function loadSessions() {
    setLoading(true);
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    loadMessages();
  }

  async function deleteMessage(id: string) {
    if (!confirm('Obrisati poruku?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    loadMessages();
  }

  async function deleteSession(id: string) {
    if (!confirm('Obrisati cijeli razgovor?')) return;
    setDeletingSession(id);
    await supabase.from('chat_sessions').delete().eq('id', id);
    setDeletingSession(null);
    setExpandedSession(null);
    loadSessions();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatRelative(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Upravo';
    if (mins < 60) return `Prije ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Prije ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Prije ${days}d`;
    return formatDate(date);
  }

  function exportMessages() {
    const headers = ['Ime', 'Email', 'Telefon', 'Poruka', 'Pročitano', 'Datum'];
    const rows = messages.map((msg) => [
      msg.name,
      msg.email || '',
      msg.phone || '',
      msg.message,
      msg.is_read ? 'Da' : 'Ne',
      formatDate(msg.created_at),
    ]);
    const suffix = filter === 'all' ? 'sve' : 'neprocitane';
    downloadCSV(`poruke-${suffix}`, headers, rows);
  }

  function exportSessions() {
    const headers = ['Platforma', 'Korisnik', 'Poruke', 'Zadnja aktivnost', 'Razgovor'];
    const rows = sessions.map((s) => [
      s.platform,
      s.external_user_id,
      String(s.messages?.length || 0),
      formatDate(s.updated_at),
      (s.messages || []).map(m => `${m.role}: ${m.content}`).join(' | '),
    ]);
    downloadCSV('chatbot-razgovori', headers, rows);
  }

  const PlatformIcon = ({ platform }: { platform: string }) => {
    if (platform === 'instagram') return <MessageSquare size={14} className="text-pink-400" />;
    return <Globe size={14} className="text-blue-400" />;
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)]">Poruke</h1>
        <button
          onClick={tab === 'contact' ? exportMessages : exportSessions}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-bg-card border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        <button
          onClick={() => setTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'contact'
              ? 'bg-accent text-white'
              : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <Mail size={16} />
          Kontakt
          {unreadCount > 0 && tab !== 'contact' && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'chat'
              ? 'bg-accent text-white'
              : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <MessageSquare size={16} />
          Chatbot
          {sessions.length > 0 && tab !== 'chat' && (
            <span className="bg-accent/20 text-accent text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {sessions.length}
            </span>
          )}
        </button>
      </div>

      {/* Contact Messages Tab */}
      {tab === 'contact' && (
        <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-accent text-white'
                  : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Nepročitane
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-accent text-white'
                  : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Sve
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-text-muted">Učitavanje...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-bg-card border border-border rounded-xl">
              {filter === 'unread' ? 'Nema nepročitanih poruka.' : 'Nema poruka.'}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-bg-card border rounded-xl p-4 sm:p-6 ${
                    msg.is_read ? 'border-border' : 'border-accent/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">{msg.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary mt-1">
                        {msg.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail size={14} className="shrink-0" />
                            <span className="truncate">{msg.email}</span>
                          </span>
                        )}
                        {msg.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} className="shrink-0" />
                            {msg.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="shrink-0" />
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 ml-2 shrink-0">
                      {!msg.is_read && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="p-1.5 sm:p-2 rounded-lg hover:bg-green-500/10 text-text-secondary hover:text-green-400 transition-colors"
                          title="Označi kao pročitano"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
                        title="Obriši"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-text-secondary whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Chat Sessions Tab */}
      {tab === 'chat' && (
        <>
          {loading ? (
            <div className="text-center py-12 text-text-muted">Učitavanje...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-bg-card border border-border rounded-xl">
              Nema chatbot razgovora.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const isExpanded = expandedSession === session.id;
                const msgs = session.messages || [];
                const lastUserMsg = [...msgs].reverse().find(m => m.role === 'user');
                const platformLabel = session.platform === 'instagram' ? 'Instagram' : 'Web';

                return (
                  <div
                    key={session.id}
                    className="bg-bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Session header */}
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      className="w-full p-4 sm:p-5 flex items-center gap-3 hover:bg-bg-primary/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-bg-primary border border-border flex items-center justify-center shrink-0">
                        <PlatformIcon platform={session.platform} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm truncate">
                            {session.external_user_id.length > 20
                              ? session.external_user_id.slice(0, 8) + '...'
                              : session.external_user_id}
                          </span>
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                            session.platform === 'instagram'
                              ? 'bg-pink-500/10 text-pink-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {platformLabel}
                          </span>
                          <span className="text-[10px] text-text-muted bg-bg-primary px-2 py-0.5 rounded-full">
                            {msgs.length} poruka
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary truncate">
                          {lastUserMsg ? lastUserMsg.content : 'Nema poruka'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-text-muted hidden sm:block">
                          {formatRelative(session.updated_at)}
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                      </div>
                    </button>

                    {/* Expanded messages */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                          {msgs.length === 0 ? (
                            <p className="text-center text-text-muted text-sm py-4">Prazan razgovor</p>
                          ) : (
                            msgs.map((msg, i) => (
                              <div
                                key={i}
                                className={`flex gap-2.5 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}
                              >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                  msg.role === 'assistant'
                                    ? 'bg-accent/10 text-accent'
                                    : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                                </div>
                                <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                  msg.role === 'assistant'
                                    ? 'bg-bg-primary border border-border text-text-secondary'
                                    : 'bg-accent/10 border border-accent/20 text-text-primary'
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="border-t border-border p-3 flex items-center justify-between">
                          <span className="text-xs text-text-muted">
                            {formatDate(session.created_at)} — {formatDate(session.updated_at)}
                          </span>
                          <button
                            onClick={() => deleteSession(session.id)}
                            disabled={deletingSession === session.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                            Obriši razgovor
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
