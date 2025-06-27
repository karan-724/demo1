// facebookPixel.js
export const initFacebookPixel = (pixelID) => {
  if (typeof window !== 'undefined' && !window.fbq) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', pixelID);
    fbq('track', 'PageView');
  }
};

export const trackFacebookEvent = (eventName, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    fbq('track', eventName, options);
  }
};

export const FbPixelEvents = {
  pageView: () => trackFacebookEvent('PageView'),
  purchaseView: () => trackFacebookEvent('PurchaseView'),

  productView: (product) => trackFacebookEvent('ViewContent', product),

  addToCart: (product) => trackFacebookEvent('AddToCart', product),

  removeFromCart: (product, quantity = 1) =>
    trackFacebookEvent('RemoveFromCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      currency: product.currency || 'INR',
      value: product.price * quantity,
      quantity: quantity
    }),

  initiateCheckout: (products, totalValue) =>
    trackFacebookEvent('InitiateCheckout', {
      content_ids: products.map((p) => p._id),
      content_type: 'product',
      content_name: products.map((p) => p.Title),
      currency: products[0]?.currency || 'INR',
      value: totalValue,
      num_items: products?.reduce((sum, p) => sum + (p.quantity || 1), 0)
    }),

  checkoutStep: (step, products, totalValue) =>
    trackFacebookEvent('Checkout', {
      content_ids: products.map((p) => p.id),
      content_type: 'product',
      currency: products[0]?.currency || 'INR',
      value: totalValue,
      num_items: products.reduce((sum, p) => sum + (p.quantity || 1), 0),
      checkout_step: step
    }),

  purchase: (data) => trackFacebookEvent('Purchase', data),

  customEvent: (eventName, customData) =>
    trackFacebookEvent(eventName, customData)
};
