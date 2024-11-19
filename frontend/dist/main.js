"use strict";
const API_URL = "http://localhost:3000/api/pedidos";
const CLIENTS_API_URL = "http://localhost:3000/api/clientes";
const PRODUCTS_API_URL = "http://localhost:3000/api/productos";
// Referencias a elementos del DOM
const ordersTableBody = document.querySelector("#orders-table tbody");
const orderForm = document.querySelector("#order-form");
const clientSelect = document.querySelector("#client-select");
const orderDateInput = document.querySelector("#order-date");
const orderNumberInput = document.querySelector("#order-number");
const paymentMethodInput = document.querySelector("#payment-method");
const productsContainer = document.querySelector("#products-container");
const addProductBtn = document.querySelector("#add-product-btn");
const saveOrderBtn = document.querySelector("#save-order-btn");
const totalAmountSpan = document.querySelector("#total-amount");
// Función para obtener los pedidos del backend
async function fetchOrders() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Error al obtener la lista de pedidos");
        }
        const orders = await response.json();
        renderOrders(orders);
    }
    catch (error) {
        console.error("Error:", error);
    }
}
// Función para renderizar los pedidos en la tabla
function renderOrders(orders) {
    if (!ordersTableBody)
        return;
    ordersTableBody.innerHTML = "";
    orders.forEach((order) => {
        const totalPedido = parseFloat(order.totalPedido) || 0;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.cliente.razonSocial}</td>
            <td>${new Date(order.fechaPedido).toLocaleDateString()}</td>
            <td>${order.nroComprobante}</td>
            <td>${order.formaPago}</td>
            <td>$${totalPedido.toFixed(2)}</td>
            <td>
                <button class="edit-btn" data-id="${order.id}">Editar</button>
                <button class="delete-btn" data-id="${order.id}">Eliminar</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
        // Botón de eliminar
        const deleteBtn = row.querySelector(".delete-btn");
        deleteBtn?.addEventListener("click", () => deleteOrder(order.id));
    });
}
//Función para cargar clientes en el combo
async function fetchClients() {
    try {
        const response = await fetch(CLIENTS_API_URL);
        if (!response.ok) {
            throw new Error("Error al obtener los clientes");
        }
        const clients = await response.json();
        if (clientSelect) {
            clients.forEach((client) => {
                const option = document.createElement("option");
                option.value = client.id;
                option.textContent = client.razonSocial;
                clientSelect.appendChild(option);
            });
        }
    }
    catch (error) {
        console.error("Error al cargar clientes:", error);
    }
}
//Función para agregar un producto al formulario
function addProductRow(product) {
    const productRow = document.createElement("div");
    productRow.classList.add("product-row");
    productRow.innerHTML = `
        <select class="product-select">
            <option value="">Seleccione un producto</option>
        </select>
        <input type="number" class="product-quantity" placeholder="Cantidad" min="1" required>
        <button type="button" class="remove-product-btn">Eliminar</button>
    `;
    productsContainer?.appendChild(productRow);
    const productSelect = productRow.querySelector(".product-select");
    const quantityInput = productRow.querySelector(".product-quantity");
    fetchProducts(productSelect, product?.id);
    // Escuchar cambios en el producto o cantidad para recalcular el total
    productSelect?.addEventListener("change", calculateTotal);
    quantityInput?.addEventListener("input", calculateTotal);
    // Si es edición, prellenar datos
    if (product) {
        quantityInput.value = product.cantidad;
    }
    productRow.querySelector(".remove-product-btn").addEventListener("click", () => {
        productRow.remove();
        calculateTotal(); // Recalcular el total al eliminar un producto
    });
}
// Función para llenar productos en el select
async function fetchProducts(selectElement, selectedId) {
    try {
        const response = await fetch(PRODUCTS_API_URL);
        if (!response.ok) {
            throw new Error("Error al obtener los productos");
        }
        const products = await response.json();
        if (selectElement) {
            selectElement.innerHTML = '<option value="">Seleccione un producto</option>';
            products.forEach((product) => {
                const option = document.createElement("option");
                option.value = product.id.toString();
                option.textContent = `${product.denominacion} ($${Number(product.precioVenta).toFixed(2)})`;
                option.setAttribute("data-price", product.precioVenta); // Agregar precio como atributo
                selectElement.appendChild(option);
            });
            if (selectedId) {
                selectElement.value = selectedId.toString();
            }
        }
    }
    catch (error) {
        console.error("Error al cargar productos:", error);
    }
}
async function saveOrder(event) {
    event.preventDefault();
    const selectedClientId = clientSelect?.value;
    const orderDate = orderDateInput?.value;
    const orderNumber = orderNumberInput?.value;
    const paymentMethod = paymentMethodInput?.value;
    if (!selectedClientId || !orderDate || !orderNumber || !paymentMethod) {
        alert("Por favor, complete todos los campos.");
        return;
    }
    const products = [];
    const productRows = productsContainer?.querySelectorAll(".product-row");
    productRows?.forEach((row) => {
        const productId = row.querySelector(".product-select")?.value;
        const quantity = row.querySelector(".product-quantity")?.value;
        if (productId && quantity) {
            products.push({
                idproducto: parseInt(productId),
                cantidad: parseInt(quantity),
            });
        }
    });
    if (products.length === 0) {
        alert("Debe agregar al menos un producto.");
        return;
    }
    const order = {
        idcliente: parseInt(selectedClientId),
        fechaPedido: orderDate,
        nroComprobante: parseInt(orderNumber),
        formaPago: paymentMethod,
        detalles: products,
    };
    try {
        const orderId = saveOrderBtn.dataset.orderId; // Revisar si hay un ID en el botón
        const response = await fetch(orderId ? `${API_URL}/${orderId}` : API_URL, {
            method: orderId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(order),
        });
        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
            return;
        }
        alert(orderId ? "Pedido actualizado exitosamente." : "Pedido guardado exitosamente.");
        fetchOrders(); // Volver a cargar la lista de pedidos
        orderForm?.reset(); // Limpiar formulario
        totalAmountSpan.textContent = "0.00"; // Reiniciar el total
        saveOrderBtn.textContent = "Guardar Pedido";
        delete saveOrderBtn.dataset.orderId; // Eliminar el ID del botón
    }
    catch (error) {
        console.error("Error al guardar o actualizar el pedido:", error);
    }
}
// Función para calcular el total del pedido
function calculateTotal() {
    let total = 0;
    // Iterar sobre cada fila de producto
    const productRows = productsContainer?.querySelectorAll(".product-row");
    productRows?.forEach((row) => {
        const productSelect = row.querySelector(".product-select");
        const quantityInput = row.querySelector(".product-quantity");
        if (productSelect && quantityInput) {
            const selectedOption = productSelect.selectedOptions[0];
            const productPrice = selectedOption ? parseFloat(selectedOption.getAttribute("data-price") || "0") : 0;
            const quantity = parseInt(quantityInput.value) || 0;
            // Sumar subtotal al total
            total += productPrice * quantity;
        }
    });
    // Actualizar el total en el DOM
    if (totalAmountSpan) {
        totalAmountSpan.textContent = total.toFixed(2);
    }
}
//Borrado logico de un pedido venta
async function deleteOrder(orderId) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este pedido?");
    if (!confirmDelete)
        return;
    try {
        const response = await fetch(`${API_URL}/${orderId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error al eliminar el pedido: ${errorData.message}`);
            return;
        }
        alert("Pedido eliminado exitosamente.");
        fetchOrders(); // Volver a cargar la lista de pedidos
    }
    catch (error) {
        console.error("Error al eliminar el pedido:", error);
        alert("Error interno del servidor al intentar eliminar el pedido.");
    }
}
// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
    fetchOrders();
    fetchClients();
    addProductBtn?.addEventListener("click", () => addProductRow());
    orderForm?.addEventListener("submit", saveOrder);
});
