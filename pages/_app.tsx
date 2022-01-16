import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import PyodideProvider from '../components/pyodide-provider'
import { Toaster } from 'react-hot-toast'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PyodideProvider>
      <Toaster />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PyodideProvider>
  )
}

export default MyApp
