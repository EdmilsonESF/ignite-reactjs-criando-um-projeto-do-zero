import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [results, setResults] = useState<PostPagination>(postsPagination);

  async function handleLoadMorePosts(): Promise<void> {
    try {
      await fetch(results.next_page)
        .then(response => response.json())
        .then(data => {
          const updatedResult = [...results.results];

          data.results.map(result => {
            updatedResult.push({
              uid: result.uid,
              first_publication_date: result.first_publication_date,
              data: {
                title: result.data.title,
                subtitle: result.data.subtitle,
                author: result.data.author,
              },
            });
          });

          setResults({
            next_page: data.next_page,
            results: updatedResult,
          });
        });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Head>
        <title>Posts | Desafio</title>
      </Head>

      <main>
        <div>
          {results.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  ).toString()}
                </time>
                <span>{post.data.author}</span>
              </a>
            </Link>
          ))}
        </div>
        {results.next_page ? (
          <button onClick={() => handleLoadMorePosts()} type="button">
            Carregar mais posts
          </button>
        ) : (
          ''
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
    revalidate: 60 * 30, // 30 min
  };
};
