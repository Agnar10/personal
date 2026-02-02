import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Savings Projector (ISK)",
  description: "Month-by-month ISK savings projections with scenario comparisons."
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className="min-h-screen bg-panel-2 text-slate-100">
      {children}
    </body>
  </html>
);

export default RootLayout;
