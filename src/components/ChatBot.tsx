'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageCircle, X, Send, Phone, Car, HelpCircle, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { faqItemsHr, faqItemsEn } from '@/data/faq';

type ChatStep = 'menu' | 'faq' | 'faq-detail' | 'reservation' | 'contact';

interface Message {
  from: 'bot' | 'user';
  text: string;
}

export default function ChatBot() {
  const t = useTranslations();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>('menu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const faqItems = locale === 'hr' ? faqItemsHr : faqItemsEn;
  const isHr = locale === 'hr';

  function openChat() {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        from: 'bot',
        text: isHr
          ? 'Zdravo! 👋 Dobrodosli u SV Cars. Kako vam mozemo pomoci?'
          : 'Hello! 👋 Welcome to SV Cars. How can we help you?',
      }]);
    }
  }

  function goToMenu() {
    setStep('menu');
    setSelectedFaq(null);
  }

  function handleMenuOption(option: string) {
    switch (option) {
      case 'vehicles':
        setMessages(prev => [
          ...prev,
          { from: 'user', text: isHr ? 'Zelim pogledati vozila' : 'I want to see vehicles' },
          {
            from: 'bot',
            text: isHr
              ? 'Pogledajte nasu kompletnu ponudu na stranici Vozila. Imamo 12 vozila — od ekonomicnih do premium klase i quad vozila!'
              : 'Check out our full fleet on the Vehicles page. We have 12 vehicles — from economy to premium class and quad bikes!',
          },
        ]);
        break;
      case 'reservation':
        setStep('reservation');
        setMessages(prev => [
          ...prev,
          { from: 'user', text: isHr ? 'Zelim rezervisati vozilo' : 'I want to reserve a vehicle' },
          {
            from: 'bot',
            text: isHr
              ? 'Za brzu rezervaciju, kontaktirajte nas direktno putem WhatsAppa ili telefona. Trebat ce nam:\n\n• Vase ime\n• Telefon\n• Koje vozilo zelite\n• Datum preuzimanja i vracanja\n• Lokacija preuzimanja'
              : 'For a quick reservation, contact us directly via WhatsApp or phone. We\'ll need:\n\n• Your name\n• Phone number\n• Which vehicle you want\n• Pickup and return dates\n• Pickup location',
          },
        ]);
        break;
      case 'faq':
        setStep('faq');
        setMessages(prev => [
          ...prev,
          { from: 'user', text: isHr ? 'Imam pitanje' : 'I have a question' },
          {
            from: 'bot',
            text: isHr
              ? 'Odaberite pitanje koje vas zanima:'
              : 'Select the question you\'re interested in:',
          },
        ]);
        break;
      case 'contact':
        setStep('contact');
        setMessages(prev => [
          ...prev,
          { from: 'user', text: isHr ? 'Kontakt informacije' : 'Contact information' },
          {
            from: 'bot',
            text: isHr
              ? '📍 Vojno bb, 88000 Mostar, BiH\n📞 +387 63 09 09 08\n📧 info@sv-cars.ba\n🕐 Radno vrijeme: 08:00 - 20:00\n\nMozete nas kontaktirati i putem WhatsAppa!'
              : '📍 Vojno bb, 88000 Mostar, BiH\n📞 +387 63 09 09 08\n📧 info@sv-cars.ba\n🕐 Working hours: 08:00 - 20:00\n\nYou can also reach us via WhatsApp!',
          },
        ]);
        break;
    }
  }

  function handleFaqSelect(index: number) {
    setSelectedFaq(index);
    setStep('faq-detail');
    setMessages(prev => [
      ...prev,
      { from: 'user', text: faqItems[index].question },
      { from: 'bot', text: faqItems[index].answer },
    ]);
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent-hover transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-bg-primary border border-border rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-bg-secondary border-b border-border px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                <span className="text-white font-[family-name:var(--font-montserrat)] font-black text-[8px] leading-tight text-center">
                  SV<br />CARS
                </span>
              </div>
              <div>
                <p className="font-[family-name:var(--font-montserrat)] font-bold text-sm">SV Cars</p>
                <p className="text-text-secondary text-xs">
                  {isHr ? 'Online — odgovaramo odmah' : 'Online — we reply instantly'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-bg-card border border-border text-text-primary rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* FAQ Options */}
            {step === 'faq' && (
              <div className="space-y-2 pt-2">
                {faqItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleFaqSelect(i)}
                    className="w-full text-left px-4 py-3 bg-bg-card border border-border rounded-xl text-sm text-text-primary hover:border-accent/50 hover:text-accent transition-all"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-border p-3 flex-shrink-0">
            {step === 'menu' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMenuOption('vehicles')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-bg-card border border-border rounded-xl text-xs font-medium hover:border-accent/50 hover:text-accent transition-all"
                >
                  <Car size={14} className="text-accent flex-shrink-0" />
                  {isHr ? 'Pogledaj vozila' : 'View vehicles'}
                </button>
                <button
                  onClick={() => handleMenuOption('reservation')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-bg-card border border-border rounded-xl text-xs font-medium hover:border-accent/50 hover:text-accent transition-all"
                >
                  <Calendar size={14} className="text-accent flex-shrink-0" />
                  {isHr ? 'Rezervisi' : 'Reserve'}
                </button>
                <button
                  onClick={() => handleMenuOption('faq')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-bg-card border border-border rounded-xl text-xs font-medium hover:border-accent/50 hover:text-accent transition-all"
                >
                  <HelpCircle size={14} className="text-accent flex-shrink-0" />
                  {isHr ? 'Cesta pitanja' : 'FAQ'}
                </button>
                <button
                  onClick={() => handleMenuOption('contact')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-bg-card border border-border rounded-xl text-xs font-medium hover:border-accent/50 hover:text-accent transition-all"
                >
                  <MapPin size={14} className="text-accent flex-shrink-0" />
                  {isHr ? 'Kontakt' : 'Contact'}
                </button>
              </div>
            )}

            {step === 'reservation' && (
              <div className="space-y-2">
                <a
                  href="https://wa.me/38763090908?text=Zdravo!%20Zelim%20rezervisati%20vozilo."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#20bd5a] transition-all"
                >
                  <Send size={14} />
                  WhatsApp
                </a>
                <a
                  href="tel:+38763090908"
                  className="flex items-center justify-center gap-2 w-full bg-accent text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-accent-hover transition-all"
                >
                  <Phone size={14} />
                  {isHr ? 'Nazovite nas' : 'Call us'}
                </a>
                <button
                  onClick={goToMenu}
                  className="w-full text-text-secondary text-xs py-2 hover:text-accent transition-colors"
                >
                  <ArrowRight size={12} className="inline rotate-180 mr-1" />
                  {isHr ? 'Nazad na meni' : 'Back to menu'}
                </button>
              </div>
            )}

            {step === 'contact' && (
              <div className="space-y-2">
                <a
                  href="https://wa.me/38763090908"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#20bd5a] transition-all"
                >
                  <Send size={14} />
                  WhatsApp
                </a>
                <button
                  onClick={goToMenu}
                  className="w-full text-text-secondary text-xs py-2 hover:text-accent transition-colors"
                >
                  <ArrowRight size={12} className="inline rotate-180 mr-1" />
                  {isHr ? 'Nazad na meni' : 'Back to menu'}
                </button>
              </div>
            )}

            {(step === 'faq' || step === 'faq-detail') && (
              <div className="space-y-2">
                {step === 'faq-detail' && (
                  <button
                    onClick={() => { setStep('faq'); setSelectedFaq(null); }}
                    className="w-full flex items-center justify-center gap-2 bg-bg-card border border-border text-text-primary px-4 py-2.5 rounded-xl text-xs font-medium hover:border-accent/50 hover:text-accent transition-all"
                  >
                    <HelpCircle size={12} />
                    {isHr ? 'Vidi druga pitanja' : 'See other questions'}
                  </button>
                )}
                <button
                  onClick={goToMenu}
                  className="w-full text-text-secondary text-xs py-2 hover:text-accent transition-colors"
                >
                  <ArrowRight size={12} className="inline rotate-180 mr-1" />
                  {isHr ? 'Nazad na meni' : 'Back to menu'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
