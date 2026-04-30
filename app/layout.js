import "./globals.css";

export const metadata = {
  title: "Cathedral Coffee — Melbourne CBD",
  description:
    "Hidden in the heart of Melbourne CBD's Cathedral Arcade. Coffee by day, wine by night. Unit 9, 37 Swanston St, Nicholas Building.",
  openGraph: {
    title: "Cathedral Coffee",
    description: "Hidden heritage cafe in Melbourne's historic Cathedral Arcade",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
