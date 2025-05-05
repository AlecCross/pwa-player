import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
       <Head>
          <link rel="icon" href="/favicon.webp" type="image/webp" sizes="32x32" />
          <link rel="icon" href="/icons/icon-16.webp" type="image/webp" sizes="16x16" />
          <link rel="shortcut icon" href="/favicon.ico" />

          <link rel="icon" href="/icons/icon-16.ico" />
          <link rel="icon" type="/icons/webp" sizes="32x32" href="/icons/icon-32.webp" />
          <link rel="icon" type="/icons/webp" sizes="144x144" href="/icons/icon-144.webp" />
          <link rel="icon" type="/icons/webp" sizes="512x512" href="/icons/icon-512.webp" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
