import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-[10px] bg-teal flex items-center justify-center shadow-teal">
          <span className="font-display font-black text-white text-lg">C</span>
        </div>
        <span className="font-display text-xl font-bold text-gray-900 -tracking-wide">CoachForge</span>
      </Link>
      {children}
    </div>
  );
}
