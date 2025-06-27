"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { load } from '@cashfreepayments/cashfree-js'
import axios from "axios";

const Ordersummary = () => {
  const router = useRouter();
  const [user13, setuser13] = useState({})
  const [data, setdata] = useState({})

  useEffect(() => {
  }, []);
  useEffect(() => {
    // This code will run on the client side
    if (typeof window !== "undefined") {
      setuser13(JSON.parse(localStorage.getItem("user")) || {});
      setdata(JSON.parse(localStorage.getItem("data")) || {});
    }

    // ... rest of your code

  }, []); // empty dependency array ensures this runs once when the component mounts

  const [cashfree, setCashfree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Initialize Cashfree SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const cf = await load({
          mode: "production", // Must be "production" (not "prod")
          style: {
            theme: "light",
            orientation: "portrait"
          }
        });
        setCashfree(cf);
      } catch (error) {
        console.error("Failed to load Cashfree SDK:", error);
        alert("Payment system initialization failed. Please refresh the page.");
      }
    };
    initSDK();
  }, []);

  // Verify payment status with backend
  useEffect(() => {
    const verifyPayment = async (orderId) => {
      try {
        const response = await axios.get(`/api/verifyPayment?order_id=${orderId}`);
        setPaymentStatus({
          id: orderId,
          status: response.data.status,
          message: response.data.message ||
            (response.data.status === "SUCCESS"
              ? "Payment successful!"
              : "Payment failed or was cancelled")
        });
      } catch (error) {
        console.error("Verification failed:", error);
        setPaymentStatus({
          id: orderId,
          status: "PENDING",
          message: "Payment verification in progress"
        });
      }
    };

    const queryParams = new URLSearchParams(window?.location.search);
    const orderId = queryParams.get('order_id');

    if (orderId) {
      verifyPayment(orderId);
      window?.history.replaceState({}, document.title, window?.location.pathname);
    }
  }, []);

  const handleCheckout = async (e) => {
    const order_id = `order_${Date.now()}`;
    FbPixelEvents.purchase({ value: e, currency: "INR", transaction_id: order_id });
    if (!cashfree) {
      alert("Cashfree SDK not loaded yet. Please wait...");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/createOrder', {
        order_amount: Number(e), // Amount in INR
        order_id: order_id,
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: "John Doe",
          customer_email: "john@example.com",
          customer_phone: "9876543210"
        }
      });

      if (!response.data?.payment_session_id) {
        throw new Error('Invalid response from server');
      }

      const checkoutOptions = {
        paymentSessionId: response.data.payment_session_id,
        redirectTarget: "_self", // Changed to _self
        onSuccess: () => {
          // This is just a fallback
          router.push(`/payment-success?order_id=${response.data.order_id}`);
        },
        onFailure: () => {
          router.push(`/payment-success?order_id=${response.data.order_id}`);
        }
      };

      cashfree.checkout(checkoutOptions);
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message ||
        error.message ||
        "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentLink = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/createPaymentLink', {
        amount: 100, // Amount in INR
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        customer_phone: "9876543211"
      });

      if (response.data.success) {
        window?.open(response.data.link_url, "_blank");
      } else {
        throw new Error(response.data.message || "Failed to create payment link");
      }
    } catch (error) {
      console.error("Payment link error:", error);
      alert(error.response?.data?.message ||
        error.message ||
        "Failed to create payment link");
    } finally {
      setLoading(false);
    }
  };
  // const navigation = useNavigate();
  return (
    <div style={{ height: "100%" }} data-reactroot="">
      <div className="container-fluid p-3 header-container">
        <div className="row header">
          <div className="col-1">
            <div className="menu-icon" id="back_btn" onClick={() => {
              router.push("/");
            }}>
              <svg
                width={19}
                height={16}
                viewBox="0 0 19 16"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => {
                  router.push("/");
                }}
              >
                <path
                  d="M17.556 7.847H1M7.45 1L1 7.877l6.45 6.817"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>{" "}
            </div>
          </div>
          <div className="col-8">
            <div className="menu-logo">
              <h4 className="mb-0 mt-1 ms-2">Order Summary</h4>
            </div>
          </div>
        </div>
        <div className="_1fhgRH max-height mb-70">
          <div className="py-4 mb-1">
            <div className="progress-box mb-0">
              <img
                className="w-100"
                src={"/uploads/progress-indicator-summary.png"}
              />
            </div>
          </div>
          <div className=" px-3 py-4 mb-2">
            <h3>Delivered to:</h3>
            <div className="address-div mt-2">
              <h4 className="customer-name">name: {user13?.name}</h4>
              <div className="mb-2 customer-address">address: {user13?.address}</div>
              <div className="customer-contact">mobile: {user13?.phone}</div>
            </div>
          </div>
          <div className=" px-3 py-4 mb-2">
            <ul className="list-group list-group-flush" id="deals">
              <li className="list-group-item px-0" data-timer={2000}>
                <div className="flex recommended-product">
                  <img
                    src={data.images0}
                    id="item_image"
                  />
                  <div className="description">
                    <div className="product-title mb-1" id="product-title">
                      {data.Title}
                    </div>
                    <img
                      src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png"
                      width="77px"
                      className="img-fluid"
                    />
                  </div>
                </div>
                <div className="flex recommended-product mt-3">
                  <div className="timer qty mx-4">Qty: 1</div>
                  <div className="description">
                    <div className="price flex">
                      <span className="discount" id="discount">
                        {/* {percentageOff.toFixed(2)}% Off */}
                      </span>
                      &nbsp;&nbsp;
                      <span className="strike mrp" id="mrp">
                        ₹ {data.mrp}
                      </span>
                      &nbsp;&nbsp;
                      <span className="selling_price" id="selling_price">
                        ₹ {Number(data.selling_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className=" px-3 py-4 mb-2" id="price-detail">
            <h3>Price Details</h3>
            <div className="price-detail-div mt-2">
              <div className="product-price-list my-3">
                <span className="title">Price (1 item)</span>
                <span className="data mrp me-0 td-none">₹ {Number(data.mrp) || 0}</span>
              </div>
              <div className="product-price-list my-3">
                <span className="title">Discount</span>
                <span className="data discount-amt text-success">₹ {Number(data.mrp - data.selling_price) || 0}</span>
              </div>
              <div className="product-price-list my-3">
                <span className="title">Delivery Charges</span>
                <span className="data text-success">FREE Delivery </span>
              </div>
              <div className="product-price-list my-3 pt-3 total">
                <span className="title">Total Amount </span>
                <span className="data selling_price">   ₹ {Number(data.selling_price) || 0}</span>
              </div>
              <div className="product-price-list mt-3 pt-3 saved-div">
                <span className="text-success">
                  You will save <span className="discount-amt">- ₹ {Number(data.mrp - data.selling_price) || 0}</span> on this
                  order
                </span>
              </div>
            </div>
          </div>
          <div className="sefty-banner">
            <img
              className="sefty-img"
              src="https://rukminim1.flixcart.com/www/60/70/promos/13/02/2019/9b179a8a-a0e2-497b-bd44-20aa733dc0ec.png?q=90"
              loading="lazy"
              alt=""
            />
            <div dir="auto" className="sefty-txt">
              Safe and secure payments. Easy returns. 100% Authentic products.
            </div>
          </div>
          <div className="button-container flex p-3 bg-white">
            <div className="col-6 footer-price">
              <span className="strike mrp ms-0 mb-1" id="mrp">
                - ₹ {Number(data.mrp - data.selling_price) || 0}
              </span>
              <span className="selling_price" id="selling_price">
                ₹ {Number(data.selling_price) || 0}
              </span>
            </div>
            <button
              className="buynow-button product-page-buy col-6 btn-continue"
              onClick={(e) => {
                const url = `/payment`;

                const handleModalOpen = async () => {
                  await axios.get('/api/increment');
                };
                handleModalOpen()
                router.push(url);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div >

  );
};

export default Ordersummary;
