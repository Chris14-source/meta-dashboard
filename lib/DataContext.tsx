"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MetaData } from "./types";

// La "forma" del magazzino: contiene i dati, una funzione per salvarli,
// e un flag che dice se qualcosa è stato caricato
interface DataContextType {
  data: MetaData;
  setData: (data: MetaData) => void;
  isLoaded: boolean;
}

// Il magazzino parte vuoto — tutti array vuoti
const emptyData: MetaData = {
  adInterests: [],
  adInteractions: [],
  advertisers: [],
  offFacebookActivity: [],
};

// Creiamo il magazzino
const DataContext = createContext<DataContextType>({
  data: emptyData,
  setData: () => {},
  isLoaded: false,
});

// Questo componente "avvolge" tutta l'app come una scatola.
// Tutto ciò che sta dentro può accedere al magazzino.
export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<MetaData>(emptyData);
  const [isLoaded, setIsLoaded] = useState(false);

  const setData = (newData: MetaData) => {
    setDataState(newData);
    setIsLoaded(true);
  };

  return (
    <DataContext.Provider value={{ data, setData, isLoaded }}>
      {children}
    </DataContext.Provider>
  );
}

// Questa funzione ti permette di accedere al magazzino da qualsiasi componente.
// Basta scrivere: const { data, isLoaded } = useMetaData();
export const useMetaData = () => useContext(DataContext);