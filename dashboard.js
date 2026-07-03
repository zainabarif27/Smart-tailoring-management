// =============================
// SIDEBAR TOGGLE
// =============================

const menuToggle = document.querySelector(".menu-toggle");
const sidebar = document.querySelector(".sidebar");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("hide");

        if (sidebar.classList.contains("hide")) {
            sidebar.style.width = "80px";
        } else {
            sidebar.style.width = "240px";
        }
    });
}

// =============================
// LOAD DASHBOARD
// =============================

// =============================
// DATE FORMAT HELPER
// Converts YYYY-MM-DD → DD/MM/YYYY
// =============================
function formatDate(dateStr) {
    if (!dateStr) return "-";
    let parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr; // return as-is if unexpected format
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

loadDashboard();

function loadDashboard() {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let payments = JSON.parse(localStorage.getItem("payments")) || [];

    // ================= TOTAL CUSTOMERS =================
    // FIX: Count unique customers, not total orders
    let uniqueCustomerIds = new Set(orders.map(o => o.customerId));
    document.getElementById("totalCustomers").innerText = uniqueCustomerIds.size;

    // ================= PENDING ORDERS =================
    let pendingOrders = orders.filter(o =>
        (o.status || "Pending") === "Pending"
    );
    document.getElementById("pendingOrders").innerText = pendingOrders.length;

    // ================= COMPLETED ORDERS =================
    let completedOrders = orders.filter(o =>
        o.status === "Completed"
    );
    document.getElementById("completedOrders").innerText = completedOrders.length;

    // ================= TODAY ORDERS =================
    let today = new Date().toISOString().split("T")[0];

    let todayOrders = orders.filter(o =>
        o.orderDate === today
    );
    document.getElementById("todayOrders").innerText = todayOrders.length;

    // ================= PAYMENTS CALCULATION =================
    // FIX: Calculate remaining per customer (group all payments by customerId)
    // to avoid wrong totals when a customer has made multiple payments

    let customerPaymentMap = {};

    payments.forEach(p => {
        let id = p.customerId;
        if (!customerPaymentMap[id]) {
            customerPaymentMap[id] = { total: 0, paid: 0 };
        }
        customerPaymentMap[id].total = Number(p.total) || 0; // latest total overrides
        customerPaymentMap[id].paid += Number(p.paid) || 0;  // accumulate all paid
    });

    let pendingAmount = Object.values(customerPaymentMap).reduce((sum, c) => {
        let remaining = c.total - c.paid;
        return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    document.getElementById("pendingPayments").innerText = "Rs. " + pendingAmount;

    // ================= RECENT ORDERS =================
    let table = document.getElementById("recentOrders");

    if (!table) return;

    table.innerHTML = "";

    orders.slice(-5).reverse().forEach(o => {

        let status = o.status || "Pending";

        let statusClass =
            status === "Completed" ? "ready" :
            status === "Stitching" ? "stitching" :
            "pending";

        table.innerHTML += `
        <tr>
            <td>${o.customerId || "-"}</td>
            <td>${o.customerName || o.name || "-"}</td>
            <td>${o.dressType || "-"}</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td>${formatDate(o.deliveryDate)}</td>
        </tr>
        `;
    });
}