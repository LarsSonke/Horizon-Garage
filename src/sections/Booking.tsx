import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingData = {
  service: string;
  serviceTitle: string;
  servicePrice: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  registration: string;
  issue: string;
  date: string;
  timeSlot: string;
  collection: boolean;
  name: string;
  email: string;
  phone: string;
};

const EMPTY: BookingData = {
  service: '', serviceTitle: '', servicePrice: '',
  make: '', model: '', year: '', mileage: '', registration: '', issue: '',
  date: '', timeSlot: '', collection: false,
  name: '', email: '', phone: '',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Service', 'Vehicle', 'Schedule', 'Contact', 'Review'];

const SERVICES = [
  { id: 'general',    title: 'General Service',        desc: 'Full inspection, oil, fluids & filters.',    price: 'From €150',    accent: '#10b981' },
  { id: 'engine',     title: 'Engine Diagnostics',     desc: 'OBD scan, compression test & repair.',       price: 'From €95',     accent: '#FF1E1E' },
  { id: 'tuning',     title: 'Performance Tuning',     desc: 'ECU remap, exhaust & suspension setup.',     price: 'From €450',    accent: '#007FFF' },
  { id: 'bodywork',   title: 'Bodywork & Paint',       desc: 'Panel repair, correction & ceramic coat.',   price: 'From €300',    accent: '#FFBF00' },
  { id: 'brakes',     title: 'Brake & Suspension',     desc: 'Pads, discs, alignment & full overhaul.',   price: 'From €180',    accent: '#a855f7' },
  { id: 'prepurchase','title': 'Pre-purchase Check',   desc: '120-point independent inspection report.',   price: '€195 fixed',   accent: '#f97316' },
];

const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   time: '08:00 – 12:00' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 – 18:00' },
];

// ─── Animation ────────────────────────────────────────────────────────────────

const stepVariants = {
  enter:  (dir: number) => ({ x: dir * 64, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:   (dir: number) => ({ x: dir * -64, opacity: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendEmails(data: BookingData, reference: string) {
  const svc  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const pub  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const cTpl = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;
  const aTpl = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;

  if (!svc || !pub || !cTpl) return; // not configured — silent skip in demo

  const common = {
    reference,
    service:      data.serviceTitle,
    price:        data.servicePrice,
    vehicle:      `${data.make} ${data.model} (${data.year})`,
    registration: data.registration || '—',
    mileage:      data.mileage ? `${data.mileage} km` : '—',
    date:         new Date(data.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time_slot:    TIME_SLOTS.find(t => t.id === data.timeSlot)?.time ?? data.timeSlot,
    collection:   data.collection ? 'Yes — we will arrange collection & delivery' : 'No — dropping off in person',
    issue:        data.issue || '—',
    customer_name:  data.name,
    customer_email: data.email,
    customer_phone: data.phone || '—',
  };

  // Customer confirmation
  await emailjs.send(svc, cTpl, { to_name: data.name, to_email: data.email, ...common }, pub);

  // Admin notification
  if (aTpl) {
    await emailjs.send(svc, aTpl, {
      to_email: import.meta.env.VITE_ADMIN_EMAIL ?? 'contact@horizongarage.com',
      ...common,
    }, pub);
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Booking() {
  const [step, setStep]         = useState(1);
  const [dir, setDir]           = useState(1);
  const [data, setData]         = useState<BookingData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference]   = useState('');
  const [confirmed, setConfirmed]   = useState(false);

  const update = (patch: Partial<BookingData>) => setData(d => ({ ...d, ...patch }));

  const next = () => { setDir(1);  setStep(s => s + 1); };
  const back = () => { setDir(-1); setStep(s => s - 1); };

  const confirm = async () => {
    setSubmitting(true);
    const ref = `HG-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    try { await sendEmails(data, ref); } catch { /* non-fatal */ }
    setReference(ref);
    setSubmitting(false);
    setConfirmed(true);
  };

  const reset = () => { setData(EMPTY); setStep(1); setDir(1); setConfirmed(false); setReference(''); };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate  = tomorrow.toISOString().split('T')[0];

  return (
    <section id="booking" className="relative py-28 px-6 lg:px-12 border-t border-white/10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">Book a Repair</div>
          <h2 className="font-display text-6xl md:text-7xl leading-none mt-3">
            {confirmed ? 'You\'re Booked.' : 'Bring It In.'}
          </h2>
          {!confirmed && (
            <p className="text-white/55 mt-3 max-w-xl">
              Complete the form below and we'll confirm your slot within a few hours. A confirmation email will be sent to you automatically.
            </p>
          )}
        </div>

        {/* Stepper */}
        {!confirmed && <Stepper step={step} />}

        {/* Steps */}
        <div className="mt-10 overflow-hidden">
          <AnimatePresence custom={dir} mode="wait">
            {confirmed ? (
              <ConfirmationScreen key="done" data={data} reference={reference} onReset={reset} />
            ) : step === 1 ? (
              <ServiceStep    key={1} data={data} update={update} onNext={next} dir={dir} />
            ) : step === 2 ? (
              <VehicleStep    key={2} data={data} update={update} onNext={next} onBack={back} dir={dir} minDate={minDate} />
            ) : step === 3 ? (
              <ScheduleStep   key={3} data={data} update={update} onNext={next} onBack={back} dir={dir} minDate={minDate} />
            ) : step === 4 ? (
              <ContactStep    key={4} data={data} update={update} onNext={next} onBack={back} dir={dir} />
            ) : (
              <ReviewStep     key={5} data={data} onConfirm={confirm} onBack={back} dir={dir} submitting={submitting} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done    = n < step;
        const active  = n === step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[11px] transition-all duration-300"
                style={{
                  borderColor: done || active ? '#007FFF' : 'rgba(255,255,255,0.15)',
                  background:  done ? '#007FFF' : active ? 'rgba(0,127,255,0.15)' : 'transparent',
                  color:       done || active ? 'white' : 'rgba(255,255,255,0.35)',
                }}
              >
                {done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : n}
              </div>
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-300"
                style={{ color: active ? 'white' : 'rgba(255,255,255,0.35)' }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-5 transition-all duration-500"
                style={{ background: n < step ? '#007FFF' : 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step wrapper ─────────────────────────────────────────────────────────────

function StepWrap({ children, dir }: { children: React.ReactNode; dir: number }) {
  return (
    <motion.div
      variants={stepVariants}
      custom={dir}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

// ─── Step 1: Service ──────────────────────────────────────────────────────────

function ServiceStep({ data, update, onNext, dir }: { data: BookingData; update: (p: Partial<BookingData>) => void; onNext: () => void; dir: number }) {
  return (
    <StepWrap dir={dir}>
      <p className="text-white/50 text-sm mb-6">Which service do you need?</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {SERVICES.map(s => {
          const selected = data.service === s.id;
          return (
            <button
              key={s.id}
              onClick={() => update({ service: s.id, serviceTitle: s.title, servicePrice: s.price })}
              className="text-left border p-4 transition-all duration-200"
              style={{
                borderColor:  selected ? s.accent : 'rgba(255,255,255,0.1)',
                background:   selected ? `${s.accent}14` : 'rgba(255,255,255,0.02)',
                boxShadow:    selected ? `0 0 0 1px ${s.accent}` : 'none',
              }}
            >
              <div className="font-display text-xl leading-tight" style={{ color: selected ? s.accent : 'white' }}>
                {s.title}
              </div>
              <div className="text-white/50 text-xs mt-1 leading-snug">{s.desc}</div>
              <div className="font-mono text-[10px] tracking-[0.2em] mt-3" style={{ color: s.accent }}>{s.price}</div>
            </button>
          );
        })}
      </div>
      <NavRow onNext={onNext} nextDisabled={!data.service} />
    </StepWrap>
  );
}

// ─── Step 2: Vehicle ──────────────────────────────────────────────────────────

function VehicleStep({ data, update, onNext, onBack, dir }: any) {
  const valid = data.make && data.model && data.year;
  return (
    <StepWrap dir={dir}>
      <p className="text-white/50 text-sm mb-6">Tell us about the vehicle.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Make" required>
          <input className="form-input" placeholder="e.g. Porsche" value={data.make} onChange={e => update({ make: e.target.value })} required />
        </Field>
        <Field label="Model" required>
          <input className="form-input" placeholder="e.g. 911 GT3" value={data.model} onChange={e => update({ model: e.target.value })} required />
        </Field>
        <Field label="Year" required>
          <input className="form-input" placeholder="e.g. 2022" type="number" min="1970" max={new Date().getFullYear() + 1} value={data.year} onChange={e => update({ year: e.target.value })} required />
        </Field>
        <Field label="Mileage (km)">
          <input className="form-input" placeholder="e.g. 14500" type="number" min="0" value={data.mileage} onChange={e => update({ mileage: e.target.value })} />
        </Field>
        <Field label="Registration Plate">
          <input className="form-input" placeholder="e.g. AB-123-C" value={data.registration} onChange={e => update({ registration: e.target.value })} />
        </Field>
        <Field label="Issue / Request" className="sm:col-span-2">
          <textarea className="form-input resize-none" rows={3} placeholder="Describe the issue or what you'd like done…" value={data.issue} onChange={e => update({ issue: e.target.value })} />
        </Field>
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!valid} />
    </StepWrap>
  );
}

// ─── Step 3: Schedule ─────────────────────────────────────────────────────────

function ScheduleStep({ data, update, onNext, onBack, dir, minDate }: any) {
  const valid = data.date && data.timeSlot;
  return (
    <StepWrap dir={dir}>
      <p className="text-white/50 text-sm mb-6">Pick your preferred date and time.</p>
      <div className="space-y-6">
        <Field label="Preferred Date" required>
          <input className="form-input" type="date" min={minDate} value={data.date} onChange={e => update({ date: e.target.value })} required />
        </Field>

        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mb-3">
            Time Slot <span className="text-white/25 ml-1">*</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIME_SLOTS.map(t => {
              const sel = data.timeSlot === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => update({ timeSlot: t.id })}
                  className="border p-4 text-left transition-all duration-200"
                  style={{
                    borderColor: sel ? '#007FFF' : 'rgba(255,255,255,0.1)',
                    background:  sel ? 'rgba(0,127,255,0.12)' : 'rgba(255,255,255,0.02)',
                    boxShadow:   sel ? '0 0 0 1px #007FFF' : 'none',
                  }}
                >
                  <div className="font-display text-2xl">{t.label}</div>
                  <div className="font-mono text-[11px] text-white/50 mt-1 tracking-wider">{t.time}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mb-3">Collection & Delivery</div>
          <button
            onClick={() => update({ collection: !data.collection })}
            className="flex items-center gap-3 border border-white/10 px-4 py-3 bg-white/[0.02] w-full text-left transition-colors"
            style={{ borderColor: data.collection ? '#007FFF' : undefined, background: data.collection ? 'rgba(0,127,255,0.08)' : undefined }}
          >
            <div
              className="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all"
              style={{ borderColor: data.collection ? '#007FFF' : 'rgba(255,255,255,0.25)', background: data.collection ? '#007FFF' : 'transparent' }}
            >
              {data.collection && (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm text-white/80">I'd like collection & delivery</div>
              <div className="text-xs text-white/40 mt-0.5">We'll pick up your car and return it when the work is done.</div>
            </div>
          </button>
        </div>
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!valid} />
    </StepWrap>
  );
}

// ─── Step 4: Contact ──────────────────────────────────────────────────────────

function ContactStep({ data, update, onNext, onBack, dir }: any) {
  const valid = data.name && data.email;
  return (
    <StepWrap dir={dir}>
      <p className="text-white/50 text-sm mb-6">How do we reach you?</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" required className="sm:col-span-2">
          <input className="form-input" placeholder="Your name" value={data.name} onChange={e => update({ name: e.target.value })} required />
        </Field>
        <Field label="Email Address" required>
          <input className="form-input" type="email" placeholder="you@example.com" value={data.email} onChange={e => update({ email: e.target.value })} required />
        </Field>
        <Field label="Phone Number">
          <input className="form-input" type="tel" placeholder="+31 6 00 00 00 00" value={data.phone} onChange={e => update({ phone: e.target.value })} />
        </Field>
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!valid} />
    </StepWrap>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────

function ReviewStep({ data, onConfirm, onBack, dir, submitting }: any) {
  const slot = TIME_SLOTS.find(t => t.id === data.timeSlot);
  const rows: [string, string][] = [
    ['Service',         data.serviceTitle],
    ['Estimated Cost',  data.servicePrice],
    ['Vehicle',         `${data.make} ${data.model} (${data.year})`],
    ['Registration',    data.registration || '—'],
    ['Mileage',         data.mileage ? `${data.mileage} km` : '—'],
    ['Date',            data.date ? new Date(data.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
    ['Time',            slot ? `${slot.label} · ${slot.time}` : '—'],
    ['Collection',      data.collection ? 'Yes' : 'No'],
    ['Name',            data.name],
    ['Email',           data.email],
    ['Phone',           data.phone || '—'],
  ];

  return (
    <StepWrap dir={dir}>
      <p className="text-white/50 text-sm mb-6">Review your booking before confirming.</p>

      <div className="border border-white/10 divide-y divide-white/8">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <span className="font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase shrink-0">{k}</span>
            <span className="text-white/85 text-sm text-right">{v}</span>
          </div>
        ))}
        {data.issue && (
          <div className="px-4 py-3">
            <div className="font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase mb-1">Notes</div>
            <div className="text-white/75 text-sm leading-relaxed">{data.issue}</div>
          </div>
        )}
      </div>

      <p className="text-white/35 text-xs mt-4 leading-relaxed">
        A confirmation email will be sent to <span className="text-white/60">{data.email}</span> once you confirm. We'll follow up if we need any additional details.
      </p>

      <NavRow
        onBack={onBack}
        onNext={onConfirm}
        nextLabel={submitting ? 'Sending…' : 'Confirm Booking'}
        nextDisabled={submitting}
        nextAccent="#10b981"
      />
    </StepWrap>
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

function ConfirmationScreen({ data, reference, onReset }: { data: BookingData; reference: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center py-8"
    >
      {/* Check icon */}
      <div className="mx-auto w-16 h-16 rounded-full border border-emerald-500/50 grid place-items-center mb-8"
        style={{ background: 'rgba(16,185,129,0.08)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Reference */}
      <div className="font-mono text-[11px] tracking-[0.4em] text-white/40 uppercase mb-3">Booking Reference</div>
      <div className="font-display text-5xl mb-8" style={{ color: '#10b981' }}>{reference}</div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
        {[
          { label: 'Service',  value: data.serviceTitle },
          { label: 'Vehicle',  value: `${data.make} ${data.model}` },
          { label: 'Date',     value: data.date ? new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="border border-white/10 px-3 py-3 bg-white/[0.02]">
            <div className="font-mono text-[9px] tracking-[0.28em] text-white/35 uppercase">{label}</div>
            <div className="text-white/80 text-sm mt-1 leading-tight">{value}</div>
          </div>
        ))}
      </div>

      <p className="text-white/50 text-sm mb-2">
        Confirmation sent to <span className="text-white">{data.email}</span>
      </p>
      <p className="text-white/35 text-xs mb-10">
        We'll be in touch to finalise the details. Questions? Call us or drop a WhatsApp.
      </p>

      {/* Contact quick-links */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <a
          href="https://wa.me/31643451816"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta primary flex items-center gap-2"
          style={{ '--accent': '#25D366', fontSize: 14, padding: '10px 18px' } as React.CSSProperties}
        >
          <WhatsAppIcon /> WhatsApp
        </a>
        <a
          href="mailto:contact@horizongarage.com"
          className="btn-cta flex items-center gap-2"
          style={{ '--accent': '#007FFF', fontSize: 14, padding: '10px 18px' } as React.CSSProperties}
        >
          Email Us
        </a>
      </div>

      <button onClick={onReset} className="font-mono text-[11px] tracking-[0.28em] text-white/35 uppercase hover:text-white/60 transition-colors">
        Make Another Booking
      </button>
    </motion.div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function NavRow({
  onNext, onBack, nextLabel = 'Continue', nextDisabled = false, nextAccent = '#007FFF',
}: {
  onNext: () => void; onBack?: () => void;
  nextLabel?: string; nextDisabled?: boolean; nextAccent?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] uppercase text-white/45 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      ) : <div />}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-cta primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        style={{ '--accent': nextAccent } as React.CSSProperties}
      >
        {nextLabel}
        {nextLabel === 'Continue' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </button>
    </div>
  );
}

function Field({ label, children, required = false, className = '' }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <div className={className}>
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
