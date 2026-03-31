// Ogni interesse pubblicitario che META ti assegna
// Esempio: "Viaggi", "Tecnologia", "Cucina italiana"
export interface AdInterest {
    name: string;
  }
  
  // Una singola interazione con un'inserzione
  // Esempio: hai cliccato o visto una pubblicità
  export interface AdInteraction {
    title: string;
    action: string;
    timestamp: number;
  }
  
  // Un inserzionista che ha caricato i tuoi dati su META
  // Esempio: un negozio online dove hai comprato qualcosa
  export interface Advertiser {
    name: string;
    has_data_file_custom_audience: boolean;
    has_remarketing_custom_audience: boolean;
    has_in_person_store_visit: boolean;
  }
  
  // Un singolo evento tracciato fuori da Facebook
  // Esempio: hai visitato un sito e quel sito l'ha detto a META
  export interface OffFacebookEvent {
    id: number;
    type: string;
    timestamp: number;
  }
  
  // Un'app o sito che manda dati su di te a META
  export interface OffFacebookActivity {
    name: string;
    events: OffFacebookEvent[];
  }
  
  // TUTTI i dati insieme — questo è il "contenitore principale"
  export interface MetaData {
    adInterests: AdInterest[];
    adInteractions: AdInteraction[];
    advertisers: Advertiser[];
    offFacebookActivity: OffFacebookActivity[];
  }