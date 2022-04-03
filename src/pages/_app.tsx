import { AppProps } from "next/app"

import "../styles/global.scss"
import { Header } from '../components/Header/index';
import { SessionProvider as NextAuthProvider } from "next-auth/react";

// AppProps é o tipo de props que o App recebe para as tipagens dos componentes
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvider>
  );
}

export default MyApp
