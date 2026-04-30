'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function ChatBot() {
  const locale = useLocale();
  const isHr = locale === 'hr';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function openChat() {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: isHr
          ? 'Zdravo! 👋 Ja sam SV Cars AI asistent. Mogu vam pomoći sa:\n\n• Pregledom vozila i cijena\n• Provjerom dostupnosti\n• Rezervacijom vozila\n• Informacijama o usluzi\n\nKako vam mogu pomoći?'
          : 'Hello! 👋 I\'m the SV Cars AI assistant. I can help you with:\n\n• Viewing vehicles and prices\n• Checking availability\n• Making reservations\n• Service information\n\nHow can I help you?',
      }]);
    }
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter((_, i) => !(i === 0 && newMessages[0].role === 'assistant'))
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const reply = data.message || data.error || 'Greška. Pokušajte ponovo.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isHr
            ? 'Izvinite, došlo je do greške. Pokušajte ponovo ili nas kontaktirajte na +387 63 09 09 08.'
            : 'Sorry, an error occurred. Please try again or contact us at +387 63 09 09 08.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sendQuickAction(text: string) {
    setInput(text);
    setTimeout(() => {
      setInput('');
      const userMsg: Message = { role: 'user', content: text };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setLoading(true);
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      })
        .then(r => r.json())
        .then(data => setMessages(prev => [...prev, { role: 'assistant', content: data.message }]))
        .catch(() => setMessages(prev => [...prev, { role: 'assistant', content: isHr ? 'Greška. Pokušajte ponovo.' : 'Error. Try again.' }]))
        .finally(() => setLoading(false));
    }, 0);
  }

  const quickActions = isHr
    ? ['Koja vozila imate?', 'Cijene za SUV?', 'Želim rezervisati', 'Radno vrijeme?']
    : ['What cars do you have?', 'SUV prices?', 'I want to book', 'Working hours?'];

  return (
    <>
      {/* Floating button with pulse ring */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            onClick={openChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent-hover transition-colors pulse-ring"
            aria-label="Open chat"
          >
            <MessageCircle size={24} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-6rem)] sm:h-[560px] glass rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden border border-border/30"
          >
            {/* Header */}
            <div className="bg-bg-secondary/80 backdrop-blur-sm border-b border-border/30 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo.jpg"
                  alt="SV Cars"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg object-cover"
                />
                <div>
                  <p className="font-[family-name:var(--font-montserrat)] font-bold text-sm">SV Cars AI</p>
                  <p className="text-text-secondary text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    {isHr ? 'Online — AI asistent' : 'Online — AI assistant'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors p-1"
                aria-label="Close chat"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-accent text-white rounded-br-md'
                        : 'bg-bg-card border border-border/50 text-text-primary rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 size={18} className="animate-spin text-accent" />
                  </div>
                </motion.div>
              )}

              {/* Quick actions after first message only */}
              {messages.length === 1 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {quickActions.map((action) => (
                    <motion.button
                      key={action}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendQuickAction(action)}
                      className="px-3 py-1.5 bg-bg-card border border-border/50 rounded-full text-xs text-text-secondary hover:border-accent/50 hover:text-accent transition-all"
                    >
                      {action}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="border-t border-border/30 p-3 flex gap-2 flex-shrink-0 bg-bg-secondary/50">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isHr ? 'Napišite poruku...' : 'Type a message...'}
                disabled={loading}
                className="flex-1 bg-bg-card border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 disabled:opacity-50 transition-colors"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={16} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
