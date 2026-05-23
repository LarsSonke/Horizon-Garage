import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE = [0.25, 0.46, 0.45, 0.94];

type Tag = 'your-action' | 'automated' | 'our-action';

const TAG_STYLES: Record<Tag, { label: string; color: string; bg: string }> = {
  'your-action': { label: 'Your Action',  color: '#007FFF', bg: 'rgba(0,127,255,0.1)'   },
  'automated':   { label: 'Automated',    color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  'our-action':  { label: 'Our Action',   color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
};

const STEPS: { title: string; desc: string; tag: Tag; detail?: string }[] = [
  {
    title: 'Submit Your Request',
    tag: 'your-action',
    desc: 'Fill in the booking form — select your service, provide your vehicle details, choose a preferred date and time slot, and enter your contact information.',
    detail: 'Takes about 2 minutes.',
  },
  {
    title: 'Instant Confirmation Email',
    tag: 'automated',
    desc: 'The moment you submit, an automated confirmation lands in your inbox with your unique booking reference number and a full summary of your request.',
    detail: 'Sent within seconds.',
  },
  {
    title: 'We Review & Confirm Your Slot',
    tag: 'our-action',
    desc: 'Our team checks availability for your requested date and time. If anything needs adjusting we\'ll reach out directly. Once confirmed, you receive a second email locking in your appointment.',
    detail: 'Usually within a few hours during opening hours.',
  },
  {
    title: '24-Hour Reminder',
    tag: 'automated',
    desc: 'The day before your appointment you\'ll automatically receive a reminder email with your booking details, our address, and what to bring with you.',
    detail: 'Sent automatically at 09:00 the day before.',
  },
  {
    title: 'Drop Off Your Vehicle',
    tag: 'your-action',
    desc: 'Arrive at Horizon Garage at your agreed time slot. If you selected collection & delivery, we\'ll come to you — no need to visit the garage at all.',
    detail: 'Stationsplein 12, 1012 AB Amsterdam.',
  },
  {
    title: 'Work in Progress',
    tag: 'our-action',
    desc: 'Our technicians carry out the agreed service. If we discover anything unexpected during the work — additional parts needed, hidden damage — we call you before proceeding. Nothing happens without your approval.',
    detail: 'You are kept informed at every stage.',
  },
  {
    title: 'Your Car Is Ready',
    tag: 'automated',
    desc: 'Once the work is complete you receive an email and SMS notification with a summary of everything that was done, the final cost, and your collection window.',
    detail: 'Triggered the moment the job is closed.',
  },
  {
    title: 'Pick Up & Pay',
    tag: 'your-action',
    desc: 'Collect your vehicle from the garage, or we deliver it back to you if you chose that option. Payment is made on collection — card, bank transfer, or cash accepted.',
    detail: 'No hidden charges beyond what was agreed.',
  },
  {
    title: 'Follow-Up Check',
    tag: 'automated',
    desc: 'Three days after collection, we send a short follow-up to make sure everything is running as expected. If anything isn\'t right, we want to know — and we\'ll make it right.',
    detail: 'Sent automatically 72 hours after collection.',
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section id="process" ref={ref} className="relative py-28 px-6 lg:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">How It Works</div>
          <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">The Full Flow</h2>
          <p className="text-white/55 max-w-xl mt-4">
            Every step from booking to driving away — what happens, who does it, and what to expect.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            {(Object.entries(TAG_STYLES) as [Tag, typeof TAG_STYLES[Tag]][]).map(([, s]) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] lg:left-[23px] top-0 bottom-0 w-px bg-white/8 hidden sm:block" />

          <div className="space-y-0">
            {STEPS.map((step, i) => {
              const tag = TAG_STYLES[step.tag];
              const isLast = i === STEPS.length - 1;

              return (
                <motion.div
                  key={step.title}
                  className="relative flex gap-6 lg:gap-10"
                  initial={{ opacity: 0, x: -24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
                >
                  {/* Step number + line */}
                  <div className="flex flex-col items-center shrink-0 z-10">
                    <div
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border flex items-center justify-center font-display text-lg shrink-0"
                      style={{
                        borderColor: tag.color,
                        background: tag.bg,
                        color: tag.color,
                        boxShadow: `0 0 16px ${tag.color}22`,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 min-h-[32px]" style={{ background: `linear-gradient(to bottom, ${tag.color}40, transparent)` }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-10 ${isLast ? '' : ''}`}>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-display text-2xl lg:text-3xl leading-tight">{step.title}</h3>
                      <span
                        className="font-mono text-[9px] tracking-[0.28em] uppercase px-2 py-1 rounded-sm"
                        style={{ color: tag.color, background: tag.bg, border: `1px solid ${tag.color}40` }}
                      >
                        {tag.label}
                      </span>
                    </div>
                    <p className="text-white/60 leading-relaxed max-w-2xl">{step.desc}</p>
                    {step.detail && (
                      <div
                        className="inline-block mt-3 font-mono text-[10px] tracking-[0.2em] uppercase"
                        style={{ color: tag.color, opacity: 0.7 }}
                      >
                        {step.detail}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-4 pt-12 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
        >
          <div>
            <div className="font-display text-3xl leading-tight">Ready to book?</div>
            <div className="text-white/50 text-sm mt-1">The form takes two minutes. We'll handle the rest.</div>
          </div>
          <a
            href="#booking"
            className="btn-cta primary shrink-0"
            style={{ '--accent': '#007FFF' } as React.CSSProperties}
          >
            Book a Service
          </a>
        </motion.div>

      </div>
    </section>
  );
}
