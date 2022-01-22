import { PropsWithChildren } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import PythonEditor from "./python-editor";
import { pandasEditorDefault, matplotlibEditorDefault } from "../lib/pythonFragments"

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <div className="max-w-7xl py-8 px-4 mx-auto lg:px-8">
        <main className="flex flex-col gap-8 min-h-screen">
          {/* editors */}
          <div className="flex flex-row gap-8">
            <PythonEditor outputType="rendered" startCode={pandasEditorDefault} />
            <PythonEditor outputType="matplotlib" startCode={matplotlibEditorDefault} />
          </div>

          {/* navbar */}
          <Navbar />

          {/* page contents */}
          {children}
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}
