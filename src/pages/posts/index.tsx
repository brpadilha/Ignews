import { GetStaticProps } from 'next';

import Head from "next/head";
import styles from './styles.module.scss'
import { getPrismicClient } from '../../services/prismic';
import { query } from 'faunadb';
import  Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

type Post = {
  slug: string;
  title: string;
  except: string;
  updatedAt: string;
}

interface PopstProps {
  posts: Post[];
}

export default function Posts({ posts }: PopstProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <a key={post.slug}>
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>
                {post.except}
              </p>
            </a>
          )) }
          
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    {
      fetch: ["publication.title", "publication.content"],
      pageSize: 100,
    }
  );   
   console.log(JSON.stringify(response, null, 2))

  const posts = response.results.map(post=> {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.Title),
      except: post.data.Content.find(content => content.type === 'paragraph').text,
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR',{
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    }
  })

  return {
    props: {posts},
  };

}