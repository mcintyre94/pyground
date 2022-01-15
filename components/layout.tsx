import Link from "next/link";
import { PropsWithChildren, useState } from "react";
import PythonEditor from "./python-editor";

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <div className="max-w-7xl py-8 px-4 mx-auto lg:px-8">
        <div className="flex flex-col gap-8">
          {/* editors */}
          <div className="flex flex-row gap-8">
            <PythonEditor />
            <PythonEditor />
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
        </div>
      </div>
    </>
  )
}
