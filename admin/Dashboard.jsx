import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Dashboard.css";

const EMPTY_FORM = {
  title: "",
  category: "",
  brand: "",
  price: "",
  originalPrice: "",
  stock: "",
  image: "",
  unit: "",
};

function Dashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [page, setPage] = useState("manage");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchProducts = () =>
    fetch("https://hardware-store-backend-3qar.onrender.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

  useEffect(() => {
    const isLogin = localStorage.getItem("adminLoggedIn") === "true" ||
                    localStorage.getItem("is_login") === "true" ||
                    localStorage.getItem("isLogin") === "true" ||
                    localStorage.getItem("isLoggedIn") === "true";
    if (!isLogin) {
      navigate("/admin/login");
    } else {
      setAuthorized(true);
      fetchProducts();
    }
  }, [navigate]);

  const change = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const addProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      showMsg(data.message || "Product added!");
      await fetchProducts();
      setFormData(EMPTY_FORM);
      setPage("manage");
    } catch {
      showMsg("Failed to add product.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      showMsg(data.message || "Product updated!");
      setEditingId(null);
      await fetchProducts();
      setFormData(EMPTY_FORM);
      setPage("manage");
    } catch {
      showMsg("Failed to update product.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      showMsg(data.message || "Deleted!");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      showMsg("Failed to delete.", "error");
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      category: product.category,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      image: product.image,
      unit: product.unit,
    });
    setPage("add");
  };

  const goToAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setPage("add");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!authorized) {
    return null;
  }

  return (
    <div className={`dashboard ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Mobile top bar for admin panel */}
      <header className="dash-mobile-header">
        <button className="dash-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h2>Sri Sai Admin</h2>
      </header>

      {/* ─── Sidebar ─── */}
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <h2>Sri Sai Hardware</h2>
        <ul>
          <li
            className={`sidebar-link ${page === "manage" ? "active" : ""}`}
            onClick={() => { setPage("manage"); setSidebarOpen(false); }}
          >
            Manage Products
          </li>
          <li
            className={`sidebar-link ${page === "add" ? "active" : ""}`}
            onClick={() => { goToAdd(); setSidebarOpen(false); }}
          >
            Add Product
          </li>
        </ul>
      </aside>

      {/* ââ Main ââ */}
      <main className="main-content">

        {/* Toast message */}
        {message.text && (
          <div className={`dash-toast ${message.type}`}>{message.text}</div>
        )}

        {/* ââ Manage Products ââ */}
        {page === "manage" && (
          <div>
            <div className="topbar">
              <div>
                <h1>Manage Products</h1>
                <p>{products.length} products in the catalogue</p>
              </div>
              <button className="manage-add-btn" onClick={goToAdd}>
                Add Product
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {/* â image wrapped in div.product-img */}
                      <div className="product-img">
                        <img src={product.image} alt={product.title} />
                      </div>
                    </td>
                    <td>{product.title}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>{product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <button className="edit-btn" onClick={() => startEdit(product)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ââ Add / Edit Product ââ */}
        {page === "add" && (
          <div className="add-product">
            <h2>{editingId ? "✏️ Edit Product" : "➕ Add Product"}</h2>

            {[
              ["title",         "text",   "Product Title"],
              ["category",      "text",   "Category"],
              ["brand",         "text",   "Brand"],
              ["price",         "number", "Price "],
              ["originalPrice", "number", "Original Price"],
              ["stock",         "number", "Stock Quantity"],
              ["image",         "text",   "Image URL"],
              ["unit",          "text",   "Unit (bag, piece, kgâ¦)"],
            ].map(([field, type, placeholder]) => (
              <input
                key={field}
                type={type}
                placeholder={placeholder}
                value={formData[field]}
                onChange={change(field)}
              />
            ))}

            <button
              className="add-product-btn"
              onClick={editingId ? updateProduct : addProduct}
              disabled={loading}
            >
              {loading ? "Saving…" : editingId ? "Update Product" : "Add Product"}
            </button>

            <button
              className="add-product-btn"
              style={{ marginTop: 10, background: "#374151", boxShadow: "none" }}
              onClick={() => { setPage("manage"); setEditingId(null); setFormData(EMPTY_FORM); }}
            >
              Back to Manage
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
