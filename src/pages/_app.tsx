import { AppProps } from "next/app"

import "../styles/global.scss"
import { Header } from '../components/Header/index';

// AppProps é o tipo de props que o App recebe para as tipagens dos componentes
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header/>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
