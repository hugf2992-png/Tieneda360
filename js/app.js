const WHATSAPP_NUMBER = "521234567890";
const CART_KEY = "fc_cart";
const THEME_KEY = "fc_theme";

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "belleza", label: "Belleza" },
  { id: "hogar", label: "Hogar" },
  { id: "comida", label: "Comida" },
  { id: "servicios", label: "Servicios" }
];

const FALLBACK_PRODUCTS = [
  {
    id: "p1",
    name: "Combo cuidado personal",
    description: "Kit completo para rutinas de belleza y bienestar.",
    price: 180,
    unit: "unidad",
    category: "belleza",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "p2",
    name: "Set de cocina premium",
    description: "Utensilios y accesorios para cocina moderna.",
    price: 260,
    unit: "unidad",
    category: "hogar",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "p3",
    name: "Caja de desayuno",
    description: "Deliciosa selección para compartir en familia.",
    price: 140,
    unit: "unidad",
    category: "comida",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "p4",
    name: "Servicio personalizado",
    description: "Asesoría y atención directa para tu necesidad.",
    price: 0,
    unit: "cotizar",
    category: "servicios",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
  }
];

const SERVICES = [
  {
    ico: "🛍️",
    name: "Atención personalizada",
    desc: "Te ayudamos a elegir el mejor producto según lo que necesitas."
  },
  {
    ico: "🚚",
    name: "Entrega rápida",
    desc: "Procesamos pedidos con tiempos ágiles y seguimiento sencillo."
  },
  {
    ico: "💬",
    name: "Pedidos por WhatsApp",
    desc: "Tu compra se coordina de forma directa con el negocio."
  }
];

let selectedCategory = "all";
let PRODUCTS = Array.isArray(window.PRODUCTS) && window.PRODUCTS.length ? window.PRODUCTS : FALLBACK_PRODUCTS;

const productGrid = document.getElementById("productGrid");
const pills = document.getElementById("pills");
const servicesGrid = document.getElementById("servicesGrid");
const cartButton = document.getElementById("cartButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const themeToggle = document.getElementById("themeToggle");
const orderModal = document.getElementById("orderModal");
const orderForm = document.getElementById("orderForm");
const closeModal = document.getElementById("closeModal");
const closeCart = document.getElementById("closeCart");

window.addEventListener("products:ready", (event) => {
  const nextProducts = Array.isArray(event.detail) ? event.detail : [];
  if (nextProducts.length) {
    PRODUCTS = nextProducts;
    renderProducts();
  }
});

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(price);
}

function renderCategories() {
  pills.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = `pill ${selectedCategory === category.id ? "active" : ""}`;
    btn.textContent = category.label;
    btn.addEventListener("click", () => {
      selectedCategory = category.id;
      renderCategories();
      renderProducts();
    });
    pills.appendChild(btn);
  });
}

function renderProducts() {
  if (!productGrid) return;

  const visibleProducts =
    selectedCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === selectedCategory);

  productGrid.innerHTML = "";

  visibleProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const qtyControl =
      product.unit === "unidad"
        ? `<input class="qty-input" type="number" min="1" value="1" data-qty="${product.id}" />`
        : "";

    const buttonText = product.unit === "cotizar" ? "Cotizar" : "Agregar";

    card.innerHTML = `
      <img src="${product.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"}" alt="${product.name}" />
      <div class="product-body">
        <div class="product-meta">
          <h3>${product.name}</h3>
          ${product.price > 0 ? `<span class="product-price">${formatPrice(product.price)}</span>` : `<span class="product-price">Consultar</span>`}
        </div>
        <div class="product-desc">${product.description}</div>
        <div class="product-footer">
          <span class="product-tag">${product.category}</span>
          ${qtyControl}
          <button class="btn btn-primary add-btn" data-product-id="${product.id}" data-unit="${product.unit}">${buttonText}</button>
        </div>
      </div>
    `;

    const addButton = card.querySelector(".add-btn");
    addButton.addEventListener("click", () => {
      const unit = addButton.dataset.unit;

      if (unit === "cotizar") {
        const message = `Hola, quiero cotizar ${product.name}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
        return;
      }

      const qtyInput = card.querySelector(".qty-input");
      const qty = qtyInput ? Number(qtyInput.value) || 1 : 1;

      const cart = getCart();
      const existing = cart.find((item) => item.id === product.id);

      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({ id: product.id, quantity: qty });
      }

      saveCart(cart);
      renderCart();
    });

    productGrid.appendChild(card);
  });
}

function renderServices() {
  if (!servicesGrid) return;

  servicesGrid.innerHTML = "";
  SERVICES.forEach((service) => {
    const card = document.createElement("article");
    card.className = "service-card";
    card.innerHTML = `
      <div class="service-icon">${service.ico}</div>
      <h3>${service.name}</h3>
      <p>${service.desc}</p>
    `;
    servicesGrid.appendChild(card);
  });
}

function renderCart() {
  const cart = getCart();
  const items = cart
    .map((item) => ({ ...item, product: getProductById(item.id) }))
    .filter((item) => item.product);

  cartItems.innerHTML = "";

  if (!items.length) {
    cartItems.innerHTML = `<p style="color: var(--text-soft); margin: 0;">Tu carrito está vacío.</p>`;
    cartCount.textContent = "0";
    cartTotal.textContent = "$0";
    return;
  }

  let subtotal = 0;

  items.forEach((item) => {
    subtotal += item.product.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.product.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"}" alt="${item.product.name}" />
      <div>
        <h4>${item.product.name}</h4>
        <small>${item.quantity} x ${formatPrice(item.product.price)}</small>
      </div>
      <button class="remove-btn" data-remove="${item.product.id}">Quitar</button>
    `;

    cartItems.appendChild(row);
    row.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(item.product.id));
  });

  cartCount.textContent = String(items.reduce((sum, item) => sum + item.quantity, 0));
  cartTotal.textContent = formatPrice(subtotal);
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function openCart() {
  cartDrawer.classList.add("open");
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
}

function openOrderModal() {
  const cart = getCart();
  if (!cart.length) {
    alert("Tu carrito está vacío.");
    return;
  }

  orderModal.classList.remove("hidden");
  orderModal.setAttribute("aria-hidden", "false");
}

function closeOrderModal() {
  orderModal.classList.add("hidden");
  orderModal.setAttribute("aria-hidden", "true");
}

function sendOrderByWhatsApp(formData) {
  const cart = getCart();
  const items = cart
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;
      return `${item.quantity} x ${product.name} - ${formatPrice(product.price * item.quantity)}`;
    })
    .filter(Boolean)
    .join("%0A");

  const subtotal = cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const message = `
Hola, quiero hacer este pedido:%0A
%0A
Nombre: ${formData.nombre}%0A
Teléfono: ${formData.telefono}%0A
Dirección: ${formData.direccion || "No especificada"}%0A
Fecha: ${formData.fecha || "Sin fecha"}%0A
Observaciones: ${formData.observaciones || "Ninguna"}%0A
%0A
Productos:%0A${items}%0A
%0A
Total estimado: ${formatPrice(subtotal)}
  `.trim();

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.textContent = isDark ? "☀️" : "🌙";
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

if (cartButton) cartButton.addEventListener("click", openCart);
if (closeCart) closeCart.addEventListener("click", closeCartDrawer);

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    closeCartDrawer();
    openOrderModal();
  });
}

if (closeModal) closeModal.addEventListener("click", closeOrderModal);
if (orderModal) {
  orderModal.addEventListener("click", (event) => {
    if (event.target === orderModal) closeOrderModal();
  });
}

if (orderForm) {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(orderForm).entries());
    sendOrderByWhatsApp(formData);
    localStorage.removeItem(CART_KEY);
    closeOrderModal();
    renderCart();
  });
}

initTheme();
renderCategories();
renderProducts();
renderServices();
renderCart();
