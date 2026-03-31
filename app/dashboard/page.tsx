"use client";

import { useMetaData } from "@/lib/DataContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, Globe, Target } from "lucide-react";

export default function Dashboard() {
  // Prendi i dati dal "magazzino"
  const { data, isLoaded } = useMetaData();
  const router = useRouter();

  // Se nessun dato è stato caricato, mostra un messaggio
  if (!isLoaded) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Nessun dato caricato.</p>
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:underline"
        >
          ← Torna all&apos;upload
        </button>
      </div>
    );
  }

  // Le 4 statistiche principali
  const stats = [
    {
      label: "Interessi Pubblicitari",
      value: data.adInterests.length,
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Interazioni con Ads",
      value: data.adInteractions.length,
      icon: BarChart3,
      color: "text-green-600",
    },
    {
      label: "Inserzionisti",
      value: data.advertisers.length,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Attività Off-Facebook",
      value: data.offFacebookActivity.length,
      icon: Globe,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">La tua Dashboard</h2>

      {/* 4 CARTE CON I NUMERI TOTALI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {s.value.toLocaleString("it-IT")}
                </p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Placeholder — qui metteremo i grafici nello Step 4 */}
      <Card className="p-8 text-center text-gray-500">
        <p>I grafici dettagliati arriveranno nello Step 4 🚀</p>
      </Card>
    </div>
  );
}
