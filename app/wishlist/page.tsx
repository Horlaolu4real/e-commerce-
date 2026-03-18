'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const router = useRouter()
  const { user, refreshAuth } = useAuthStore()
  const { items, fetchWishlist, removeFromWishlist, isLoading } = useWishlistStore()
  const { addToCart } = useCartStore()

  useEffect(() => {
    const init = async () => {
      if (!user) {
        const ok = await refreshAuth()
        if (!ok) { router.replace('/login'); return }
      }
      fetchWishlist()
    }
    init()
  }, [])

  const handleMoveToCart = async (productId: number, wishlistItemId: number) => {
    try {
      await addToCart(productId)
      await removeFromWishlist(wishlistItemId)
      toast.success('Moved to cart!')
    } catch {
      toast.error('Could not move to cart')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-gray-800">🛍️ Learn Store</Link>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Store</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Wishlist ({items.length})</h2>
        {isLoading ? (
          <p className="text-gray-400">Loading wishlist...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Your wishlist is empty</p>
            <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
                <div className="relative bg-gray-100 rounded-lg h-36 overflow-hidden mb-4">
                  {item.product?.imageUrl ? (
                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🖥️</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                <p className="text-sm text-gray-500 mt-1 flex-1">{item.product?.description}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">${item.product?.price}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleMoveToCart(item.productId, item.id)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    Move to Cart
                  </button>
                  <button onClick={() => { removeFromWishlist(item.id); toast.success('Removed') }}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}