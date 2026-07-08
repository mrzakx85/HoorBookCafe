const order = {}; // name -> { price, qty }

const cartFab = document.getElementById("cartFab");
const cartCount = document.getElementById("cartCount");
const cartFabTotal = document.getElementById("cartFabTotal");
const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerList = document.getElementById("drawerList");
const drawerTotal = document.getElementById("drawerTotal");
const toast = document.getElementById("toast");

function money(n) {
  return "$" + n.toFixed(2);
}

function totals() {
  let count = 0,
    sum = 0;
  for (const key in order) {
    count += order[key].qty;
    sum += order[key].qty * order[key].price;
  }
  return { count, sum };
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1400);
}

function renderFab() {
  const { count, sum } = totals();
  cartCount.textContent = count;
  cartFabTotal.textContent = money(sum);
  cartFab.classList.toggle("visible", count > 0);
}

function renderDrawer() {
  const keys = Object.keys(order);
  if (keys.length === 0) {
    drawerList.innerHTML =
      '<div class="drawer__empty">No items yet. Tap something from the menu to start your order.</div>';
  } else {
    drawerList.innerHTML = keys
      .map((name) => {
        const it = order[name];
        return `
          <div class="order-row" data-name="${name}">
            <div class="order-row__info">
              <div class="order-row__name">${name}</div>
              <div class="order-row__unit">${money(it.price)} each</div>
            </div>
            <div class="qty">
              <button class="qty-minus" aria-label="Remove one">−</button>
              <span>${it.qty}</span>
              <button class="qty-plus" aria-label="Add one">+</button>
            </div>
            <div class="order-row__price mono">${money(it.price * it.qty)}</div>
          </div>`;
      })
      .join("");
  }
  const { sum } = totals();
  drawerTotal.textContent = money(sum);
  renderFab();
}

function addItem(name, price, sourceEl) {
  if (!order[name]) order[name] = { price, qty: 0 };
  order[name].qty += 1;
  renderDrawer();
  showToast(name + " added");
  if (sourceEl) {
    sourceEl.classList.add("added");
    setTimeout(() => sourceEl.classList.remove("added"), 450);
  }
}

document.querySelectorAll(".item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    addItem(name, price, btn);
  });
});

drawerList.addEventListener("click", (e) => {
  const row = e.target.closest(".order-row");
  if (!row) return;
  const name = row.dataset.name;
  if (e.target.classList.contains("qty-plus")) {
    order[name].qty += 1;
  } else if (e.target.classList.contains("qty-minus")) {
    order[name].qty -= 1;
    if (order[name].qty <= 0) delete order[name];
  }
  renderDrawer();
});

function openDrawer() {
  drawer.classList.add("open");
  drawerBackdrop.classList.add("open");
}
function closeDrawer() {
  drawer.classList.remove("open");
  drawerBackdrop.classList.remove("open");
}

cartFab.addEventListener("click", openDrawer);
document.getElementById("drawerClose").addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

document.getElementById("clearOrderBtn").addEventListener("click", () => {
  for (const key in order) delete order[key];
  renderDrawer();
});

document.getElementById("placeOrderBtn").addEventListener("click", () => {
  const { count } = totals();
  if (count === 0) {
    showToast("Your order is empty");
    return;
  }
  showToast("Order placed — thank you!");
  closeDrawer();
  setTimeout(() => {
    for (const key in order) delete order[key];
    renderDrawer();
  }, 400);
});

// Reveal menu sections on scroll
const sections = document.querySelectorAll(".menu__section");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);
sections.forEach((sec) => observer.observe(sec));

renderFab();
