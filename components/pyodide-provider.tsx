import { useState, useEffect, createContext, useContext, PropsWithChildren } from "react";
import Script from "next/script";
import { createPythonClient } from "@run-wasm/python"

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
  pyodide?: Pyodide | undefined,
  loading: boolean,
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
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.19.0/full/',
      });
      await preloadMatplotlib(loadedPyodide);
      setPyodide(loadedPyodide);
    }

    loadAndSetPyodide();
  }, [pyodide])

  const plotElementId = 'data-playground__plot'
  // Python code that is preloaded before the user's code is run
  // <- [reference](https://stackoverflow.com/a/59571016/1375972)
  const preloadMatplotlibCode = `
  import matplotlib.pyplot as plt
  from js import document

  f = plt.figure()

  def get_render_element(self):
      return document.getElementById('${plotElementId}')

  f.canvas.create_root_element = get_render_element.__get__(
      get_render_element, f.canvas.__class__
  )`;

  async function preloadMatplotlib(pyodide: Pyodide) {
    const pythonClient = createPythonClient(pyodide)
    await pythonClient.run({ code: preloadMatplotlibCode })
  }

  const value: Value = {
    pyodide,
    loading,
    plotElementId
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.19.0/full/pyodide.js"
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
