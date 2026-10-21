import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import "./globals.css";
import { THEME_COLOR } from "@/lib/tokens";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SustentaESG — Diagnóstico de sostenibilidad por empresa",
  description:
    "Ordena la información de sostenibilidad de tu empresa o de tus clientes: diagnóstico, brechas, plan de mejora e historial. 7 días de prueba, sin tarjeta.",
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${newsreader.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
