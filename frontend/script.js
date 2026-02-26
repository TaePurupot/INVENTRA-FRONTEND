// Redirect if not logged in
if (!localStorage.getItem("loggedIn") && 
    !window.location.href.includes("login.html") && 
    !window.location.href.includes("signup.html")) {
    window.location.href = "login.html";
}

// Cache DOM elements
const productForm = document.getElementById('productForm');
const productTableBody = document.getElementById('productTableBody');
const totalProductsElement = document.getElementById('totalProducts');
const productSelect = document.getElementById('productSelect');
const saleQty = document.getElementById('saleQty');
const sellBtn = document.getElementById('sellBtn');

const productName = document.getElementById('productName');
const sku = document.getElementById('sku');
const quantity = document.getElementById('quantity');
const price = document.getElementById('price');

let editingProductId = null;

// ==========================
// LOAD PRODUCTS (PRODUCTS PAGE)
// ==========================
async function loadProducts() {
    if (!productTableBody) return;

    const res = await fetch('/api/products');
    if (!res.ok) return console.error("Failed to load products");
    const products = await res.json();

    productTableBody.innerHTML = '';

    products.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.sku}</td>
            <td>${p.quantity}</td>
            <td>₱${p.price.toFixed(2)}</td>
            <td>
                <button onclick="editProduct(${p.id})">Edit</button>
                <button onclick="deleteProduct(${p.id})" class="danger">Delete</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

// ==========================
// ADD / UPDATE PRODUCT
// ==========================
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameVal = productName.value;
        const skuVal = sku.value;
        const qtyVal = Number(quantity.value);
        const priceVal = Number(price.value);

        const url = editingProductId
            ? `/api/products/${editingProductId}`
            : '/api/products';

        const method = editingProductId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nameVal, sku: skuVal, quantity: qtyVal, price: priceVal })
        });

        if (!res.ok) {
            const err = await res.json();
            alert(`Error: ${err.error || "Failed to save product"}`);
            return;
        }

        editingProductId = null;
        productForm.reset();
        loadProducts();
        loadDashboardStats();
        loadProductsForSales();
        loadSalesTotal();
    });
}

// ==========================
// EDIT PRODUCT
// ==========================
async function editProduct(id) {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) return alert("Failed to fetch product");
    const p = await res.json();

    productName.value = p.name;
    sku.value = p.sku;
    quantity.value = p.quantity;
    price.value = p.price;

    editingProductId = id;
}

// ==========================
// DELETE PRODUCT
// ==========================
async function deleteProduct(id) {
    if (!confirm('Delete product?')) return;

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to delete product"}`);
        return;
    }

    loadProducts();
    loadDashboardStats();
    loadProductsForSales();
    loadSalesTotal();
}

// ==========================
// DASHBOARD (INDEX.HTML)
// ==========================
async function loadDashboardStats() {
    if (!totalProductsElement) return;

    const res = await fetch('/api/products');
    if (!res.ok) return;
    const products = await res.json();

    totalProductsElement.textContent = products.length;
}

// ==========================
// TOTAL SALES (DASHBOARD)
// ==========================
async function loadSalesTotal() {
    const statCard = document.querySelector(".stat-card:nth-child(3) .stat");
    if (!statCard) return;

    const res = await fetch("/api/sales");
    if (!res.ok) return;
    const sales = await res.json();

    let total = 0;
    for (const s of sales) {
        const productRes = await fetch(`/api/products/${s.productId}`);
        if (!productRes.ok) continue;
        const product = await productRes.json();

        total += s.quantity * product.price;
    }

    statCard.textContent = `₱${total.toFixed(2)}`;
}

// ==========================
// SALES PAGE: PRODUCT DROPDOWN
// ==========================
async function loadProductsForSales() {
    if (!productSelect) return;

    const res = await fetch('/api/products');
    if (!res.ok) return;
    const products = await res.json();

    productSelect.innerHTML = '<option value="">Select product</option>';

    products.forEach(p => {
        productSelect.innerHTML += `
            <option value="${p.id}">
                ${p.name} (Stock: ${p.quantity})
            </option>
        `;
    });
}

// ==========================
// SELL PRODUCT (use /api/sales)
// ==========================
if (sellBtn) {
    sellBtn.addEventListener('click', async () => {
        const id = productSelect.value;
        const qty = Number(saleQty.value);

        if (!id || qty <= 0) return alert('Invalid sale');

        const res = await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, quantity: qty })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            alert(data.error || data.message || "Sale failed");
            return;
        }

        alert(`Sale completed! Remaining stock: ${data.remaining}`);
        loadProducts();
        loadDashboardStats();
        loadProductsForSales();
        loadSalesTotal();
    });
}

// ==========================
// LOAD SALES TABLE
// ==========================
async function loadSalesTable() {
  const salesTableBody = document.getElementById("salesTableBody");
  if (!salesTableBody) return;

  const res = await fetch("/api/sales");
  if (!res.ok) return console.error("Failed to load sales");
  const sales = await res.json();

  salesTableBody.innerHTML = "";

  for (const s of sales) {
    // Fetch product info for each sale
    const productRes = await fetch(`/api/products/${s.productId}`);
    if (!productRes.ok) continue;
    const product = await productRes.json();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${s.quantity}</td>
      <td>${new Date(s.date).toLocaleString()}</td>
      <td>₱${(s.quantity * product.price).toFixed(2)}</td>
    `;
    salesTableBody.appendChild(row);
  }
}

// Logout functionality
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Clear login state
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userId");

    // Redirect to login page
    window.location.href = "login.html";
  });
}

// INIT
loadProducts();
loadDashboardStats();
loadProductsForSales();
loadSalesTotal();
loadSalesTable();