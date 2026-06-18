import Link from 'next/link';

export default function BusinessNotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="inline-block text-8xl font-bold text-gold-500/20 select-none">
            404
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Negocio no encontrado
        </h1>

        <p className="text-dark-100 mb-8 leading-relaxed">
          El negocio que estas buscando no existe o ha sido desactivado.
          Verifica el enlace e intenta de nuevo.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl btn-gold text-sm font-semibold"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
