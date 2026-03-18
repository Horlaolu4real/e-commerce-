import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Learn Store",
  description: "Fullstack learning project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        {children}
      </body>
    </html>
  );
}
