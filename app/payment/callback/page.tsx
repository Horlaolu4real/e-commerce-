"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/axios";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      router.replace("/dashboard");
      return;
    }
    api
      .get(`/payments/verify/${reference}`)
      .then(({ data }) => {
        setStatus(
          data.data.paystackStatus === "success" ? "success" : "failed",
        );
      })
      .catch(() => setStatus("failed"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800">
              Verifying payment...
            </h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your order has been placed.
            </p>
            <Link
              href="/orders"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              View Orders
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-500 text-sm mb-6">Something went wrong.</p>
            <Link
              href="/cart"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Back to Cart
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
