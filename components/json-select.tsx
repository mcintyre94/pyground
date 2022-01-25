import { CheckCircleIcon, DownloadIcon, UploadIcon, ExclamationCircleIcon, RefreshIcon } from "@heroicons/react/outline"
import clsx from "clsx"
import { useState } from "react"
import { useDropzone } from "react-dropzone"

type Props = {
  onParsedJson: (parsed: Object[]) => void
}

export default function JsonSelect({ onParsedJson }: Props) {
  const [acceptedFile, setAcceptedFile] = useState<File | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [parsing, setParsing] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    console.log(acceptedFiles.map(a => a.name))
    if (acceptedFiles.length === 0) return
    const acceptedFile = acceptedFiles[acceptedFiles.length - 1]
    setAcceptedFile(acceptedFile)
    setParsing(true)

    try {
      const buffer: ArrayBuffer = await acceptedFile.arrayBuffer()
      const decoder = new TextDecoder('utf-8')
      const contents = decoder.decode(buffer)
      console.log({ contents })
      const parsed = JSON.parse(contents)
      setParsing(false)
      setError(undefined)

      console.log({ parsed })
      onParsedJson(parsed)
    } catch (error) {
      setParsing(false)
      console.error(error)
      setError(String(error))
    }
  }

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: "application/json",
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
          <p className="text-gray-100">Drop the file to import it</p>
        </div>
      )
    }
    return (
      <div className="flex flex-row gap-2">
        <UploadIcon className="w-6 h-6 text-gray-100" />
        <p className="text-gray-100">Drop a JSON file here, or click to select one</p>
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