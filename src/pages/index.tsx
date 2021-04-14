import Prismic from '@prismicio/client';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import ptBr from 'date-fns/locale/pt-BR'
import { format } from 'date-fns';
import {FiCalendar, FiUser} from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { useState } from 'react';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function loadMorePosts() {
    const response: PostPagination = await (await fetch(postsPagination.next_page)).json();

    const newPosts = response.results;

    setPosts(state => [...state, ...newPosts]);
    setNextPage(response.next_page);
  }

  return (
    <>
      <Header />
      <div className={`${commonStyles.content} ${styles.posts}`}>
        {postsPagination.results.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
                <time>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: ptBr }
                  )}
                </time>
                <span><FiUser />{post.data.author}</span>
              </div>
            </a>
          </Link>
        ))}
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
              <time>
                <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: ptBr }
                  )}
                </time>
                <span><FiUser />{post.data.author}</span>
              </div>
            </a>
          </Link>
        ))}
        {
          nextPage && 
          <button onClick={() => loadMorePosts()}>Carregar mais posts</button>
      }
    </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ],
  {
    fetch: ['post.author', 'post.title', 'post.subtitle'],
    pageSize: 1,
  });

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        author: post.data.author,
        title: post.data.title,
        subtitle: post.data.subtitle,
      }
    }
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    }
  }
};
