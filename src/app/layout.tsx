import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Martinique - L'île aux fleurs",
  description: "Bienvenue en Martinique, découvrez l'île aux fleurs des Caraïbes",
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
