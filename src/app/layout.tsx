import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ReservaPro — Sistema de Reserva de Turnos",
    template: "%s | ReservaPro",
  },
  description:
    "Plataforma SaaS premium de reserva de turnos online. Gestiona tu agenda, recibe pagos y notifica automáticamente a tus clientes.",
  keywords: ["reservas", "turnos", "agenda", "saas", "reservapro"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-dark-900 text-gray-200 antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
