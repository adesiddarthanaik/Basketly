import { useState } from "react";
import Dashboard from "./Dashboard";
import Product from "./Product";
import ViewAll from "./ViewAll";
import Orders from "./Orders";
import { logoutUser } from "../../services/user";

function AdminUI({ onLogout }) {
    const [activePage, setActivePage] = useState("dashboard");

    const pages = {
        dashboard: <Dashboard />,
        orders: <Orders />,
        product: <Product />,
        viewAll: <ViewAll />,
    };

    const navItems = [
        { key: "dashboard", label: "Dashboard" },
        { key: "orders", label: "Customer Orders" },
        { key: "product", label: "Add Product" },
        { key: "viewAll", label: "All Products" },
    ];

    const handleLogout = () => {
        logoutUser();
        onLogout();
    };

    return (
    <div className="min-h-screen bg-slate-100">
        <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <div className="flex flex-wrap gap-3">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setActivePage(item.key)}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                                activePage === item.key
                                    ? "bg-slate-900 text-white shadow"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleLogout}
                    className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6">
            {pages[activePage]}
        </div>
    </div>
    );
}



export default AdminUI;