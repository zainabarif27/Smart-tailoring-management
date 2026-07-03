console.log("Payments Page Loaded - FIXED VERSION v4");

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
// HELPERS
// ==========================
function getCustomers() {
    return JSON.parse(localStorage.getItem("customers")) || [];
}

function getOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
}

function getPayments() {
    return JSON.parse(localStorage.getItem("payments")) || [];
}

// ==========================
// LOAD CUSTOMERS
// ==========================
function loadCustomers() {
    let select = document.getElementById("customerSelect");
    let customers = getCustomers();

    select.innerHTML = `<option value="">Select Customer</option>`;

    customers.forEach(c => {
        select.innerHTML += `
            <option value="${c.customerId}">
                ${c.name || "No Name"} | ${c.phone || "No Phone"}
            </option>
        `;
    });
}

// ==========================
// SEARCH CUSTOMER
// ==========================
function searchCustomer() {
    let input = document.getElementById("searchBox").value.toLowerCase();
    let customers = getCustomers();
    let select = document.getElementById("customerSelect");

    select.innerHTML = `<option value="">Select Customer</option>`;

    customers
        .filter(c =>
            (c.name || "").toLowerCase().includes(input) ||
            (c.phone || "").includes(input)
        )
        .forEach(c => {
            select.innerHTML += `
                <option value="${c.customerId}">
                    ${c.name} | ${c.phone}
                </option>
            `;
        });
}

// ==========================
// TOKEN SEARCH
// ==========================
function searchByToken() {
    let token = document.getElementById("tokenSearch").value.trim();
    if (!token) return;

    if (!token.startsWith("#")) token = "#" + token;

    let orders = getOrders();
    let order = orders.find(o => (o.token || "") === token);

    if (!order) {
        alert("Token not found");
        clearInvoice();
        return;
    }

    let select = document.getElementById("customerSelect");
    select.value = order.customerId || "";

    fillCustomerData(order.customerId, token);
}

// ==========================
// LIVE CALCULATION
// ==========================
function calculateLive() {
    let customerId = document.getElementById("customerSelect").value;

    let total    = Number(document.getElementById("total").value) || 0;
    let livePaid = Number(document.getElementById("paid").value)  || 0;

    let paidFromHistory = 0;
    if (customerId) {
        let payments = getPayments();
        paidFromHistory = payments
            .filter(p => p.customerId === customerId)
            .reduce((sum, p) => sum + Number(p.paid || 0), 0);
    }

    let totalPaid = paidFromHistory + livePaid;
    let remaining = total - totalPaid;

    document.getElementById("remaining").value = remaining;
    document.getElementById("status").value =
        remaining <= 0 && total > 0 ? "Paid" : "Pending";
}

// FIX: your HTML calls calculateRemaining(), map it to calculateLive()
function calculateRemaining() {
    calculateLive();
}

// ==========================
// MAIN ENGINE
// ==========================
function fillCustomerData(customerId = null, specificToken = null) {

    let id = customerId || document.getElementById("customerSelect").value;

    if (!id) {
        clearInvoice();
        return;
    }

    let customers = getCustomers();
    let orders    = getOrders();
    let payments  = getPayments();

    let customer = customers.find(c => c.customerId === id);
    if (!customer) {
        clearInvoice();
        return;
    }

    // If a specific token was provided, only use that order
    let customerOrders = specificToken
        ? orders.filter(o => o.customerId === id && o.token === specificToken)
        : orders.filter(o => o.customerId === id);

    // Get token from matched order
    let token = specificToken
        ? specificToken
        : (customerOrders.length ? customerOrders[0].token : "-");

    let firstOrder = customerOrders.length ? customerOrders[0] : null;

    // BASE TOTAL
    let totalFromOrders = customerOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount || o.total || 0), 0
    );

    let totalInputEl = document.getElementById("total");
    let liveTotal    = totalInputEl.value !== "" ? Number(totalInputEl.value) : totalFromOrders;

    // HISTORY PAYMENTS
    let paidFromHistory = payments
        .filter(p => p.customerId === id)
        .reduce((sum, p) => sum + Number(p.paid || 0), 0);

    let livePaid  = Number(document.getElementById("paid").value) || 0;

    // FINAL VALUES
    let total     = liveTotal;
    let totalPaid = paidFromHistory + livePaid;
    let remaining = total - totalPaid;

    // ================= FORM =================
    document.getElementById("total").value     = total;
    document.getElementById("remaining").value = remaining;
    document.getElementById("status").value    =
        remaining <= 0 && total > 0 ? "Paid" : "Pending";

    // FIX: Autofill tokenSearch field with the customer's token
    document.getElementById("tokenSearch").value = token !== "-" ? token : "";

    // ================= TOKEN CARD =================
    let tokenCard = document.getElementById("tokenCard");
    if (tokenCard) {
        tokenCard.style.display = "block";
        document.getElementById("tokenNumber").innerText      = token;
        document.getElementById("tId").innerText              = customer.customerId       || "-";
        document.getElementById("tName").innerText            = customer.name             || "-";
        document.getElementById("tDress").innerText           = firstOrder?.dressType     || "-";
        document.getElementById("tOrderDate").innerText       = formatDate(firstOrder?.orderDate);
        document.getElementById("tDeliveryDate").innerText    = formatDate(firstOrder?.deliveryDate);
    }

    // ================= INVOICE PREVIEW =================
    let lastPayment = payments
        .filter(p => p.customerId === id)
        .slice(-1)[0];

    document.getElementById("invNo").innerText     = lastPayment ? lastPayment.invoiceNo : "Will generate on save";
    document.getElementById("invName").innerText   = customer.name   || "-";
    document.getElementById("invPhone").innerText  = customer.phone  || "-";
    document.getElementById("invToken").innerText  = token;                          // FIX: token autofills in invoice
    document.getElementById("invDress").innerText  = firstOrder?.dressType || "-";  // FIX: dress was never filled
    document.getElementById("invTotal").innerText  = total;
    document.getElementById("invPaid").innerText   = totalPaid;
    document.getElementById("invRemain").innerText = remaining;
    document.getElementById("invStatus").innerText =
        remaining <= 0 && total > 0 ? "Paid" : "Pending";
}

// ==========================
// SAVE PAYMENT
// ==========================
function savePayment() {

    let customerId = document.getElementById("customerSelect").value;
    let total      = Number(document.getElementById("total").value)     || 0;
    let paid       = Number(document.getElementById("paid").value)      || 0;
    let remaining  = Number(document.getElementById("remaining").value) || 0;
    let date       = document.getElementById("date").value
                        || new Date().toISOString().split("T")[0];
    let notes      = document.getElementById("notes").value || "";

    if (!customerId || paid <= 0) {
        alert("Invalid payment data. Please select a customer and enter a paid amount.");
        return;
    }

    let invoiceNo = "INV-" + Date.now();

    let payments = getPayments();

    payments.push({
        invoiceNo,
        customerId,
        total,
        paid,
        remaining,
        date,
        notes
    });

    localStorage.setItem("payments", JSON.stringify(payments));

    // Update invoice panel immediately with new INV number
    document.getElementById("invNo").innerText = invoiceNo;

    alert("Payment Saved ✅\nInvoice No: " + invoiceNo);

    document.getElementById("paid").value = "";

    loadPayments();
    fillCustomerData(customerId);
}

// ==========================
// RESET FORM
// FIX: your HTML calls resetForm(), added it here
// ==========================
function resetForm() {
    document.getElementById("customerSelect").value = "";
    document.getElementById("searchBox").value      = "";
    document.getElementById("tokenSearch").value    = "";
    document.getElementById("notes").value          = "";
    document.getElementById("date").value           = "";
    clearInvoice();
}

// ==========================
// CLEAR INVOICE
// ==========================
function clearInvoice() {
    document.getElementById("invNo").innerText     = "-";
    document.getElementById("invName").innerText   = "-";
    document.getElementById("invPhone").innerText  = "-";
    document.getElementById("invToken").innerText  = "-";
    document.getElementById("invDress").innerText  = "-";
    document.getElementById("invTotal").innerText  = "0";
    document.getElementById("invPaid").innerText   = "0";
    document.getElementById("invRemain").innerText = "0";
    document.getElementById("invStatus").innerText = "Pending";

    // Hide and reset token card
    let tokenCard = document.getElementById("tokenCard");
    if (tokenCard) {
        tokenCard.style.display                           = "none";
        document.getElementById("tokenNumber").innerText = "#----";
        document.getElementById("tId").innerText         = "";
        document.getElementById("tName").innerText       = "";
        document.getElementById("tDress").innerText      = "";
        document.getElementById("tOrderDate").innerText  = "";
        document.getElementById("tDeliveryDate").innerText = "";
    }

    document.getElementById("total").value     = "";
    document.getElementById("paid").value      = "";
    document.getElementById("remaining").value = "";
    document.getElementById("status").value    = "Pending";
}

// ==========================
// LOAD PAYMENTS
// ==========================
function loadPayments() {
    let payments  = getPayments();
    let customers = getCustomers();
    let box       = document.getElementById("paymentList");

    box.innerHTML = "";

    if (payments.length === 0) {
        box.innerHTML = "<p>No payments recorded yet.</p>";
        return;
    }

    payments.slice().reverse().forEach(p => {
        let customer     = customers.find(c => c.customerId === p.customerId);
        let customerName = customer ? customer.name : p.customerId;

        box.innerHTML += `
            <p>
                ${p.invoiceNo} | 
                ${customerName} | 
                Rs ${p.paid} | 
                Remaining: Rs ${p.remaining ?? "-"} | 
                ${formatDate(p.date)}
            </p>
        `;
    });
}

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    loadCustomers();
    loadPayments();

    document.getElementById("total").addEventListener("input", calculateLive);
    document.getElementById("paid").addEventListener("input", calculateLive);
});