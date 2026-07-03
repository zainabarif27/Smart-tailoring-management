document.addEventListener("DOMContentLoaded", () => {
    let current = JSON.parse(localStorage.getItem("currentOrder"));

    if (current) {
        document.getElementById("customerId").value = current.customerId || "";

        // FIX: current object may store name as either 'name' or 'customerName'
        document.getElementById("customerName").value = current.customerName || current.name || "";
    }
});

document.getElementById("measureForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let customerId   = document.getElementById("customerId").value.trim();
    let customerName = document.getElementById("customerName").value.trim();
    let dressType    = document.getElementById("dressType").value.trim();

    // FIX: Basic validation — don't save if essential fields are empty
    if (!customerId || !customerName) {
        alert("Customer ID and Name are required.");
        return;
    }

    // ================= SAVE MEASUREMENTS =================
    let measurements = JSON.parse(localStorage.getItem("measurements")) || {};

    measurements[customerId] = {
        customerId,
        customerName,
        dressType,
        chest:        document.getElementById("chest").value,
        shoulder:     document.getElementById("shoulder").value,
        sleeve:       document.getElementById("sleeve").value,
        neck:         document.getElementById("neck").value,
        waist:        document.getElementById("waist").value,
        hip:          document.getElementById("hip").value,
        thigh:        document.getElementById("thigh").value,
        knee:         document.getElementById("knee").value,
        cuff:         document.getElementById("cuff").value,
        instructions: document.getElementById("instructions").value,
    };

    localStorage.setItem("measurements", JSON.stringify(measurements));

    // ================= TOKEN LOGIC =================
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    // FIX: Trim and stringify both sides to avoid type/whitespace mismatch
    let index = orders.findIndex(
        o => String(o.customerId).trim() === String(customerId).trim()
    );

    let token;

    if (index !== -1 && orders[index].token) {
        // Existing order with a valid token → reuse it
        token = orders[index].token;
    } else {
        // New order OR existing order missing a token → generate a new token
        let counter = Number(localStorage.getItem("tokenCounter")) || 0;
        counter++;
        localStorage.setItem("tokenCounter", String(counter));
        token = "#" + String(counter).padStart(4, "0");
    }

    // Safety check — should never happen, but guards against silent failures
    if (!token) {
        alert("Error: Token could not be generated. Please try again.");
        return;
    }

    // ================= SAVE ORDER =================
    let orderData = {
        customerId,
        customerName,
        dressType,
        // FIX: Keep original order date on update; set today's date for new orders
        orderDate:    index !== -1
                        ? orders[index].orderDate
                        : new Date().toISOString().split("T")[0],
        deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        token,
        // FIX: Keep existing status and amount on update; default for new orders
        status:      index !== -1 ? orders[index].status      : "Pending",
        totalAmount: index !== -1 ? orders[index].totalAmount : 0
    };

    if (index !== -1) {
        orders[index] = orderData;
    } else {
        orders.push(orderData);
    }

    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Saved Successfully! Token: " + token);
});