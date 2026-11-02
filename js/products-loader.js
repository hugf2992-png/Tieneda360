import { db, collection, onSnapshot } from "./firebase-init.js";
import { firebaseConfig } from "./firebase-config.js";

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

const isDemoConfig =
  !firebaseConfig ||
  !firebaseConfig.projectId ||
  firebaseConfig.projectId === "tu-proyecto" ||
  firebaseConfig.apiKey.startsWith("TU_");

if (isDemoConfig) {
  window.PRODUCTS = FALLBACK_PRODUCTS;
  window.dispatchEvent(new CustomEvent("products:ready", { detail: FALLBACK_PRODUCTS }));
} else {
  const productsRef = collection(db, "products");
  onSnapshot(productsRef, (snapshot) => {
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    window.PRODUCTS = products.length ? products : FALLBACK_PRODUCTS;
    window.dispatchEvent(new CustomEvent("products:ready", { detail: window.PRODUCTS }));
  }, () => {
    window.PRODUCTS = FALLBACK_PRODUCTS;
    window.dispatchEvent(new CustomEvent("products:ready", { detail: FALLBACK_PRODUCTS }));
  });
}
