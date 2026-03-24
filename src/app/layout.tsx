import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "SAH Dashboard",
  description: "Sales performance dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased bg-surface">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64">{children}</main>
        </div>
      </body>
    </html>
  );
}
