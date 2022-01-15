import { useEffect, useState } from "react";
import CsvSelect from "../components/csv-select";

export default function Home() {
  const [parsedData, setParsedData] = useState<Object[]>([])

  useEffect(() => {
    console.log({ parsedData })
  }, [parsedData])

  return (
    <div className='flex flex-col gap-4 max-w-4xl'>
      <h1 className="prose prose-invert prose-2xl">Select a CSV file</h1>

      <CsvSelect onParsedCsv={setParsedData} />
    </div>
  )
}
