import { PropsWithChildren, useEffect, useState } from "react";
import { parse, useUserAgent } from "next-useragent";
import Footer from "./footer";
import Navbar from "./navbar";
import PythonEditor from "./python-editor";
import { pandasEditorDefault, matplotlibEditorDefault } from "../lib/pythonFragments";
import SafariBanner from "./safari-banner";
import clsx from "clsx";

export default function Layout({ children }: PropsWithChildren<{}>) {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const userAgent = parse(window.navigator.userAgent);
    setIsSafari(userAgent.isSafari || userAgent.isIos);
  });

  return (
    <>
      <div className="max-w-7xl py-8 px-4 mx-auto lg:px-8">
        <main className="flex flex-col gap-8 min-h-screen">
          {/* safari banner :/ */}
          {isSafari && <SafariBanner />}

          {/* editors */}
          <div className={clsx(
            { "justify-center items-center": isSafari },
            "flex flex-col xl:flex-row gap-8"
          )}>
            <PythonEditor outputType="rendered" startCode={pandasEditorDefault} />
            {!isSafari && <PythonEditor outputType="matplotlib" startCode={matplotlibEditorDefault} />}
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
