"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, refreshAuth } = useAuthStore();
  const { addToCart, fetchCart, items } = useCartStore();
  const {
    addToWishlist,
    items: wishlistItems,
    fetchWishlist,
  } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      let currentUser = user;
      if (!currentUser) {
        const ok = await refreshAuth();
        if (!ok) {
          router.replace("/login");
          return;
        }
        currentUser = useAuthStore.getState().user;
      }
      try {
        const [{ data }] = await Promise.all([
          api.get("/products"),
          fetchCart(),
          fetchWishlist(),
        ]);
        setProducts(data.data);
      } catch {
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistIds = new Set(wishlistItems.map((w) => w.productId));

  const handleAddToCart = async (productId: number) => {
    setAddingId(productId);
    try {
      await addToCart(productId);
      toast.success("Added to cart!");
    } catch {
      toast.error("Could not add to cart");
    }
    setAddingId(null);
  };

  const handleWishlist = async (productId: number) => {
    if (wishlistIds.has(productId)) return;
    try {
      await addToWishlist(productId);
      toast.success("Added to wishlist!");
    } catch {
      toast.error("Could not add to wishlist");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">🛍️ Learn Store</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500">
              Hi,{" "}
              <span className="font-medium text-gray-700">{user?.name}</span>
            </span>
            <Link
              href="/cart"
              className="relative text-sm text-blue-600 hover:underline"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/wishlist"
              className="text-sm text-blue-600 hover:underline"
            >
              Wishlist
            </Link>
            <Link
              href="/orders"
              className="text-sm text-blue-600 hover:underline"
            >
              Orders
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-sm text-purple-600 font-medium hover:underline"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">All Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-400">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col"
              >
                <div className="relative bg-gray-100 rounded-lg h-36 overflow-hidden mb-4">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🖥️
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 flex-1">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    ${product.price}
                  </span>
                  <span className="text-xs text-gray-400">
                    {product.stock} left
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingId === product.id}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {addingId === product.id ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => handleWishlist(product.id)}
                    className={`px-3 py-2 rounded-lg border transition text-sm ${wishlistIds.has(product.id) ? "bg-pink-50 border-pink-300 text-pink-500" : "border-gray-300 hover:bg-gray-50"}`}
                  >
                    {wishlistIds.has(product.id) ? "♥" : "♡"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
