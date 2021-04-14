import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';


export default function Header() {
  return (
    <div className={styles.container}>
      <div className={`${commonStyles.content} ${styles.content}`}>
        <Link href="/">
        <a>
          <img src="/logo_full.svg" alt="logo"/>
        </a>
        </Link>
      </div>
    </div>
  )
}
