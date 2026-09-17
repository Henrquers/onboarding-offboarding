import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Fonte principal do manual da marca; Arial fica como apoio no CSS.
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-montserrat",
});

export const metadata: Metadata = {
  title: "Onboarding e Offboarding · Coletta Rodrigues Advogados",
  description:
    "Controle das providências de entrada e saída de colaboradores do escritório.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
