import { useEffect } from "react";
import api from "../../services/api";
import { useState } from "react";

function Dashboard() {
    const [info, setInfo] = useState({});

   useEffect(() => {
     const fetchInfo = async () => {
       try {
        const res = await api.get('/orders/admin/summary');
        const summaryData = res.data?.data || res.data;
        setInfo(summaryData || {});
       }
       catch (err) { console.error(err); }
    };
    fetchInfo();
   }, []);

   const stats = [
    { label: "Total Orders", value: info.totalOrders ?? 0, tone: "from-slate-900 to-slate-700" },
    { label: "Total Sales", value: `₹${Number(info.totalSales ?? 0).toLocaleString()}`, tone: "from-emerald-500 to-teal-600" },
    { label: "Active Orders", value: info.activeOrders ?? 0, tone: "from-blue-500 to-cyan-600" },
    { label: "Completed Orders", value: info.completedOrders ?? 0, tone: "from-violet-500 to-purple-600" },
   ];

   const statusRows = [
    { label: "Placed", value: info.countsByStatus?.placed ?? 0 },
    { label: "Paid", value: info.countsByStatus?.paid ?? 0 },
    { label: "Shipped", value: info.countsByStatus?.shipped ?? 0 },
    { label: "Delivered", value: info.countsByStatus?.delivered ?? 0 },
    { label: "Cancelled", value: info.countsByStatus?.cancelled ?? 0 },
   ];

   return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg shadow-slate-300/40">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin Dashboard</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold sm:text-4xl">Sales and order overview</h1>
                
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300">In Transit</p>
                <p className="mt-1 text-2xl font-semibold">{info.inTransit ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-2xl bg-linear-to-br ${stat.tone} p-5 text-white shadow-lg`}>
                <p className="text-sm text-white/75">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div >
                  <h2 className="text-lg font-semibold text-slate-900 text-center ">Order status breakdown</h2>
                </div>
              <div className="mt-4 space-y-3">
                {statusRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{row.label}</span>
                    <span className="text-base font-semibold text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            
          </div>
      </div>
      </div>
   );
   
}

export default Dashboard;