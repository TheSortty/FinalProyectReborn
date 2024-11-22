const API_URL = "http://localhost:3000/api/pedidos";
const CLIENTES_API_URL = "http://localhost:3000/api/clientes";

interface Pedido {
    id: number;
    cliente: { id: number; razonSocial: string };
    nroComprobante: number;
    totalPedido: number;
    detalles?: { idproducto: number; cantidad: number; subtotal: number }[];
}

const pedidosTableBody = document.getElementById("pedidosTableBody")!;
const createPedidoBtn = document.getElementById("createPedidoBtn")!;
const pedidoModal = document.getElementById("pedidoModal")!;
const closeModal = document.querySelector(".close")!;
const pedidoForm = document.getElementById("pedidoForm")! as HTMLFormElement;
const clienteSelect = document.getElementById("clienteSelect")! as HTMLSelectElement;
const productosContainer = document.getElementById("productosContainer")!;
const totalPedidoSpan = document.getElementById("totalPedido")! as HTMLSpanElement;

let currentPedidoId: number | null = null;
let productos: { idproducto: number; cantidad: number; subtotal: number }[] = [];

// Mostrar lista de pedidos
async function fetchPedidos() {
    try {
        const response = await fetch(API_URL);
        const pedidos: Pedido[] = await response.json();

        pedidosTableBody.innerHTML = pedidos
            .map(
                (pedido) => `
      <tr>
        <td>${pedido.id}</td>
        <td>${pedido.cliente.razonSocial}</td>
        <td>${typeof pedido.totalPedido === "number" ? pedido.totalPedido.toFixed(2) : "0.00"}</td>
        <td>
          <button class="btn btn-edit" data-id="${pedido.id}">Editar</button>
          <button class="btn btn-delete" data-id="${pedido.id}">Eliminar</button>
          <button class="btn btn-pdf" data-id="${pedido.id}">PDF</button>
        </td>
      </tr>
    `
            )
            .join("");

        addTableEventListeners();
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

// Manejar eventos de botones
function addTableEventListeners() {
    document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = (e.target as HTMLElement).getAttribute("data-id");
            if (id) {
                currentPedidoId = Number(id);
                await loadPedido(Number(id));
                openModal();
            }
        });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = (e.target as HTMLElement).getAttribute("data-id");
            if (id) {
                await deletePedido(Number(id));
                fetchPedidos();
            }
        });
    });

    document.querySelectorAll(".btn-pdf").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = (e.target as HTMLElement).getAttribute("data-id");
            if (id) {
                await generatePDF(Number(id));
            }
        });
    });
}

// Eliminar pedido
async function deletePedido(id: number) {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    } catch (error) {
        console.error("Error al eliminar pedido:", error);
    }
}

// Generar PDF
async function generatePDF(id: number) {
    try {
        const response = await fetch(`${API_URL}/${id}/pdf`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `pedido_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Error al generar PDF:", error);
    }
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
async function loadClientes() {
    try {
        const response = await fetch(CLIENTES_API_URL);
        const clientes = await response.json();
        clienteSelect.innerHTML = clientes
            .map(
                (cliente: { id: number; razonSocial: string }) => `
            <option value="${cliente.id}">${cliente.razonSocial}</option>
        `
            )
            .join("");
    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }
}

// Cargar pedido en el formulario para edición
async function loadPedido(id: number) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const pedido: Pedido = await response.json();

        clienteSelect.value = String(pedido.cliente.id);
        (document.getElementById("nroComprobante") as HTMLInputElement).value = String(pedido.nroComprobante);
        productos = pedido.detalles || [];
        renderProductos();
        calculateTotal();
    } catch (error) {
        console.error("Error al cargar el pedido:", error);
    }
}

// Renderizar productos
function renderProductos() {
    productosContainer.innerHTML = productos
        .map(
            (producto, index) => `
        <div class="producto-row" data-index="${index}">
            <input type="number" class="producto-id" value="${producto.idproducto}" />
            <input type="number" class="producto-cantidad" value="${producto.cantidad}" />
            <span class="producto-subtotal">${producto.subtotal.toFixed(2)}</span>
            <button type="button" class="remove-producto-btn">Eliminar</button>
        </div>
    `
        )
        .join("");

    document.querySelectorAll(".remove-producto-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = Number((e.target as HTMLElement).parentElement?.getAttribute("data-index"));
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
document.getElementById("addProductoBtn")!.addEventListener("click", () => {
    productos.push({ idproducto: 0, cantidad: 1, subtotal: 0 });
    renderProductos();
});

// Guardar pedido (crear o editar)
pedidoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const clienteId = clienteSelect.value;
    const nroComprobante = (document.getElementById("nroComprobante") as HTMLInputElement).value;
    const data = {
        idcliente: clienteId,
        nroComprobante,
        detalles: productos,
    };

    try {
        if (currentPedidoId) {
            // Editar pedido
            await fetch(`${API_URL}/${currentPedidoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // Crear pedido
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }
        fetchPedidos();
        pedidoModal.style.display = "none";
        resetForm();
    } catch (error) {
        console.error("Error al guardar pedido:", error);
    }
});

// Inicializar
loadClientes();
fetchPedidos();
