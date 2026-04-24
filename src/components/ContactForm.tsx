'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const t = useTranslations('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with server action when Supabase is connected
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSuccess(true);
    setIsSubmitting(false);
  }

  if (isSuccess) {
    return (
      <div className="bg-bg-card border border-accent/30 rounded-lg p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Send size={24} className="text-accent" />
        </div>
        <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-xl mb-2">Hvala!</h3>
        <p className="text-text-secondary">Poruka uspjesno poslana. Kontaktiracemo vas uskoro.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-lg p-8">
      <div className="space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-2">{t('name')}</label>
          <input
            type="text"
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-colors"
            placeholder={t('name')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-text-secondary mb-2">{t('email')}</label>
            <input
              type="email"
              className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-colors"
              placeholder={t('email')}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">{t('phone')}</label>
            <input
              type="tel"
              className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-colors"
              placeholder={t('phone')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">{t('message')}</label>
          <textarea
            required
            rows={5}
            className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-colors resize-none"
            placeholder={t('message')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white px-8 py-4 text-sm font-bold tracking-wider hover:bg-accent-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? 'SLANJE...' : t('send')}
          <Send size={16} />
        </button>
      </div>
    </form>
  );
}
