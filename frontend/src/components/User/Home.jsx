import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

const productCategories = [
    "All",
    "Electronics",
    "Clothing",
    "Footwear",
    "Home & Kitchen",
    "Accessories",
    "Grocery",
    "Beauty & Personal Care",
    "Other",
];

function Home() {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [error, setError] = useState("");
    const [cartError, setCartError] = useState("");

    // Filter, Search, Sort, and Pagination state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [inStockOnly, setInStockOnly] = useState(false);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(9);
    const [pagination, setPagination] = useState({
        totalProducts: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 9,
    });
    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

    const loadWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await api.get("/wishlist");
            const wishlistData = res.data?.data || res.data;
            const productList = wishlistData?.products || [];
            const productIds = productList.map((p) => (typeof p === "object" && p !== null ? p._id : p));
            setWishlist(productIds.filter(Boolean));
        } catch {
            setWishlist([]);
        }
    };

    const toggleWishlist = async (productId, e) => {
        e?.stopPropagation?.();
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please log in to manage your wishlist.");
            return;
        }

        if (wishlistLoadingId === productId) return;
        setWishlistLoadingId(productId);
        setError("");

        const isCurrentlyWishlisted = wishlist.includes(productId);

        try {
            if (isCurrentlyWishlisted) {
                const res = await api.delete(`/wishlist/${productId}`);
                const wishlistData = res.data?.data || res.data;
                const productList = wishlistData?.products || [];
                const productIds = productList.map((p) => (typeof p === "object" && p !== null ? p._id : p));
                setWishlist(productIds.filter(Boolean));
            } else {
                const res = await api.post(`/wishlist/${productId}`);
                const wishlistData = res.data?.data || res.data;
                const productList = wishlistData?.products || [];
                const productIds = productList.map((p) => (typeof p === "object" && p !== null ? p._id : p));
                setWishlist(productIds.filter(Boolean));
            }
        } catch (err) {
            setError(err.extractedMessage || err.response?.data?.message || "Could not update wishlist.");
        } finally {
            setWishlistLoadingId(null);
        }
    };

    const loadCart = async () => {
        try {
            const res = await api.get("/cart");
            const cartData = res.data?.data || res.data;
            setCartItems(cartData?.cartItems || []);
        } catch (err) {
            setCartError(err.extractedMessage || err.response?.data?.message || "Could not load cart.");
        }
    };

    const fetchProducts = useCallback(async (targetPage = page) => {
        setLoading(true);
        setError("");
        try {
            const params = {
                page: targetPage,
                limit,
            };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (selectedCategory !== "All") params.category = selectedCategory;
            if (sortBy) params.sortBy = sortBy;
            if (inStockOnly) params.inStock = true;
            if (minPrice !== "" && !Number.isNaN(Number(minPrice))) {
                params.minPrice = Number(minPrice);
            }
            if (maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
                params.maxPrice = Number(maxPrice);
            }

            const res = await api.get("/products", { params });
            const productList = res.data?.data || [];
            const paginationMeta = res.data?.pagination || {
                totalProducts: productList.length,
                totalPages: 1,
                currentPage: targetPage,
                pageSize: limit,
            };

            setProducts(Array.isArray(productList) ? productList : []);
            setPagination(paginationMeta);
        } catch (err) {
            setError(err.extractedMessage || err.response?.data?.message || "Could not load products.");
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, sortBy, inStockOnly, minPrice, maxPrice, limit, page]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchProducts(page);
        }, 250);
        return () => clearTimeout(debounceTimer);
    }, [fetchProducts, page]);

    useEffect(() => {
        loadCart();
        loadWishlist();
    }, []);

    const getCartQuantity = (productId) => {
        const item = cartItems.find((entry) => (entry.product?._id || entry.product) === productId);
        return item?.quantity ?? 0;
    };

    const handleCardClick = (productId) => {
        setSelectedProductId((currentId) => (currentId === productId ? null : productId));
    };

    const handleAddToCart = async (productId) => {
        setCartLoading(true);
        setCartError("");

        try {
            await api.post("/cart/add", { productId, quantity: 1 });
            await loadCart();
        } catch (err) {
            setCartError(err.extractedMessage || err.response?.data?.message || "Could not add item to cart.");
        } finally {
            setCartLoading(false);
        }
    };

    const handleRemoveFromCart = async (productId) => {
        setCartLoading(true);
        setCartError("");

        try {
            await api.post("/cart/remove", { productId, quantity: 1 });
            await loadCart();
        } catch (err) {
            setCartError(err.extractedMessage || err.response?.data?.message || "Could not remove item from cart.");
        } finally {
            setCartLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Hero Header */}
                <div className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg shadow-slate-300/40">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Featured Collections</p>
                    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Discover Curated Products</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">
                        Explore quality products, top-rated brands, and curated everyday essentials with Basketly.
                    </p>

                    {/* Search & Filter Controls Bar */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <input
                                type="text"
                                placeholder="Search products, brands, or categories..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 backdrop-blur outline-none ring-1 ring-white/20 transition focus:bg-white focus:text-slate-900 focus:ring-slate-900"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setPage(1);
                                    }}
                                    className="absolute right-3 top-3 text-xs font-bold text-slate-400 hover:text-slate-700"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Price Range Filter Inputs */}
                        <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/20 bg-slate-800 px-3 py-2 text-xs text-white">
                            <span className="font-medium text-slate-400">Price (₹):</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                min="0"
                                onChange={(e) => {
                                    setMinPrice(e.target.value);
                                    setPage(1);
                                }}
                                className="w-16 rounded-xl bg-white/10 px-2 py-1 text-center text-xs text-white placeholder-slate-500 outline-none focus:bg-white focus:text-slate-900"
                            />
                            <span className="text-slate-500">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                min="0"
                                onChange={(e) => {
                                    setMaxPrice(e.target.value);
                                    setPage(1);
                                }}
                                className="w-16 rounded-xl bg-white/10 px-2 py-1 text-center text-xs text-white placeholder-slate-500 outline-none focus:bg-white focus:text-slate-900"
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-2xl border border-white/20 bg-slate-800 px-4 py-3 text-sm font-medium text-white outline-none"
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Alphabetical (A-Z)</option>
                        </select>

                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-white">
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={(e) => {
                                    setInStockOnly(e.target.checked);
                                    setPage(1);
                                }}
                                className="h-4 w-4 rounded accent-emerald-500"
                            />
                            <span>In Stock Only</span>
                        </label>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {productCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setPage(1);
                            }}
                            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition ${
                                selectedCategory === cat
                                    ? "bg-slate-900 text-white shadow"
                                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Active Search & Filter Indicator */}
                {(searchQuery.trim() || selectedCategory !== "All" || inStockOnly || minPrice !== "" || maxPrice !== "") && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">Active Filters:</span>
                            {searchQuery.trim() && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                                    Keyword: "{searchQuery.trim()}"
                                </span>
                            )}
                            {selectedCategory !== "All" && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                                    Category: {selectedCategory}
                                </span>
                            )}
                            {(minPrice !== "" || maxPrice !== "") && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                                    Price: ₹{minPrice || "0"} – {maxPrice ? `₹${maxPrice}` : "Any"}
                                </span>
                            )}
                            {inStockOnly && (
                                <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 font-medium">
                                    In Stock
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                                setMinPrice("");
                                setMaxPrice("");
                                setSortBy("newest");
                                setInStockOnly(false);
                                setPage(1);
                            }}
                            className="font-semibold text-red-600 hover:text-red-700"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Item Counter Summary */}
                {!loading && pagination.totalProducts > 0 && (
                    <div className="flex items-center justify-between px-1 text-xs font-medium text-slate-500">
                        <span>
                            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1}–
                            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalProducts)} of {pagination.totalProducts} products
                        </span>
                        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {cartError && (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
                        {cartError}
                    </div>
                )}

                {loading && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-200" />
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
                        <p className="text-base font-semibold text-slate-900">No matching products found</p>
                        <p className="mt-1 text-sm text-slate-500">Try changing your search query or filter criteria.</p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                                setMinPrice("");
                                setMaxPrice("");
                                setSortBy("newest");
                                setInStockOnly(false);
                                setPage(1);
                            }}
                            className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-xs font-medium text-white"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Product Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => {
                            const isWishlisted = wishlist.includes(product._id);
                            return (
                                <article
                                    key={product._id}
                                    onClick={() => handleCardClick(product._id)}
                                    className={`group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                                        selectedProductId === product._id ? "ring-2 ring-slate-900 shadow-xl" : ""
                                    }`}
                                >
                                    {/* Product Image & Badges */}
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={
                                                product.image ||
                                                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
                                            }
                                            alt={product.name}
                                            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                                                selectedProductId === product._id ? "h-64" : "h-52"
                                            }`}
                                        />

                                        <div className="absolute left-3 top-3 flex gap-2">
                                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 backdrop-blur">
                                                {product.category || "General"}
                                            </span>
                                            {Number(product.countInStock ?? 0) <= 0 && (
                                                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                                    Sold Out
                                                </span>
                                            )}
                                        </div>

                                        {/* Wishlist Heart Button */}
                                        <button
                                            type="button"
                                            disabled={wishlistLoadingId === product._id}
                                            onClick={(e) => toggleWishlist(product._id, e)}
                                            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${
                                                isWishlisted
                                                    ? "bg-red-500 text-white shadow-md"
                                                    : "bg-white/80 text-slate-700 hover:bg-white"
                                            } ${wishlistLoadingId === product._id ? "opacity-60 cursor-not-allowed" : ""}`}
                                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                        >
                                            ♥
                                        </button>
                                    </div>

                                    {/* Product Details */}
                                    <div className="space-y-3 p-5">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">
                                                {product.name}
                                            </h2>
                                            <p className="text-xs font-medium text-slate-500">{product.brand || "Basketly"}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xl font-bold text-slate-900">
                                                ₹{Number(product.price ?? 0).toLocaleString()}
                                            </p>
                                            <span
                                                className={`text-xs font-medium ${
                                                    Number(product.countInStock ?? 0) > 5
                                                        ? "text-emerald-600"
                                                        : Number(product.countInStock ?? 0) > 0
                                                        ? "text-amber-600"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {Number(product.countInStock ?? 0) > 0
                                                    ? `${product.countInStock} in stock`
                                                    : "Out of stock"}
                                            </span>
                                        </div>

                                        <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                                            {product.description || "Quality product delivered directly to your doorstep."}
                                        </p>

                                        {/* Expandable Cart Controller */}
                                        {selectedProductId === product._id && (
                                            <div
                                                className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-slate-600">In your cart</p>
                                                    <p className="text-base font-bold text-slate-900">
                                                        {getCartQuantity(product._id)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddToCart(product._id)}
                                                        disabled={cartLoading || Number(product.countInStock ?? 0) <= 0}
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-bold text-white transition hover:bg-slate-700 disabled:opacity-40"
                                                    >
                                                        +
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFromCart(product._id)}
                                                        disabled={cartLoading || getCartQuantity(product._id) === 0}
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-40"
                                                    >
                                                        -
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddToCart(product._id)}
                                                        disabled={cartLoading || Number(product.countInStock ?? 0) <= 0}
                                                        className="ml-auto rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
                                                    >
                                                        Add More
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-4 pb-8">
                        <button
                            type="button"
                            onClick={() => {
                                setPage((p) => Math.max(1, p - 1));
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={page <= 1 || loading}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => {
                                            setPage(pageNumber);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className={`h-9 min-w-9 rounded-xl px-3 text-xs font-semibold transition ${
                                            page === pageNumber
                                                ? "bg-slate-900 text-white shadow-md"
                                                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setPage((p) => Math.min(pagination.totalPages, p + 1));
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={page >= pagination.totalPages || loading}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;