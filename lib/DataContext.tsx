"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MetaData } from "./types";

// La "forma" del magazzino
interface DataContextType {
  data: MetaData;
  setData: (data: MetaData) => void;
  isLoaded: boolean;
}

// Il magazzino parte vuoto
const emptyData: MetaData = {
  rows: [],
  fileName: "",
};

// Creiamo il magazzino
const DataContext = createContext<DataContextType>({
  data: emptyData,
  setData: () => {},
  isLoaded: false,
});

// Questo componente avvolge tutta l'app
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

// Per accedere ai dati da qualsiasi componente
export const useMetaData = () => useContext(DataContext);