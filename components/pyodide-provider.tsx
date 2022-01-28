import { useState, useEffect, createContext, useContext, PropsWithChildren } from "react";
import Script from "next/script";
import { createPythonClient } from "@run-wasm/python"
import { preloadMatplotlibCode } from "../lib/pythonFragments";

declare global {
  // <- [reference](https://stackoverflow.com/a/56458070/11542903)
  interface Window {
    loadPyodide: Function
  }
}

export interface Pyodide {
  runPython: (code: string) => unknown
}

type Value = {
  runPython: (code: string) => Promise<string>,
  pyodideLoading: boolean,
  plotElementId: string
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
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/',
      });
      await preloadMatplotlib(loadedPyodide);
      await importDateUtil(loadedPyodide);
      setPyodide(loadedPyodide);
    }

    loadAndSetPyodide();
  }, [pyodide])

  const runPython = async (code: string): Promise<string> => {
    const pythonClient = createPythonClient(pyodide)
    const output = await pythonClient.run({ code })
    return output
  }

  const plotElementId = 'data-playground__plot'

  async function preloadMatplotlib(pyodide: Pyodide) {
    const pythonClient = createPythonClient(pyodide)
    await pythonClient.run({ code: preloadMatplotlibCode(plotElementId) })
  }

  async function importDateUtil(pyodide: Pyodide) {
    const pythonClient = createPythonClient(pyodide)
    await pythonClient.run({ code: 'import dateutil' })
  }

  const value: Value = {
    runPython,
    pyodideLoading: loading,
    plotElementId
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <Script src="https://kit.fontawesome.com/137d63e13e.js" />

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
