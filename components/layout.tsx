import Link from "next/link";
import { PropsWithChildren } from "react";
import Footer from "./footer";
import { usePyodide } from "./pyodide-provider";
import PythonEditor from "./python-editor";

export default function Layout({ children }: PropsWithChildren<{}>) {
  const { pyodide, loading, plotElementId } = usePyodide()

  return (
    <>
      <div className="max-w-7xl py-8 px-4 mx-auto lg:px-8">
        <div className="flex flex-col gap-8">
          <main>
            {/* editors */}
            <div className="flex flex-row gap-8">
              <PythonEditor pyodide={pyodide} pythonLoading={loading} outputType="rendered" />
              <PythonEditor pyodide={pyodide} pythonLoading={loading} outputType="matplotlib" plotElementId={plotElementId} />
            </div>

            {/* navbar */}
            <nav>
              <ul>
                <li><Link href="/">Index</Link></li>
                <li><Link href="/second">Second</Link></li>
              </ul>
            </nav>

            {/* page contents */}
            {children}
          </main>
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  )
}
