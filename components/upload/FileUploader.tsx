"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMetaData } from "@/lib/DataContext";
import { MetaData } from "@/lib/types";

// Tipo per un file che è stato letto e riconosciuto
interface ParsedFile {
  name: string;
  category: string;
  count: number;
}

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tempData, setTempData] = useState<Partial<MetaData>>({});
  const { setData } = useMetaData();
  const router = useRouter();

  // Questa funzione prende un file JSON e capisce che tipo di dati contiene
  const detectAndParse = (
    fileName: string,
    json: any
  ): { category: string; count: number; data: Partial<MetaData> } | null => {
    try {
      // Caso 1: Interessi pubblicitari
      if (fileName.includes("ad_interests") || json?.topics) {
        const interests = json.topics || json.inferred_topics || [];
        return {
          category: "Interessi Pubblicitari",
          count: interests.length,
          data: {
            adInterests: interests.map((t: any) => ({
              name: typeof t === "string" ? t : t.name || t,
            })),
          },
        };
      }

      // Caso 2: Interazioni con inserzioni (ads che hai visto o cliccato)
      if (
        fileName.includes("recently_viewed") ||
        fileName.includes("recently_visited") ||
        json?.impressions_history_v2
      ) {
        const interactions = json.impressions_history_v2 || json.history_v2 || [];
        return {
          category: "Interazioni con Inserzioni",
          count: interactions.length,
          data: {
            adInteractions: interactions.map((i: any) => ({
              title: i.title || "Sconosciuto",
              action: i.action || "view",
              timestamp: i.timestamp || 0,
            })),
          },
        };
      }

      // Caso 3: Inserzionisti che hanno i tuoi dati
      if (
        fileName.includes("advertisers") ||
        json?.custom_audiences_all_types_v2 ||
        json?.ig_custom_audiences_all_types_v2
      ) {
        const list =
          json.custom_audiences_all_types_v2 ||
          json.ig_custom_audiences_all_types_v2 ||
          [];
        return {
          category: "Inserzionisti",
          count: list.length,
          data: {
            advertisers: list.map((a: any) => ({
              name: a.advertiser_name || a.name || "Sconosciuto",
              has_data_file_custom_audience:
                a.has_data_file_custom_audience || false,
              has_remarketing_custom_audience:
                a.has_remarketing_custom_audience || false,
              has_in_person_store_visit: a.has_in_person_store_visit || false,
            })),
          },
        };
      }

      // Caso 4: Attività fuori Facebook (siti/app che parlano di te a META)
      if (fileName.includes("off_facebook") || json?.off_facebook_activity_v2) {
        const activities = json.off_facebook_activity_v2 || [];
        return {
          category: "Attività Fuori Facebook",
          count: activities.length,
          data: {
            offFacebookActivity: activities.map((a: any) => ({
              name: a.name || "Sconosciuto",
              events: (a.events || []).map((e: any) => ({
                id: e.id || 0,
                type: e.type || "CUSTOM",
                timestamp: e.timestamp || 0,
              })),
            })),
          },
        };
      }

      // Se non riconosce il file
      return null;
    } catch {
      return null;
    }
  };

  // Questa funzione viene chiamata quando l'utente carica dei file
  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      const newParsed: ParsedFile[] = [...parsedFiles];
      const newData: Partial<MetaData> = { ...tempData };

      for (const file of Array.from(files)) {
        // Controlla che sia un file JSON
        if (!file.name.endsWith(".json")) {
          setError(
            `"${file.name}" non è un file JSON. Seleziona solo file .json dall'export META.`
          );
          continue;
        }

        try {
          // Leggi il contenuto del file
          const text = await file.text();
          const json = JSON.parse(text);
          const result = detectAndParse(file.name, json);

          if (result) {
            newParsed.push({
              name: file.name,
              category: result.category,
              count: result.count,
            });
            Object.assign(newData, result.data);
          } else {
            newParsed.push({
              name: file.name,
              category: "Non riconosciuto",
              count: 0,
            });
          }
        } catch {
          setError(
            `Errore nel parsing di "${file.name}". Assicurati che sia un JSON valido.`
          );
        }
      }

      setParsedFiles(newParsed);
      setTempData(newData);
    },
    [parsedFiles, tempData]
  );

  // Gestisce il "drag and drop" (trascinamento file)
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

  // Quando clicchi "Analizza", salva i dati nel magazzino e vai alla dashboard
  const handleLaunch = () => {
    setData({
      adInterests: tempData.adInterests || [],
      adInteractions: tempData.adInteractions || [],
      advertisers: tempData.advertisers || [],
      offFacebookActivity: tempData.offFacebookActivity || [],
    });
    router.push("/dashboard");
  };

  const recognizedFiles = parsedFiles.filter(
    (f) => f.category !== "Non riconosciuto"
  );

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
            Trascina qui i file JSON dell&apos;export META
          </p>
          <p className="text-sm text-gray-500 mt-1">
            oppure clicca per selezionarli. Puoi caricare più file insieme.
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          accept=".json"
          multiple
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

      {/* LISTA DEI FILE CARICATI */}
      {parsedFiles.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">File caricati</h3>
          <div className="space-y-2">
            {parsedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-mono">{f.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{f.category}</span>
                  {f.category !== "Non riconosciuto" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* BOTTONE PER ANDARE ALLA DASHBOARD */}
      {recognizedFiles.length > 0 && (
        <Button onClick={handleLaunch} className="w-full" size="lg">
          Analizza {recognizedFiles.length} file → Dashboard
        </Button>
      )}
    </div>
  );
}
