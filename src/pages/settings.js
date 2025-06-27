// components/Settings.js

import { useFormik } from 'formik';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import 'react-quill/dist/quill.snow.css';
import { useToasts } from 'react-toast-notifications';

import styles from '../styles/ProductForm.module.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Settings = () => {
    const { addToast } = useToasts();
    const [products, setProducts] = useState({});
    const [products1, setProducts1] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            let headersList = {
                "Accept": "*/*",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            };

            const response = await fetch('/api/upichange', {
                method: 'GET',
                headers: headersList,
            });

            if (response.ok) {
                const data = await response.json();
                setProducts({ upi: data.upi.upi, Bhim: data.upi.Bhim, Gpay: data.upi.Gpay, Paytm: data.upi.Paytm, Phonepe: data.upi.Phonepe, WPay: data.upi.WPay });
                setProducts1(data?.pixelId.FacebookPixel);
            }
        } catch (error) {
            addToast('Failed to fetch UPI settings', { appearance: 'error' });
        }
    };

    const formik = useFormik({
        initialValues: {
            upi: products.upi,
            Gpay: products.Gpay,
            Paytm: products.Paytm,
            Phonepe: products.Phonepe,
            WPay: products.WPay,
        },
        onSubmit: async () => {
            try {
                let headersList = {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                };

                let bodyContent = JSON.stringify(products);

                let response = await fetch("/api/upichange", {
                    method: "POST",
                    body: bodyContent,
                    headers: headersList
                });

                const data = await response.json();
                if (data.status === 1) {
                    addToast("UPI submitted successfully", { appearance: 'success' });
                } else {
                    addToast('Error submitting UPI', { appearance: 'error' });
                }
            } catch (error) {
                addToast('Submission failed', { appearance: 'error' });
            }
        },
    });

    const formik1 = useFormik({
        initialValues: {
            pixelId: products1,
        },
        onSubmit: async () => {
            try {
                let headersList = {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                };

                let bodyContent = JSON.stringify({ pixelId: products1 });

                let response = await fetch("/api/facebookPixel", {
                    method: "POST",
                    body: bodyContent,
                    headers: headersList
                });

                const data = await response.json();
                if (data.status === 1) {
                    addToast("Pixel submitted successfully", { appearance: 'success' });
                } else {
                    addToast('Error submitting Pixel', { appearance: 'error' });
                }
            } catch (error) {
                addToast('Error submitting pixel', { appearance: 'error' });
            }
        },
    });

    // 🧾 Payout form with validation
    const formik2 = useFormik({
        initialValues: {
            request_id: 'REQ123456',
            amount: '',
            transaction_mode: 'IMPS',
            account_number: '',
            ifsc_code: '',
            name: '',
            email: '',
            mobile: '',
        },
        validationSchema: Yup.object({
            request_id: Yup.string().required('Request ID is required'),
            amount: Yup.number().min(1).required('Amount is required'),
            transaction_mode: Yup.string().required('Mode is required'),
            account_number: Yup.string().min(10).required('Account number is required'),
            ifsc_code: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC').required('IFSC code is required'),
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
            mobile: Yup.string().matches(/^\d{10}$/, 'Enter a valid 10-digit number').required('Mobile is required'),
        }),
        onSubmit: async (values) => {
            try {
                const response = await fetch('https://finziopay.com/api/payout/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': ` ${data.upi.upi}`,
                    },
                    body: JSON.stringify(values),
                });

                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    addToast('Payout successful', { appearance: 'success' });
                } else {
                    addToast('Payout failed: ' + (result.message || 'Unknown error'), { appearance: 'error' });
                }
            } catch (err) {
                addToast('API error: ' + err.message, { appearance: 'error' });
            }
        }
    });


    return (
        <div className="container py-4">
            {/* ✅ NAVIGATION */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4 px-3 rounded">
                <a className="navbar-brand fw-bold text-primary
            
            " style={{
                        textAlign: "center", display: "block", margin: "auto"
                    }}
                    href="#">Admin Panel</a>
            </nav>

            <div className="row g-4">

                <div className="col-lg-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-primary text-white d-flex align-items-center">
                            <h5 className="mb-0"><span role="img" aria-label="key">🔑</span> UPI / Token Settings</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={formik.handleSubmit}>
                                {/* Token Field */}
                                <div className="mb-4">
                                    <label htmlFor="upi" className="form-label fw-semibold">API Token</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="upi"
                                        placeholder="Enter your API token"
                                        value={products.upi || ''}
                                        onChange={(e) => setProducts({ ...products, upi: e.target.value })}
                                    />
                                </div>

                                {/* UPI Methods Toggle */}
                                <label className="form-label fw-semibold mt-3">Enable UPI Methods</label>
                                <div className="row gx-2 gy-2">
                                    {['Gpay', 'Phonepe', 'Paytm', 'Bhim', 'WPay'].map((method) => (
                                        <div key={method} className="col-6 col-md-4">
                                            <div className="form-check form-switch" style={{
                                                display: "flex", justifyContent: "center", alignItems: 'center'
                                            }}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`${method}Switch`}
                                                    checked={products[method]}
                                                    onChange={(e) => setProducts({ ...products, [method]: e.target.checked })}
                                                />
                                                <label className="form-check-label" htmlFor={`${method}Switch`} style={{ fontSize: 12 }}>
                                                    {method}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="btn btn-primary w-100 mt-4 py-2 fs-5">
                                    💾 Save Settings
                                </button>
                            </form>
                        </div>
                    </div>
                </div>


                {/* ✅ PIXEL ID SETTINGS */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">📈 Facebook Pixel</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={formik1.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="pixelId" className="form-label">Pixel ID</label>
                                    <textarea
                                        id="pixelId"
                                        name="pixelId"
                                        className="form-control"
                                        rows="4"
                                        placeholder="Paste Facebook Pixel Code..."
                                        onChange={(e) => setProducts1(e.target.value)}
                                        value={products1}
                                    />
                                </div>
                                <button type="submit" className="btn btn-info text-white w-100">💾 Save Pixel</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ✅ PAYOUT FORM */}
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">💸 Payout Form</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={formik2.handleSubmit}>
                                <div className="row g-3">
                                    {Object.entries(formik2.initialValues).map(([key, val]) => (
                                        <div className="col-md-6" key={key}>
                                            <label className="form-label">{key.replace(/_/g, ' ').toUpperCase()}</label>
                                            <input
                                                type={key === 'amount' ? 'number' : 'text'}
                                                name={key}
                                                className="form-control"
                                                placeholder={`Enter ${key.replace('_', ' ')}`}
                                                value={formik2.values[key]}
                                                onChange={formik2.handleChange}
                                            />
                                            {formik2.touched[key] && formik2.errors[key] && (
                                                <small className="text-danger">{formik2.errors[key]}</small>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" className="btn btn-success w-100 mt-4">🚀 Initiate Payout</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Settings;
