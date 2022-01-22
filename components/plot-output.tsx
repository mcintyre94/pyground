import { useState } from "react";
import { usePyodide } from "./pyodide-provider"
import clsx from "clsx";
import ModeToggle from "./mode-toggle";

type Props = {
  hasCodeRun: boolean
}

export default function PlotOutput({ hasCodeRun }: Props) {
  const { plotElementId } = usePyodide();
  const [invert, setInvert] = useState(true);

  return (
    <>
      {hasCodeRun && <ModeToggle defaultEnabled={true} afterChange={setInvert} />}
      <div className={clsx({ invert })} id={plotElementId} />
    </>
  )
}
