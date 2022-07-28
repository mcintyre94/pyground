import React, { useState } from "react"
import { usePyodide } from "../components/pyodide-provider"
import { DateConversion, preprocessData } from "../lib/pythonFragments"
import toast from "react-hot-toast"
import axios from "axios"
import { DateTime } from "luxon"
import Loader from "../components/loader"

declare global {
  // <- [reference](https://stackoverflow.com/a/56458070/11542903)
  interface Window {
    parsedData: string
  }
}

type GraphJSONCollection = {
  name: string
}

export default function Graphjson() {
  const [apiKey, setApiKey] = useState<string>("")
  const [fetchingCollections, setFetchingCollections] = useState(false)
  const [fetchedCollections, setFetchedCollections] = useState<string[]>([])
  const [collection, setCollection] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("now")
  const [fetching, setFetching] = useState(false)
  const { runPython } = usePyodide()

  const fetchCollections = async (apiKey: string) => {
    if (!apiKey) return
    setFetchingCollections(true)
    const payload = {
      api_key: apiKey
    }
    const { data: { list } } = await axios.post("https://api.graphjson.com/api/collections", payload)
    const collections = list as GraphJSONCollection[]
    const collectionNames = collections.map(c => c.name)
    setFetchedCollections(collectionNames)
    setFetchingCollections(false)
  }

  type GraphJsonDataObject = {
    json: Object,
    timestamp: number,
  }

  type GraphJsonDataPayload = {
    result: GraphJsonDataObject[]
  }

  // Only returns 50 results at a time, so need to keep fetching
  const fetchFromGraphjson = async () => {
    // graphjson input, so this is a string not a date object
    let start: string = startDate
    let data: GraphJsonDataObject[] = []

    while (true) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const payload = {
        api_key: apiKey,
        collection: collection,
        IANA_time_zone: tz,
        graph_type: "Samples",
        start: start,
        end: endDate,
        filters: [],
        customizations: {},
        order: "Ascending"
      };

      console.log(`Fetching from GraphJSON with start ${start}`)

      const { data: fetchedData }: { data: GraphJsonDataPayload } = await axios.post("https://api.graphjson.com/api/visualize/data", payload)
      const { result } = fetchedData

      if (result.length === 0) {
        break
      }

      // GraphJSON timestamp is in seconds
      const lastTimestamp = result[result.length - 1].timestamp
      const lastTimestampDate = DateTime.fromSeconds(lastTimestamp, { zone: tz })

      // GraphJSON format is eg. 05/08/2022 9:10 pm (8th May 2022)
      // Dedupe on timestamp, add 1 min and fetch from there
      start = lastTimestampDate.plus({ minutes: 1 }).toFormat("MM/dd/y h:mm a")
      data = [...data, ...result]
    }

    return data
  }

  function getUniqueListBy<T, K extends keyof T>(arr: T[], key: K) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }

  const fetchData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFetching(true)

    const data = await fetchFromGraphjson()
      // dedupe by timestamp
      .then(result => getUniqueListBy(result, "timestamp"))
      // Flatten the json to top-level, and move timestamp to top-level
      .then(result => result.map(({ json, timestamp }: { json: Object, timestamp: number }) => ({ ...json, timestamp })))

    const dateConversions: DateConversion[] = [{ field: "timestamp", format: "timestamp_seconds" }]
    window.parsedData = JSON.stringify(data)
    const dataCode = preprocessData(dateConversions)
    console.log({ dataCode })

    setFetching(false)

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
    <div className='flex flex-col max-w-4xl gap-8'>
      <h1 className="prose prose-2xl prose-invert">Fetch data from <a href="https://graphjson.com" className="hover:no-underline">GraphJSON</a></h1>

      <p className="text-sm text-gray-100 text">
        Your API key is used only to fetch data from GraphJSON. It is never stored or sent anywhere else.
      </p>

      <form className="flex flex-col gap-4" onSubmit={fetchData}>
        <div>
          <label htmlFor="apikey" className="block text-sm font-medium text-gray-300">
            GraphJSON API key
          </label>
          <div className="mt-1">
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              name="apikey"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md [-webkit-text-security:disc]"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 mt-2 text-sm font-medium leading-4 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            onClick={() => fetchCollections(apiKey)}
            disabled={fetchingCollections}
          >
            Fetch Collections
          </button>
        </div>

        <div>
          <label htmlFor="collection" className="block text-sm font-medium text-gray-300">
            GraphJSON Collection
          </label>
          {fetchingCollections ? <Loader /> : (
            <select
              name="collection"
              className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              disabled={fetchedCollections.length === 0}
            >
              {fetchedCollections.map(collectionName => (
                <option value={collectionName}>{collectionName}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="collection" className="block text-sm font-medium text-gray-300">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="collection"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500" id="email-description">
            Any GraphJSON date format, eg. "4 weeks ago" or "01/16/2022 8:36 pm"
          </p>
        </div>

        <div>
          <label htmlFor="collection" className="block text-sm font-medium text-gray-300">
            End Date
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="collection"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="3 months ago"
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500" id="email-description">
            Any GraphJSON date format, eg. "4 weeks ago" or "01/16/2022 8:36 pm"
          </p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 font-bold text-white transition bg-blue-500 rounded hover:bg-blue-700 hover:scale-105 w-fit transition-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-progress"
          disabled={fetching}
        >{fetching ? "Fetching..." : "Fetch Data"}</button>

      </form>
    </div>
  )
}