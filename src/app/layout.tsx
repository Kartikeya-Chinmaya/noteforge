import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteForge - Turn any mess into mastery",
  description: "Upload PDFs, PPTs, images, or text and get AI-generated notes in your preferred style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
