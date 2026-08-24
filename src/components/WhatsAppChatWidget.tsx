import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const WHATSAPP_NUMBER = '919973878399';

const QUICK_QUESTIONS = [
  'How do I activate my QR tag?',
  'What is the price of the Car Tag?',
  'Is my phone number kept private?',
  'How long does delivery take?',
  'I want to talk to a support agent',
];

const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const WhatsAppChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 font-['Hanken_Grotesk',sans-serif]">
      {isOpen && (
        <div className="w-[320px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-neutral-200 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Scan Connect Support</p>
              <p className="text-white/80 text-xs leading-tight">Typically replies within minutes</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat widget"
              className="text-white/90 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#ECE5DD] max-h-[360px] overflow-y-auto">
            <div className="bg-white rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-xs max-w-[85%]">
              <p className="text-sm text-[#1B1C1C]">
                Hi there! 👋 How can we help you today? Pick a quick question below or send us your own message on WhatsApp.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {QUICK_QUESTIONS.map((question) => (
                <a
                  key={question}
                  href={buildWhatsAppLink(question)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left bg-white hover:bg-[#FFED00]/10 border border-neutral-200 hover:border-[#FFED00] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#1B1C1C] transition-colors cursor-pointer"
                >
                  {question}
                </a>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-3 bg-white border-t border-neutral-200">
            <a
              href={buildWhatsAppLink('Hi, I need help with Scan Connect.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer w-full h-[44px] bg-[#25D366] hover:bg-[#1fbd5a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Start WhatsApp Chat</span>
            </a>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        className="btn-shimmer w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1fbd5a] shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:-translate-y-0.5 flex items-center justify-center transition-all cursor-pointer active:scale-95"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
};
