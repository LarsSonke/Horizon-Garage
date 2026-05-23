import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICES = [
  'General Service & Inspection',
  'Engine Diagnostics & Repair',
  'Performance Tuning',
  'Bodywork & Paint Correction',
  'Brake & Suspension',
  'Pre-purchase Inspection',
  'Other',
];

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

type FormState = {
  name: string; email: string; phone: string;
  vehicle: string; service: string; date: string; notes: string;
};

const EMPTY: FormState = { name: '', email: '', phone: '', vehicle: '', service: '', date: '', notes: '' };

export default function Booking() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="booking" className="relative py-28 px-6 lg:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
        {/* Left */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">Book an Appointment</div>
            <h2 className="font-display text-6xl md:text-7xl leading-none mt-3">Bring It In.</h2>
            <p className="text-white/60 max-w-md mt-4 leading-relaxed">
              Whether it's a scheduled service, an urgent repair, or a pre-purchase inspection — we'll have it sorted. Fill in the form and we'll confirm within 24 hours.
            </p>
          </div>

          <div className="space-y-3">
            {([
              ['Opening Hours', 'Mon – Fri  08:00 – 18:00\nSaturday  09:00 – 14:00\nSunday  Closed'],
              ['Location', 'Stationsplein 12\n1012 AB Amsterdam, NL'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="border border-white/10 px-4 py-3 bg-white/[0.02]">
                <div className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase mb-1">{label}</div>
                <div className="text-white/75 text-sm whitespace-pre-line leading-relaxed">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/31643451816?text=Hi%2C%20I%27d%20like%20to%20book%20an%20appointment%20at%20Horizon%20Garage."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta primary flex items-center justify-center gap-2"
              style={{ '--accent': '#25D366' } as React.CSSProperties}
            >
              <WhatsAppIcon /> WhatsApp Us
            </a>
            <a
              href="mailto:contact@horizongarage.com"
              className="btn-cta flex items-center justify-center gap-2"
              style={{ '--accent': '#007FFF' } as React.CSSProperties}
            >
              Email Us
            </a>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="min-h-[480px] flex flex-col items-center justify-center text-center border border-white/10 bg-white/[0.02] p-10"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div
                  className="w-14 h-14 rounded-full border border-emerald-500/60 grid place-items-center mb-6"
                  style={{ background: 'rgba(16,185,129,0.08)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display text-4xl mb-3">Request Received</h3>
                <p className="text-white/60 max-w-sm leading-relaxed">
                  We'll confirm your appointment within 24 hours. You'll hear from us at{' '}
                  <span className="text-white">{form.email}</span>.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm(EMPTY); }}
                  className="btn-cta mt-8"
                  style={{ '--accent': '#10b981' } as React.CSSProperties}
                >
                  New Booking
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Field label="Full Name" required>
                  <input type="text" placeholder="Your name" value={form.name} onChange={set('name')} required className="form-input" />
                </Field>
                <Field label="Email Address" required>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required className="form-input" />
                </Field>
                <Field label="Phone Number">
                  <input type="tel" placeholder="+31 6 00 00 00 00" value={form.phone} onChange={set('phone')} className="form-input" />
                </Field>
                <Field label="Your Vehicle" required>
                  <input type="text" placeholder="e.g. BMW M3 2022" value={form.vehicle} onChange={set('vehicle')} required className="form-input" />
                </Field>
                <Field label="Service Type" required className="col-span-2">
                  <select value={form.service} onChange={set('service')} required className="form-input">
                    <option value="">Select a service…</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Preferred Date" className="col-span-1">
                  <input type="date" value={form.date} onChange={set('date')} className="form-input" />
                </Field>
                <Field label="Notes" className="col-span-2">
                  <textarea
                    placeholder="Any details about the issue or your vehicle…"
                    value={form.notes}
                    onChange={set('notes')}
                    rows={3}
                    className="form-input resize-none"
                  />
                </Field>
                <div className="col-span-2">
                  <button type="submit" className="btn-cta primary w-full" style={{ '--accent': '#007FFF' } as React.CSSProperties}>
                    Request Appointment
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Field({
  label, children, required = false, className = '',
}: {
  label: string; children: React.ReactNode; required?: boolean; className?: string;
}) {
  return (
    <div className={className || 'col-span-1'}>
      <label className="block font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mb-2">
        {label}{required && <span className="text-white/25 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
