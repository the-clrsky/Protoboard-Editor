import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The fonts of sadmanbishal.com, for the home page, site header and footer
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Protoboard Editor - Free Stripboard Layout & Schematic Tool",
    template: "%s - Protoboard Editor",
  },
  description:
    "Free online stripboard layout editor with a built-in schematic editor and an automatic layouter. Draw a schematic with standard symbols, then let the layouter place every part, size the board, and work out the strip cuts and link wires for you: compact boards with no slanted or crossing wires, connectors on the edge, and drilled cuts. Or lay it out by hand. Every part is drawn as its real package at true size, so the board on screen looks like the one you build. Copper strips colour-code to your nets in real time so you can instantly see what is connected, then print a true-scale build template with a mirrored cut guide and a bill of materials (BOM), or export a KiCad-compatible netlist to turn the prototype into a PCB.",
  keywords: [
    "stripboard",
    "veroboard",
    "circuit layout",
    "stripboard editor",
    "automatic stripboard layout",
    "stripboard auto router",
    "stripboard auto-layout",
    "automatic veroboard layout",
    "stripboard layout generator",
    "veroboard layout generator",
    "schematic to stripboard",
    "KiCad netlist",
    "netlist export",
    "export stripboard to KiCad",
    "stripboard to PCB",
    "electronics",
    "PCB layout",
    "through-hole",
    "prototype",
    "schematic editor",
    "realistic component rendering",
    "off-board wiring",
    "printable stripboard template",
    "bill of materials",
    "BOM",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Protoboard Editor",
    title: "Protoboard Editor",
    description:
      "Free layout editor for stripboards, dot boards and breadboard PCBs, with a built-in schematic editor and an automatic layouter. Draw circuits with standard symbols, wire up nets, then let the layouter build the whole board for you, compact and without slanted or crossing wires, or place parts by hand with live strip colouring. Parts are drawn as their real packages at true size. Print a 1:1 build template with a parts list (BOM), or export a KiCad netlist.",
    images: [
      {
        url: "/demo-dotboard.png",
        width: 3840,
        height: 1360,
        alt: "Protoboard Editor showing the schematic and the dot board layout of a 555 LED flasher side by side",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Protoboard Editor",
    description:
      "Free layout editor for stripboards, dot boards and breadboard PCBs, with a built-in schematic editor and an automatic layouter. Draw circuits, wire up nets, let the layouter build a compact board with no slanted or crossing wires, see every part at its real size, print a 1:1 build template with a BOM, or export a KiCad netlist.",
    images: ["/demo-dotboard.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="describedby" href={`${siteUrl}/llms.txt`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
