'use client'

import { useCartStore } from '@/lib/cart-store'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, totalPrice } = useCartStore()
  const subtotal = totalPrice()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-nv-black flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag className="w-16 h-16 text-nv-smoke mx-auto mb-6" />
          <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight mb-4">
            YOUR BAG IS EMPTY.
          </h1>
          <p className="font-mono-brand text-nv-fog text-sm max-w-md mx-auto mb-8">
            N&apos;VAIIN is not merely a brand; it is a movement.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-nv-gold text-nv-black font-anton tracking-wider px-8 py-4 hover:bg-nv-white transition-colors duration-200"
          >
            SHOP THE DROP
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nv-black px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight mb-12">
          YOUR BAG
        </h1>

        <div className="space-y-0">
          {items.map((item) => (
            <div key={item.id} className="py-6 border-b border-nv-smoke">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 bg-nv-concrete border border-nv-smoke flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-nv-fog" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bebas text-lg sm:text-xl tracking-wider uppercase truncate">
                    {item.name}
                  </h3>
                  {item.size && (
                    <p className="font-mono-brand text-nv-fog text-xs mt-0.5">SIZE: {item.size}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-8 h-8 flex items-center justify-center border border-nv-smoke bg-nv-smoke hover:border-nv-gold hover:text-nv-gold text-nv-white"
                  >
                    −
                  </button>
                  <span className="font-mono-brand text-sm w-8 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-nv-smoke bg-nv-smoke hover:border-nv-gold hover:text-nv-gold text-nv-white"
                  >
                    +
                  </button>
                </div>
                <p className="font-mono-brand text-nv-gold text-sm sm:text-base w-20 text-right">
                  ${(item.price * item.qty).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-nv-fog hover:text-nv-red"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Link
              href="/shop"
              className="font-mono-brand text-sm text-nv-fog hover:text-nv-gold uppercase tracking-wider"
            >
              ← Continue Shopping
            </Link>
          </div>
          <div className="bg-nv-concrete border border-nv-smoke p-6">
            <div className="flex justify-between font-mono-brand text-sm mb-3">
              <span className="text-nv-fog">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-mono-brand text-sm mb-3">
              <span className="text-nv-fog">Shipping</span>
              <span className={subtotal >= 75 ? 'text-nv-gold' : 'text-nv-fog'}>
                {subtotal >= 75 ? 'FREE' : '$9.99'}
              </span>
            </div>
            <div className="border-t border-nv-smoke pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-anton text-xl uppercase tracking-wider">Total</span>
                <span className="font-anton text-2xl text-nv-gold">
                  ${(subtotal + (subtotal >= 75 ? 0 : 9.99)).toFixed(2)}
                </span>
              </div>
            </div>
            <Link
              href="/shop"
              className="block w-full mt-6 bg-nv-gold text-nv-black font-anton text-xl tracking-wider py-4 text-center hover:bg-nv-white transition-colors"
            >
              CHECKOUT
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
