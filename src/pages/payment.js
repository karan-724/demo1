"use client";
import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import "./payment.module.css"
import { Loader2 } from "lucide-react";
import { FbPixelEvents } from "@/lib/facebookPixel";

// Base URL for the payment API
const PAYMENT_API_BASE_URL = "http://meefo.shop:4000/api/";

const Payments = () => {
    const [products, setProducts] = useState({ upi: "", Gpay: true });
    const [loader, setLoader] = useState(false);
    const [count, setCount] = useState(0);
    const [user13, setuser13] = useState({});
    const [data, setdata] = useState({});
    const [activeTab, setActiveTab] = useState(2);
    const [payment, setPayment] = useState("");
    const [showStatus, setShowStatus] = useState(false);
    const [status, setStatus] = useState("verifying"); // verifying, success, failed
    const [statusMsg, setStatusMsg] = useState("");
    const [orderId, setOrderId] = useState("");
    const [verifyingTimer, setVerifyingTimer] = useState(120); // 120s for verification
    const verifyingInterval = useRef(null);
    const verifyingTimerInterval = useRef(null);
    const [doneData, setDoneData] = useState(null);
    const [paymentlinkdata, setPaymentlinkdata] = useState({ upi_links: {}, upi_link: "", qr_code: '', transaction_id: "", qr_code: "" });
    const router = useRouter();

    useEffect(() => {
        if (status == "success") {
            setTimeout(() => {
                const url = `/payment-success/?order_id=${orderId}`;
                try {
                    router.push(url);
                } catch (e) {
                    window.location.href = url;
                }
            }, 1200);
        }
    }, [status])

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
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
                setProducts(data.upi);
                paymentlinkganrat(data.upi.upi);
                setActiveTab(data.upi.Gpay === false ? data.upi.Phonepe === false ? 4 : 3 : 2)
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setuser13(JSON.parse(localStorage.getItem("user")) || {});
            setdata(JSON.parse(localStorage.getItem("data")) || {});
        }
    }, []);

    const base = Number(data.selling_price);
    const total = 100;

    function generateRequestId() {
        const random = Math.floor(Math.random() * 100000); // 5-digit random number
        return `TXN${random}`;
    }

    const paymentlinkganrat = async (upiId) => {
        try {
            let headersList = {
                "Accept": "*/*",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                "token": upiId,
                "Content-Type": "application/json"
            };


            let bodyContent = JSON.stringify({ token: upiId, total: total });

            let response = await fetch(`/api/payment/initiate`, {
                method: "POST",
                body: bodyContent,
                headers: headersList
            });

            let data = await response.json();
            if (data.status === "initiate") {
                setPaymentlinkdata(data.data);
            } else {
                console.error("Payment initiation failed:", data.message);
                setStatusMsg(data.message || "Payment initiation failed");
                setStatus("failed");
                setShowStatus(true);
            }
        } catch (error) {
            console.error("Error initiating payment:", error);
            setStatusMsg("Error initiating payment");
            setStatus("failed");
            setShowStatus(true);
        }
    }

    const initialTime = 300;
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        const timer = setInterval(() => {
            if (time <= 0) {
                clearInterval(timer);
            } else {
                setTime((prevTime) => prevTime - 1);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [time]);

    useEffect(() => {
        const name = "KHODIYAR ENTERPRISE";
        let paymentUrl;

        // Standard UPI payment link format that works with all UPI apps
        paymentUrl = `upi://pay?pa=${products.upi}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR&tn=Payment`;

        // Optional: App-specific links if you want to try opening specific apps first
        switch (activeTab) {
            case 1: // BHIM
                paymentUrl = paymentlinkdata.upi_links.bhim
                break;
            case 2: // Google Pay
                paymentUrl = paymentlinkdata.upi_links.gpay
                break;
            case 3: // PhonePe

                paymentUrl = paymentlinkdata.upi_links.phonepe
                break;
            case 4: // Paytm

                paymentUrl = paymentlinkdata.upi_links.paytm
                break;
            case 5: // WhatsApp Pay

                paymentUrl = paymentlinkdata.upi_links.gpay
                break;
            default:
                // Default to standard UPI link

                paymentUrl = paymentlinkdata.upi_links.gpay
                break;
        }

        setPayment(paymentUrl);
    }, [activeTab, products.upi, total]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    // Check localStorage on mount for existing verification state
    useEffect(() => {
        const storedVerification = localStorage.getItem('paymentVerification');
        if (storedVerification) {
            const { status: storedStatus, orderId: storedOrderId, statusMsg: storedMsg } = JSON.parse(storedVerification);
            setStatus(storedStatus);
            setOrderId(storedOrderId);
            setStatusMsg(storedMsg);
            setShowStatus(true);

            if (storedStatus === 'verifying') {
                verifyPayment(storedOrderId);
            }
        }
    }, []);

    // Store verification state in localStorage
    const updateVerificationState = (id, newStatus, newOrderId, newMsg) => {
        const verificationState = {
            id: id,
            status: newStatus,
            orderId: newOrderId,
            statusMsg: newMsg
        };
        localStorage.setItem('paymentVerification', JSON.stringify(verificationState));
    };

    const verifyPayment = async (order_id) => {
        if (!order_id) return;

        setStatus("verifying");
        setShowStatus(true);
        setVerifyingTimer(120);
        setOrderId(order_id);
        updateVerificationState("verifying", order_id, "Initializing payment verification...");

        let attempts = 0;
        const maxAttempts = 60; // Increased max attempts for longer verification
        const checkInterval = 3000; // Check every 3 seconds
        let lastErrorMsg = "";
        let isVerified = false;

        // Start timer countdown
        verifyingTimerInterval.current = setInterval(() => {
            setVerifyingTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(verifyingTimerInterval.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const checkPaymentStatus = async () => {
            if (isVerified) return;

            try {
                // Update status message based on attempts
                if (attempts === 2) setStatusMsg("Checking payment status...");
                else if (attempts === 5) setStatusMsg("Still verifying payment...");
                else if (attempts === 10) setStatusMsg("Payment verification in progress...");
                console.log("paymentlinkdata", paymentlinkdata);

                const res = await axios.post(`api/payment/status`, {
                    transaction_id: paymentlinkdata.transaction_id
                });
                // const res = {
                //     data: {
                //         success: true,
                //         data1: {
                //             status: "success",
                //             message: "Transaction details retrieved successfully.",
                //             data: {
                //                 transaction_status: "pending",
                //                 request_id: "TXN94087",
                //                 transaction_id: "064076843766693",
                //                 amount: 100
                //             }
                //         }
                //     }
                // };

                // Check for success
                if (res.data.data.transaction_status === "success") {
                    isVerified = true;

                    const paymentData = {
                        orderId: res.data.id,
                        amount: res.data.amount,
                        paymentMethod: "upi netbanking",
                        referenceId: res.data.reference_id || null,
                        verificationTime: new Date().toISOString(),
                        attempts: attempts,
                        status: 'success',
                    };

                    // Store payment data
                    localStorage.setItem('paymentData', JSON.stringify(paymentData));
                    setDoneData(paymentData);

                    // Clear intervals
                    clearInterval(verifyingInterval.current);
                    clearInterval(verifyingTimerInterval.current);

                    // Update UI
                    setStatus("success");
                    setStatusMsg("Payment Successful! Thank you for your payment.");
                    updateVerificationState(res.data.id, "success", order_id, "Payment Successful! Thank you for your payment.");

                    // Track successful payment
                    FbPixelEvents('Purchase', {
                        value: total,
                        currency: 'INR',
                        contents: [{
                            id: data.product_id,
                            quantity: 1
                        }],
                        content_type: 'product'
                    });

                    return;
                } else {
                    lastErrorMsg = res.data.message || "Payment verification in progress...";
                }
            } catch (err) {
                lastErrorMsg = err?.response?.data?.message || "Error verifying payment. Please try again.";
                console.error("Payment verification error:", err);
            }

            attempts++;

            // Stop if max attempts reached
            if (attempts >= maxAttempts && !isVerified) {
                clearInterval(verifyingInterval.current);
                clearInterval(verifyingTimerInterval.current);

                setStatus("failed");
                setStatusMsg(lastErrorMsg || "Payment verification timed out. Please try again.");
                updateVerificationState("failed", order_id, lastErrorMsg || "Payment verification timed out. Please try again.");
            }
        };

        // Initial check
        checkPaymentStatus();

        // Set up interval for continuous checking
        verifyingInterval.current = setInterval(checkPaymentStatus, checkInterval);
    };

    // --- Retry Handler ---
    const handleRetry = () => {
        // Clear any existing intervals
        if (verifyingInterval.current) clearInterval(verifyingInterval.current);
        if (verifyingTimerInterval.current) clearInterval(verifyingTimerInterval.current);

        setStatus("verifying");
        setStatusMsg("Retrying payment verification...");
        setVerifyingTimer(120);
        verifyPayment(orderId);
    };

    // --- Cleanup on modal close ---
    const handleCloseModal = () => {
        // Clear any existing intervals
        if (verifyingInterval.current) clearInterval(verifyingInterval.current);
        if (verifyingTimerInterval.current) clearInterval(verifyingTimerInterval.current);

        if (status === 'success') {
            localStorage.removeItem('paymentVerification');
            // Keep paymentData for successful payments
            setDoneData(null);
        } else {
            localStorage.removeItem('paymentVerification');
            localStorage.removeItem('paymentData');
        }
        setShowStatus(false);
    };

    // --- Payment Button Handler ---
    const handleUPIRedirect = () => {
        let products = JSON.parse(localStorage.getItem("d1"))
        setLoader(true);

        const upiLink = payment
        setTimeout(() => {
            window.open(upiLink, '_blank');
            setLoader(false);
            const newOrderId = total;
            setOrderId(newOrderId);
            verifyPayment(newOrderId);
        }, 100);
    };

    const SpinLoader = () => {
        return (
            <img src='/Infinity@1x-1.0s-200px-200px.gif' width={100} className="d-block m-auto" />
        );
    };

    const StatusModal = () => (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.25)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{
                background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", textAlign: "center"
            }}>
                {status === "verifying" && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <SpinLoader />
                        </div>
                        <h4>Verifying Payment...</h4>
                        <p style={{ color: "#666" }}>Please wait while we confirm your transaction.</p>
                        <button style={{
                            width: "100%",
                            background: "#2874F0", color: "#fff", border: "none", borderRadius: 8, padding: "10px 32px", fontWeight: 600, marginTop: 16, cursor: "pointer"
                        }} onClick={handleCloseModal}>Close</button>
                    </>
                )}
                {status === "success" && (
                    <>
                        <svg width="56" height="56" fill="none" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
                            <circle cx="12" cy="12" r="10" fill="#22c55e" />
                            <path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h4 style={{ color: "#22c55e" }}>Payment Successful</h4>
                        <p>{statusMsg}</p>
                        <button style={{
                            background: "#2874F0", color: "#fff", border: "none", borderRadius: 8, padding: "10px 32px", fontWeight: 600, marginTop: 16, cursor: "pointer"
                        }} onClick={handleCloseModal}>Close</button>
                    </>
                )}
                {status === "failed" && (
                    <>
                        <svg width="56" height="56" fill="none" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
                            <circle cx="12" cy="12" r="10" fill="#ef4444" />
                            <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h4 style={{ color: "#ef4444" }}>Payment Failed</h4>
                        <p>{statusMsg}</p>
                        <button style={{
                            background: "#2874F0", color: "#fff", border: "none", borderRadius: 8, padding: "10px 32px", fontWeight: 600, marginTop: 16, cursor: "pointer"
                        }} onClick={handleRetry}>Retry</button>
                        <button style={{
                            background: "#fff", color: "#2874F0", border: "1px solid #2874F0", borderRadius: 8, padding: "10px 32px", fontWeight: 600, marginTop: 16, marginLeft: 8, cursor: "pointer"
                        }} onClick={handleCloseModal}>Close</button>
                    </>
                )}
            </div>
            {/* Bottom timer bar during verification */}
            {status === "verifying" && (
                <div style={{
                    position: "fixed", bottom: 0, left: 0, width: "100vw", background: "#2874F0", color: "#fff", textAlign: "center", padding: "12px 0", fontWeight: 500, fontSize: 18, letterSpacing: 1, zIndex: 10000, boxShadow: "0 -2px 12px rgba(40,116,240,0.10)"
                }}>
                    Verifying payment... <span style={{ fontWeight: 700 }}>{verifyingTimer}s</span>
                </div>
            )}
        </div>
    );

    return (
        products.upi &&
        <div>
            {loader && <div className="fullscreen-loader">
                <div className="spinner"></div>
            </div>}
            <img src={paymentlinkdata.qr_code} />
            {showStatus && <StatusModal />}

            <div className="container-fluid py-2 header-container">
                <div className="row header py-2">
                    <div className="col-1">
                        <div className="menu-icon" id="back_btn" onClick={() => { }}>
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
                            <h4 className="mb-0  ms-2">Payments</h4>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card py-1 my-1">
                <div className="py-2 px-3">
                    <div className="container-fluid px-0 offerend-container">
                        <h4>
                            {" "}
                            Offer ends in{" "}
                            <span className="offer-timer" id="offerend-time">
                                {minutes}min {seconds}sec
                            </span>
                        </h4>
                    </div>
                    <div className="modern-method-list">
                        {products.Gpay &&
                            <div
                                id="divgpay"
                                className={`modern-method-card${activeTab === 2 ? ' selected' : ''}`}
                                pay-type="gpay"
                                onClick={() => setActiveTab(2)}
                            >
                                <label className="modern-method-label">
                                    <svg width="30" height="30" viewBox="15 -10 225 250" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><g><path d="M232.503966,42.1689673 C207.253909,27.593266 174.966113,36.2544206 160.374443,61.5045895 L123.592187,125.222113 C112.948983,143.621675 126.650534,150.051007 141.928772,159.211427 L177.322148,179.639204 C189.30756,186.552676 204.616725,182.448452 211.530197,170.478784 L249.342585,104.997327 C262.045492,82.993425 254.507868,54.8722676 232.503966,42.1689673 Z" fill="#EA4335"></path><path d="M190.884248,68.541767 L155.490872,48.1141593 C135.952653,37.2682465 124.888287,36.5503588 116.866523,49.3002175 L64.6660169,139.704135 C50.0900907,164.938447 58.7669334,197.211061 84.0012455,211.755499 C106.005147,224.458406 134.126867,216.920782 146.829774,194.91688 L200.029486,102.764998 C206.973884,90.7801476 202.869661,75.4552386 190.884248,68.541767 Z" fill="#FBBC04"></path><path d="M197.696506,22.068674 L172.836685,7.71148235 C145.33968,-8.15950938 110.180221,1.25070674 94.3093189,28.7478917 L46.9771448,110.724347 C39.9857947,122.818845 44.1369141,138.299511 56.2315252,145.275398 L84.0720952,161.34929 C97.8203166,169.292894 115.392174,164.5797 123.335778,150.830917 L177.409304,57.1816314 C188.614245,37.7835939 213.411651,31.1355838 232.809294,42.3404686 L197.696506,22.068674 Z" fill="#34A853"></path><path d="M101.033296,52.202526 L74.1604429,36.7216914 C62.1750303,29.8240204 46.8660906,33.9126683 39.9527877,45.8666484 L7.71149357,101.579108 C-8.15952065,128.997954 1.25071234,164.079816 28.7479029,179.904047 L49.2069432,191.685907 L74.0198681,205.980684 L84.7879024,212.176099 C65.670846,199.37985 59.6002612,173.739558 71.2887797,153.545698 L79.6378018,139.126091 L110.20946,86.3008703 C117.107187,74.3784352 113.002964,59.1001971 101.033296,52.202526 Z" fill="#4285F4"></path></g></svg>
                                    <span>Google Pay</span>
                                </label>
                            </div>
                        }
                        {products.Phonepe &&
                            <div
                                id="divphonepe"
                                className={`modern-method-card${activeTab === 3 ? ' selected' : ''}`}
                                pay-type="phonepe"
                                onClick={() => setActiveTab(3)}
                            >
                                <label className="modern-method-label">
                                    <svg
                                        height={30}
                                        viewBox="0 0 700 700"
                                        width={30}
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle cx="339.53" cy="339.53" fill="#5f259f" r="339.46" />
                                        <path
                                            d="m493.6 250.94c0-13.27-11.38-24.65-24.65-24.65h-45.51l-104.3-119.47c-9.48-11.38-24.65-15.17-39.82-11.38l-36.03 11.38c-5.69 1.9-7.59 9.48-3.79 13.27l113.78 108.1h-172.59c-5.69 0-9.48 3.79-9.48 9.48v18.96c0 13.27 11.38 24.65 24.65 24.65h26.55v91.03c0 68.27 36.03 108.1 96.72 108.1 18.96 0 34.14-1.9 53.1-9.48v60.69c0 17.07 13.27 30.34 30.34 30.34h26.55c5.69 0 11.38-5.69 11.38-11.38v-271.19h43.62c5.69 0 9.48-3.79 9.48-9.48zm-121.37 163.09c-11.38 5.69-26.55 7.59-37.93 7.59-30.34 0-45.51-15.17-45.51-49.31v-91.03h83.44z"
                                            fill="#fff"
                                        />
                                    </svg>
                                    <span>PhonePe</span>
                                </label>
                            </div>
                        }
                        {products.Paytm &&
                            <div
                                id="divpaytm"
                                className={`modern-method-card${activeTab === 4 ? ' selected' : ''}`}
                                pay-type="paytm"
                                onClick={() => setActiveTab(4)}
                            >
                                <label className="modern-method-label">
                                    <img src="/uploads/Paytm-Logo.png" alt="Paytm" style={{ width: 40, objectFit: 'contain' }} />
                                    <span>Paytm</span>
                                </label>
                            </div>
                        }
                        {products.Bhim &&
                            <div
                                id="divbhimupi"
                                className={`modern-method-card${activeTab === 1 ? ' selected' : ''}`}
                                pay-type="bhim_upi"
                                onClick={() => setActiveTab(1)}
                            >
                                <label className="modern-method-label">
                                    <img src="/uploads/images.png" alt="BHIM UPI" style={{ width: 48, objectFit: 'cover' }} />
                                    <span>BHIM UPI</span>
                                </label>
                            </div>
                        }
                        {products.WPay &&
                            <div
                                id="divwhatspppay"
                                className={`modern-method-card${activeTab === 5 ? ' selected' : ''}`}
                                pay-type="whatspp_pay"
                                onClick={() => setActiveTab(5)}
                            >
                                <label className="modern-method-label">
                                    <img src="/uploads/WhatsApp-Logo.png" alt="WhatsApp Pay" style={{ width: 48, objectFit: 'cover' }} />
                                    <span>WhatsApp Pay</span>
                                </label>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="svg-100">
                {/* ... your SVG ... */}
            </div>
            <div className="button-container flex p-3 bg-white">
                <div className="col-6 footer-price">
                    <span className="selling_price" id="selling_price">
                        ₹ 100
                    </span>
                </div>
                <button
                    onClick={handleUPIRedirect}
                    className="buynow-button product-page-buy col-6 btn-continue text-center"
                    disabled={loader}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default Payments;
