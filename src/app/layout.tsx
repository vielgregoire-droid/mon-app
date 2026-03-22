import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon App",
  description: "Application Next.js avec Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
