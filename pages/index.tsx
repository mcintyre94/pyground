import { ChangeEvent, FormEventHandler, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CsvSelect from "../components/csv-select";
import DataFormRow from "../components/data-form-row";
import { usePyodide } from "../components/pyodide-provider";
import { DateConversion, DateConversionFormat, preprocessData } from "../lib/pythonFragments";

type FieldAndValue = {
  field: string,
  value: string,
}

export default function Home() {
  const [parsedData, setParsedData] = useState<Object[]>([])
  const [fields, setFields] = useState<FieldAndValue[]>([])
  const [dateConversionFormats, setDateConversionFormats] = useState<{ [field: string]: DateConversionFormat }>({})
  const { runPython } = usePyodide()

  useEffect(() => {
    if (parsedData.length > 0) {
      const firstRow: { [field: string]: any } = parsedData[0]
      const rowFields = Object.getOwnPropertyNames(firstRow)
      const fieldsAndValues: FieldAndValue[] = rowFields.map(field => ({
        field,
        value: firstRow.hasOwnProperty(field) ? firstRow[field] as string : ""
      }))

      setFields(fieldsAndValues)
      setDateConversionFormats({})
    }
  }, [parsedData])

  const recordDateConversion = (field: string, format?: DateConversionFormat) => {
    if (format === undefined) {
      const newDateConversions = { ...dateConversionFormats }
      delete newDateConversions[field]
      setDateConversionFormats(newDateConversions)
    } else {
      setDateConversionFormats({ ...dateConversionFormats, [field]: format })
    }
  }

  const setData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const dateConversions: DateConversion[] = Object.entries(dateConversionFormats).map(([field, format]) => ({
      field,
      format,
    }))

    const dataCode = preprocessData(parsedData, dateConversions)
    console.log({ dataCode })

    const promise = runPython(dataCode).then(_output => window.scrollTo(0, 0))
    toast.promise(promise, {
      loading: 'Setting the data...',
      success: 'Data variable set',
      error: (err) => `Failed to set data: ${err}`,
    }, {
      style: {
        minWidth: "10em",
      }
    })
  }

  return (
    <div className='flex flex-col gap-4 max-w-4xl'>
      <h1 className="prose prose-invert prose-2xl">Select a CSV file</h1>

      <CsvSelect onParsedCsv={setParsedData} />

      {fields.length > 0 ? (
        <>
          <h3 className="prose prose-invert prose-lg m-2">Optional: configure date fields</h3>

          <form className="flex flex-col gap-4" onSubmit={setData}>
            <table className="table-auto">
              <tbody className="p-2">
                {fields.map(({ field, value }) => <DataFormRow key={field} field={field} firstValue={value} recordUpdate={recordDateConversion} />)}
              </tbody>
            </table>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 hover:scale-105 text-white font-bold py-2 px-4 rounded w-fit ml-8"
            >Set Data</button>
          </form>
        </>
      ) : null}

    </div>
  )
}
