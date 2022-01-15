import { useState, useEffect, createContext, useContext, PropsWithChildren } from "react";
import Script from "next/script";

declare global {
  // <- [reference](https://stackoverflow.com/a/56458070/11542903)
  interface Window {
    loadPyodide: Function
  }
}

export interface Pyodide { }

type Value = {
  pyodide?: Pyodide | undefined,
  loading: boolean,
}

const PyodideContext = createContext<Value | undefined>(undefined)

export default function PyodideProvider({ children }: PropsWithChildren<{}>) {
  const [pyodide, setPyodide] = useState<Pyodide | undefined>(undefined)
  const loading = !pyodide;

  // Note that window.loadPyodide comes from the beforeInteractive pyodide.js Script
  useEffect(() => {
    if (pyodide) {
      return
    }

    const loadAndSetPyodide = async () => {
      const loadedPyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.19.0/full/',
      });
      // await preloadMatplotlib(loadedPyodide);
      setPyodide(loadedPyodide);
    }

    loadAndSetPyodide();
  }, [pyodide])

  const value: Value = {
    pyodide,
    loading,
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.19.0/full/pyodide.js"
        strategy="beforeInteractive"
      />

      <PyodideContext.Provider value={value}>
        {children}
      </PyodideContext.Provider>
    </>
  )
}

export const usePyodide = () => {
  const context = useContext(PyodideContext)
  if (context === undefined) {
    throw new Error("usePyodide must be used within a PyodideProvider")
  }
  return context
}
