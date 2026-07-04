import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Research Assistant",
  description: "Research any company with AI-powered analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased overflow-hidden">{children}</body>
    </html>
  );
}
