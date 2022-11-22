import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className="p-[0 2rem]">
      <Head>
        <title>Next Template</title>
        <meta name="description" content="Generated with next-template" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen p-4 flex flex-1 flex-col justify-center items-center text-4xl">
        <h1 className="font-bold text-center">
          Welcome to{" "}
          <a
            href="https://github.com/andrecox/next-template"
            className="text-blue-500 underline decoration-transparent hover:decoration-blue-500 transition-all"
          >
            Next Template!
          </a>
        </h1>
        <h2 className="mt-2">
          Powered by{" "}
          <a
            href="https://nextjs.org"
            className="text-blue-500 underline decoration-transparent hover:decoration-blue-500 transition-all"
          >
            Next.js
          </a>
        </h2>

        <p className="text-center m-16 text-[1.5rem]">
          Get started by editing{" "}
          <code className="bg-[#fafafa] rounded-md p-[0.75rem] font-mono text-[1.1rem]">
            pages/index.js
          </code>
        </p>

        <div className="flex items-center justify-center flex-wrap max-w-[800px]">
          <a href="https://tailwindcss.com" className={styles.card}>
            <h2>Tailwind CSS &rarr;</h2>
            <p>
              Learn about Tailwind keeps the app size small while still being
              easy to use.
            </p>
          </a>

          <a href="https://mobx.js.org/README.html" className={styles.card}>
            <h2>MobX &rarr;</h2>
            <p>A powerful way to manage state without tons of boilerplate!</p>
          </a>

          <a href="https://pages.github.com/" className={styles.card}>
            <h2>Github Pages &rarr;</h2>
            <p>Build a static site and deploy it using Github Actions.</p>
          </a>

          <a href="https://capacitorjs.com" className={styles.card}>
            <h2>Capacitor JS &rarr;</h2>
            <p>Build your web app for mobile with access to native features.</p>
          </a>
        </div>
        <p className="text-center mt-16 text-[1.5rem]">
          MobX state management built in!
        </p>
        <Link href="/mobx">
          <a className="text-blue-500 under text-xl underline decoration-transparent  hover:decoration-blue-500 transition-all">
            Check it out here
          </a>
        </Link>
      </main>
    </div>
  );
}
