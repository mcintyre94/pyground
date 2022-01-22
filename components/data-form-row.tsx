import { ChangeEvent, useState } from "react";
import { DateConversionFormat } from "../lib/pythonFragments";

type DataFormRowProps = {
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

export default function DataFormRow({ field, firstValue, recordUpdate }: DataFormRowProps) {
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
      <td className="px-2">
        <select
          name={field}
          value={formatType}
          onChange={onChangeFormatType}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="none">Not a date</option>
          <option value="timestamp_seconds">Timestamp (seconds since UNIX epoch)</option>
          <option value="isoformat">ISOformat (eg. 2022-01-07T21:47:30) (</option>
          <option value="custom_format">Custom format</option>
        </select>
      </td>
      <td className="px-2">
        {formatType === "custom_format" ?
          <>
            <label htmlFor={field + "_custom"} className="sr-only">
              Custom date format for {field}
            </label>
            <input
              type="text"
              name={field + "_custom"}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="%d/%m/%Y"
              value={customFormat}
              onChange={onChangeCustomFormat}
            />
          </> :
          null
        }
      </td>
    </tr>
  )
}
