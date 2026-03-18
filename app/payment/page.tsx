"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function PaymentPage() {
  const router = useRouter();
  const { user, refreshAuth } = useAuthStore();
  const { items, summary, fetchCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        const ok = await refreshAuth();
        if (!ok) {
          router.replace("/login");
          return;
        }
      }
      fetchCart();
    };
    init();
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/payments/initialize");
      window.location.href = data.data.authorization_url;
    } catch {
      toast.error("Could not initialize payment");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Checkout</h2>
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{summary?.item_count}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${summary?.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${summary?.tax}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span>${summary?.total}</span>
          </div>
        </div>
        <button
          onClick={handlePayment}
          disabled={isLoading || items.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isLoading ? "Redirecting to Paystack..." : "Pay with Paystack"}
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="mt-3 w-full text-gray-500 py-2 text-sm hover:text-gray-700"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
}
