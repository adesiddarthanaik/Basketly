import { useEffect, useState } from "react";
import api from "../../services/api";

function ViewAll() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/products");
        const productList = res.data?.data || res.data;
        setProducts(Array.isArray(productList) ? productList : []);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900">All Products</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product._id} className="overflow-hidden rounded-2xl border border-slate-200">
            <img
              src={product.image}
              alt={product.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
              <p className="text-sm text-slate-600">{product.brand}</p>
              <p className="mt-2 font-medium text-slate-900">₹{product.price}</p>
              <p className="text-sm text-slate-500">{product.category}</p>
              <p className="text-sm text-slate-500">Stock: {product.countInStock}</p>
              <p className="mt-2 text-sm text-slate-600">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewAll;
