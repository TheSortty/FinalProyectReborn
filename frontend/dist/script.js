"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_URL = "http://localhost:3000/api/pedidos";
const CLIENTES_API_URL = "http://localhost:3000/api/clientes";
const PRODUCTOS_API_URL = "http://localhost:3000/api/productos";
const searchByNumeroBtn = document.getElementById("searchByNumeroBtn");
const searchByDateRangeBtn = document.getElementById("searchByDateRangeBtn");
const pedidosTableBody = document.getElementById("pedidosTableBody");
const createPedidoBtn = document.getElementById("createPedidoBtn");
const pedidoModal = document.getElementById("pedidoModal");
const closeModal = document.querySelector(".close");
const pedidoForm = document.getElementById("pedidoForm");
const clienteSelect = document.getElementById("clienteSelect");
const productosContainer = document.getElementById("productosContainer");
const totalPedidoSpan = document.getElementById("totalPedido");
const fechaPedidoInput = document.getElementById("fechaPedido");
const formaPagoInput = document.getElementById("formaPago");
// Inputs de búsqueda
const searchNumeroInput = document.getElementById("searchComprobante");
const startDateInput = document.getElementById("searchFechaInicio");
const endDateInput = document.getElementById("searchFechaFin");
let currentPedidoId = null;
let productos = [];
let productosDisponibles = [];
let isEditing = false;
// Mostrar lista de pedidos
function fetchPedidos() {
    return __awaiter(this, arguments, void 0, function* (query = "") {
        try {
            const response = yield fetch(`${API_URL}${query}`);
            const pedidos = yield response.json();
            pedidosTableBody.innerHTML = pedidos
                .map((pedido) => `
      <tr>
        <td>${pedido.id}</td>
        <td>${pedido.cliente.razonSocial}</td>
        <td>${pedido.fechaPedido}</td>
        <td>${pedido.nroComprobante}</td>
        <td>${pedido.formaPago}</td>
        <td>${pedido.totalPedido != null ? Number(pedido.totalPedido).toFixed(2) : "0.00"}</td>
        <td>
          <button class="btn btn-edit" data-id="${pedido.id}">Editar</button>
          <button class="btn btn-delete" data-id="${pedido.id}">Eliminar</button>
          <button class="btn btn-pdf" data-id="${pedido.id}">PDF</button>
        </td>
      </tr>
    `)
                .join("");
            addTableEventListeners();
        }
        catch (error) {
            console.error("Error al cargar pedidos:", error);
        }
    });
}
// Manejar eventos de botones
function addTableEventListeners() {
    // Botones de Editar
    document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            const id = e.target.getAttribute("data-id");
            if (id) {
                // Mostrar confirmación antes de editar
                const shouldEdit = confirm("Los productos serán eliminados si desea continuar con la edición. ¿Desea continuar?");
                if (shouldEdit) {
                    currentPedidoId = Number(id);
                    yield loadPedido(Number(id)); // Cargar los datos del pedido
                    openModal(true); // Abrir el modal en modo edición
                }
                else {
                    // Si se cancela la edición, vuelve a la vista principal (nada adicional necesario, solo no abrir el modal)
                    console.log("Edición cancelada por el usuario.");
                }
            }
        }));
    });
    // Botones de Eliminar
    document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            const id = e.target.getAttribute("data-id");
            if (id) {
                yield deletePedido(Number(id));
                fetchPedidos(); // Refrescar la lista de pedidos después de eliminar
            }
        }));
    });
    // Botones de PDF
    document.querySelectorAll(".btn-pdf").forEach((btn) => {
        btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            const id = e.target.getAttribute("data-id");
            if (id) {
                yield generatePDF(Number(id));
            }
        }));
    });
}
// Eliminar pedido
function deletePedido(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fetch(`${API_URL}/${id}`, { method: "DELETE" });
        }
        catch (error) {
            console.error("Error al eliminar pedido:", error);
        }
    });
}
// Generar PDF
function generatePDF(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/${id}/pdf`);
            const blob = yield response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `pedido_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
        catch (error) {
            console.error("Error al generar PDF:", error);
        }
    });
}
// Abrir modal
function openModal(editMode = false) {
    isEditing = editMode;
    if (isEditing) {
        document.getElementById("modalTitle").textContent = "Editar Pedido";
        // No reseteamos el formulario porque estamos editando un pedido existente.
    }
    else {
        document.getElementById("modalTitle").textContent = "Crear Pedido";
        resetForm(); // Limpiar el formulario cuando es un nuevo pedido.
    }
    pedidoModal.style.display = "block";
    calculateTotal(); // Actualizar el total en el formulario modal.
}
// Cerrar modal
closeModal.addEventListener("click", () => {
    pedidoModal.style.display = "none";
    resetForm();
});
// Evento para el botón "Crear Pedido"
createPedidoBtn.addEventListener("click", () => {
    openModal(false); // Abrir el modal en modo de creación
});
// Cargar clientes en el select
function loadClientes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(CLIENTES_API_URL);
            const clientes = yield response.json();
            clienteSelect.innerHTML = clientes
                .map((cliente) => `
            <option value="${cliente.id}">${cliente.razonSocial}</option>
        `)
                .join("");
        }
        catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    });
}
// Cargar productos disponibles
function loadProductos() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(PRODUCTOS_API_URL);
            productosDisponibles = yield response.json();
        }
        catch (error) {
            console.error("Error al cargar productos:", error);
        }
    });
}
// Cargar pedido en el formulario para edición
function loadPedido(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/${id}`);
            const pedido = yield response.json();
            clienteSelect.value = String(pedido.cliente.id);
            document.getElementById("nroComprobante").value = String(pedido.nroComprobante);
            fechaPedidoInput.value = pedido.fechaPedido;
            formaPagoInput.value = pedido.formaPago;
            productos = pedido.detalles || [];
            renderProductos();
            calculateTotal();
        }
        catch (error) {
            console.error("Error al cargar el pedido:", error);
        }
    });
}
// Renderizar productos en el formulario
// Renderizar productos en el formulario
function renderProductos() {
    productosContainer.innerHTML = productos
        .map((producto, index) => `
        <div class="producto-row" data-index="${index}">
            <select class="producto-select">
                ${productosDisponibles
        .map((prod) => {
        const precioVenta = typeof prod.precioVenta === 'string' ? parseFloat(prod.precioVenta) : prod.precioVenta;
        return `<option value="${prod.id}" ${producto.idproducto === prod.id ? "selected" : ""}>
                            ${prod.denominacion} - $${precioVenta.toFixed(2)}
                        </option>`;
    })
        .join("")}
            </select>
            <input type="number" class="producto-cantidad" value="${producto.cantidad}" min="1" />
            <span class="producto-subtotal">${producto.subtotal.toFixed(2)}</span>
            <button type="button" class="remove-producto-btn">Eliminar</button>
        </div>
    `)
        .join("");
    document.querySelectorAll(".remove-producto-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            var _a;
            const index = Number((_a = e.target.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("data-index"));
            productos.splice(index, 1);
            renderProductos();
            calculateTotal();
        });
    });
    document.querySelectorAll(".producto-select, .producto-cantidad").forEach((elem) => {
        elem.addEventListener("change", () => {
            productos.forEach((producto, index) => {
                const row = productosContainer.children[index];
                const select = row.querySelector(".producto-select");
                const cantidad = row.querySelector(".producto-cantidad");
                const selectedProducto = productosDisponibles.find((p) => p.id === Number(select.value));
                if (selectedProducto) {
                    producto.idproducto = selectedProducto.id;
                    producto.cantidad = Number(cantidad.value);
                    producto.subtotal = parseFloat(selectedProducto.precioVenta) * producto.cantidad;
                }
            });
            calculateTotal();
            renderProductos(); // Re-renderizar para actualizar subtotales
        });
    });
}
// Calcular total del pedido
function calculateTotal() {
    const total = productos.reduce((sum, producto) => sum + producto.subtotal, 0);
    totalPedidoSpan.textContent = total.toFixed(2);
}
// Resetear formulario
function resetForm() {
    pedidoForm.reset();
    productos = [];
    renderProductos();
    currentPedidoId = null;
}
// Agregar producto al pedido
document.getElementById("addProductoBtn").addEventListener("click", () => {
    productos.push({ idproducto: 0, cantidad: 1, subtotal: 0 });
    renderProductos();
});
// Guardar pedido (crear o editar)
pedidoForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const clienteId = clienteSelect.value;
    const nroComprobante = document.getElementById("nroComprobante").value;
    // Obtener el valor de la fecha y asegurarse de que esté en el formato correcto
    const fechaInput = document.querySelector('#fechaPedido').value;
    const fechaPedido = formatDate(fechaInput); // Utilizar la función para asegurar el formato correcto
    const formaPago = formaPagoInput.value;
    const data = {
        idcliente: clienteId,
        nroComprobante,
        fechaPedido,
        formaPago,
        detalles: productos,
    };
    try {
        if (isEditing && currentPedidoId) {
            // Editar pedido existente
            yield fetch(`${API_URL}/${currentPedidoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }
        else {
            // Crear un nuevo pedido
            yield fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }
        fetchPedidos(); // Actualizar la lista de pedidos después de crear/editar
        pedidoModal.style.display = "none"; // Cerrar el modal
        resetForm(); // Limpiar el formulario
    }
    catch (error) {
        console.error("Error al guardar pedido:", error);
    }
}));
// Función para formatear la fecha en 'YYYY-MM-DD' 
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate() + 1;
    // Formatear la fecha para tener el formato correcto 'YYYY-MM-DD'
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedDay = day < 10 ? `0${day}` : day.toString();
    return `${year}-${formattedMonth}-${formattedDay}`;
}
function searchByComprobante() {
    return __awaiter(this, void 0, void 0, function* () {
        const nroComprobante = document.querySelector('#searchComprobante').value;
        const response = yield fetch(`${API_URL}/comprobante/${nroComprobante}`);
        const pedido = yield response.json();
        console.log(pedido);
        if (pedido) {
            // Mostrar el pedido en la tabla (al final de la página)
            const searchResultContainer = document.getElementById("searchResultContainer");
            searchResultContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Fecha de Pedido</th>
                        <th>Nro Comprobante</th>
                        <th>Forma de Pago</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${pedido.id}</td>
                        <td>${pedido.cliente.razonSocial}</td>
                        <td>${pedido.fechaPedido}</td>
                        <td>${pedido.nroComprobante}</td>
                        <td>${pedido.formaPago}</td>
                        <td>${pedido.totalPedido != null ? Number(pedido.totalPedido).toFixed(2) : "0.00"}</td>
                    </tr>
                </tbody>
            </table>
        `;
        }
        else {
            alert("No se encontró el pedido con ese número de comprobante.");
        }
    });
}
// Buscar por rango de fechas
function searchByDateRange() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!startDateInput || !endDateInput) {
            alert("Por favor, ingrese ambas fechas.");
            return;
        }
        const fechaInicio = startDateInput.value;
        const fechaFin = endDateInput.value;
        if (!fechaInicio || !fechaFin) {
            alert("Por favor, ingrese ambas fechas.");
            return;
        }
        try {
            // Corregir URL con parámetros query
            const response = yield fetch(`${API_URL}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            const pedidos = yield response.json();
            const searchResultContainer = document.getElementById("searchResultContainer");
            if (pedidos.length > 0) {
                searchResultContainer.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Fecha de Pedido</th>
                            <th>Nro Comprobante</th>
                            <th>Forma de Pago</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos
                    .map((pedido) => `
                            <tr>
                                <td>${pedido.id}</td>
                                <td>${pedido.cliente.razonSocial}</td>
                                <td>${pedido.fechaPedido}</td>
                                <td>${pedido.nroComprobante}</td>
                                <td>${pedido.formaPago}</td>
                                <td>${pedido.totalPedido != null ? Number(pedido.totalPedido).toFixed(2) : "0.00"}</td>
                            </tr>
                        `)
                    .join("")}
                    </tbody>
                </table>
            `;
            }
            else {
                searchResultContainer.innerHTML = "<p>No se encontraron pedidos en el rango de fechas proporcionado.</p>";
            }
        }
        catch (error) {
            console.error("Error al buscar pedidos por rango de fechas:", error);
            alert("Error al buscar pedidos por rango de fechas. Por favor, inténtelo de nuevo.");
        }
    });
}
document.getElementById('searchByFecha').addEventListener('click', searchByDateRange);
document.getElementById('searchByComprobante').addEventListener('click', searchByComprobante);
// Inicializar
loadClientes();
loadProductos();
fetchPedidos();
