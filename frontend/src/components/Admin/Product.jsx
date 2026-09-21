import { useState } from "react";
import api from "../../services/api";

const initialForm = {
  name: "",
  price: "",
  image: "",
  brand: "",
  category: "Roasted Beans",
  countInStock: "",
  description: "",
};

const coffeeCategories = [
  "Roasted Beans",
  "Instant Coffee",
  "Cold Brew",
  "Espresso",
  "Drip Brew",
  "French Press",
  "Pour Over",
  "Moka Pot",
];

function Product() {

  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
	const { name, value } = event.target;
	setFormData((prev) => ({
		...prev,
		[name]: value,
	}));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
	setError("");
	setMessage("");
	setLoading(true);

	try {
		const payload = {
			...formData,
			price: Number(formData.price),
			countInStock: Number(formData.countInStock),
		};
		await api.post("/products/addProduct", payload);
		setMessage("Product added successfully.");
      setFormData(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add product.");
    } finally {
		setLoading(false);
	}
  };

	return (
		
		<div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
			<h2 className="text-2xl font-semibold text-slate-900">Add Product</h2>
			<p className="mt-2 text-sm text-slate-600">
				Add coffee products for roasted beans, instant coffee, cold brew, and more.
			</p>
			 <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Premium Arabica Coffee"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="499"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Items Available</label>
          <input
            type="number"
            name="countInStock"
            value={formData.countInStock}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="25"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="QuikBUY Coffee"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            required
          >
            {coffeeCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Write a short product description..."
            required
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Product"}
          </button>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>
		</div>
		
	);
}

export default Product;
