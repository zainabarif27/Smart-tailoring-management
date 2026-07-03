console.log("Orders page loaded");

// ==========================
// DATE FORMAT HELPER
// Converts YYYY-MM-DD → DD/MM/YYYY
// ==========================
function formatDate(dateStr) {
    if (!dateStr) return "-";
    let parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ==========================
// LOAD ORDERS
// ==========================
function loadOrders() {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let tbody = document.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No orders found</td></tr>`;
        return;
    }

    orders.forEach((order) => {

        tbody.innerHTML += `
            <tr>
                <td>${order.customerId || "-"}</td>
                <td>${order.customerName || order.name || "-"}</td>
                <td>${order.dressType || "-"}</td>

                <td>
                    <select onchange="updateStatus('${order.customerId}', this.value)">
                        <option value="Pending"   ${order.status === "Pending"   ? "selected" : ""}>Pending</option>
                        <option value="Stitching" ${order.status === "Stitching" ? "selected" : ""}>Stitching</option>
                        <option value="Ready"     ${order.status === "Ready"     ? "selected" : ""}>Ready</option>
                        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                        <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                    </select>
                </td>

                <td>${formatDate(order.deliveryDate)}</td>

                <td>
                    <i class="fa-solid fa-eye view"     onclick="viewOrder('${order.customerId}')"></i>
                    <i class="fa-solid fa-trash delete" onclick="deleteOrder('${order.customerId}')"></i>
                </td>
            </tr>
        `;
    });
}


// ==========================
// UPDATE STATUS
// ==========================
function updateStatus(customerId, newStatus) {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let index = orders.findIndex(o => o.customerId === customerId);

    if (index !== -1) {
        orders[index].status = newStatus;
        localStorage.setItem("orders", JSON.stringify(orders));

        let scrollY = window.scrollY;
        loadOrders();
        window.scrollTo(0, scrollY);
    }
}


// ==========================
// VIEW ORDER + MEASUREMENTS + PAYMENTS
// FIX: Added full payment history for this customer
// ==========================
function viewOrder(customerId) {

    let orders       = JSON.parse(localStorage.getItem("orders"))       || [];
    let measurements = JSON.parse(localStorage.getItem("measurements")) || {};
    let payments     = JSON.parse(localStorage.getItem("payments"))     || [];

    let order = orders.find(o => o.customerId === customerId);
    let m     = measurements[customerId];

    if (!order) {
        alert("Order not found");
        return;
    }

    // ---- PAYMENT SUMMARY ----
    let customerPayments = payments.filter(
    p => p.customerId === customerId
);

let totalAmount = 0;
let totalPaid = 0;
let totalRemain = 0;

if (customerPayments.length > 0) {
    let latestPayment = customerPayments[customerPayments.length - 1];

    totalAmount = Number(latestPayment.total || 0);

    totalPaid = customerPayments.reduce(
        (sum, payment) => sum + Number(payment.paid || 0),
        0
    );

    totalRemain = totalAmount - totalPaid;

    if (totalRemain < 0) {
        totalRemain = 0;
    }
}

    // Build payment history lines
    let paymentHistory = "";
    if (customerPayments.length === 0) {
        paymentHistory = "   No payments recorded yet.";
    } else {
        customerPayments.forEach((p, i) => {
            paymentHistory += `
   #${i + 1}  ${p.invoiceNo}
       Paid:      Rs. ${p.paid}
       Remaining: Rs. ${p.remaining ?? "-"}
       Date:      ${formatDate(p.date)}`;
        });
    }

    let details = `
🧾 ORDER DETAILS

ID:         ${order.customerId || "-"}
Token:      ${order.token || "-"}
Name:       ${order.customerName || order.name || "-"}
Dress Type: ${order.dressType || "-"}
Status:     ${order.status || "Pending"}

📅 Order Date:    ${formatDate(order.orderDate)}
📦 Delivery Date: ${formatDate(order.deliveryDate)}

📏 MEASUREMENTS
Chest:    ${m?.chest    || "-"}
Shoulder: ${m?.shoulder || "-"}
Sleeve:   ${m?.sleeve   || "-"}
Neck:     ${m?.neck     || "-"}
Waist:    ${m?.waist    || "-"}
Hip:      ${m?.hip      || "-"}
Thigh:    ${m?.thigh    || "-"}
Knee:     ${m?.knee     || "-"}
Cuff:     ${m?.cuff     || "-"}

📝 Instructions: ${m?.instructions || "-"}

💰 PAYMENT DETAILS
Total Amount:  Rs. ${totalAmount}
Total Paid:    Rs. ${totalPaid}
Remaining:     Rs. ${totalRemain > 0 ? totalRemain : 0}
Payment Status: ${totalRemain <= 0 && totalAmount > 0 ? "✅ Paid" : "⏳ Pending"}

📋 Payment History:${paymentHistory}
    `;

    alert(details);
}


// ==========================
// DELETE ORDER
// ==========================
function deleteOrder(customerId) {

    let confirmed = confirm("Are you sure you want to delete this order?");
    if (!confirmed) return;

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders = orders.filter(o => o.customerId !== customerId);
    localStorage.setItem("orders", JSON.stringify(orders));

    loadOrders();
}


// ==========================
// SEARCH
// ==========================
function searchOrders() {

    let searchBox = document.querySelector(".search-box input");
    if (!searchBox) return;

    let input = searchBox.value.toLowerCase();
    let rows  = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        let id   = row.children[0]?.innerText.toLowerCase() || "";
        let name = row.children[1]?.innerText.toLowerCase() || "";

        row.style.display = (id.includes(input) || name.includes(input)) ? "" : "none";
    });
}


// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    loadOrders();

    let searchBox = document.querySelector(".search-box input");
    if (searchBox) {
        searchBox.addEventListener("input", searchOrders);
    }
});