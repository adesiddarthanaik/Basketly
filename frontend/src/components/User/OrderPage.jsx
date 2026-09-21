import { useEffect, useState } from "react";
import api from "../../services/api";

const statusStyles = {
    placed: "bg-slate-100 text-slate-700",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-amber-100 text-amber-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
};

const steps = ["placed", "paid", "shipped", "delivered"];

function OrderTimeline({ currentStatus }) {
    if (currentStatus === "cancelled") {
        return (
            <div className="rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-red-700">
                This order was cancelled.
            </div>
        );
    }

    const currentIndex = steps.indexOf(currentStatus);

    return (
        <div className="mt-4 flex items-center justify-between text-xs">
            {steps.map((step, idx) => {
                const isPassed = currentIndex >= idx;
                const isCurrent = currentIndex === idx;
                return (
                    <div key={step} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                                    isCurrent
                                        ? "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2"
                                        : isPassed
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-200 text-slate-500"
                                }`}
                            >
                                {isPassed && !isCurrent ? "✓" : idx + 1}
                            </div>
                            <span
                                className={`mt-1 capitalize text-[11px] font-medium ${
                                    isCurrent ? "text-slate-900 font-bold" : isPassed ? "text-emerald-700" : "text-slate-400"
                                }`}
                            >
                                {step}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div
                                className={`h-0.5 flex-1 mx-2 mb-4 ${
                                    currentIndex > idx ? "bg-emerald-500" : "bg-slate-200"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/orders");
                const orderList = res.data?.data || res.data;
                setOrders(Array.isArray(orderList) ? orderList : []);
            } catch (err) {
                setError(err.extractedMessage || err.response?.data?.message || "Could not load orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg shadow-slate-300/40">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Your Order History</p>
                    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Track Recent Coffee Orders</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">
                        View order status timelines, delivery addresses, item snapshots, and payment receipts.
                    </p>
                </div>

                {loading && (
                    <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                        Loading your orders...
                    </div>
                )}

                {error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
                        <p className="text-base font-semibold text-slate-900">No orders placed yet</p>
                        <p className="mt-1 text-sm text-slate-500">Explore our specialty roasts and place your first order!</p>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {orders.map((order) => (
                            <div key={order._id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </p>
                                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                            ₹{Number(order.totalAmount ?? 0).toLocaleString()}
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                            {new Date(order.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                            statusStyles[order.status] || "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Order Tracking Timeline */}
                                    <OrderTimeline currentStatus={order.status} />

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {order.orderItems?.map((item, index) => (
                                            <div key={`${order._id}-${index}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                                <p className="font-semibold text-slate-900">{item.product?.name || "Product"}</p>
                                                <p className="mt-1 text-xs text-slate-600">
                                                    Qty: {item.quantity} • ₹{Number(item.priceAtPurchase ?? 0).toLocaleString()} each
                                                </p>
                                                {item.product?.category && (
                                                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                                        {item.product.category}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                                        <span className="rounded-full bg-slate-100 px-3 py-1">Payment: {order.paymentStatus}</span>
                                        {order.shippingAddress && (
                                            <span className="rounded-full bg-slate-100 px-3 py-1">Ship to: {order.shippingAddress}</span>
                                        )}
                                        <span className="rounded-full bg-slate-100 px-3 py-1">Items: {order.orderItems?.length ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderPage;