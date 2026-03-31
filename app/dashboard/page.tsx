"use client";

import { useState, useMemo } from "react";
import { useMetaData } from "@/lib/DataContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Euro,
  MousePointerClick,
  Target,
  Eye,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Dashboard() {
  const { data, isLoaded } = useMetaData();
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const allDays = useMemo(() => {
    if (!isLoaded) return [];
    const days = [
      ...new Set(data.rows.map((r) => r.day).filter((d) => d !== "")),
    ];
    return days.sort();
  }, [data, isLoaded]);

  useMemo(() => {
    if (allDays.length > 0 && startDate === "") {
      setStartDate(allDays[0]);
      setEndDate(allDays[allDays.length - 1]);
    }
  }, [allDays, startDate]);

  const filteredRows = useMemo(() => {
    if (!isLoaded) return [];
    if (!startDate || !endDate) return data.rows;
    return data.rows.filter((r) => {
      if (r.day === "") return true;
      return r.day >= startDate && r.day <= endDate;
    });
  }, [data, isLoaded, startDate, endDate]);

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

  const rows = filteredRows;
  const hasDays = rows.some((r) => r.day !== "");

  const totalSpent = rows.reduce((sum, r) => sum + r.amountSpent, 0);
  const totalResults = rows.reduce((sum, r) => sum + r.results, 0);
  const totalImpressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const totalLinkClicks = rows.reduce((sum, r) => sum + r.linkClicks, 0);
  const avgCPR = totalResults > 0 ? totalSpent / totalResults : 0;
  const avgCTR =
    totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0;

  const stats = [
    {
      label: "Spesa Totale",
      value: `€${totalSpent.toFixed(2)}`,
      icon: Euro,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Lead / Risultati",
      value: totalResults.toString(),
      icon: Target,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Costo per Lead",
      value: `€${avgCPR.toFixed(2)}`,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Impression",
      value: totalImpressions.toLocaleString("it-IT"),
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Click sui Link",
      value: totalLinkClicks.toLocaleString("it-IT"),
      icon: MousePointerClick,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "CTR Medio",
      value: `${avgCTR.toFixed(2)}%`,
      icon: BarChart3,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  const adNames = [...new Set(rows.map((r) => r.adName))];

  const leadsByAdSorted = adNames
    .map((name) => ({
      name: name.length > 20 ? name.slice(0, 20) + "…" : name,
      lead: rows
        .filter((r) => r.adName === name)
        .reduce((s, r) => s + r.results, 0),
    }))
    .sort((a, b) => b.lead - a.lead);

  const costPerLeadByAd = adNames
    .map((name) => {
      const adRows = rows.filter((r) => r.adName === name);
      const totalSpentAd = adRows.reduce((s, r) => s + r.amountSpent, 0);
      const totalLeads = adRows.reduce((s, r) => s + r.results, 0);
      return {
        name: name.length > 20 ? name.slice(0, 20) + "…" : name,
        costoPerLead: totalLeads > 0 ? totalSpentAd / totalLeads : 0,
        lead: totalLeads,
      };
    })
    .filter((d) => d.lead > 0)
    .sort((a, b) => a.costoPerLead - b.costoPerLead);

  const dailyData = (() => {
    if (!hasDays) return [];
    const days = [...new Set(rows.map((r) => r.day))].sort();
    return days.map((day) => {
      const dayRows = rows.filter((r) => r.day === day);
      return {
        day: day.slice(5),
        spesa: dayRows.reduce((s, r) => s + r.amountSpent, 0),
        lead: dayRows.reduce((s, r) => s + r.results, 0),
        click: dayRows.reduce((s, r) => s + r.linkClicks, 0),
      };
    });
  })();

  const sortedRows = (() => {
    const grouped = adNames.map((name) => {
      const adRows = rows.filter((r) => r.adName === name);
      const totalSpentAd = adRows.reduce((s, r) => s + r.amountSpent, 0);
      const totalLeads = adRows.reduce((s, r) => s + r.results, 0);
      const totalClicks = adRows.reduce((s, r) => s + r.linkClicks, 0);
      const totalImp = adRows.reduce((s, r) => s + r.impressions, 0);
      return {
        adName: name,
        adSetName: adRows[0]?.adSetName || "",
        results: totalLeads,
        amountSpent: totalSpentAd,
        linkClicks: totalClicks,
        impressions: totalImp,
        costPerResult: totalLeads > 0 ? totalSpentAd / totalLeads : 0,
        ctr: totalImp > 0 ? (totalClicks / totalImp) * 100 : 0,
        cpc: totalClicks > 0 ? totalSpentAd / totalClicks : 0,
      };
    });
    return grouped.sort((a, b) => b.results - a.results);
  })();

  return (
    <div className="space-y-8">
      {/* HEADER + FILTRO DATE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Nuovo file
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {data.fileName} · {rows.length} righe
          </p>
        </div>

        {hasDays && (
          <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            />
          </div>
        )}
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
              <div className={`p-3 rounded-lg ${s.bg}`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* GRAFICO ANDAMENTO GIORNALIERO */}
      {hasDays && dailyData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Andamento Giornaliero
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="lead"
                name="Lead"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="spesa"
                name="Spesa €"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="click"
                name="Click"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* GRAFICI LEAD + COSTO PER LEAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lead per Inserzione
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadsByAdSorted} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar
                dataKey="lead"
                name="Lead"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Costo per Lead (€)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costPerLeadByAd} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar
                dataKey="costoPerLead"
                name="€ per Lead"
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* TABELLA PERFORMANCE */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance per Inserzione
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Inserzione</th>
                <th className="pb-3 pr-4 text-right">Lead</th>
                <th className="pb-3 pr-4 text-right">Spesa</th>
                <th className="pb-3 pr-4 text-right">€/Lead</th>
                <th className="pb-3 pr-4 text-right">Click</th>
                <th className="pb-3 pr-4 text-right">CTR</th>
                <th className="pb-3 text-right">CPC</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
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
                    {row.costPerResult > 0
                      ? `€${row.costPerResult.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {row.linkClicks.toLocaleString("it-IT")}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {row.ctr.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right">€{row.cpc.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}