export default function Footer() {
  return (
    <footer className="flex items-center justify-center w-full h-24 border-t text-gray-100 m-8">
      <p>Built by {' '}
        <a
          href="https://twitter.com/callum_codes"
          className="underline hover:no-underline hover:text-blue-300"
        >@callum_codes</a> | Source on {' '}
        <a
          href="https://github.com/mcintyre94/data-playground"
          className="underline hover:no-underline hover:text-blue-300"
        >GitHub</a>
      </p>
    </footer>
  )
}