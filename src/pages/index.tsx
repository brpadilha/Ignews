import { GetStaticProps } from 'next';
import Head from 'next/head';
import SubscribeButton from '../components/SubscribeButton';
import styles from './home.module.scss'
import { stripe } from '../services/stripe';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

//props que recebemos aqui é o que vem do getServerSideProps
export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Início | Ignews</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

// getServerSideProps é o método de fazer requisição no backend, ele é como o useEffect
// vantagem de usar ele, é que os dados são carregados no servidor SSR antes de ser renderizado na tela
// com isso ele é carregado já desde o começo da renderização da página

// getStaticProps é o método de fazer requisição no backend, ele é como o useEffect
// mas ele cria uma página html statica que armazena os dados, é mt utilizado para dados que não mudam tanto
// nós iremos gerar um tempo para que ele refaça um novo html

export const getStaticProps: GetStaticProps = async () => {
  // fazendo requisicao para pegar os dados do stripe
  // priceId devemos pegar na pagina de produtos do stripe
  const price = await stripe.prices.retrieve("price_1JDdDdCN91OfmpophCaRMSiG", {
    // para ter acesso a todos os dados do protudo que está dentro do price, é como se fosse referencia para outra tabela
    // se não vai trazer somente o id do produto
    //expand: ["product"]
  });

  //dividido por 100 pq vem em centavos
  const amountProdut = price.unit_amount / 100;

  const product = {
    priceId: price.id,
    //IntL.NumberFormat é para formatar o valor para o dolar
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amountProdut),
  };

  const oneDayInHour = 60 * 60 * 24; // 24 horas

  return {
    props: {
      product,
    },
    revalidate: oneDayInHour,
  };
};
