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
const pedidosTableBody = document.getElementById("pedidosTableBody");
const createPedidoBtn = document.getElementById("createPedidoBtn");
const pedidoModal = document.getElementById("pedidoModal");
const closeModal = document.querySelector(".close");
const pedidoForm = document.getElementById("pedidoForm");
const clienteSelect = document.getElementById("clienteSelect");
const productosContainer = document.getElementById("productosContainer");
const totalPedidoSpan = document.getElementById("totalPedido");
let currentPedidoId = null;
let productos = [];
// Mostrar lista de pedidos
function fetchPedidos() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(API_URL);
            const pedidos = yield response.json();
            pedidosTableBody.innerHTML = pedidos
                .map((pedido) => `
      <tr>
        <td>${pedido.id}</td>
        <td>${pedido.cliente.razonSocial}</td>
        <td>${pedido.totalPedido.toFixed(2)}</td>
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
    document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            const id = e.target.getAttribute("data-id");
            if (id) {
                currentPedidoId = Number(id);
                yield loadPedido(Number(id));
                openModal();
            }
        }));
    });
    document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            const id = e.target.getAttribute("data-id");
            if (id) {
                yield deletePedido(Number(id));
                fetchPedidos();
            }
        }));
    });
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
function openModal() {
    pedidoModal.style.display = "block";
    calculateTotal();
}
// Cerrar modal
closeModal.addEventListener("click", () => {
    pedidoModal.style.display = "none";
    resetForm();
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
// Cargar pedido en el formulario para edición
function loadPedido(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/${id}`);
            const pedido = yield response.json();
            clienteSelect.value = String(pedido.cliente.id);
            document.getElementById("nroComprobante").value = String(pedido.nroComprobante);
            productos = pedido.detalles || [];
            renderProductos();
            calculateTotal();
        }
        catch (error) {
            console.error("Error al cargar el pedido:", error);
        }
    });
}
// Renderizar productos
function renderProductos() {
    productosContainer.innerHTML = productos
        .map((producto, index) => `
        <div class="producto-row" data-index="${index}">
            <input type="number" class="producto-id" value="${producto.idproducto}" />
            <input type="number" class="producto-cantidad" value="${producto.cantidad}" />
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
    const data = {
        idcliente: clienteId,
        nroComprobante,
        detalles: productos,
    };
    try {
        if (currentPedidoId) {
            // Editar pedido
            yield fetch(`${API_URL}/${currentPedidoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }
        else {
            // Crear pedido
            yield fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }
        fetchPedidos();
        pedidoModal.style.display = "none";
        resetForm();
    }
    catch (error) {
        console.error("Error al guardar pedido:", error);
    }
}));
// Inicializar
loadClientes();
fetchPedidos();
