/* This example requires Tailwind CSS v2.0+ */
import { ExclamationCircleIcon, XIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import { useState } from 'react'

// Super lame: Matplotlib in Pyodide doesn't work in Safari
// https://github.com/pyodide/pyodide/issues/1921

export default function SafariBanner() {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <div className={clsx(
      { hidden: !isVisible },
      "rounded-md bg-yellow-50 p-4"
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-yellow-700">Just a heads up - matplotlib in Safari doesn't work so I've hidden that editor. Sorry!</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className="inline-flex bg-yellow-50 rounded-full p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              onClick={() => setIsVisible(false)}
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )


}
