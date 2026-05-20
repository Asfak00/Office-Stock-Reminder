import { Package } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Package className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold">StockRemind</span>
      </Link>
      {children}
    </div>
  );
}
