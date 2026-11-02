import {
  firebaseConfig,
  ADMIN_EMAIL
} from "../js/firebase-config.js";
import {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "../js/firebase-init.js";

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");
const loginForm = document.getElementById("loginForm");
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");
const resetBtn = document.getElementById("resetBtn");

const isDemoConfig =
  !firebaseConfig ||
  !firebaseConfig.projectId ||
  firebaseConfig.projectId === "tu-proyecto" ||
  firebaseConfig.apiKey.startsWith("TU_");

let currentProducts = [];

function showAlert(message) {
  alert(message);
}

function setAuthView(isLoggedIn) {
  loginView.classList.toggle("hidden", isLoggedIn);
  adminView.classList.toggle("hidden", !isLoggedIn);
}

function resetForm() {
  productForm.reset();
  document.getElementById("category").value = "belleza";
  document.getElementById("unit").value = "unidad";
  document.getElementById("price").value = 0;
  document.getElementById("productId").value = "";
}

function normalizeProduct(data) {
  return {
    id: data.id || crypto.randomUUID(),
    name: data.name || "",
    description: data.description || "",
    price: Number(data.price || 0),
    unit: data.unit || "unidad",
    category: data.category || "belleza",
    image: data.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"
  };
}

async function loadProducts() {
  if (isDemoConfig) {
    currentProducts = [
      {
        id: "demo-1",
        name: "Producto demo",
        description: "Producto de ejemplo para ver el panel.",
        price: 150,
        unit: "unidad",
        category: "belleza",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80"
      }
    ];
    renderProducts();
    return;
  }

  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    currentProducts = snapshot.docs.map((docRef) => ({ id: docRef.id, ...docRef.data() }));
    renderProducts();
  } catch (error) {
    console.error(error);
    showAlert("No se pudo cargar el catálogo. Revisa la configuración de Firebase.");
  }
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = currentProducts.filter((product) =>
    product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
  );

  productList.innerHTML = filtered.map((product) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(product.price || 0))}</td>
      <td>${product.unit}</td>
      <td>
        <div class="action-group">
          <button type="button" class="action-btn edit-btn" data-id="${product.id}">Editar</button>
          <button type="button" class="action-btn delete-btn" data-id="${product.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  productList.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => fillForm(button.dataset.id));
  });

  productList.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => deleteProductById(button.dataset.id));
  });
}

function fillForm(productId) {
  const product = currentProducts.find((item) => item.id === productId);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("category").value = product.category || "belleza";
  document.getElementById("price").value = product.price || 0;
  document.getElementById("unit").value = product.unit || "unidad";
  document.getElementById("description").value = product.description || "";
  document.getElementById("image").value = product.image || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveProduct(event) {
  event.preventDefault();

  if (isDemoConfig) {
    showAlert("Configura Firebase antes de guardar productos reales.");
    return;
  }

  const productId = document.getElementById("productId").value;
  const payload = normalizeProduct({
    id: productId || crypto.randomUUID(),
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value,
    price: Number(document.getElementById("price").value || 0),
    unit: document.getElementById("unit").value,
    description: document.getElementById("description").value.trim(),
    image: document.getElementById("image").value.trim()
  });

  if (!payload.name || !payload.description) {
    showAlert("Nombre y descripción son obligatorios.");
    return;
  }

  try {
    if (productId) {
      await updateDoc(doc(db, "products", productId), payload);
    } else {
      await addDoc(collection(db, "products"), payload);
    }

    resetForm();
    await loadProducts();
  } catch (error) {
    console.error(error);
    showAlert("No se pudo guardar el producto. Revisa Firebase y los permisos.");
  }
}

async function deleteProductById(productId) {
  if (!confirm("¿Deseas eliminar este producto?")) return;

  if (isDemoConfig) {
    showAlert("Configura Firebase antes de eliminar elementos.");
    return;
  }

  try {
    await deleteDoc(doc(db, "products", productId));
    await loadProducts();
  } catch (error) {
    console.error(error);
    showAlert("No se pudo eliminar el producto.");
  }
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userEmail = userCredential.user.email;

    if (userEmail !== ADMIN_EMAIL) {
      await signOut(auth);
      showAlert("Este correo no tiene permisos para administrar la tienda.");
      return;
    }

    setAuthView(true);
  } catch (error) {
    console.error(error);
    showAlert("Credenciales incorrectas o configuración no válida de Firebase.");
  }
}

async function logout() {
  try {
    await signOut(auth);
    setAuthView(false);
  } catch (error) {
    console.error(error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    setAuthView(true);
    loadProducts();
  } else {
    setAuthView(false);
  }
});

loginForm.addEventListener("submit", login);
productForm.addEventListener("submit", saveProduct);
logoutBtn.addEventListener("click", logout);
resetBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderProducts);

resetForm();
