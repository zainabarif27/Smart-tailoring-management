let customers = JSON.parse(localStorage.getItem("customers")) || [];

// ==========================
// GENERATE CUSTOMER ID
// ==========================
function generateCustomerId() {
    let id = "CUST-" + String(customers.length + 1).padStart(3, "0");
    document.getElementById("customerId").value = id;
}
generateCustomerId();

// ==========================
// PHONE LOOKUP
// Auto-fills existing customer info when phone is entered
// ==========================
document.getElementById("phone").addEventListener("blur", function () {
    let phone = this.value.trim();
    let found = customers.find(c => c.phone === phone);

    if (found) {
        document.getElementById("customerName").value = found.name     || "";
        document.getElementById("address").value      = found.address  || "";
        document.getElementById("customerId").value   = found.customerId;
    }
});

// ==========================
// SAVE ORDER
// Delivery date is calculated silently as order date + 10 days
// ==========================
function saveOrder() {

    let customerId = document.getElementById("customerId").value;
    let name       = document.getElementById("customerName").value.trim();
    let phone      = document.getElementById("phone").value.trim();
    let address    = document.getElementById("address").value.trim();
    let orderDate  = document.getElementById("orderDate").value;

    if (!name || !phone || !address || !orderDate) {
        alert("Please fill all required fields.");
        return;
    }

    // FIX: Calculate delivery date silently — not shown to user
    let d = new Date(orderDate);
    d.setDate(d.getDate() + 10);
    let deliveryDate = d.toISOString().split("T")[0];

    // ================= CUSTOMER =================
    // Update existing customer instead of duplicating
    let existingIndex = customers.findIndex(c => c.phone === phone);

    let customer = {
        customerId,
        name,
        phone,
        address,
        orderDate,
        deliveryDate,
        token: "",
        status: "Pending",
        totalAmount: 0
    };

    if (existingIndex !== -1) {
        customer.customerId = customers[existingIndex].customerId;
        customers[existingIndex] = customer;
    } else {
        customers.push(customer);
    }

    localStorage.setItem("customers", JSON.stringify(customers));

    // ================= ORDERS =================
    // Save/update in orders so dashboard and orders page show correct delivery date
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let orderIndex = orders.findIndex(o => o.customerId === customer.customerId);

    let orderData = {
        customerId:   customer.customerId,
        customerName: name,
        phone,
        address,
        orderDate,
        deliveryDate,
        token:       orderIndex !== -1 ? orders[orderIndex].token       : "",
        status:      orderIndex !== -1 ? orders[orderIndex].status      : "Pending",
        totalAmount: orderIndex !== -1 ? orders[orderIndex].totalAmount : 0
    };

    if (orderIndex !== -1) orders[orderIndex] = orderData;
    else orders.push(orderData);

    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("currentOrder", JSON.stringify(customer));

    alert("Order Saved ✅");
    generateCustomerId();
    window.location.href = "measurements.html";
}