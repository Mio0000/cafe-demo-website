import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Cafe",
  description: "Discover great cafes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
