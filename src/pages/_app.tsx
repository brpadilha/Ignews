import { AppProps } from "next/app"

// AppProps é o tipo de props que o App recebe para as tipagens dos componentes
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
