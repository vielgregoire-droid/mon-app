export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-turquoise-dark via-turquoise to-turquoise-light relative overflow-hidden">
      {/* Ocean wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-turquoise-dark/30 to-transparent" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Sun glow */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-sunset-orange/20 blur-3xl animate-float" />
        <div className="absolute top-16 right-16 w-20 h-20 rounded-full bg-sunset-orange/40 blur-xl animate-float" />

        {/* Decorative palm leaves */}
        <div className="absolute top-0 left-0 text-7xl opacity-20 select-none animate-wave">
          🌴
        </div>
        <div className="absolute top-10 right-5 text-6xl opacity-15 select-none animate-wave" style={{ animationDelay: "1s" }}>
          🌴
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-3xl">
          <p className="animate-fade-in-up text-sand/80 text-sm uppercase tracking-[0.3em] font-medium mb-4">
            Bienvenue en
          </p>

          <h1 className="animate-fade-in-up-delay-1 text-6xl sm:text-8xl font-bold text-white mb-2 drop-shadow-lg">
            Martinique
          </h1>

          <p className="animate-fade-in-up-delay-2 text-2xl sm:text-3xl text-sand font-light italic mb-8">
            L&apos;île aux fleurs 🌺
          </p>

          <p className="animate-fade-in-up-delay-3 text-lg text-white/80 max-w-xl mx-auto leading-relaxed mb-12">
            Découvrez la perle des Caraïbes, entre plages de sable fin,
            forêts tropicales luxuriantes et la majestueuse Montagne Pelée.
          </p>

          <div className="animate-fade-in-up-delay-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#decouvrir"
              className="px-8 py-4 bg-sunset-orange text-white font-semibold rounded-full shadow-lg hover:bg-sunset-red transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Découvrir l&apos;île
            </a>
            <a
              href="#incontournables"
              className="px-8 py-4 bg-white/15 text-white font-semibold rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105"
            >
              Les incontournables
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 animate-bounce text-white/60">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Discover Section */}
      <section id="decouvrir" className="relative bg-sand py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-volcano text-center mb-4">
            Découvrez la Martinique
          </h2>
          <p className="text-volcano/60 text-center mb-16 max-w-2xl mx-auto text-lg">
            Une île aux mille visages, où chaque recoin raconte une histoire
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              emoji="🏖️"
              title="Plages paradisiaques"
              description="Des Salines aux Anses-d'Arlet, des plages de sable blanc et noir bordées d'eaux cristallines."
              color="bg-turquoise"
            />
            <FeatureCard
              emoji="🌋"
              title="Montagne Pelée"
              description="Volcan emblématique culminant à 1397m, offrant des randonnées spectaculaires en pleine nature."
              color="bg-tropical-green"
            />
            <FeatureCard
              emoji="🍹"
              title="Rhum & Gastronomie"
              description="Dégustez les meilleurs rhums du monde et savourez une cuisine créole riche et épicée."
              color="bg-sunset-orange"
            />
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section id="incontournables" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-turquoise-dark text-center mb-16">
            Les incontournables
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <HighlightCard emoji="⛵" title="Baie de Fort-de-France" subtitle="Plus belle baie du monde" />
            <HighlightCard emoji="🌿" title="Jardin de Balata" subtitle="Jardin botanique tropical" />
            <HighlightCard emoji="🏝️" title="Les Anses-d'Arlet" subtitle="Village pittoresque" />
            <HighlightCard emoji="🦜" title="Presqu'île de la Caravelle" subtitle="Réserve naturelle" />
            <HighlightCard emoji="🎭" title="Saint-Pierre" subtitle="Le petit Pompéi" />
            <HighlightCard emoji="🐢" title="Grande Anse" subtitle="Plage sauvage du nord" />
            <HighlightCard emoji="🌊" title="Gorges de la Falaise" subtitle="Canyon tropical" />
            <HighlightCard emoji="🎶" title="Culture créole" subtitle="Musique, danse & traditions" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-turquoise-dark text-white/70 py-12 px-6 text-center">
        <p className="text-3xl mb-4">🌺</p>
        <p className="text-lg font-medium text-white mb-2">Martinique — Madinina</p>
        <p className="text-sm">L&apos;île aux fleurs des Petites Antilles</p>
        <div className="mt-6 flex justify-center gap-6 text-2xl">
          <span>🇲🇶</span>
          <span>🌴</span>
          <span>🌊</span>
          <span>☀️</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
  color,
}: {
  emoji: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      <div
        className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
      >
        {emoji}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function HighlightCard({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="group bg-gradient-to-br from-turquoise-light/10 to-turquoise/10 rounded-2xl p-6 border border-turquoise/10 hover:border-turquoise/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <span className="text-4xl block mb-3 group-hover:scale-125 transition-transform duration-300">
        {emoji}
      </span>
      <h3 className="font-bold text-turquoise-dark text-lg">{title}</h3>
      <p className="text-turquoise-dark/60 text-sm mt-1">{subtitle}</p>
    </div>
  );
}
