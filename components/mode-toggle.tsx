import { useState } from 'react'
import { Switch } from '@headlessui/react'
import clsx from 'clsx'

type Props = {
  defaultEnabled: boolean
  afterChange: (b: boolean) => void
}

export default function ModeToggle({ defaultEnabled, afterChange }: Props) {
  const [enabled, setEnabled] = useState(defaultEnabled)

  const onChange = (b: boolean) => {
    setEnabled(b)
    afterChange(b)
  }

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabled}
        onChange={onChange}
        className={clsx(
          enabled ? 'bg-indigo-600' : 'bg-gray-200',
          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm font-medium text-white">Dark Mode </span>
        <span className="text-sm text-gray-400">(inverts plot colours)</span>
      </Switch.Label>
    </Switch.Group>
  )
}
