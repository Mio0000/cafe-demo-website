import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
  import { SpeedInsights } from "@vercel/speed-insights/next";


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
        <SpeedInsights />         
      </body>
    </html>
  );
}
