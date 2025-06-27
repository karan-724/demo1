import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ToastProvider } from 'react-toast-notifications'; 
import { initFacebookPixel, trackFacebookEvent } from '../lib/facebookPixel';
import '../styles/Home.module.css'
import '../styles/globals.css'
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS

function MyApp({ Component, pageProps }) {

  const [products1, setProducts1] = useState({ pixelId: "" });

  useEffect(() => {
    fetchProducts1();
  }, []);
  const fetchProducts1 = async () => {
    try {
      let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      };

      const response = await fetch('/api/upichange', {
        method: 'GET',
        headers: headersList,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("upi", data.upi.upi)
        setProducts1(data.pixelId);
      } else {
      }
    } catch (error) {
    }

  };
  const router = useRouter();

  useEffect(() => {
    if (products1.pixelId !== "") {
      // Initialize Pixel
      initFacebookPixel(products1.pixelId);

      // Track page views on route changes
    }

    const handleRouteChange = (url) => {
      trackFacebookEvent('PageView');
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  );
}
export default MyApp;