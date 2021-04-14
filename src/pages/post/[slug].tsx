import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import ptBr from 'date-fns/locale/pt-BR'
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  function readingTime(): String {
    const wordsPerMinute = 200;

    const totalWords = post.data.content.reduce((accumulator, { heading, body }) => {
      const wordsInBody = RichText.asText(body).split(new RegExp('\\s'));
      const wordsInHeading = heading.split(new RegExp('\\s'));

      return accumulator + wordsInBody.length + wordsInHeading.length;
    }, 0);

    return `${Math.ceil(totalWords / wordsPerMinute)} min`;
  }

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner"/>
      </div>
      <main className={`${commonStyles.content} ${styles.post}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfo}>
          <div>
            <FiCalendar />
            {format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              { locale: ptBr }
            )}
          </div>
          <div>
            <FiUser />
            {post.data.author}
          </div>
          <div>
            <FiClock />
            {readingTime()}
          </div>
        </div>
        <article>
          {post.data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h2>{heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
            </div>
          ))}
        </article>
      </main>
      {router.isFallback && (
        <h5>Carregando...</h5>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ],
  {
    fetch: ['post.uid'],
    pageSize: 1,
  });

  const uidPaths = response.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths: uidPaths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post: Post = {
    ...response,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
      title: response.data.title,
    }
  };

  return {
    props: {
      post
    },
    revalidate: 60 * 30,
  }
};
