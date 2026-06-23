import {
  ArrowRight,
  BadgeIndianRupee,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Drill,
  ExternalLink,
  Eye,
  Factory,
  Hammer,
  Heart,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  X
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { address, categories, phone, whatsapp } from "./data/products.js";
import Login from "../login/login";
import Dashboard from "../admin/Dashboard";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const callLink = `tel:${phone}`;
const waLink = (text = "Hi Sri Sai Hardware, I want to enquire about materials.") =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;

function App() {
  const [wish, setWish] = useState(() => JSON.parse(localStorage.getItem("ssh_wishlist") || "[]"));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("ssh_cart") || "[]"));
  const [toast, setToast] = useState("");
  const [dbProducts, setDbProducts] = useState([]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.sshToast);
    window.sshToast = window.setTimeout(() => setToast(""), 2600);
  };

  const enrichProducts = (items = []) =>
    items.map((item, index) => {
      const price = Number(item.price) || 0;
      const originalPrice = Number(item.originalPrice) || price;

      return {
        ...item,
        id: item.id,
        title: item.title || "Untitled Product",
        category: item.category || "Uncategorized",
        brand: item.brand || "Unknown",
        price,
        originalPrice,
        discountPercentage:
          originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        rating: Number(item.rating) || (index % 5 === 0 ? 4.9 : 4.6),
        stock: item.stock || "Available",
        image: item.image || "https://via.placeholder.com/600x400?text=Product+Image",
        unit: item.unit || "nos",
        description:
          item.description ||
          `${item.title || "This product"} from ${item.brand || "our store"}, available at Sri Sai Hardware in Nirmal with genuine billing and local support.`,
        specifications:
          item.specifications || [
            "Genuine brand stock",
            "GST invoice available",
            "Suitable for residential and contractor projects"
          ],
        suitableFor: item.suitableFor || ["Home building", "Renovation", "Contractor supply"],
        isBestSeller: item.isBestSeller ?? (index < 12 || index % 9 === 0),
        isBulkAvailable:
          item.isBulkAvailable ??
          ["Cement", "Steel & TMT Bars", "Bricks & Blocks", "Tiles", "Paints"].includes(
            item.category
          )
      };
    });

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://hardware-store-backend-3qar.onrender.com/products", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const safe = Array.isArray(data) ? data : [];
        setDbProducts(enrichProducts(safe));
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch products error:", err);
          setDbProducts([]);
        }
      });

    return () => controller.abort();
  }, []);

  const toggleWish = (id) => {
    const next = wish.includes(id) ? wish.filter((item) => item !== id) : [...wish, id];
    setWish(next);
    localStorage.setItem("ssh_wishlist", JSON.stringify(next));
    showToast(wish.includes(id) ? "Removed from Wishlist" : "Saved to Wishlist");
  };

  const addToCart = (id) => {
    if (cart.includes(id)) {
      showToast("Already in cart");
      return;
    }
    const next = [...cart, id];
    setCart(next);
    localStorage.setItem("ssh_cart", JSON.stringify(next));
    showToast("Added to cart");
  };

  const removeFromCart = (id) => {
    const next = cart.filter((item) => item !== id);
    setCart(next);
    localStorage.setItem("ssh_cart", JSON.stringify(next));
    showToast("Removed from cart");
  };

  return (
    <>
      <Announcement />
      <Navbar wishCount={wish.length} cartCount={cart.length} products={dbProducts} />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={dbProducts}
                wish={wish}
                toggleWish={toggleWish}
                addToCart={addToCart}
                cart={cart}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProductsPage
                products={dbProducts}
                wish={wish}
                cart={cart}
                toggleWish={toggleWish}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/category/:name"
            element={
              <ProductsPage
                products={dbProducts}
                wish={wish}
                cart={cart}
                toggleWish={toggleWish}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetails
                products={dbProducts}
                wish={wish}
                cart={cart}
                toggleWish={toggleWish}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                products={dbProducts}
                wish={wish}
                cart={cart}
                toggleWish={toggleWish}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                products={dbProducts}
                wish={wish}
                cart={cart}
                toggleWish={toggleWish}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/cart"
            element={<CartPage products={dbProducts} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />}
          />
          <Route path="/bulk-quote" element={<BulkQuote products={dbProducts} showToast={showToast} />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage showToast={showToast} />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <FloatingButtons />
      <Footer />
      {toast && (
        <div className="toast">
          {toast}
          <span />
        </div>
      )}
    </>
  );
}

function Announcement() {
  return (
    <div className="ticker">
      <div>
        <span>Call for Best Prices: {phone}</span>
        <span>Genuine Materials - Cement, Steel, Pipes and More</span>
        <span>GST Invoices Available</span>
        <span>Serving Nirmal and Surrounding Areas</span>
        <span>WhatsApp us for Bulk Quotations</span>
      </div>
    </div>
  );
}

function Navbar({ wishCount, cartCount, products }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const suggestions = products
    .filter((p) => (p.title + p.brand + p.category).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const submit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    const recent = JSON.parse(localStorage.getItem("ssh_searches") || "[]");
    localStorage.setItem(
      "ssh_searches",
      JSON.stringify([query, ...recent.filter((item) => item !== query)].slice(0, 6))
    );
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
    setOpen(false);
  };

  return (
    <header className="navbar">
      <Link className="brand" to="/" onClick={() => setOpen(false)}>
        <span className="brand-icon">
          <Hammer size={22} />
        </span>
        <strong>
          <span>Sri Sai</span> Hardware
        </strong>
      </Link>

      <span className="location">
        <MapPin size={16} /> Nirmal, Telangana
      </span>

      <form className="nav-search" onSubmit={submit}>
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cement, tools, pipes..."
        />
        {query && (
          <div className="suggestions">
            {suggestions.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`}>
                {p.title}
                <small>{p.brand}</small>
              </Link>
            ))}
          </div>
        )}
      </form>

      <nav className={open ? "is-open" : ""}>
        <NavLink to="/products">Products</NavLink>
        <div className="drop">
          Categories <ChevronDown size={15} />
          <div className="drop-menu">
            {categories.map((cat) => (
              <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
        <NavLink to="/bulk-quote">Bulk Quote</NavLink>
        <NavLink to="/calculator">Calculator</NavLink>
        <NavLink to="/cart" className="wish-link">
          <ShoppingCart size={18} /> <b>{cartCount}</b>
        </NavLink>
      </nav>

      <a className="call-now" href={callLink}>
        <Phone size={18} /> Call Now
      </a>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function HomePage({ products, wish, toggleWish, addToCart, cart, removeFromCart }) {
  const featured = products.slice(0, 8);
  const priceItems = products.filter((p) => ["Cement", "Steel & TMT Bars", "Bricks & Blocks"].includes(p.category)).slice(0, 6);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="floating-tools">
          <Hammer />
          <Drill />
          <Factory />
        </div>
        <div className="hero-content">
          <p className="eyebrow">Owned and managed by G Hanmanth Reddy</p>
          <h1>Build Your Dream Home with Genuine Materials</h1>
          <p>Cement, steel, tools, pipes, paints and more - available at Nirmal's trusted hardware store.</p>
        </div>
      </section>

      <CtaBar />
      <Highlights />
      <Section title="Shop by Category" sub="Browse construction essentials with quick call and WhatsApp support.">
        <div className="category-grid">
          {categories.map((cat) => (
            <CategoryCard key={cat} cat={cat} products={products} />
          ))}
        </div>
      </Section>

      <Section title="Today's Material Prices in Nirmal" sub="Indicative prices. Call for best live pricing and availability.">
        <div className="price-grid">
          {priceItems.map((p) => (
            <PriceCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section title="Our Popular Products" sub="Top moving items for homes, contractors and site teams.">
        <ProductGrid items={featured} wish={wish} toggleWish={toggleWish} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />
      </Section>

      <Banner />
      <CalculatorPromo />
      <Brands />
      <WhyChoose />
      <Stats />
      <Testimonials />
      <ContactStrip />
    </div>
  );
}

function CtaBar() {
  return null;
}

function Highlights() {
  const items = [
    ["Genuine & Branded Products", ShieldCheck],
    ["Local Delivery in Nirmal", Truck],
    ["Bulk Orders Welcome", ClipboardList],
    ["GST Invoice Available", PackageCheck],
    [`Call for Best Price: ${phone}`, Phone]
  ];
  return (
    <div className="highlights">
      {items.map(([text, Icon]) => (
        <span key={text}>
          <Icon size={18} /> {text}
        </span>
      ))}
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <section className="section reveal">
      <div className="section-head">
        <p className="eyebrow">Sri Sai Hardware</p>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function CategoryCard({ cat, products }) {
  const count = products.filter((p) => p.category === cat).length;
  return (
    <Link className="category-card" to={`/category/${encodeURIComponent(cat)}`}>
      <span>
        <Factory size={24} />
      </span>
      <h3>{cat}</h3>
      <p>{count} products</p>
    </Link>
  );
}

function PriceCard({ product }) {
  return (
    <article className="price-card">
      <div>
        <small>Updated Today</small>
        <h3>{product.title}</h3>
        <p>
          {money(product.price)} / {product.unit}
        </p>
      </div>
      <a href={callLink}>Call to Order</a>
    </article>
  );
}

function ProductGrid({ items, wish, toggleWish, cart, addToCart, removeFromCart }) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          wished={wish.includes(product.id)}
          toggleWish={toggleWish}
          inCart={cart.includes(product.id)}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  const specs = (product.specifications || []).slice(0, 3);
  const inStock = product.stock > 0;
  return (
    <article className="product-card">
      <Link className="product-img" to={`/product/${product.id}`}>
        <img src={product.image} alt={product.title} />
        <span className="card-brand-badge">{product.brand}</span>
        {inStock && <span className="card-stock-badge">● In Stock</span>}
      </Link>
      <div className="product-info">
        <h3>
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        {specs.length > 0 && (
          <div className="spec-tags">
            {specs.map((s, i) => (
              <span key={i} className="spec-tag">{s}</span>
            ))}
          </div>
        )}
        <div className="card-price-row">
          <div>
            <p className="card-price-label">PRICE</p>
            <p className="price">{money(product.price)}</p>
          </div>
          <Link to={`/product/${product.id}`} className="view-details-btn">
            <Eye size={15} /> View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductsPage({ products, wish, cart, toggleWish, addToCart, removeFromCart }) {
  const { name } = useParams();
  const decoded = name ? decodeURIComponent(name) : "All";
  const [cat, setCat] = useState(decoded);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    setCat(decoded);
  }, [decoded]);

  const list = useMemo(() => {
    const available = products || [];
    let filtered = cat === "All" ? available : available.filter((p) => p.category === cat);
    if (sort === "low") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "high") filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "discount") filtered = [...filtered].sort((a, b) => b.discountPercentage - a.discountPercentage);
    return filtered;
  }, [cat, sort, products]);

  return (
    <div className="page inner">
      <PageHero title={cat === "All" ? "All Products" : cat} sub={`${list.length} products available. Call Sri Sai Hardware for confirmed live pricing.`} />
      <div className="products-layout">
        <aside className="filters">
          <h3>Filters</h3>
          {["All", ...categories].map((item) => (
            <button key={item} className={cat === item ? "active" : ""} onClick={() => setCat(item)}>
              {item}
            </button>
          ))}
        </aside>
        <div>
          <div className="toolbar">
            <strong>{list.length} items</strong>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price low to high</option>
              <option value="high">Price high to low</option>
              <option value="discount">Biggest discount</option>
            </select>
          </div>
          <ProductGrid items={list} wish={wish} toggleWish={toggleWish} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />
        </div>
      </div>
    </div>
  );
}

function ProductDetails({ products, wish, cart, toggleWish, addToCart, removeFromCart }) {
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === id) || products[0] || {};

  const similar = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="page inner">
      <div className="detail">
        <div className="detail-image">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="detail-copy">
          <p className="crumb">Home / {product.category}</p>
          <h1>{product.title}</h1>
          <p className="brand-line">
            {product.brand} <span><Star size={16} /> {product.rating?.toFixed?.(1) || "4.6"}</span>
          </p>
          <p className="detail-price">
            {money(product.price)} <del>{money(product.originalPrice)}</del> <b>{product.discountPercentage}% off</b>
          </p>
          <div className="info-grid">
            <span>Stock: {product.stock}</span>
            <span>Unit: {product.unit}</span>
            <span>Min order: {product.minOrderQuantity || "1 nos"}</span>
            <span>GST invoice available</span>
          </div>
          <p>{product.description}</p>

        </div>
        <aside className="sticky-quote">
          <h3>{money(product.price)}</h3>
          <p>Call for confirmed availability.</p>
          <a className="btn primary" href={callLink}>Call Now</a>
          <a className="btn green" href={waLink(`Hi Sri Sai Hardware, I am interested in ${product.title}.`)}>WhatsApp</a>
        </aside>
      </div>

      <Section title="Specifications" sub="Reliable products for residential and contractor use.">
        <div className="specs">
          {((product.specifications || []).concat(product.suitableFor || [])).map((s) => (
            <span key={s}>
              <CheckCircle2 size={18} /> {s}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Similar Products">
        <ProductGrid items={similar} wish={wish} toggleWish={toggleWish} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />
      </Section>
    </div>
  );
}

function SearchPage({ products, wish, cart, toggleWish, addToCart, removeFromCart }) {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const list = (products || []).filter((p) => (p.title + p.category + p.brand).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="page inner">
      <PageHero title={`Search: ${q || "Products"}`} sub={`${list.length} matching products found.`} />
      <ProductGrid items={list} wish={wish} toggleWish={toggleWish} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />
    </div>
  );
}

function WishlistPage({ products, wish, cart, toggleWish, addToCart, removeFromCart }) {
  const list = (products || []).filter((p) => wish.includes(p.id));
  return (
    <div className="page inner">
      <PageHero title="Wishlist" sub="Saved products for quick call or WhatsApp enquiry." />
      {list.length ? (
        <ProductGrid items={list} wish={wish} toggleWish={toggleWish} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />
      ) : (
        <div className="empty">No saved products yet. Browse and tap the heart to save products.</div>
      )}
    </div>
  );
}

function CartPage({ products, cart, addToCart, removeFromCart }) {
  const list = (products || []).filter((p) => cart.includes(p.id));
  return (
    <div className="page inner">
      <PageHero title="Cart" sub={list.length ? `You have ${list.length} items in your cart.` : `Your cart is empty.`} />
      {list.length ? (
        <ProductGrid items={list} wish={[]} toggleWish={() => { }} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />
      ) : (
        <div className="empty">No items in your cart yet.</div>
      )}
    </div>
  );
}

function BulkQuote({ products, showToast }) {
  const [rows, setRows] = useState([{ product: "", qty: 100 }]);

  useEffect(() => {
    if (!rows[0]?.product && products?.[0]?.id) {
      setRows([{ product: products[0].id, qty: 100 }]);
    }
  }, [products, rows]);

  const chosen = rows.map((row) => ({
    ...row,
    item: (products || []).find((p) => p.id === Number(row.product))
  }));

  const subtotal = chosen.reduce((sum, row) => sum + (row.item?.price || 0) * row.qty, 0);

  const send = () => {
    showToast("Quote sent via WhatsApp");
    window.open(
      waLink(
        `Hi Sri Sai Hardware, I need a bulk quote. Items: ${chosen
          .map((r) => `${r.item?.title || "Item"} - ${r.qty} ${r.item?.unit || "nos"}`)
          .join(", ")}. Estimated total ${money(subtotal)}.`
      ),
      "_blank"
    );
  };

  return (
    <div className="page inner">
      <PageHero title="Request Bulk Material Quotation" sub="For contractors and large projects in Nirmal." />
      <div className="form-page">
        <div className="panel form-grid">
          <input placeholder="Full name" />
          <input placeholder="Phone number" />
          <input placeholder="Project name" />
          <input placeholder="Site location" />
          <textarea placeholder="Notes" />
        </div>
        <div className="panel">
          <h3>Material Estimate</h3>
          {rows.map((row, index) => (
            <div className="quote-row" key={index}>
              <select
                value={row.product}
                onChange={(e) =>
                  setRows(rows.map((r, i) => (i === index ? { ...r, product: e.target.value } : r)))
                }
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={row.qty}
                onChange={(e) =>
                  setRows(rows.map((r, i) => (i === index ? { ...r, qty: Number(e.target.value) } : r)))
                }
              />
            </div>
          ))}
          <button className="btn ghost" onClick={() => setRows([...rows, { product: products[0]?.id || "", qty: 50 }])}>
            Add Product
          </button>
          <div className="estimate">
            <p>Subtotal <b>{money(subtotal)}</b></p>
            <p>Bulk discount estimate <b>-{money(subtotal * 0.05)}</b></p>
            <p>Total <b>{money(subtotal * 0.95)}</b></p>
          </div>
          <div className="big-actions">
            <a className="btn primary" href={callLink}>Call Now to Confirm</a>
            <button className="btn green" onClick={send}>Send Quote on WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalculatorPage() {
  const [area, setArea] = useState(1000);
  const cement = Math.ceil(area * 0.4);
  const steel = Math.ceil(area * 3.5);
  const bricks = Math.ceil(area * 8);
  return (
    <div className="page inner">
      <PageHero title="Free Construction Material Calculator" sub="Estimate materials for your Nirmal project." />
      <div className="calculator-panel">
        <div className="panel">
          <h3>Built-up Area</h3>
          <input type="number" value={area} onChange={(e) => setArea(Number(e.target.value))} />
          <p className="muted">Enter area in square feet.</p>
        </div>
        <div className="calc-results">
          <Result label="Cement bags" value={cement} />
          <Result label="Steel kg" value={steel} />
          <Result label="Bricks" value={bricks} />
          <Result label="Approx budget" value={money(area * 1600)} />
        </div>
      </div>
      <CtaBar />
    </div>
  );
}

function Result({ label, value }) {
  return (
    <div className="result">
      <Calculator />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page inner">
      <PageHero title="About Sri Sai Hardware" sub="Nirmal's trusted hardware store." />
      <div className="story panel">
        <h2>Our Story</h2>
        <p>
          Sri Sai Hardware is proudly owned and managed by G Hanmanth Reddy. Located at Banisa, Beside HDFC Bank,
          Nirmal, Telangana, we serve homeowners, contractors, engineers, electricians and plumbers with genuine
          building materials at honest prices.
        </p>
        <div className="owner">
          <Hammer />
          <div>
            <h3>G Hanmanth Reddy</h3>
            <p>Owner & Founder, Sri Sai Hardware</p>
            <a className="btn primary" href={callLink}>Call Now</a>
          </div>
        </div>
      </div>
      <WhyChoose />
    </div>
  );
}

function ContactPage({ showToast }) {
  const submit = (event) => {
    event.preventDefault();
    showToast("Opening WhatsApp enquiry");
    window.open(waLink("Hi Sri Sai Hardware, I want to enquire about materials."), "_blank");
  };

  return (
    <div className="page inner">
      <PageHero title="Get in Touch with Sri Sai Hardware" sub={address} />
      <div className="contact-grid">
        <ContactCard icon={Phone} title={phone} action="Call Now" href={callLink} />
        <ContactCard icon={ExternalLink} title="WhatsApp" action="Chat Now" href={waLink()} />
        <ContactCard icon={Mail} title="sainadhgaralapati@gmail.com" action="Email" href="mailto:sainadhgaralapati@gmail.com" />
        <ContactCard icon={MapPin} title="Banisa, HDFC Bank, Nirmal" action="Directions" href="https://maps.google.com/?q=Banisa%20Beside%20HDFC%20Bank%20Nirmal" />
      </div>
      <form className="panel enquiry" onSubmit={submit}>
        <input placeholder="Name" />
        <input placeholder="Phone" />
        <input placeholder="Subject" />
        <textarea placeholder="Message" />
        <button className="btn green">Send on WhatsApp</button>
      </form>
      <MapBlock />
    </div>
  );
}

function ContactCard({ icon: Icon, title, action, href }) {
  return (
    <a className="contact-card" href={href}>
      <Icon />
      <strong>{title}</strong>
      <span>{action}</span>
    </a>
  );
}

function PageHero({ title, sub }) {
  return (
    <section className="page-hero">
      <p className="eyebrow">Quality You Can Build On</p>
      <h1>{title}</h1>
      <p>{sub}</p>
    </section>
  );
}

function Banner() {
  return (
    <section className="banner">
      <h2>Building on a Large Scale?</h2>
      <p>Get special pricing on cement, steel, bricks and tiles for your construction project.</p>
      <div className="actions">
        <a className="btn dark" href={callLink}>Call for Bulk Quote</a>
        <a className="btn green" href={waLink("Hi Sri Sai Hardware, I need a bulk quotation.")}>Send WhatsApp Enquiry</a>
      </div>
    </section>
  );
}

function CalculatorPromo() {
  return (
    <Section title="Estimate Your Materials for Free" sub="Use our calculator before calling the store.">
      <div className="promo-grid">
        {["Brick Calculator", "Tile Calculator", "Paint Calculator", "Cement Calculator"].map((item) => (
          <Link className="promo" to="/calculator" key={item}>
            <Calculator /> {item}
          </Link>
        ))}
      </div>
    </Section>
  );
}

function Brands() {
  const names = ["UltraTech", "ACC", "Ambuja", "Asian Paints", "Berger", "Bosch", "Taparia", "Finolex", "Dr. Fixit", "Havells", "Polycab", "Astral", "Kirloskar", "JSW Steel"];
  return (
    <Section title="Brands We Stock">
      <div className="marquee">
        <div>{names.concat(names).map((n, i) => <span key={`${n}-${i}`}>{n}</span>)}</div>
      </div>
    </Section>
  );
}

function WhyChoose() {
  const items = ["Genuine & Branded Products", "Fast Local Delivery", "Best Prices Guaranteed", "GST Invoice Support", "Expert Product Advice", "Prime Location in Nirmal"];
  return (
    <Section title="Why Nirmal Builders Trust Sri Sai Hardware">
      <div className="why-grid">
        {items.map((item) => (
          <div className="why" key={item}>
            <ShieldCheck /> <h3>{item}</h3>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Stats() {
  return (
    <section className="stats">
      <div><strong>500+</strong><span>Happy Customers</span></div>
      <div><strong>1000+</strong><span>Products Available</span></div>
      <div><strong>50+</strong><span>Trusted Brands</span></div>
      <div><strong>10+</strong><span>Years Serving Nirmal</span></div>
    </section>
  );
}

function Testimonials() {
  return (
    <Section title="Customer Words">
      <div className="testimonials">
        {[
          "Sri Sai Hardware is my go-to store. Genuine products, honest pricing, and quick delivery.",
          "Called them for cement and TMT bars. Got the best price in Nirmal.",
          "Always stocked with quality materials. My first call for construction requirements."
        ].map((text, i) => (
          <blockquote key={text}>
            {text}
            <cite>{["Ravi Kumar, Contractor", "Suresh Reddy, Home Owner", "Anitha Rao, Civil Engineer"][i]}</cite>
          </blockquote>
        ))}
      </div>
    </Section>
  );
}

function ContactStrip() {
  return (
    <section className="contact-strip">
      <span><MapPin /> {address}</span>
      <span><Phone /> {phone}</span>
      <span>Mon-Sat 8AM-8PM | Sun 9AM-2PM</span>
      <a href={callLink}>Call Now</a>
      <a href={waLink()}>WhatsApp</a>
    </section>
  );
}

function MapBlock() {
  return (
    <iframe
      className="map"
      title="Sri Sai Hardware Map"
      loading="lazy"
      src="https://maps.google.com/maps?q=Banisa%20Beside%20HDFC%20Bank%20Nirmal%20Telangana&t=&z=14&ie=UTF8&iwloc=&output=embed"
    />
  );
}

function FloatingButtons() {
  return (
    <>
      <a className="float-wa" href={waLink()} aria-label="WhatsApp">
        <svg viewBox="0 0 448 512" width="34" height="38" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </a>
      <div className="mobile-bottom">
        <a href={callLink}><Phone /> Call Now<br />{phone}</a>
        <a href={waLink()}>WhatsApp<br />+91 94942 01167</a>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <Link className="brand" to="/">
            <span className="brand-icon"><Hammer /></span>
            <strong><span>Sri Sai</span> Hardware</strong>
          </Link>
          <p>Quality You Can Build On. Your trusted hardware partner in Nirmal, Telangana.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/calculator">Calculator</Link>
          <Link to="/bulk-quote">Bulk Quote</Link>
        </div>
        <div>
          <h3>Categories</h3>
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}>{cat}</Link>
          ))}
        </div>
        <div>
          <h3>Contact</h3>
          <p>{address}</p>
          <p>{phone}</p>
          <p>sainadhgaralapati@gmail.com</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Sri Sai Hardware. All Rights Reserved. Owned by G Hanmanth Reddy.</div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="page inner">
      <PageHero title="Page Not Found" sub="The page you are looking for is not available." />
      <Link className="btn primary" to="/">Back Home</Link>
    </div>
  );
}

export default App;