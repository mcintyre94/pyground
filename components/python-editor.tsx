import Editor, { Monaco } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { Pyodide } from "./pyodide-provider";
import { createPythonClient } from "@run-wasm/python"
import type monaco from 'monaco-editor';

type Props = {
  pythonLoading: boolean
  pyodide: Pyodide | undefined
}

export default function PythonEditor({ pythonLoading, pyodide }: Props) {
  const [codeRunning, setCodeRunning] = useState(false)
  const [output, setOutput] = useState(undefined)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined)

  const runCode = async () => {
    setCodeRunning(true)
    try {
      const pythonClient = createPythonClient(pyodide)
      if (editorRef.current !== undefined) {
        const code = editorRef.current.getValue()
        const output = await pythonClient.run({ code })
        setOutput(output)
        console.log('output', output)
      }
    } finally {
      setCodeRunning(false)
    }

  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, _monaco: Monaco) => {
    editorRef.current = editor;
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
        disabled={codeRunning || pythonLoading}
      >
        {codeRunning || pythonLoading
          ? "Loading..."
          : "Run Code →"}
      </button>

      <div className="border border-blue-600" />
    </div>
  );

}
