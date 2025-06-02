import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UTA Libraries - Print & Design Queue",
  description:
    "Digital queue management system for UTA Libraries Print and Design Studios",
  keywords: ["UTA", "Libraries", "Print", "Design", "Queue", "Students"],
  authors: [{ name: "UTA Libraries" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
