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
    to_email:       'service.horizon.garage@gmail.com',
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
                    href="mailto:service.horizon.garage@gmail.com"
                    className="btn-cta primary flex items-center gap-2"
                    style={{ '--accent': '#007FFF', fontSize: 13, padding: '9px 16px' } as React.CSSProperties}
                  >
                    Email Us
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
                  <a href="mailto:service.horizon.garage@gmail.com" className="text-white/50 hover:text-white transition-colors underline underline-offset-2">
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

