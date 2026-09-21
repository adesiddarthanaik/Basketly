import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const razorpayScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector(`script[src="${razorpayScriptUrl}"]`);
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), { once: true });
            existingScript.addEventListener("error", () => resolve(false), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = razorpayScriptUrl;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function Payment({ onBack, onSuccess }) {
    const [cart, setCart] = useState({ cartItems: [] });
    const [shippingAddress, setShippingAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCart = async () => {
            try {
                const res = await api.get("/cart");
                const cartData = res.data?.data || res.data;
                setCart(cartData || { cartItems: [] });
            } catch (err) {
                setError(err.extractedMessage || err.response?.data?.message || "Could not load cart for payment.");
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, []);

    const cartItems = cart.cartItems || [];

    const summary = useMemo(() => {
        const itemCount = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
        const subtotal = cartItems.reduce((total, item) => {
            const price = Number(item.product?.priceAtPurchase ?? item.product?.price ?? 0);
            return total + price * Number(item.quantity || 0);
        }, 0);

        return { itemCount, subtotal };
    }, [cartItems]);

    const handlePayment = async () => {
        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setError("");
        setProcessing(true);

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Could not load Razorpay checkout.");
            }

            const response = await api.post("/payment/create-order", {
                shippingAddress,
            });

            const { razorpayOrder, orderId, keyId } = response.data;

            const options = {
                key: keyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "QuikBUY Coffee",
                description: "Specialty coffee order payment",
                order_id: razorpayOrder.id,
                handler: async (paymentResponse) => {
                    await api.post("/payment/verify", {
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature,
                        orderId,
                    });

                    onSuccess?.();
                },
                modal: {
                    ondismiss: () => {
                        setError("Payment window closed before completion.");
                    },
                },
                theme: {
                    color: "#0f172a",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            setError(err.extractedMessage || err.response?.data?.message || err.message || "Payment could not be started.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg shadow-slate-300/40">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Payment</p>
                    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Complete your order</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">
                        Review the cart total, add a shipping address, and continue to Razorpay checkout.
                    </p>
                </div>

                {loading && (
                    <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                        Loading payment details...
                    </div>
                )}

                {error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && cartItems.length === 0 && (
                    <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                        Your cart is empty. Go back to add items before paying.
                    </div>
                )}

                {!loading && cartItems.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                        <div className="space-y-4">
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                <label className="block text-sm font-medium text-slate-700" htmlFor="shippingAddress">
                                    Shipping address
                                </label>
                                <textarea
                                    id="shippingAddress"
                                    value={shippingAddress}
                                    onChange={(event) => setShippingAddress(event.target.value)}
                                    rows={4}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                    placeholder="Enter the address where you want this order delivered"
                                />
                            </div>

                            <div className="space-y-3">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.product?._id || item._id}
                                        className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center"
                                    >
                                        <img
                                            src={item.product?.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"}
                                            alt={item.product?.name || "Product"}
                                            className="h-24 w-full rounded-2xl object-cover sm:w-24"
                                        />

                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-slate-900">
                                                        {item.product?.name || "Product"}
                                                    </h2>
                                                    <p className="text-sm text-slate-600">{item.product?.brand || "QuikBUY Coffee"}</p>
                                                </div>
                                                <p className="text-lg font-semibold text-slate-900">
                                                    ₹{Number(item.product?.priceAtPurchase ?? item.product?.price ?? 0).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                                                <span className="rounded-full bg-slate-100 px-3 py-1">Qty: {item.quantity}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1">
                                                    Line total: ₹
                                                    {Number(
                                                        Number(item.product?.priceAtPurchase ?? item.product?.price ?? 0) *
                                                            Number(item.quantity || 0)
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>

                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                    <span>Total items</span>
                                    <span className="font-semibold text-slate-900">{summary.itemCount}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">₹{summary.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-slate-900">Calculated after checkout</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                {processing ? "Opening checkout..." : "Pay with Razorpay"}
                            </button>

                            <button
                                type="button"
                                className="mt-3 w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                onClick={() => onBack?.()}
                                disabled={processing}
                            >
                                Back to cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Payment;