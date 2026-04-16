import React, { useState } from "react";
import { ClipboardCheck } from "lucide-react";

type TabType = "autoavaliacoes" | "gerenciar" | "comites";

const Avaliacoes = () => {
  const [activeTab, setActiveTab] = useState<TabType>("autoavaliacoes");

  const tabs: { key: TabType; label: string }[] = [
    { key: "autoavaliacoes", label: "Autoavaliações" },
    { key: "gerenciar", label: "Gerenciar avaliações" },
    { key: "comites", label: "Comitês de calibragem" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold text-foreground">Avaliações de desempenho</h1>
        <p className="text-muted-foreground mt-1">
          Aqui estão as avaliações de desempenho criadas na sua empresa onde você pode realizar a sua autoavaliação ou ver os resultados.
        </p>

        {/* Tabs */}
        <div className="flex gap-6 mt-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-border p-6">
        {activeTab === "autoavaliacoes" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-64 h-48 mb-6 flex items-center justify-center">
              <svg viewBox="0 0 300 220" className="w-full h-full" fill="none">
                <rect x="80" y="40" width="140" height="100" rx="8" fill="#E8EDF2" stroke="#CBD5E1" strokeWidth="1.5"/>
                <rect x="95" y="70" width="80" height="6" rx="3" fill="#94A3B8"/>
                <rect x="95" y="82" width="110" height="6" rx="3" fill="#CBD5E1"/>
                <rect x="95" y="94" width="90" height="6" rx="3" fill="#CBD5E1"/>
                <rect x="95" y="106" width="100" height="6" rx="3" fill="#CBD5E1"/>
                <rect x="60" y="20" width="80" height="20" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
                <circle cx="195" cy="90" r="25" stroke="#F97316" strokeWidth="2.5" fill="none"/>
                <line x1="213" y1="108" x2="225" y2="120" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="240" cy="50" r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5"/>
                <line x1="240" y1="42" x2="240" y2="35" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="248" y1="44" x2="253" y2="39" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="250" y1="50" x2="257" y2="50" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="130" cy="80" r="20" fill="#7C3AED" opacity="0.15"/>
                <circle cx="130" cy="80" r="12" fill="#7C3AED" opacity="0.3"/>
                <circle cx="90" cy="170" r="8" fill="#7C3AED" opacity="0.2"/>
                <rect x="70" y="150" width="20" height="30" rx="4" fill="#7C3AED" opacity="0.15"/>
                <circle cx="85" cy="185" r="10" fill="#F59E0B" opacity="0.3"/>
                <circle cx="210" cy="175" r="10" fill="#3B82F6" opacity="0.3"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Ainda não há uma avaliação criada.</h2>
            <p className="text-muted-foreground text-sm">
              Não existem avaliações criadas para realizar sua autoavaliação
            </p>
          </div>
        )}

        {activeTab === "gerenciar" && (
          <div>
            <h2 className="text-xl font-bold text-foreground">Avaliações</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Listagem das avaliações que você é gestor ou avaliador de algum colaborador
            </p>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-64 h-48 mb-6 flex items-center justify-center">
                <svg viewBox="0 0 300 220" className="w-full h-full" fill="none">
                  <rect x="80" y="40" width="140" height="100" rx="8" fill="#E8EDF2" stroke="#CBD5E1" strokeWidth="1.5"/>
                  <rect x="95" y="70" width="80" height="6" rx="3" fill="#94A3B8"/>
                  <rect x="95" y="82" width="110" height="6" rx="3" fill="#CBD5E1"/>
                  <rect x="95" y="94" width="90" height="6" rx="3" fill="#CBD5E1"/>
                  <rect x="95" y="106" width="100" height="6" rx="3" fill="#CBD5E1"/>
                  <rect x="60" y="20" width="80" height="20" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
                  <circle cx="195" cy="90" r="25" stroke="#F97316" strokeWidth="2.5" fill="none"/>
                  <line x1="213" y1="108" x2="225" y2="120" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="240" cy="50" r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5"/>
                  <line x1="240" y1="42" x2="240" y2="35" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="248" y1="44" x2="253" y2="39" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="250" y1="50" x2="257" y2="50" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="130" cy="80" r="20" fill="#7C3AED" opacity="0.15"/>
                  <circle cx="130" cy="80" r="12" fill="#7C3AED" opacity="0.3"/>
                  <circle cx="90" cy="170" r="8" fill="#7C3AED" opacity="0.2"/>
                  <rect x="70" y="150" width="20" height="30" rx="4" fill="#7C3AED" opacity="0.15"/>
                  <circle cx="85" cy="185" r="10" fill="#F59E0B" opacity="0.3"/>
                  <circle cx="210" cy="175" r="10" fill="#3B82F6" opacity="0.3"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">Ainda não há uma avaliação criada.</h2>
            </div>
          </div>
        )}

        {activeTab === "comites" && (
          <div>
            <h2 className="text-xl font-bold text-foreground">Meus comitês de calibragem</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Acesse os comitês de calibragem que você participa como facilitador ou avaliador.
            </p>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-64 h-48 mb-6 flex items-center justify-center">
                <svg viewBox="0 0 300 250" className="w-full h-full" fill="none">
                  <rect x="90" y="80" width="120" height="100" rx="12" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5"/>
                  <line x1="120" y1="140" x2="180" y2="140" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="150" y1="120" x2="150" y2="160" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="150" cy="140" r="20" fill="#DBEAFE"/>
                  <text x="145" y="146" fontSize="20" fill="#3B82F6" fontWeight="bold">×</text>
                  <rect x="70" y="50" width="40" height="50" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1"/>
                  <rect x="75" y="55" width="30" height="4" rx="2" fill="#94A3B8"/>
                  <rect x="75" y="62" width="25" height="4" rx="2" fill="#CBD5E1"/>
                  <rect x="75" y="69" width="28" height="4" rx="2" fill="#CBD5E1"/>
                  <circle cx="200" cy="65" r="12" fill="#BFDBFE"/>
                  <text x="195" y="70" fontSize="16" fill="#3B82F6">?</text>
                  <line x1="205" y1="55" x2="210" y2="50" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="212" y1="58" x2="217" y2="55" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="220" cy="120" r="15" fill="#1E3A5F" opacity="0.8"/>
                  <rect x="210" y="135" width="20" height="30" rx="4" fill="#1E3A5F" opacity="0.6"/>
                  <circle cx="50" cy="190" r="4" fill="#3B82F6" opacity="0.4"/>
                  <path d="M45 200 Q50 195 55 200 Q60 205 55 210" fill="#3B82F6" opacity="0.2"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">Nenhum comitê criado</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Avaliacoes;
