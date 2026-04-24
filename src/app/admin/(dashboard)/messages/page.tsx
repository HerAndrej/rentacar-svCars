'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { ContactMessage } from '@/types';
import { Mail, Phone, Clock, Check, Trash2, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/export-csv';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const supabase = createClient();

  useEffect(() => {
    loadMessages();
  }, [filter]);

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

  async function markAsRead(id: string) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    loadMessages();
  }

  async function deleteMessage(id: string) {
    if (!confirm('Obrisati poruku?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    loadMessages();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)]">Poruke</h1>
        <button
          onClick={exportMessages}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-bg-card border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

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
    </div>
  );
}
