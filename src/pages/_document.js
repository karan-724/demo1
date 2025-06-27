import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
