'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { user, refreshAuth } = useAuthStore()
  const { items, summary, fetchCart, updateQuantity, removeItem, clearCart, isLoading } = useCartStore()

  useEffect(() => {
    const init = async () => {
      if (!user) {
        const ok = await refreshAuth()
        if (!ok) { router.replace('/login'); return }
      }
      fetchCart()
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-gray-800">🛍️ Learn Store</Link>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Store</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Cart</h2>
        {isLoading ? (
          <p className="text-gray-400">Loading cart...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
            <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🖥️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{item.product?.name}</h3>
                    <p className="text-blue-600 font-bold text-sm mt-1">${item.product?.price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">−</button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
                      <button onClick={() => { removeItem(item.id); toast.success('Item removed') }}
                        className="ml-auto text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => { clearCart(); toast.success('Cart cleared') }}
                className="text-sm text-red-400 hover:text-red-600">Clear cart</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
              <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Items ({summary?.item_count})</span><span>${summary?.subtotal}</span></div>
                <div className="flex justify-between"><span>Tax (7.5%)</span><span>${summary?.tax}</span></div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                  <span>Total</span><span>${summary?.total}</span>
                </div>
              </div>
              <button onClick={() => router.push('/payment')}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}