import Link from "next/link";
import { Calendar, CreditCard, Bell, Users, Shield, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-500 to-amber-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-dark-900" />
              </div>
              <span className="text-xl font-bold text-white">
                Reserva<span className="text-gold-gradient">Pro</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/signup"
                className="btn-gold px-5 py-2 rounded-lg text-sm"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/5 text-gold-500 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            Plataforma SaaS Multi-Tenant
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Gestiona tus turnos
            <br />
            <span className="text-gold-gradient">como un profesional</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
            ReservaPro es la plataforma todo-en-uno para profesionales y
            negocios. Agenda, cobra y notifica automáticamente a tus clientes
            con una experiencia premium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="btn-gold px-8 py-3.5 rounded-xl text-base font-semibold w-full sm:w-auto"
            >
              Crear mi negocio gratis
            </Link>
            <Link
              href="/auth/login"
              className="btn-outline-gold px-8 py-3.5 rounded-xl text-base font-semibold w-full sm:w-auto"
            >
              Acceder a mi panel
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Desde la reserva hasta el pago y el recordatorio. Automatizado,
            elegante y seguro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-dark p-6 hover:border-gold-500/30 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-lg bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors">
                <feature.icon className="w-5 h-5 text-gold-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Planes que crecen con tu negocio
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Elige el plan que mejor se adapte a ti. Cambia en cualquier momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`card-dark p-8 relative ${
                plan.featured
                  ? "border-gold-500 ring-1 ring-gold-500/30"
                  : ""
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-500 text-dark-900 text-xs font-bold uppercase tracking-wider">
                  Más Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-400">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${
                  plan.featured
                    ? "btn-gold"
                    : "btn-outline-gold"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ReservaPro. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description:
      "Calendario interactivo que muestra solo los horarios disponibles en tiempo real. Sin confusiones.",
  },
  {
    icon: CreditCard,
    title: "Pagos Integrados",
    description:
      "Cobra al instante con Stripe. El turno se confirma automáticamente al recibir el pago.",
  },
  {
    icon: Bell,
    title: "Notificaciones Automáticas",
    description:
      "Recordatorios por WhatsApp y Email 24h y 1h antes. Reduce las ausencias.",
  },
  {
    icon: Users,
    title: "Multi-Profesional",
    description:
      "Gestiona múltiples profesionales desde un solo panel. Ideal para equipos y sucursales.",
  },
  {
    icon: Shield,
    title: "Anti Doble Reserva",
    description:
      "Sistema transaccional que previene que dos clientes tomen el mismo turno simultáneamente.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Métricas",
    description:
      "Visualiza tus ingresos, tasa de asistencia y actividad anual con gráficos elegantes.",
  },
];

const plans = [
  {
    name: "Plan Básico",
    price: "29.990",
    features: [
      "Agenda de turnos",
      "Reservas básicas",
      "Notificaciones por Email",
      "1 Profesional",
      "1 Sucursal",
    ],
    cta: "Comenzar",
    featured: false,
  },
  {
    name: "Plan Pro",
    price: "59.990",
    features: [
      "Todo lo del Plan Básico",
      "Notificaciones WhatsApp",
      "Integración Stripe propia",
      "Hasta 5 Profesionales",
      "Soporte prioritario",
    ],
    cta: "Comenzar",
    featured: true,
  },
  {
    name: "Plan Premium",
    price: "99.990",
    features: [
      "Todo lo del Plan Pro",
      "Reportes avanzados",
      "Multi-sucursal",
      "Profesionales ilimitados",
      "Soporte VIP 24/7",
    ],
    cta: "Comenzar",
    featured: false,
  },
];
