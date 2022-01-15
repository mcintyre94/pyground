import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import PyodideProvider from '../components/pyodide-provider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PyodideProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PyodideProvider>
  )
}

export default MyApp
