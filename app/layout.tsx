import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/DataContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "META Ads Dashboard",
  description: "Analizza i tuoi dati pubblicitari di Facebook",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {/* DataProvider avvolge tutto: il "magazzino" dei dati è disponibile ovunque */}
        <DataProvider>
          <div className="min-h-screen bg-gray-50">

            {/* HEADER - la barra in alto che appare su tutte le pagine */}
            <header className="border-b bg-white sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Logo e titolo a sinistra */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      META Ads Dashboard
                    </h1>
                  </div>
                  {/* Slogan a destra */}
                  <span className="text-sm text-gray-500">
                    I tuoi dati, la tua consapevolezza
                  </span>
                </div>
              </div>
            </header>

            {/* CONTENUTO - qui dentro appare la pagina corrente */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

          </div>
        </DataProvider>
      </body>
    </html>
  );
}