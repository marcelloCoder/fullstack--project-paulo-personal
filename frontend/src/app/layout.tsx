import type { Metadata } from "next";
import { DM_Sans, Great_Vibes, Oswald } from "next/font/google";
import { Cabecalho } from "@/components/cabecalho";
import { ProvedorAuth } from "@/components/provedor-auth";
import { Rodape } from "@/components/rodape";
import { perfil } from "@/content/perfil";
import "./globals.css";

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

const script = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: {
    default: `${perfil.nome} | ${perfil.funcao}`,
    template: `%s | ${perfil.nome}`,
  },
  description: perfil.resumo,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dm.variable} ${oswald.variable} ${script.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <ProvedorAuth>
          <Cabecalho />
          <main className="flex-1">{children}</main>
          <Rodape />
        </ProvedorAuth>
      </body>
    </html>
  );
}
