import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SV Cars | Premium Rent a Car Mostar",
    template: "%s | SV Cars",
  },
  description:
    "Premium rent-a-car usluga u Mostaru i cijeloj BiH. Luksuzna vozila za svaku priliku. Rezervisite online ili putem WhatsAppa.",
  keywords: [
    "rent a car Mostar",
    "iznajmljivanje vozila Mostar",
    "auto rent Mostar",
    "rent a car BiH",
    "quad najam Mostar",
    "premium rent a car",
  ],
  openGraph: {
    title: "SV Cars | Premium Rent a Car Mostar",
    description:
      "Luksuz. Pouzdanost. Sloboda. Premium rent-a-car usluga u Mostaru.",
    url: "https://sv-cars.ba",
    siteName: "SV Cars",
    locale: "hr_BA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
