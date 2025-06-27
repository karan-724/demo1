import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handlePaymentClick = () => {
    router.push('/payment');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="text-center p-5 shadow rounded bg-white">
        <h1 className="mb-3 text-primary">👋 Welcome to PayPortal</h1>
        <p className="lead mb-4">Easily manage and process payments in one place.</p>

        <button
          onClick={handlePaymentClick}
          className="btn btn-success btn-lg px-4 py-2 fw-bold"
        >
          💸 Pay ₹100 Now
        </button>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f8ff, #e6f7ff);
          font-family: 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  );
}
