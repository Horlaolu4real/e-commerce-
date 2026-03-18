'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '../../store/authStore'
import { Product } from '../../types'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const { user, refreshAuth } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      let currentUser = user
      if (!currentUser) {
        const ok = await refreshAuth()
        if (!ok) { router.replace('/login'); return }
        currentUser = useAuthStore.getState().user
      }
      if (currentUser?.role !== 'admin') {
        router.replace('/dashboard')
        return
      }
      fetchProducts()
    }
    init()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products')
      setProducts(data.data)
    } catch {
      toast.error('Could not fetch products')
    }
    setIsLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) { toast.error('Please select an image'); return }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('stock', stock)
      formData.append('image', image)
      await api.post('/products', formData)
      toast.success('Product created!')
      setName(''); setDescription(''); setPrice(''); setStock('')
      setImage(null); setPreview(null)
      fetchProducts()
    } catch {
      toast.error('Could not create product')
    }
    setSubmitting(false)
  }

  const handleUpdateImage = async (productId: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const formData = new FormData()
      formData.append('image', file)
      try {
        await api.patch(`/products/${productId}/image`, formData)
        toast.success('Image updated!')
        fetchProducts()
      } catch {
        toast.error('Could not update image')
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">⚙️ Admin Panel</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Store</Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Wireless Headphones" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="79.99" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Product description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
              </div>
            </div>
            {preview && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                </div>
              </div>
            )}
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? 'Uploading to Cloudinary...' : 'Create Product'}
            </button>
          </form>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Products ({products.length})</h2>
          {isLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-400 text-sm">No products yet. Create one above.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="relative h-36 w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
                  <p className="text-blue-600 font-bold text-sm mt-1">${product.price}</p>
                  <button onClick={() => handleUpdateImage(product.id)}
                    className="mt-3 w-full border border-gray-300 text-gray-600 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition">
                    Update Image
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}