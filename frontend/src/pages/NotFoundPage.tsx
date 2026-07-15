import { Link } from 'react-router-dom'; 

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold text-cyan-400">404</h1>
      <p className="mt-4 text-xl text-slate-300">This workspace route does not exist.</p>
      
      {/* Do not use onClick={() => navigate(-1)} here! */}
      <Link 
        to="/" 
        className="mt-8 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}