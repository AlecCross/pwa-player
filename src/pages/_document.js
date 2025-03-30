import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
       <Head>
          <link rel="icon" href="/icon-16.ico" />
          <link rel="icon" type="image/webp" sizes="32x32" href="/icon-32.webp" />
          <link rel="icon" type="image/webp" sizes="16x16" href="/icon-16.webp" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
