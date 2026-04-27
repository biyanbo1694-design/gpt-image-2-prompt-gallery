import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GPT Image 2 Prompt Gallery",
    template: "%s | GPT Image 2 Prompt Gallery"
  },
  description: "A minimal prompt gallery synced from EvoLinkAI/awesome-gpt-image-2-prompts."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
