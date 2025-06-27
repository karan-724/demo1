import Head from 'next/head';
import { useEffect, useState } from 'react';

const Layout = ({ children, data }) => {
  const [facebookPixelID, setFacebookPixelID] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && data?.FacebookPixel) {
      // Save raw FacebookPixel string to sessionStorage
      sessionStorage.setItem('FacebookPixel', data.FacebookPixel);

      // Extract the ID from the pixel script
      const idMatch = data.FacebookPixel.match(/tr\?id=([0-9]+)/);
      const extractedID = idMatch ? idMatch[1] : '';

      if (extractedID) {
        setFacebookPixelID(extractedID);
        // Store in session
        sessionStorage.setItem('FacebookPixelID', extractedID);
      }

      // Dynamically inject pixel script
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${extractedID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }
  }, [data?.FacebookPixel]);

  return (
    <>
      <Head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Head>

      {/* Fallback noscript image for Pixel */}
      {facebookPixelID && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${facebookPixelID}&ev=PageView&noscript=1`}
            alt="fb-pixel"
          />
        </noscript>
      )}

      {children}
    </>
  );
};

export default Layout;
