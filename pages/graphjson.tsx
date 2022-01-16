import { useState } from "react"
import { usePyodide } from "../components/pyodide-provider"
import { DateConversion, preprocessData } from "../lib/pythonFragments"
import toast from "react-hot-toast"

export default function Graphjson() {
  const [apiKey, setApiKey] = useState<string>("")
  const [collection, setCollection] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("now")
  const [fetching, setFetching] = useState(false)
  const { runPython } = usePyodide()

  const fetchData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFetching(true)

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const payload = {
      api_key: apiKey,
      collection: collection,
      IANA_time_zone: tz,
      graph_type: "Samples",
      start: startDate,
      end: endDate,
      filters: [],
      customizations: {},
      order: "Ascending"
    };

    const data: Object[] = await fetch("https://www.graphjson.com/api/visualize/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(response => response.result)
      // Flatten the json to top-level, and move timestamp to top-level
      .then(result => result.map(({ json, timestamp }: { json: Object, timestamp: number }) => ({ ...json, timestamp })))

    const dateConversions: DateConversion[] = [{ field: "timestamp", format: "timestamp_seconds" }]
    const dataCode = preprocessData(data, dateConversions)
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
    <div className='flex flex-col gap-8 max-w-4xl'>
      <h1 className="prose prose-invert prose-2xl">Fetch data from <a href="https://graphjson.com" className="hover:no-underline">GraphJSON</a></h1>

      <p className="text text-sm text-gray-100">
        Your API key is used only to fetch data from GraphJSON. It is never stored or sent anywhere else.
      </p>

      <form className="flex flex-col gap-4" onSubmit={fetchData}>
        <div>
          <label htmlFor="apikey" className="block text-sm font-medium text-gray-300">
            GraphJSON API key
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="apikey"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="collection" className="block text-sm font-medium text-gray-300">
            GraphJSON Collection
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="collection"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="collection" className="block text-sm font-medium text-gray-300">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="collection"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
          className="bg-blue-500 hover:bg-blue-700 hover:scale-105 text-white font-bold py-2 px-4 rounded w-fit transition transition-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-progress"
          disabled={fetching}
        >{fetching ? "Fetching..." : "Fetch Data"}</button>

      </form>
    </div>
  )
}