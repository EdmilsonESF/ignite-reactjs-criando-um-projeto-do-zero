import Link from 'next/link';

export default function Header(): JSX.Element {
  return (
    <Link href="/">
      <img src="/Logo.svg" alt="logo" />
    </Link>
  );
}
