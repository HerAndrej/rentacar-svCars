'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendContactMessage } from '@/lib/actions';

export default function ContactForm() {
  const t = useTranslations('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await sendContactMessage({
      name: formData.get('name') as string,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      message: formData.get('message') as string,
    });

    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrorMsg(result.message);
    }
    setIsSubmitting(false);
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="glass rounded-xl p-12 text-center border border-accent/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
          className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle size={32} className="text-accent" />
        </motion.div>
        <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-xl mb-2">Hvala!</h3>
        <p className="text-text-secondary">Poruka uspjesno poslana. Kontaktiracemo vas uskoro.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-8 border border-border/30">
      <div className="space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-2">{t('name')}</label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
            placeholder={t('name')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-text-secondary mb-2">{t('email')}</label>
            <input
              type="email"
              name="email"
              className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
              placeholder={t('email')}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">{t('phone')}</label>
            <input
              type="tel"
              name="phone"
              className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
              placeholder={t('phone')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">{t('message')}</label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all resize-none focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
            placeholder={t('message')}
          />
        </div>

        {errorMsg && (
          <p className="text-red-400 text-sm">{errorMsg}</p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-accent text-white px-8 py-4 rounded-lg text-sm font-bold tracking-wider hover:bg-accent-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <AnimatePresence mode="wait">
            {isSubmitting ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                SLANJE...
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                {t('send')}
                <Send size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </form>
  );
}
