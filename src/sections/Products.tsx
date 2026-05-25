import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import emailjs from '@emailjs/browser';

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const ACCENT = '#10b981';

const API_BASE = import.meta.env.VITE_PRODUCTS_API_URL as string | undefined;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  inStock: boolean;
  stock?: number;
};

const b = import.meta.env.BASE_URL;

const FALLBACK: Product[] = [
  {
    id: 'windscreen-fluid',
    name: 'Windscreen Fluid',
    description: 'Premium all-season screen wash. Ready to use, streak-free formula. 5L.',
    price: 7.99,
    currency: 'EUR',
    image: `${b}images/products/windscreen-fluid.png`,
    inStock: true,
    stock: 50,
  },
  {
    id: 'car-cover',
    name: 'Car Cover',
    description: 'Breathable, waterproof full car cover. Universal fit for most saloons and estates.',
    price: 49.99,
    currency: 'EUR',
    image: `${b}images/products/car-cover.png`,
    inStock: true,
    stock: 20,
  },
];

async function fetchProducts(): Promise<Product[]> {
  if (!API_BASE) return FALLBACK;
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) return FALLBACK;
    return await res.json();
  } catch {
    return FALLBACK;
  }
}

export async function placeOrder(order: {
  productId: string;
  quantity: number;
  name: string;
  email: string;
  phone: string;
}): Promise<{ orderId: string }> {
  if (!API_BASE) {
    // No backend yet — send notification via EmailJS and return a local ref
    const svc  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const pub  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const aTpl = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
    if (svc && pub && aTpl) {
      await emailjs.send(svc, aTpl, {
        reference:      `SHOP-${Date.now().toString(36).toUpperCase()}`,
        service:        `Product Order — ${order.productId} × ${order.quantity}`,
        price:          '—',
        vehicle:        '—',
        registration:   '—',
        mileage:        '—',
        date:           '—',
        time_slot:      '—',
        collection:     '—',
        issue:          `Quantity: ${order.quantity}`,
        customer_name:  order.name,
        customer_email: order.email,
        customer_phone: order.phone || '—',
        to_email:       'service.horizon.garage@gmail.com',
      }, pub);
    }
    return { orderId: `ORD-${Date.now().toString(36).toUpperCase()}` };
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Order failed');
  return res.json();
}

// ─── Buy Drawer ───────────────────────────────────────────────────────────────

function BuyDrawer({ product, onClose, onSuccess }: {
  product: Product;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
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
    try {
      const { orderId } = await placeOrder({ productId: product.id, quantity: qty, ...form });
      setStatus('sent');
      onSuccess(orderId);
    } catch {
      setStatus('idle');
    }
  };

  const total = (product.price * qty).toFixed(2);
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
        {/* Product header */}
        <div
          className="relative px-8 pt-8 pb-7 border-b border-white/8 shrink-0"
          style={{ background: `linear-gradient(135deg, ${ACCENT}16 0%, transparent 55%)` }}
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
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white/5">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mb-1">Order</div>
              <div className="font-display text-3xl leading-tight" style={{ color: ACCENT }}>{product.name}</div>
              <div className="font-display text-xl text-white/55 mt-0.5">
                {product.currency === 'EUR' ? '€' : product.currency} {product.price.toFixed(2)}
              </div>
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
                  style={{ borderColor: `${ACCENT}50`, background: `${ACCENT}12` }}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" stroke={ACCENT}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="font-mono text-[10px] tracking-[0.35em] text-white/40 uppercase mb-2">Order Placed</div>
                <h3 className="font-display text-4xl mb-3" style={{ color: ACCENT }}>Thank You</h3>
                <p className="text-white/55 text-sm leading-relaxed max-w-xs mb-8">
                  Your order for <span className="text-white/80">{qty}× {product.name}</span> has been received.
                  We'll confirm and arrange delivery by email.
                </p>
                <button
                  onClick={onClose}
                  className="btn-cta primary"
                  style={{ '--accent': ACCENT, fontSize: 13, padding: '9px 20px' } as React.CSSProperties}
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={submit}
                className="space-y-5"
              >
                {/* Quantity */}
                <div>
                  <label className="block font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 border border-white/10 rounded flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 transition-all text-lg"
                    >−</button>
                    <span className="font-display text-3xl w-8 text-center">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(q => product.stock ? Math.min(product.stock, q + 1) : q + 1)}
                      className="w-9 h-9 border border-white/10 rounded flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 transition-all text-lg"
                    >+</button>
                    <span className="text-white/35 text-sm ml-2">
                      {product.stock != null ? `${product.stock} in stock` : ''}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border border-white/8 px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase">Total</span>
                  <span className="font-display text-2xl" style={{ color: ACCENT }}>
                    {product.currency === 'EUR' ? '€' : product.currency}{total}
                  </span>
                </div>

                <div className="border-t border-white/8 pt-5 space-y-5">
                  <Field label="Full Name" required>
                    <input className="form-input w-full" placeholder="Your name" value={form.name} onChange={set('name')} required autoFocus />
                  </Field>
                  <Field label="Email Address" required>
                    <input className="form-input w-full" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                  </Field>
                  <Field label="Phone Number">
                    <input className="form-input w-full" type="tel" placeholder="+31 6 00 00 00 00" value={form.phone} onChange={set('phone')} />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || status === 'sending'}
                  className="btn-cta primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ '--accent': ACCENT, fontSize: 15, padding: '13px 0' } as React.CSSProperties}
                >
                  {status === 'sending' ? 'Placing Order…' : `Place Order · €${total}`}
                </button>

                <p className="text-white/30 text-xs text-center">
                  We'll confirm your order and arrange delivery within 24 hours.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index, inView, onBuy }: {
  product: Product;
  index: number;
  inView: boolean;
  onBuy: (p: Product) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE }}
      className="border border-white/10 bg-white/[0.02] flex flex-col overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="font-mono text-[10px] tracking-[0.3em] text-white/60 uppercase">Out of Stock</span>
          </div>
        )}
        {product.inStock && product.stock != null && product.stock <= 5 && (
          <div className="absolute top-3 left-3">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-1" style={{ background: '#f97316', color: 'white' }}>
              Only {product.stock} left
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5">
        <div className="font-display text-2xl leading-tight mb-2" style={{ color: ACCENT }}>{product.name}</div>
        <p className="text-white/55 text-sm leading-relaxed flex-1 mb-4">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display text-2xl">
            {product.currency === 'EUR' ? '€' : product.currency}{product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onBuy(product)}
            disabled={!product.inStock}
            className="btn-cta primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ '--accent': ACCENT, fontSize: 12, padding: '8px 14px' } as React.CSSProperties}
          >
            Buy Now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Products() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-10% 0px' });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts().then(p => { setProducts(p); setLoading(false); });
  }, []);

  const handleSuccess = (orderId: string) => {
    // Refresh products to get updated stock from API
    if (API_BASE) {
      fetchProducts().then(setProducts);
    } else {
      // Decrement stock locally in fallback mode
      setProducts(ps => ps.map(p =>
        p.id === buyProduct?.id && p.stock != null
          ? { ...p, stock: p.stock - 1, inStock: p.stock - 1 > 0 }
          : p
      ));
    }
    console.log('Order placed:', orderId);
  };

  return (
    <>
      <section
        id="products"
        ref={sectionRef}
        className="relative py-28 px-6 lg:px-12 border-t border-white/10"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, #001a0f 0%, #000c07 50%, #010201 100%)' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase" style={{ color: ACCENT }}>Workshop Store</div>
            <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">Products</h2>
            <p className="text-white/60 max-w-xl mt-4">
              Maintenance essentials and accessories, delivered direct from the garage.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1].map(i => (
                <div key={i} className="border border-white/8 bg-white/[0.02] aspect-square animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} inView={inView} onBuy={setBuyProduct} />
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {buyProduct && (
          <BuyDrawer
            product={buyProduct}
            onClose={() => setBuyProduct(null)}
            onSuccess={(id) => { handleSuccess(id); }}
          />
        )}
      </AnimatePresence>
    </>
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
