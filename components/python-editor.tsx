import Editor, { Monaco } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { usePyodide } from "./pyodide-provider";
import type monaco from 'monaco-editor';
import PythonOutput from "./python-output";
import PlotOutput from "./plot-output";

type Props = {
  outputType: "rendered" | "matplotlib"
  startCode: string
}

export default function PythonEditor({ outputType, startCode }: Props) {
  const { runPython, pyodideLoading } = usePyodide()
  const [codeRunning, setCodeRunning] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [output, setOutput] = useState<string | undefined>(undefined)
  const [hasCodeRun, setHasCodeRun] = useState<boolean>(false)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined)

  const runCode = async () => {
    setError(undefined)

    if (editorRef.current !== undefined) {
      const code = editorRef.current.getValue()
      setCodeRunning(true)
      try {
        const output = await runPython(code)
        setOutput(output)
      } catch (error) {
        setError(String(error))
      } finally {
        setCodeRunning(false)
        setHasCodeRun(true)
      }
    }
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, _monaco: Monaco) => {
    editorRef.current = editor;
  }

  const renderOutput = () => {
    if (outputType === "rendered" && output !== undefined) {
      return <PythonOutput output={output} />
    } else if (outputType === "matplotlib") {
      return <PlotOutput hasCodeRun={hasCodeRun} />
    } else {
      return null
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Editor
        height="50vh"
        defaultLanguage="python"
        defaultValue={startCode}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          overviewRulerLanes: 0,
          padding: { top: 15, bottom: 4 },
        }}
      />
      <button
        className="items-center px-4 py-2 text-sm font-medium text-gray-100 transition rounded-md bg-black hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 w-fit"
        onClick={runCode}
        disabled={codeRunning || pyodideLoading}
      >
        {codeRunning || pyodideLoading
          ? "Loading..."
          : "Run Code →"}
      </button>

      {error ? <div className="text-sm text-red-400 border-red-600">{error}</div> : null}

      {renderOutput()}
    </div>
  );

}
