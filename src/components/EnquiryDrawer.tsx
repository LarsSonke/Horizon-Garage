import React, { useEffect, useState } from 'react';
import type { Car } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

async function sendEnquiry(car: Car, form: { name: string; email: string; phone: string; message: string }) {
  const svc  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const pub  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const aTpl = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
  if (!svc || !pub || !aTpl) return;

  await emailjs.send(svc, aTpl, {
    reference:      `ENQ-${Date.now().toString(36).toUpperCase()}`,
    service:        `Purchase Enquiry — ${car.name}`,
    price:          car.price ?? 'POA',
    vehicle:        `${car.maker} ${car.name} (${car.year})`,
    registration:   '—',
    mileage:        '—',
    date:           '—',
    time_slot:      '—',
    collection:     '—',
    issue:          form.message || '—',
    customer_name:  form.name,
    customer_email: form.email,
    customer_phone: form.phone || '—',
    to_email:       import.meta.env.VITE_ADMIN_EMAIL ?? 'contact@horizongarage.com',
  }, pub);
}

export default function EnquiryDrawer({ car, onClose }: { car: Car; onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    message: `Hi, I'm interested in the ${car.name} listed at ${car.price ?? 'POA'}. Could you provide more details?`,
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try { await sendEnquiry(car, form); } catch { /* non-fatal */ }
    setStatus('sent');
  };

  const canSubmit = form.name.trim() && form.email.trim();

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }} />

      <motion.div
        className="relative w-full md:max-w-[480px] h-full overflow-y-auto flex flex-col"
        style={{ background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Car header */}
        <div
          className="relative px-8 pt-8 pb-7 border-b border-white/8 shrink-0"
          style={{ background: `linear-gradient(135deg, ${car.accent}16 0%, transparent 55%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/45 hover:text-white hover:border-white/25 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flex items-start gap-5">
            {car.imgStatic && (
              <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <img src={car.imgStatic} alt={car.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mb-1">Enquire About</div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase">{car.maker} · {car.year}</div>
              <div className="font-display text-3xl leading-tight mt-0.5" style={{ color: car.accent }}>{car.name}</div>
              <div className="font-display text-xl text-white/55 mt-0.5">{car.price ?? 'POA'}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-8">
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col items-center text-center py-8"
              >
                <div
                  className="w-16 h-16 rounded-full border grid place-items-center mb-6"
                  style={{ borderColor: `${car.accent}50`, background: `${car.accent}12` }}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" stroke={car.accent}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <div className="font-mono text-[10px] tracking-[0.35em] text-white/40 uppercase mb-2">Enquiry Sent</div>
                <h3 className="font-display text-4xl mb-3" style={{ color: car.accent }}>We'll Be in Touch</h3>
                <p className="text-white/55 text-sm leading-relaxed max-w-xs mb-8">
                  We've received your interest in the {car.name}. One of our team will reach out within a few hours.
                </p>

                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/31643451816?text=Hi%2C%20I%20just%20enquired%20about%20the%20${encodeURIComponent(car.name)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta primary flex items-center gap-2"
                    style={{ '--accent': '#25D366', fontSize: 13, padding: '9px 16px' } as React.CSSProperties}
                  >
                    <WhatsAppIcon /> WhatsApp Us
                  </a>
                  <button
                    onClick={onClose}
                    className="btn-cta flex items-center gap-2"
                    style={{ '--accent': car.accent, fontSize: 13, padding: '9px 16px' } as React.CSSProperties}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={submit}
                className="space-y-5"
              >
                <p className="text-white/50 text-sm leading-relaxed">
                  Leave your details and we'll get back to you within a few hours to discuss the {car.name}.
                </p>

                <Field label="Full Name" required>
                  <input className="form-input w-full" placeholder="Your name" value={form.name} onChange={set('name')} required autoFocus />
                </Field>

                <Field label="Email Address" required>
                  <input className="form-input w-full" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </Field>

                <Field label="Phone Number">
                  <input className="form-input w-full" type="tel" placeholder="+31 6 00 00 00 00" value={form.phone} onChange={set('phone')} />
                </Field>

                <Field label="Message">
                  <textarea className="form-input w-full resize-none" rows={4} value={form.message} onChange={set('message')} />
                </Field>

                <button
                  type="submit"
                  disabled={!canSubmit || status === 'sending'}
                  className="btn-cta primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ '--accent': car.accent, fontSize: 15, padding: '13px 0' } as React.CSSProperties}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Enquiry'}
                </button>

                <p className="text-white/30 text-xs text-center">
                  Or reach us directly —{' '}
                  <a
                    href={`https://wa.me/31643451816?text=${encodeURIComponent(`Hi, I'm interested in the ${car.name}.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-white/50 hover:text-white transition-colors underline underline-offset-2"
                  >
                    WhatsApp
                  </a>
                  {' '}or{' '}
                  <a href="mailto:contact@horizongarage.com" className="text-white/50 hover:text-white transition-colors underline underline-offset-2">
                    email us
                  </a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mb-2">
        {label}{required && <span className="text-white/25 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
