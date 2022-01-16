import Editor, { Monaco } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { usePyodide } from "./pyodide-provider";
import type monaco from 'monaco-editor';

type Props = {
  outputType: "rendered" | "matplotlib"
  plotElementId?: string
}

export default function PythonEditor({ outputType, plotElementId }: Props) {
  const { runPython, pyodideLoading } = usePyodide()
  const [codeRunning, setCodeRunning] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [output, setOutput] = useState<string | undefined>(undefined)
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
      }
    }
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, _monaco: Monaco) => {
    editorRef.current = editor;
  }

  const renderOutput = () => {
    if (outputType === "rendered" && output !== undefined) {
      return <div className="prose prose-invert prose-table:table-auto prose-th:text-center whitespace-pre-wrap overflow-x-auto" dangerouslySetInnerHTML={{ __html: output }} />
    } else if (outputType === "matplotlib" && plotElementId !== undefined) {
      return <div className="invert" id={plotElementId} />
    } else {
      return null
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Editor
        height="50vh"
        defaultLanguage="python"
        defaultValue="# some comment"
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
