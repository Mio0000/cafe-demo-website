import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Café Felice — Bourke St Breakfast, Melbourne CBD",
  description:
    "Classic Bourke St breakfast spot. Great coffee, hearty meals, outdoor seating. 461 Bourke St, Melbourne VIC 3000. Rated 4.6★.",
  openGraph: {
    title: "Café Felice — Bourke St Breakfast",
    description:
      "Casual, vibrant, affordable CBD cafe. Great coffee and hearty meals in Melbourne's Bourke St.",
    type: "website",
  },
};

export default function CafeFeliceLayout({ children }) {
  return (
    <div className={`${poppins.variable} font-[family-name:var(--font-poppins)]`}>
      {children}
    </div>
  );
}
