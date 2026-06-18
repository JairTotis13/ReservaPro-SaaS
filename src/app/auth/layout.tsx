export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 px-4">
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-gold-gradient">Reserva</span>
          <span className="text-white">Pro</span>
        </h1>
        <p className="mt-2 text-dark-200 text-sm font-medium tracking-wide uppercase">
          Smart Booking Platform
        </p>
      </div>

      {children}

      <footer className="mt-12 text-dark-300 text-xs">
        &copy; {new Date().getFullYear()} ReservaPro. All rights reserved.
      </footer>
    </div>
  );
}
