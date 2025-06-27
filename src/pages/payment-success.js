import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { FbPixelEvents, initFacebookPixel } from '@/lib/facebookPixel';

const PaymentSuccess = () => {
  const router = useRouter();
  const { order_id } = router.query;
  const [orderId, setOrderId] = useState('');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [data123, setData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    initFacebookPixel(); // Initialize pixel

    const data = localStorage.getItem('paymentVerification');
    if (!data) {
      setStatus('failed');
      setError('No payment data found.');
      return;
    }

    const parsedData = JSON.parse(data);
    setData(parsedData);

    // 1 second verifying animation
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  }, []);
  
  useEffect(() => {
    let storedOrderId = localStorage.getItem('generatedOrderId');

    if (!storedOrderId) {
      const newOrderId = generateOrderId();
      localStorage.setItem('generatedOrderId', newOrderId);
      storedOrderId = newOrderId;
    }

    setOrderId(storedOrderId);
  }, []);

  const generateOrderId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  return (
    <>
      <Head>
        <title>Payment Status</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <div className={`card fade-in`}>
          <div className="logo-wrapper">
            {status === 'verifying' && <Loader2 className="icon blue spin" size={72} />}
            {status === 'success' && <CheckCircle2 className="icon green bounce" size={72} />}
            {status === 'failed' && <XCircle className="icon red shake" size={72} />}
          </div>

          {status === 'verifying' && (
            <>
              <h2>Verifying Payment...</h2>
              <p className="text">Please wait while we confirm your transaction.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className="mb-3 text-success text-center">Payment Successful</h2>
              <p className="text-muted text-center mb-4">{data123.statusMsg}</p>

              <div className="card bg-light mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                <div className="card-body">
                  <p className="mb-2 justify-content-between d-flex"><strong>Order ID:</strong> {orderId}</p>
                  <p className="mb-2 justify-content-between d-flex"><strong>Amount Paid:</strong> ₹ {data123?.orderId}</p>
                  <p className="mb-2 justify-content-between d-flex"><strong>Reference ID:</strong> {data123?.referenceId || 'N/A'}</p>
                  <p className="mb-0 justify-content-between d-flex"><strong>Date:</strong> {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button className="btn btn-primary px-4" onClick={() => router.push('/')}>
                  View Orders
                </button>
                <button className="btn btn-outline-primary px-4" onClick={() => router.push('/')}>
                  Back to Home
                </button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <h2>Payment Failed</h2>
              <p className="text">{error}</p>
              <div className="btn-group">
                <button onClick={() => router.push('/')}>Try Again</button>
                <button onClick={() => router.push('/')}>Back to Home</button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .card {
          background: #fff;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          max-width: 500px;
          width: 100%;
          text-align: center;
          font-family: 'Segoe UI', sans-serif;
          animation: fadeIn 0.8s ease-in-out;
        }

        .logo-wrapper {
          margin-bottom: 1rem;
        }

        .icon {
          display: block;
          margin: 0 auto;
        }

        .blue {
          color: #3b82f6;
        }

        .green {
          color: #22c55e;
        }

        .red {
          color: #ef4444;
        }

        h2 {
          margin-top: 0.5rem;
          font-size: 1.75rem;
          color: #111827;
        }

        .text {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .btn-group {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        button {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background: #2563eb;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        .bounce {
          animation: bounce 1s ease-out;
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%   { transform: scale(0.8); opacity: 0; }
          50%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .card {
            padding: 1.5rem;
          }

          button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default PaymentSuccess;
