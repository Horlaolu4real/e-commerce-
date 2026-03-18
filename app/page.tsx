"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../types";
import api from "../lib/axios";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => {
        setProducts(data.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">🛍️ Learn Store</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="bg-white border-b border-gray-100 py-12 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Welcome to Learn Store
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Browse our products. Sign in to add items to your cart and checkout.
        </p>
        <Link
          href="/register"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Create Free Account
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h3 className="text-xl font-bold text-gray-800 mb-6">All Products</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="bg-gray-200 h-36 rounded-lg mb-4" />
                <div className="bg-gray-200 h-4 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products yet.</p>
          </div>
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
                <Link
                  href="/login"
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition text-center"
                >
                  Sign in to buy
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
