import Editor from "@monaco-editor/react";

export default function PythonEditor() {
  return (
    <Editor
      height="50vh"
      defaultLanguage="python"
      defaultValue="# some comment"
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        padding: { top: 15, bottom: 4 },
      }}
    />
  );
}
