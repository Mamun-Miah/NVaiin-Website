'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, type CartItem } from '@/lib/cart-store';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
}

function CartItemRow({ item }: { item: CartItem }) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);

  return (
    <div className="flex gap-4 py-4 border-b border-nv-smoke/50">
      {/* Product Image */}
      <div className="relative h-24 w-20 flex-shrink-0 bg-nv-smoke overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <ShoppingBag size={20} className="text-nv-fog" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bebas text-sm tracking-[0.1em] text-nv-white truncate">
              {item.name}
            </h4>
            {item.size && (
              <p className="font-mono-brand text-[10px] text-nv-fog mt-0.5">
                SIZE: {item.size}
              </p>
            )}
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="p-1 text-nv-fog hover:text-nv-red transition-colors duration-200 flex-shrink-0 cursor-hover"
            aria-label={`Remove ${item.name}`}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Qty + Price */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-nv-smoke">
            <button
              onClick={() => updateQty(item.id, item.qty - 1)}
              className="p-1.5 text-nv-fog hover:text-nv-white hover:bg-nv-smoke/50 transition-colors duration-200 cursor-hover"
              aria-label="Decrease quantity"
            >
              <Minus size={12} strokeWidth={2} />
            </button>
            <span className="font-mono-brand text-xs text-nv-white w-8 text-center select-none">
              {item.qty}
            </span>
            <button
              onClick={() => updateQty(item.id, item.qty + 1)}
              className="p-1.5 text-nv-fog hover:text-nv-white hover:bg-nv-smoke/50 transition-colors duration-200 cursor-hover"
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Price */}
          <p className="font-mono-brand text-sm text-nv-white">
            {formatPrice(item.price * item.qty)}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  const closeCart = useCartStore((s) => s.closeCart);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      <div className="w-20 h-20 rounded-full border border-nv-smoke flex items-center justify-center">
        <ShoppingBag size={32} className="text-nv-fog" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-anton text-xl tracking-wide text-nv-white mb-2">
          YOUR BAG IS EMPTY.
        </h3>
        <p className="font-syne text-sm text-nv-fog max-w-xs">
          Looks like you haven&apos;t added anything yet. Explore our latest
          collection and find something that speaks to you.
        </p>
      </div>
      <Link
        href="/shop"
        onClick={closeCart}
        className="mt-2 font-bebas text-sm tracking-[0.2em] uppercase bg-nv-gold text-nv-black px-8 py-3 hover:bg-nv-white transition-colors duration-300 cursor-hover"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);

  const subtotal = totalPrice();
  const count = totalItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 z-[70] bg-black/70"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            className="fixed top-0 right-0 z-[80] h-full w-full max-w-md bg-nv-concrete border-l border-nv-gold/30 flex flex-col shadow-2xl shadow-black/50"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-nv-smoke">
              <div className="flex items-baseline gap-3">
                <h2 className="font-anton text-lg tracking-wide text-nv-white">
                  YOUR BAG
                </h2>
                {count > 0 && (
                  <span className="font-mono-brand text-xs text-nv-fog">
                    ({count} {count === 1 ? 'item' : 'items'})
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-nv-fog hover:text-nv-white transition-colors duration-200 cursor-hover"
                aria-label="Close cart"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items / Empty State */}
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              <>
                {/* Items List (scrollable) */}
                <div className="flex-1 overflow-y-auto px-6">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-nv-smoke px-6 py-5 flex flex-col gap-4 bg-nv-concrete">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="font-bebas text-sm tracking-[0.15em] text-nv-fog uppercase">
                      Subtotal
                    </span>
                    <span className="font-mono-brand text-base text-nv-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button className="w-full font-bebas text-base tracking-[0.2em] uppercase bg-nv-gold text-nv-black py-4 hover:bg-nv-white transition-colors duration-300 cursor-hover">
                    Checkout
                  </button>

                  {/* Shipping Note */}
                  <p className="text-center font-mono-brand text-[10px] text-nv-fog tracking-wide">
                    Free shipping on orders over $75
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
