import { ChangeEvent, FormEventHandler, useEffect, useState } from "react";
import CsvSelect from "../components/csv-select";
import { usePyodide } from "../components/pyodide-provider";
import { DateConversion, DateConversionFormat, preprocessData } from "../lib/pythonFragments";

type FormRowProps = {
  field: string,
  firstValue: string,
  recordUpdate: (field: string, format?: DateConversionFormat) => unknown,
}

const shorten = (s: string, max: number) => {
  if (s?.length > max) {
    return s.slice(0, max - 3) + "...";
  } else {
    return s;
  }
}

function FormRow({ field, firstValue, recordUpdate }: FormRowProps) {
  const [formatType, setFormatType] = useState<string>("none")
  const [customFormat, setCustomFormat] = useState<string>("")

  const onChangeFormatType = (e: ChangeEvent<HTMLSelectElement>) => {
    const newFormatType = e.target.value
    setFormatType(newFormatType)
    if (newFormatType === "none") recordUpdate(field)
    if (newFormatType === "timestamp_seconds") recordUpdate(field, "timestamp_seconds")
    if (newFormatType === "isoformat") recordUpdate(field, "isoformat")
    if (newFormatType === "custom_format") recordUpdate(field, customFormat)
  }

  const onChangeCustomFormat = (e: ChangeEvent<HTMLInputElement>) => {
    const newCustomFormat = e.target.value
    setCustomFormat(newCustomFormat)
    recordUpdate(field, newCustomFormat)
  }

  return (
    <tr>
      <th className="px-2"><label className="text text-gray-100">{field}</label></th>
      <td className="text text-sm text-gray-400">{shorten(firstValue, 30)}</td>
      <td className="px-2"><select name={field} value={formatType} onChange={onChangeFormatType}>
        <option value="none">Not a date</option>
        <option value="timestamp_seconds">Timestamp (seconds since UNIX epoch)</option>
        <option value="isoformat">ISOformat (eg. 2022-01-07T21:47:30) (</option>
        <option value="custom_format">Custom format</option>
      </select></td>
      <td className="px-2">
        {formatType === "custom_format" ?
          <input type="text" name={field + "_custom"} placeholder="%d/%m/%Y" value={customFormat} onChange={onChangeCustomFormat} /> :
          <span />
        }
      </td>
    </tr>
  )
}

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
    console.log(dataCode)
    await runPython(dataCode)
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
                {fields.map(({ field, value }) => <FormRow key={field} field={field} firstValue={value} recordUpdate={recordDateConversion} />)}
              </tbody>
            </table>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit ml-8"
            >Set Data</button>

          </form>
        </>
      ) : null}

    </div>
  )
}
