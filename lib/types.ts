// Una singola riga del CSV — corrisponde a un'inserzione
export interface AdRow {
    campaignName: string;
    adSetName: string;
    adName: string;
    status: string;
    level: string;
    reach: number;
    impressions: number;
    frequency: number;
    resultType: string;
    results: number;
    amountSpent: number;
    costPerResult: number;
    linkClicks: number;
    cpc: number;
    cpm: number;
    ctr: number;
    allClicks: number;
    allCpc: number;
    roas: number;
    reportStart: string;
    reportEnd: string;
  }
  
  // L'insieme di tutti i dati caricati
  export interface MetaData {
    rows: AdRow[];
    fileName: string;
  }