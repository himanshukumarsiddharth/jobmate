import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "JobMate",
  description: "Upload your resume, find matching jobs, get ATS scores.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-slate-900 text-slate-50 min-h-screen selection:bg-neon-purple selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
