import { CheckCircleIcon, DownloadIcon, UploadIcon, ExclamationCircleIcon, RefreshIcon } from "@heroicons/react/outline"
import clsx from "clsx"
import Papa from "papaparse"
import { useState } from "react"
import { useDropzone } from "react-dropzone"

type Props = {
  onParsedCsv: (parsed: Object[]) => void
}

export default function CsvSelect({ onParsedCsv }: Props) {
  const [acceptedFile, setAcceptedFile] = useState<File | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [parsing, setParsing] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    console.log(acceptedFiles.map(a => a.name))
    if (acceptedFiles.length === 0) return
    const acceptedFile = acceptedFiles[acceptedFiles.length - 1]
    setAcceptedFile(acceptedFile)
    setParsing(true)

    Papa.parse(acceptedFiles[0], {
      header: true,
      complete: (results) => {
        setParsing(false)
        if (results.errors.length > 0) {
          console.error(results.errors)
          setError("Failed to parse CSV file")
        } else {
          setError(undefined)
          onParsedCsv(results.data as Object[])
        }
      },
      error: (error) => {
        setParsing(false)
        console.error(error)
        setError(`${error.name}: ${error.message}`)
      },
      skipEmptyLines: true,
      dynamicTyping: true,
      encoding: "utf-8",
    })
  }

  const { getRootProps, getInputProps, acceptedFiles, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: "text/csv",
  })

  const dropAFileLine = () => {
    if (isDragReject) {
      return (
        <div className="flex flex-row gap-2">
          <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
          <p className="text-gray-100">File type not allowed</p>
        </div>
      )
    }
    if (isDragAccept) {
      return (
        <div className="flex flex-row gap-2">
          <DownloadIcon className="w-6 h-6 text-green-600" />
          <p className="text-gray-100">Drop the file to select it</p>
        </div>
      )
    }
    return (
      <div className="flex flex-row gap-2">
        <UploadIcon className="w-6 h-6 text-gray-100" />
        <p className="text-gray-100">Drop a CSV file here, or click to select one</p>
      </div>
    )
  }

  const droppedFileLine = () => {
    if (acceptedFile) {
      if (parsing) {
        return (
          <div className="flex flex-row gap-2 pt-2 pl-2">
            <RefreshIcon className="h-6 w-6 text-orange-400 animate-spin" />
            <p className="text-sm text-gray-100">{acceptedFile.name}</p>
          </div>
        )
      }

      if (error) {
        return (
          <div className="flex flex-row gap-2 pt-2 pl-2">
            <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            <p className="text-sm text-red-600">{acceptedFile.name} - {error}</p>
          </div>
        )
      }

      if (!error) {
        return (
          <div className="flex flex-row gap-2 pt-2 pl-2">
            <CheckCircleIcon className="h-6 w-6 text-green-200" />
            <p className="text-sm text-green-200">{acceptedFile.name}</p>
          </div>
        )
      }
    }

    return null
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "border-2 border-dashed p-4 cursor-pointer transition duration-200 hover:border-blue-300 hover:scale-105",
        isDragAccept && "border-green-600 scale-105",
        isDragReject && "border-red-600 cursor-not-allowed"
      )}>
      <input {...getInputProps()} />
      {dropAFileLine()}
      {droppedFileLine()}
    </div>
  )



}