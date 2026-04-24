'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { ContactMessage } from '@/types';
import { Mail, Phone, Clock, Check, Trash2 } from 'lucide-react';

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-montserrat)]">Poruke</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-accent text-white'
              : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          Nepročitane
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              className={`bg-bg-card border rounded-xl p-6 ${
                msg.is_read ? 'border-border' : 'border-accent/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{msg.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                    {msg.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {msg.email}
                      </span>
                    )}
                    {msg.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {msg.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!msg.is_read && (
                    <button
                      onClick={() => markAsRead(msg.id)}
                      className="p-2 rounded-lg hover:bg-green-500/10 text-text-secondary hover:text-green-400 transition-colors"
                      title="Označi kao pročitano"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
                    title="Obriši"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-text-secondary whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
