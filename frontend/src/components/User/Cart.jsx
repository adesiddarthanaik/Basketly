import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function Cart({ onCheckout }) {
    const [cart, setCart] = useState({ cartItems: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCart = async () => {
            try {
                const res = await api.get("/cart");
                const cartData = res.data?.data || res.data;
                setCart(cartData || { cartItems: [] });
            } catch (err) {
                setError(err.extractedMessage || err.response?.data?.message || "Could not load cart.");
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

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg shadow-slate-300/40">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Your Cart</p>
                    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Items ready for checkout</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">
                        Review the coffee products you have added before placing an order.
                    </p>
                </div>

                {loading && (
                    <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                        Loading cart...
                    </div>
                )}

                {error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && cartItems.length === 0 && (
                    <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                        Your cart is empty.
                    </div>
                )}

                {!loading && !error && cartItems.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.product?._id || item._id}
                                    className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center"
                                >
                                    <img
                                        src={item.product?.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"}
                                        alt={item.product?.name || "Product"}
                                        className="h-28 w-full rounded-2xl object-cover sm:w-28"
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
                                                Category: {item.product?.category || "Coffee"}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1">
                                                Line total: ₹
                                                {Number(
                                                    (Number(item.product?.priceAtPurchase ?? item.product?.price ?? 0) * Number(item.quantity || 0))
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                    <span className="font-semibold text-slate-900">Calculated later</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
                                onClick={() => onCheckout?.()}
                                disabled={cartItems.length === 0}
                            >
                                Proceed to payment
                            </button>

                            <p className="mt-3 text-xs text-slate-500">
                                You will review the order total on the payment screen before Razorpay opens.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;