"use client";

import { useMetaData } from "@/lib/DataContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Euro,
  MousePointerClick,
  Target,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const { data, isLoaded } = useMetaData();
  const router = useRouter();

  // Se nessun dato è stato caricato
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

  const rows = data.rows;

  // Calcola i totali
  const totalSpent = rows.reduce((sum, r) => sum + r.amountSpent, 0);
  const totalResults = rows.reduce((sum, r) => sum + r.results, 0);
  const totalImpressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const totalReach = rows.reduce((sum, r) => sum + r.reach, 0);
  const totalLinkClicks = rows.reduce((sum, r) => sum + r.linkClicks, 0);
  const avgCPR = totalResults > 0 ? totalSpent / totalResults : 0;
  const avgCTR = totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0;
  const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;

  // Le 6 KPI card
  const stats = [
    {
      label: "Spesa Totale",
      value: `€${totalSpent.toFixed(2)}`,
      icon: Euro,
      color: "text-red-600",
    },
    {
      label: "Lead / Risultati",
      value: totalResults.toString(),
      icon: Target,
      color: "text-green-600",
    },
    {
      label: "Costo per Lead",
      value: `€${avgCPR.toFixed(2)}`,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Impression",
      value: totalImpressions.toLocaleString("it-IT"),
      icon: Eye,
      color: "text-blue-600",
    },
    {
      label: "Click sui Link",
      value: totalLinkClicks.toLocaleString("it-IT"),
      icon: MousePointerClick,
      color: "text-orange-600",
    },
    {
      label: "CTR Medio",
      value: `${avgCTR.toFixed(2)}%`,
      icon: BarChart3,
      color: "text-teal-600",
    },
  ];

  // Ordina le inserzioni per risultati (la migliore in cima)
  const sortedRows = [...rows].sort((a, b) => b.results - a.results);

  return (
    <div className="space-y-8">
      {/* TITOLO */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">La tua Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          File: {data.fileName} · {rows.length} inserzioni · Periodo:{" "}
          {rows[0]?.reportStart} → {rows[0]?.reportEnd}
        </p>
      </div>

      {/* 6 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* TABELLA PERFORMANCE INSERZIONI */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance per Inserzione
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Inserzione</th>
                <th className="pb-3 pr-4 text-right">Risultati</th>
                <th className="pb-3 pr-4 text-right">Spesa</th>
                <th className="pb-3 pr-4 text-right">Costo/Lead</th>
                <th className="pb-3 pr-4 text-right">Click</th>
                <th className="pb-3 pr-4 text-right">CTR</th>
                <th className="pb-3 pr-4 text-right">CPC</th>
                <th className="pb-3 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">
                        {row.adName}
                      </p>
                      <p className="text-xs text-gray-500">{row.adSetName}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-green-600">
                    {row.results}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    €{row.amountSpent.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    €{row.costPerResult.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {row.linkClicks.toLocaleString("it-IT")}
                  </td>
                  <td className="py-3 pr-4 text-right">{row.ctr.toFixed(2)}%</td>
                  <td className="py-3 pr-4 text-right">
                    €{row.cpc.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    {row.roas > 0 ? row.roas.toFixed(2) + "x" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}