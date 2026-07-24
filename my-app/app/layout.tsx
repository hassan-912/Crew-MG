import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crew-MG | Internal Training Platform",
  description: "Corporate visa training platform for Crew-MG.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isIsolatedRoute = pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/schengen");

  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className={`${inter.className} min-h-full flex flex-col text-slate-900`}>
        {!isIsolatedRoute && (
          <header className="bg-[#0f0c29] border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center gap-3">
                  <Image 
                    src="/MG%20W.svg" 
                    alt="Crew-MG Logo" 
                    width={140} 
                    height={40} 
                    className="h-8 w-auto object-contain"
                    priority
                  />
                </Link>
                <nav className="flex items-center space-x-4">
                  <div className="text-slate-300 text-sm font-medium tracking-wide">Internal Training Portal</div>
                </nav>
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
