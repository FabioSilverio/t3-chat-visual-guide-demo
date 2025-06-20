import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FABOT - Chat Multitasking",
  description: "Assistente inteligente com análise automática de conversas e Visual Guide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
