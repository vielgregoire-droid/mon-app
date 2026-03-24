export default function LogistiquePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-tw-dark">Logistique</h1>
      <p className="text-muted mt-2">Suivi des livraisons et de la chaîne logistique</p>
      <div className="mt-8 flex items-center justify-center h-64 bg-card rounded-xl border border-tw-accent/10 border-dashed">
        <div className="text-center">
          <p className="text-4xl mb-3">🚚</p>
          <p className="text-muted text-sm">Bientôt disponible</p>
        </div>
      </div>
    </div>
  );
}
