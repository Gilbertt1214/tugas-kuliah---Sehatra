import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sehatra - Smart Healthcare Transformation for Indonesia",
  description: "Platform kesehatan digital terintegrasi berbasis AI untuk transformasi pelayanan kesehatan modern, preventif, prediktif, personal, dan partisipatif.",
  keywords: "kesehatan, health, monitoring, BPJS, Indonesia, digital health, sehatra, smart healthcare",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
