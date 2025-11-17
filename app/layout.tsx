import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import I18nProvider from "@/components/providers/I18nProvider";
import { AntdAppProvider } from "@/components/providers/AntdProvider";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#690F0F",
};

export const metadata: Metadata = {
  title: "PR1AS - Nền tảng kết nối Client & Worker",
  description:
    "Tìm kiếm và thuê Worker chuyên nghiệp hoặc cung cấp dịch vụ và kiếm thu nhập",
  keywords: ["worker", "client", "dịch vụ", "tìm việc", "thuê người", "PR1AS"],
  authors: [{ name: "PR1AS Team" }],
  openGraph: {
    title: "PR1AS - Nền tảng kết nối Client & Worker",
    description:
      "Tìm kiếm và thuê Worker chuyên nghiệp hoặc cung cấp dịch vụ và kiếm thu nhập",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased`}>
        <AntdRegistry>
          <AntdAppProvider>
            <I18nProvider>{children}</I18nProvider>
          </AntdAppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
