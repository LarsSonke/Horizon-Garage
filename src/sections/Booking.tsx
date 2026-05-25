import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import emailjs from '@emailjs/browser';

// Auto-format Dutch-style plates: groups letters vs numbers and inserts dashes between them.
// AB123C → AB-123-C   |   AB12DC → AB-12-DC   |   1-ABC-23 stays as typed.
function formatPlate(raw: string): string {
  const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
  if (!clean) return '';
  const groups: string[] = [];
  let cur = clean[0];
  for (let i = 1; i < clean.length; i++) {
    const sameType = /[A-Z]/.test(clean[i]) === /[A-Z]/.test(cur[cur.length - 1]);
    if (sameType) cur += clean[i];
    else { groups.push(cur); cur = clean[i]; }
  }
  groups.push(cur);
  return groups.join('-');
}

// ─── Car data — makes and models ─────────────────────────────────────────────

const CAR_MAKES: { name: string; domain: string }[] = [
  { name: 'Acura',          domain: 'acura.com' },
  { name: 'Alfa Romeo',     domain: 'alfaromeo.com' },
  { name: 'Alpina',         domain: 'alpina.de' },
  { name: 'Alpine',         domain: 'alpinecars.com' },
  { name: 'Ariel',          domain: 'arielmotor.co.uk' },
  { name: 'Aston Martin',   domain: 'astonmartin.com' },
  { name: 'Audi',           domain: 'audi.com' },
  { name: 'BAC',            domain: 'bac-mono.com' },
  { name: 'Bentley',        domain: 'bentleymotors.com' },
  { name: 'BMW',            domain: 'bmw.com' },
  { name: 'Brabus',         domain: 'brabus.com' },
  { name: 'Bugatti',        domain: 'bugatti.com' },
  { name: 'Cadillac',       domain: 'cadillac.com' },
  { name: 'Caterham',       domain: 'caterhamcars.com' },
  { name: 'Chevrolet',      domain: 'chevrolet.com' },
  { name: 'Citroën',        domain: 'citroen.com' },
  { name: 'Cupra',          domain: 'cupraofficial.com' },
  { name: 'Dacia',          domain: 'dacia.com' },
  { name: 'De Tomaso',      domain: 'detomaso.com' },
  { name: 'Dodge',          domain: 'dodge.com' },
  { name: 'DS Automobiles', domain: 'dsautomobiles.com' },
  { name: 'Ferrari',        domain: 'ferrari.com' },
  { name: 'Fiat',           domain: 'fiat.com' },
  { name: 'Ford',           domain: 'ford.com' },
  { name: 'Genesis',        domain: 'genesis.com' },
  { name: 'Ginetta',        domain: 'ginetta.com' },
  { name: 'GMC',            domain: 'gmc.com' },
  { name: 'Honda',          domain: 'honda.com' },
  { name: 'Hyundai',        domain: 'hyundai.com' },
  { name: 'Infiniti',       domain: 'infiniti.com' },
  { name: 'Jaguar',         domain: 'jaguar.com' },
  { name: 'Kia',            domain: 'kia.com' },
  { name: 'Koenigsegg',     domain: 'koenigsegg.com' },
  { name: 'Lamborghini',    domain: 'lamborghini.com' },
  { name: 'Lancia',         domain: 'lancia.com' },
  { name: 'Land Rover',     domain: 'landrover.com' },
  { name: 'Lexus',          domain: 'lexus.com' },
  { name: 'Lotus',          domain: 'lotuscars.com' },
  { name: 'Lucid',          domain: 'lucidmotors.com' },
  { name: 'Maserati',       domain: 'maserati.com' },
  { name: 'Mazzanti',       domain: 'mazzanti.it' },
  { name: 'Mazda',          domain: 'mazda.com' },
  { name: 'McLaren',        domain: 'mclaren.com' },
  { name: 'Mercedes-Benz',  domain: 'mercedes-benz.com' },
  { name: 'Mini',           domain: 'mini.com' },
  { name: 'Mitsubishi',     domain: 'mitsubishi-motors.com' },
  { name: 'Morgan',         domain: 'morgan-motor.co.uk' },
  { name: 'Nissan',         domain: 'nissan.com' },
  { name: 'Noble',          domain: 'noblem400.com' },
  { name: 'Opel',           domain: 'opel.com' },
  { name: 'Pagani',         domain: 'pagani.com' },
  { name: 'Peugeot',        domain: 'peugeot.com' },
  { name: 'Polestar',       domain: 'polestar.com' },
  { name: 'Porsche',        domain: 'porsche.com' },
  { name: 'Radical',        domain: 'radicalmotorsport.com' },
  { name: 'Renault',        domain: 'renault.com' },
  { name: 'Rimac',          domain: 'rimac-automobili.com' },
  { name: 'Rolls-Royce',    domain: 'rolls-roycemotorcars.com' },
  { name: 'Seat',           domain: 'seat.com' },
  { name: 'Singer',         domain: 'singervehicledesign.com' },
  { name: 'Skoda',          domain: 'skoda-auto.com' },
  { name: 'Spyker',         domain: 'spykercars.com' },
  { name: 'Subaru',         domain: 'subaru.com' },
  { name: 'Suzuki',         domain: 'suzuki.com' },
  { name: 'Tesla',          domain: 'tesla.com' },
  { name: 'Toyota',         domain: 'toyota.com' },
  { name: 'TVR',            domain: 'tvr.co.uk' },
  { name: 'Vauxhall',       domain: 'vauxhall.co.uk' },
  { name: 'Volkswagen',     domain: 'vw.com' },
  { name: 'Volvo',          domain: 'volvocars.com' },
  { name: 'W Motors',       domain: 'wmotors.ae' },
  { name: 'Wiesmann',       domain: 'wiesmann.com' },
  { name: 'Zenvo',          domain: 'zenvoautomotive.com' },
];

const CAR_MODELS: Record<string, string[]> = {
  'Alfa Romeo':    ['Giulia', 'Giulia Quadrifoglio', 'Stelvio', 'Stelvio Quadrifoglio', '4C', 'GTV'],
  'Aston Martin':  ['DB11', 'DB12', 'DBS', 'Vantage', 'Vantage AMR', 'Vanquish', 'DBX', 'Valkyrie', 'Vulcan'],
  'Audi':          ['R8', 'R8 V10', 'RS3', 'RS4', 'RS4 Avant', 'RS5', 'RS6', 'RS6 Avant', 'RS6 GT', 'RS7', 'TT RS', 'S3', 'S4', 'S5', 'A4', 'A6', 'Q5', 'Q7', 'e-tron GT', 'RS e-tron GT'],
  'Bentley':       ['Continental GT', 'Continental GT Speed', 'Continental GTC', 'Flying Spur', 'Bentayga', 'Mulliner'],
  'BMW':           ['M2', 'M3', 'M3 Competition', 'M4', 'M4 Competition', 'M5', 'M5 CS', 'M8', 'M8 Gran Coupé', 'X5 M', 'X6 M', '1 Series', '3 Series', '5 Series', 'i4 M50', 'iX M60'],
  'Bugatti':       ['Chiron', 'Chiron Super Sport', 'Chiron Pur Sport', 'Veyron', 'Bolide', 'Tourbillon'],
  'Chevrolet':     ['Corvette', 'Corvette Z06', 'Corvette ZR1', 'Camaro ZL1', 'Camaro SS'],
  'Dodge':         ['Viper', 'Challenger SRT', 'Challenger Hellcat', 'Charger Hellcat'],
  'Ferrari':       ['296 GTB', '296 GTS', 'SF90 Stradale', 'SF90 Spider', 'F8 Tributo', 'F8 Spider', '812 Superfast', '812 GTS', 'Roma', 'Portofino M', 'Purosangue', 'LaFerrari', '488 Pista'],
  'Ford':          ['GT', 'Mustang', 'Mustang GT500', 'Mustang Mach 1', 'Focus RS', 'Fiesta ST'],
  'Honda':         ['NSX', 'Civic Type R', 'Integra Type S', 'S2000'],
  'Hyundai':       ['i30 N', 'i20 N', 'Elantra N', 'Ioniq 5 N'],
  'Jaguar':        ['F-Type', 'F-Type R', 'F-Type SVR', 'XE SV Project 8', 'XKR-S'],
  'Koenigsegg':    ['Agera RS', 'Jesko', 'Jesko Absolut', 'Regera', 'CC850', 'Gemera'],
  'Lamborghini':   ['Huracán', 'Huracán STO', 'Huracán Tecnica', 'Huracán Evo', 'Urus', 'Urus Performante', 'Revuelto', 'Countach'],
  'Land Rover':    ['Defender', 'Discovery', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar'],
  'Lexus':         ['LC 500', 'LC 500h', 'LFA', 'IS 500', 'RC F'],
  'Lotus':         ['Emira', 'Evija', 'Exige', 'Elise', 'Evora'],
  'Maserati':      ['MC20', 'GranTurismo', 'GranCabrio', 'Quattroporte', 'Ghibli', 'Levante'],
  'Mazzanti':      ['Evantra', 'Evantra Millecavalli'],
  'McLaren':       ['720S', '765LT', 'Artura', 'GT', 'P1', 'Senna', 'Elva', '750S', '600LT'],
  'Mercedes-Benz': ['AMG GT', 'AMG GT R', 'AMG GT Black Series', 'C 63 AMG', 'E 63 AMG', 'S 63 AMG', 'G 63 AMG', 'GLE 63 AMG', 'SL 63 AMG', 'A 45 AMG', 'CLA 45 AMG', 'AMG ONE'],
  'Nissan':        ['GT-R', 'GT-R NISMO', '370Z', '400Z', 'Skyline'],
  'Pagani':        ['Huayra', 'Huayra R', 'Huayra Roadster', 'Zonda', 'Utopia'],
  'Porsche':       ['911', '911 Carrera', '911 Carrera S', '911 Carrera 4S', '911 Turbo', '911 Turbo S', '911 GT3', '911 GT3 RS', '911 GT3 Touring', '718 Cayman', '718 Cayman GT4', '718 Boxster', 'Taycan', 'Taycan Turbo S', 'Cayenne', 'Cayenne Turbo', 'Macan', 'Panamera', '918 Spyder'],
  'Renault':       ['Mégane RS', 'Clio RS', 'Alpine A110', 'Zoe'],
  'Rolls-Royce':   ['Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Spectre'],
  'Seat':          ['Leon Cupra', 'Ibiza FR', 'Ateca Cupra'],
  'Skoda':         ['Octavia RS', 'Kodiaq RS', 'Fabia RS'],
  'Subaru':        ['WRX STI', 'BRZ', 'Impreza WRX', 'Forester XT'],
  'Toyota':        ['GR Supra', 'GR86', 'GR Yaris', 'Celica', 'MR2'],
  'Volkswagen':    ['Golf R', 'Golf GTI', 'Polo GTI', 'Arteon R', 'Scirocco R'],
  'Volvo':         ['V60 Polestar', 'S60 Polestar', 'XC40 Recharge', 'C40'],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingData = {
  service: string;
  serviceTitle: string;
  servicePrice: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  country: string;
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
  make: '', model: '', year: '', mileage: '', country: 'NL', registration: '', issue: '',
  date: '', timeSlot: '', collection: false,
  name: '', email: '', phone: '',
};

// ─── Plate countries ──────────────────────────────────────────────────────────

const PLATE_COUNTRIES = [
  { code: 'NL', name: 'Netherlands',    flag: '🇳🇱', bg: '#F5C400', text: '#000', eu: 'NL', rounded: true,  gb: false },
  { code: 'DE', name: 'Germany',        flag: '🇩🇪', bg: '#ffffff', text: '#000', eu: 'D',  rounded: false, gb: false },
  { code: 'BE', name: 'Belgium',        flag: '🇧🇪', bg: '#ffffff', text: '#000', eu: 'B',  rounded: false, gb: false },
  { code: 'FR', name: 'France',         flag: '🇫🇷', bg: '#ffffff', text: '#000', eu: 'F',  rounded: false, gb: false },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', bg: '#ffffff', text: '#000', eu: 'GB', rounded: true,  gb: true  },
  { code: 'IT', name: 'Italy',          flag: '🇮🇹', bg: '#ffffff', text: '#000', eu: 'I',  rounded: false, gb: false },
  { code: 'ES', name: 'Spain',          flag: '🇪🇸', bg: '#ffffff', text: '#000', eu: 'E',  rounded: false, gb: false },
  { code: 'PL', name: 'Poland',         flag: '🇵🇱', bg: '#ffffff', text: '#000', eu: 'PL', rounded: false, gb: false },
  { code: 'SE', name: 'Sweden',         flag: '🇸🇪', bg: '#ffffff', text: '#000', eu: 'S',  rounded: false, gb: false },
  { code: 'US', name: 'United States',  flag: '🇺🇸', bg: '#ffffff', text: '#000', eu: null, rounded: true,  gb: false },
  { code: 'XX', name: 'Other',          flag: '🌍',  bg: '#ffffff', text: '#000', eu: null, rounded: false, gb: false },
] as const;

type PlateCountry = typeof PLATE_COUNTRIES[number];
const getCountry = (code: string): PlateCountry =>
  PLATE_COUNTRIES.find(c => c.code === code) ?? PLATE_COUNTRIES[0];

function formatForCountry(raw: string, country: string): string {
  const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (country === 'GB') {
    const c = clean.slice(0, 7);
    return c.length > 4 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
  }
  if (country === 'US' || country === 'XX') {
    return clean.slice(0, 10);
  }
  return formatPlate(raw);
}

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
    registration: data.registration ? `${data.country} · ${data.registration}` : '—',
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
      to_email: 'service.horizon.garage@gmail.com',
      ...common,
    }, pub);
  }
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────

interface AcOption { label: string; logo?: string; initial?: string; }

function LogoBadge({ logo, initial }: { logo?: string; initial?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="w-6 h-6 flex items-center justify-center shrink-0 rounded p-0.5" style={{ border: '1px solid rgba(0,127,255,0.35)' }}>
      {logo && !failed ? (
        <img
          src={logo}
          alt=""
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-mono text-[10px] font-bold text-white/40">{initial}</span>
      )}
    </div>
  );
}

function Autocomplete({ value, onChange, onSelect, options, placeholder, showAllOnFocus = false }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  options: AcOption[];
  placeholder?: string;
  showAllOnFocus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim().length > 0
    ? options
        .filter(o => o.label.toLowerCase().includes(value.toLowerCase()))
        .sort((a, b) => {
          const q = value.toLowerCase();
          const aStarts = a.label.toLowerCase().startsWith(q);
          const bStarts = b.label.toLowerCase().startsWith(q);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
        })
    : showAllOnFocus ? options : [];

  const visible = filtered.slice(0, showAllOnFocus && value.trim().length === 0 ? options.length : 8);

  useEffect(() => { setCursor(-1); }, [value]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pick = (opt: AcOption) => { onSelect(opt.label); setOpen(false); setCursor(-1); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || visible.length === 0) return;
    if (e.key === 'ArrowDown')  { e.preventDefault(); setCursor(c => Math.min(c + 1, visible.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter' && cursor >= 0) { e.preventDefault(); pick(visible[cursor]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        className="form-input w-full"
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
      />
      <AnimatePresence>
        {open && visible.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 border border-white/10 overflow-hidden overflow-y-auto"
            style={{ background: '#0e0e0e', boxShadow: '0 20px 48px rgba(0,0,0,0.7)', maxHeight: 240 }}
          >
            {visible.map((opt, i) => (
              <li
                key={opt.label}
                onMouseDown={() => pick(opt)}
                onMouseEnter={() => setCursor(i)}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                style={{ background: i === cursor ? 'rgba(0,127,255,0.12)' : 'transparent' }}
              >
                {(opt.logo || opt.initial) && (
                  <LogoBadge logo={opt.logo} initial={opt.initial} />
                )}
                <span className="text-sm text-white/85">{opt.label}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Plate Input ──────────────────────────────────────────────────────────────

function PlateInput({ value, country, onChange }: { value: string; country: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      const el = inputRef.current;
      if (!el) return;
      const s = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? s;
      onChange((value.slice(0, s) + '-' + value.slice(end)).toUpperCase());
      requestAnimationFrame(() => el.setSelectionRange(s + 1, s + 1));
    }
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 12));
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    onChange(formatForCountry(e.clipboardData.getData('text'), country));
  };

  const placeholder = country === 'NL' ? 'AB-123-C' : country === 'GB' ? 'AB12-CDE' : country === 'DE' ? 'B-AB-1234' : 'PLATE';

  return (
    <input
      ref={inputRef}
      className="form-input uppercase tracking-widest"
      placeholder={placeholder}
      value={value}
      onKeyDown={onKeyDown}
      onChange={handle}
      onPaste={onPaste}
      maxLength={12}
      spellCheck={false}
      autoComplete="off"
    />
  );
}

function StarCircle() {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    return { x: 12 + 8.2 * Math.cos(a), y: 12 + 8.2 * Math.sin(a) };
  });
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" style={{ display: 'block' }}>
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="#FFD700" fontSize="4.2">★</text>
      ))}
    </svg>
  );
}

function PlatePreview({ country, number }: { country: string; number: string }) {
  const c = getCountry(country);
  const isYellow = c.bg === '#F5C400';

  const displayText = number
    ? (country === 'GB' ? number.replace(/-/g, ' ') : number)
    : (country === 'NL' ? 'AB-123-C' : country === 'GB' ? 'AB12 CDE' : 'EXAMPLE');

  // Rich directional gradient — lighter top-left, darker bottom-right
  const plateGradient = isYellow
    ? 'linear-gradient(145deg, #fde94e 0%, #f5cc00 28%, #e8b500 62%, #d9a200 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 30%, #ebebeb 70%, #e0e0e0 100%)';

  // Metallic frame: light top edge, very dark body, slight lift at bottom
  const frameGradient = 'linear-gradient(160deg, #686868 0%, #0c0c0c 48%, #343434 100%)';

  const radius = c.rounded ? 7 : 2;
  const boltBg = isYellow ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      // Gradient background acts as the border frame
      style={{
        display: 'inline-flex',
        background: frameGradient,
        padding: '3px',
        borderRadius: radius + 4,
        boxShadow: '0 6px 24px rgba(0,0,0,0.55), 0 22px 64px rgba(0,0,0,0.4)',
      }}
    >
      {/* Inner plate */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        borderRadius: radius,
        height: 70,
      }}>
        {/* EU / GB strip */}
        {c.eu && (
          <div style={{
            background: '#003399',
            width: 40,
            minWidth: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            paddingTop: 6,
            paddingBottom: 6,
            borderRight: `1px solid ${isYellow ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.2)'}`,
          }}>
            {c.gb ? (
              <>
                <span style={{ fontSize: 17, lineHeight: 1 }}>🇬🇧</span>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif', lineHeight: 1, marginTop: 2 }}>GB</span>
              </>
            ) : (
              <>
                <StarCircle />
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, fontFamily: 'Arial, sans-serif', lineHeight: 1 }}>{c.eu}</span>
              </>
            )}
          </div>
        )}

        {/* Plate body */}
        <div style={{
          background: plateGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          position: 'relative',
          minWidth: 210,
          // Top gloss highlight + bottom shadow = physical surface feel
          boxShadow: isYellow
            ? 'inset 0 2px 5px rgba(255,255,255,0.45), inset 0 -2px 5px rgba(0,0,0,0.14)'
            : 'inset 0 2px 5px rgba(255,255,255,0.6),  inset 0 -2px 5px rgba(0,0,0,0.08)',
        }}>
          {/* Bolt holes */}
          <div style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 9, height: 9, borderRadius: '50%',
            background: boltBg, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.45)',
          }} />
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 9, height: 9, borderRadius: '50%',
            background: boltBg, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.45)',
          }} />

          <span style={{
            color: '#111',
            fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: '0.07em',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            textShadow: isYellow ? '0 1px 0 rgba(0,0,0,0.14)' : '0 1px 0 rgba(0,0,0,0.09)',
          }}>
            {displayText}
          </span>
        </div>
      </div>
    </motion.div>
  );
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

  // Listen for service pre-selection from the Services section
  useEffect(() => {
    const handler = (e: CustomEvent<{ id: string }>) => {
      const svc = SERVICES.find(s => s.id === e.detail.id);
      if (!svc) return;
      setData(d => ({ ...d, service: svc.id, serviceTitle: svc.title, servicePrice: svc.price }));
      setDir(1);
      setStep(2);
      setConfirmed(false);
    };
    window.addEventListener('horizon:select-service', handler as EventListener);
    return () => window.removeEventListener('horizon:select-service', handler as EventListener);
  }, []);

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

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section id="booking" ref={sectionRef} className="relative py-28 px-6 lg:px-12 border-t border-white/10">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: bgOpacity, background: 'radial-gradient(ellipse at 10% 100%, #000d20 0%, #00050e 45%, #010203 100%)' }} />
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase" style={{ color: '#007FFF' }}>Book a Repair</div>
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

  const makeOptions: AcOption[] = CAR_MAKES.map(m => ({
    label: m.name,
    logo: `https://img.logo.dev/${m.domain}?token=pk_SfsLxaZIQMORByr3utENVg`,
    initial: m.name[0].toUpperCase(),
  }));

  const modelOptions: AcOption[] = (CAR_MODELS[data.make] ?? []).map(m => ({ label: m }));

  return (
    <StepWrap dir={dir}>
      <p className="text-white/50 text-sm mb-6">Tell us about the vehicle.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Make" required>
          <Autocomplete
            value={data.make}
            onChange={v => update({ make: v, model: '' })}
            onSelect={v => update({ make: v, model: '' })}
            options={makeOptions}
            placeholder="e.g. Porsche"
          />
        </Field>
        <Field label="Model" required>
          <Autocomplete
            value={data.model}
            onChange={v => update({ model: v })}
            onSelect={v => update({ model: v })}
            options={modelOptions}
            placeholder={data.make ? `e.g. ${(CAR_MODELS[data.make] ?? ['GT3'])[0]}` : 'Select a make first'}
            showAllOnFocus
          />
        </Field>
        <Field label="Year" required>
          <input className="form-input" placeholder="e.g. 2022" type="number" min="1970" max={new Date().getFullYear() + 1} value={data.year} onChange={e => update({ year: e.target.value })} required />
        </Field>
        <Field label="Mileage (km)">
          <input className="form-input" placeholder="e.g. 14500" type="number" min="0" value={data.mileage} onChange={e => update({ mileage: e.target.value })} />
        </Field>
        <Field label="Country">
          <select
            className="form-input"
            value={data.country}
            onChange={e => update({ country: e.target.value, registration: '' })}
          >
            {PLATE_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag}  {c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Registration Plate">
          <PlateInput value={data.registration} country={data.country} onChange={v => update({ registration: v })} />
        </Field>
        <div className="sm:col-span-2 flex justify-center pt-1 pb-2">
          <AnimatePresence mode="wait">
            <PlatePreview key={data.country} country={data.country} number={data.registration} />
          </AnimatePresence>
        </div>
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
    ['Registration',    data.registration ? `${data.country} · ${data.registration}` : '—'],
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
        We'll be in touch to finalise the details. Questions? Drop us an email.
      </p>

      {/* Contact quick-link */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <a
          href="mailto:service.horizon.garage@gmail.com"
          className="btn-cta primary flex items-center gap-2"
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

