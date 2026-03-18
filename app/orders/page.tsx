"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import { Order } from "../../types";
import api from "../../lib/axios";

export default function OrdersPage() {
  const router = useRouter();
  const { user, refreshAuth } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        const ok = await refreshAuth();
        if (!ok) {
          router.replace("/login");
          return;
        }
      }
      try {
        const { data } = await api.get("/payments/orders");
        setOrders(data.data);
      } catch {
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const statusColor = (status: string) => {
    if (status === "paid") return "bg-green-100 text-green-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-gray-800">
            🛍️ Learn Store
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Store
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Orders</h2>
        {isLoading ? (
          <p className="text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No orders yet</p>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Order #{order.id}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      ₦{(order.amount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {order.orderItems?.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
