import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineGalaxy - Galaxy Streaming",
  description: "Viaja al espacio con nosotros, y mira lo que quieras",
  openGraph: {
    title: "CineGalaxy - Galaxy Streaming",
    description: "Viaja al espacio con nosotros, y mira lo que quieras",
    images: [
      {
        url: "/cinegalaxy_logo.png",
        width: 800,
        height: 600,
        alt: "CineGalaxy Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', event => event.preventDefault());
              document.onkeydown = function(e) {
                const isDevTools = (
                  e.keyCode === 123 || 
                  (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)) || 
                  (e.ctrlKey && e.keyCode === 85)
                );
                if (isDevTools) {
                  e.preventDefault();
                  window.location.href = "https://m.youtube.com/watch?v=jy4qYmf3TxA";
                  return false;
                }
              };
              let devtoolsOpen = false;
              setInterval(function() {
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return;
                const widthThreshold = window.outerWidth - window.innerWidth > 160;
                const heightThreshold = window.outerHeight - window.innerHeight > 160;
                if(widthThreshold || heightThreshold) {
                  if(!devtoolsOpen) {
                    devtoolsOpen = true;
                    window.location.href = "https://m.youtube.com/watch?v=jy4qYmf3TxA";
                  }
                }
              }, 500);
            `
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
