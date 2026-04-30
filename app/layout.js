import "./globals.css";

export const metadata = {
  title: "Cafe",
  description: "Discover great cafes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
