import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6 text-center">
      <h2 className="text-3xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-slate-400 mb-6 max-w-md">The travel page or booking record you are searching for does not exist or has expired.</p>
      <Link href="/" className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors">
        Return to Portal
      </Link>
    </div>
  );
}
