"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMetaData } from "@/lib/DataContext";
import { AdRow } from "@/lib/types";

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<AdRow[]>([]);
  const { setData } = useMetaData();
  const router = useRouter();

  const toNum = (val: string): number => {
    if (!val || val.trim() === "") return 0;
    const cleaned = val.replace(",", ".").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const splitCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string): AdRow[] => {
    const clean = text.replace(/^\uFEFF/, "");
    const lines = clean.split("\n").filter((l) => l.trim() !== "");

    if (lines.length < 2) return [];

    const headers = splitCSVRow(lines[0]);

    // Trova la posizione della colonna "Giorno"
    // Se esiste → formato giornaliero, se no → formato aggregato
    const dayIndex = headers.findIndex(
      (h) => h.toLowerCase() === "giorno" || h.toLowerCase() === "day"
    );
    const hasDay = dayIndex !== -1;

    // Le posizioni cambiano in base alla presenza della colonna Giorno
    // Con Giorno: colonne spostate di 1 dopo la posizione 3
    const offset = hasDay ? 1 : 0;

    const rows: AdRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const v = splitCSVRow(lines[i]);
      if (v.length < 10) continue;

      rows.push({
        campaignName: v[0] || "",
        adSetName: v[1] || "",
        adName: v[2] || "",
        day: hasDay ? v[3] || "" : "",
        status: v[3 + offset] || "",
        level: v[4 + offset] || "",
        reach: toNum(v[5 + offset]),
        impressions: toNum(v[6 + offset]),
        frequency: toNum(v[7 + offset]),
        resultType: v[9 + offset] || "",
        results: toNum(v[10 + offset]),
        amountSpent: toNum(v[11 + offset]),
        costPerResult: toNum(v[12 + offset]),
        linkClicks: toNum(v[15 + offset]),
        cpc: toNum(v[16 + offset]),
        cpm: toNum(v[17 + offset]),
        ctr: toNum(v[18 + offset]),
        allClicks: toNum(v[19 + offset]),
        allCpc: toNum(v[20 + offset]),
        roas: toNum(v[24 + offset]),
        reportStart: v[26 + offset] || "",
        reportEnd: v[27 + offset] || "",
      });
    }
    return rows;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    setError(null);
    const file = files[0];

    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Seleziona un file .csv esportato da Meta Ads Manager.");
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setError("Il file CSV sembra vuoto o ha un formato non riconosciuto.");
        return;
      }

      setFileName(file.name);
      setRowCount(rows.length);
      setParsedRows(rows);
    } catch {
      setError("Errore nella lettura del file. Assicurati che sia un CSV valido.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleLaunch = () => {
    setData({
      rows: parsedRows,
      fileName: fileName || "",
    });
    router.push("/dashboard");
  };

  // Controlla se ci sono dati giornalieri
  const hasDays = parsedRows.some((r) => r.day !== "");
  const uniqueDays = new Set(parsedRows.map((r) => r.day)).size;

  return (
    <div className="space-y-6">
      {/* ZONA DI TRASCINAMENTO */}
      <Card
        className={`relative border-2 border-dashed transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Trascina qui il file CSV da Meta Ads Manager
          </p>
          <p className="text-sm text-gray-500 mt-1">
            oppure clicca per selezionarlo
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </Card>

      {/* MESSAGGIO DI ERRORE */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* FILE CARICATO */}
      {fileName && (
        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">File caricato</h3>
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span className="text-sm font-mono">{fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {rowCount} righe
                {hasDays && ` · ${uniqueDays} giorni`}
              </span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </Card>
      )}

      {/* BOTTONE PER ANDARE ALLA DASHBOARD */}
      {parsedRows.length > 0 && (
        <Button onClick={handleLaunch} className="w-full" size="lg">
          Analizza {rowCount} righe → Dashboard
        </Button>
      )}
    </div>
  );
}