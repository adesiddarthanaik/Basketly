import { useEffect, useState } from "react";
import api from "../../services/api";

const statusOptions = ["All", "placed", "paid", "shipped", "delivered", "cancelled"];

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { limit: 50 };
            if (statusFilter !== "All") params.status = statusFilter;

            const res = await api.get("/orders/admin", { params });
            const data = res.data?.data?.orders || res.data?.orders || res.data?.data || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.extractedMessage || err.response?.data?.message || "Could not load admin orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        setSuccessMessage("");
        setError("");
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            setSuccessMessage(`Order #${orderId.slice(-6).toUpperCase()} updated to ${newStatus}`);
            await fetchOrders();
        } catch (err) {
            setError(err.extractedMessage || err.response?.data?.message || "Failed to update order status.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                <h2 className="text-2xl font-bold">Manage Customer Orders</h2>
                <p className="mt-1 text-sm text-slate-300">
                    Review incoming orders, filter by state, and update shipment/delivery status.
                </p>

                {/* Filter Pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                                statusFilter === status
                                    ? "bg-white text-slate-900 shadow"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {successMessage}
                </div>
            )}

            {loading && <p className="text-sm text-slate-500">Loading orders...</p>}

            {!loading && orders.length === 0 && (
                <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
                    <p className="text-base font-semibold text-slate-900">No orders found</p>
                    <p className="text-sm text-slate-500">No orders match the selected filter.</p>
                </div>
            )}

            {!loading && orders.length > 0 && (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-4"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-slate-900">
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Customer: {order.user?.username || "Unknown"} ({order.user?.email || "N/A"})
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Placed on: {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-slate-900">
                                        ₹{Number(order.totalAmount ?? 0).toLocaleString()}
                                    </span>
                                    <select
                                        value={order.status}
                                        disabled={updatingId === order._id}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-800 outline-none hover:bg-white"
                                    >
                                        <option value="placed">placed</option>
                                        <option value="paid">paid</option>
                                        <option value="shipped">shipped</option>
                                        <option value="delivered">delivered</option>
                                        <option value="cancelled">cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className="rounded-xl bg-slate-50 p-3 text-xs">
                                        <p className="font-semibold text-slate-900">{item.product?.name || "Product"}</p>
                                        <p className="text-slate-500">
                                            Qty: {item.quantity} × ₹{item.priceAtPurchase}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {order.shippingAddress && (
                                <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3">
                                    <span className="font-semibold text-slate-900">Delivery Address: </span>
                                    {order.shippingAddress}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
