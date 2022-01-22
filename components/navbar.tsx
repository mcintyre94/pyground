import Link from 'next/link'
import { useRouter } from 'next/router'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { asPath } = useRouter()

  const navigation = [
    { name: 'CSV', href: '/', current: asPath === '/' },
    { name: 'GraphJSON', href: '/graphjson', current: asPath === '/graphjson' },
  ]

  return (
    <div className="mx-auto px-2 sm:px-6 lg:px-8 rounded-md bg-gray-900 min-w-full">
      <div className="relative flex items-center justify-between h-16">
        <div className="flex-1 flex items-stretch justify-start">
          <div className="flex-shrink-0 flex items-center text-gray-400">
            Import data...
          </div>
          <div className="block sm:ml-6">
            <div className="flex space-x-4">
              {navigation.map((item) => (
                <Link href={item.href} key={item.name}>
                  <a
                    className={classNames(
                      item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'px-3 py-2 rounded-md text-sm font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
