const API_URL = "http://localhost:3000/api/pedidos";
const CLIENTES_API_URL = "http://localhost:3000/api/clientes";
const PRODUCTOS_API_URL = "http://localhost:3000/api/productos";

interface Pedido {
    id: number;
    cliente: { id: number; razonSocial: string };
    nroComprobante: number;
    fechaPedido: string;
    formaPago: string;
    totalPedido: number;
    detalles?: { idproducto: number; cantidad: number; subtotal: number }[];
}

interface Producto {
    id: number;
    denominacion: string;
    precioVenta: number;
}
const searchByNumeroBtn = document.getElementById("searchByNumeroBtn")!;
const searchByDateRangeBtn = document.getElementById("searchByDateRangeBtn")!;
const pedidosTableBody = document.getElementById("pedidosTableBody")!;
const createPedidoBtn = document.getElementById("createPedidoBtn")!;
const pedidoModal = document.getElementById("pedidoModal")!;
const closeModal = document.querySelector(".close")!;
const pedidoForm = document.getElementById("pedidoForm")! as HTMLFormElement;
const clienteSelect = document.getElementById("clienteSelect")! as HTMLSelectElement;
const productosContainer = document.getElementById("productosContainer")!;
const totalPedidoSpan = document.getElementById("totalPedido")! as HTMLSpanElement;
const fechaPedidoInput = document.getElementById("fechaPedido")! as HTMLInputElement;
const formaPagoInput = document.getElementById("formaPago")! as HTMLInputElement;
// Inputs de búsqueda
const searchNumeroInput = document.getElementById("searchComprobante")! as HTMLInputElement;
const startDateInput = document.getElementById("searchFechaInicio") as HTMLInputElement | null;
const endDateInput = document.getElementById("searchFechaFin") as HTMLInputElement | null;


let currentPedidoId: number | null = null;
let productos: { idproducto: number; cantidad: number; subtotal: number }[] = [];
let productosDisponibles: Producto[] = [];
let isEditing = false;

// Mostrar lista de pedidos
async function fetchPedidos(query: string = "") {
    try {
        const response = await fetch(`${API_URL}${query}`);
        const pedidos: Pedido[] = await response.json();

        pedidosTableBody.innerHTML = pedidos
            .map(
                (pedido) => `
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
    // Botones de Editar
    document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = (e.target as HTMLElement).getAttribute("data-id");
            if (id) {
                // Mostrar confirmación antes de editar
                const shouldEdit = confirm("Los productos serán eliminados si desea continuar con la edición. ¿Desea continuar?");
                if (shouldEdit) {
                    currentPedidoId = Number(id);
                    await loadPedido(Number(id)); // Cargar los datos del pedido
                    openModal(true); // Abrir el modal en modo edición
                } else {
                    // Si se cancela la edición, vuelve a la vista principal (nada adicional necesario, solo no abrir el modal)
                    console.log("Edición cancelada por el usuario.");
                }
            }
        });
    });

    // Botones de Eliminar
    document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = (e.target as HTMLElement).getAttribute("data-id");
            if (id) {
                await deletePedido(Number(id));
                fetchPedidos(); // Refrescar la lista de pedidos después de eliminar
            }
        });
    });

    // Botones de PDF
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
function openModal(editMode: boolean = false) {
    isEditing = editMode;

    if (isEditing) {
        document.getElementById("modalTitle")!.textContent = "Editar Pedido";
        // No reseteamos el formulario porque estamos editando un pedido existente.
    } else {
        document.getElementById("modalTitle")!.textContent = "Crear Pedido";
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

// Cargar productos disponibles
async function loadProductos() {
    try {
        const response = await fetch(PRODUCTOS_API_URL);
        productosDisponibles = await response.json();
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Cargar pedido en el formulario para edicion
async function loadPedido(id: number) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const pedido: Pedido = await response.json();

        clienteSelect.value = String(pedido.cliente.id);
        (document.getElementById("nroComprobante") as HTMLInputElement).value = String(pedido.nroComprobante);
        fechaPedidoInput.value = pedido.fechaPedido;
        formaPagoInput.value = pedido.formaPago;
        productos = pedido.detalles || [];
        renderProductos();
        calculateTotal();
    } catch (error) {
        console.error("Error al cargar el pedido:", error);
    }
}

// Renderizar productos en el formulario
function renderProductos() {
    productosContainer.innerHTML = productos
        .map(
            (producto, index) => `
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

    document.querySelectorAll(".producto-select, .producto-cantidad").forEach((elem) => {
        elem.addEventListener("change", () => {
            productos.forEach((producto, index) => {
                const row = productosContainer.children[index] as HTMLDivElement;
                const select = row.querySelector(".producto-select") as HTMLSelectElement;
                const cantidad = row.querySelector(".producto-cantidad") as HTMLInputElement;

                const selectedProducto = productosDisponibles.find((p) => p.id === Number(select.value));
                if (selectedProducto) {
                    producto.idproducto = selectedProducto.id;
                    producto.cantidad = Number(cantidad.value);
                    producto.subtotal = parseFloat(selectedProducto.precioVenta as any) * producto.cantidad;
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
document.getElementById("addProductoBtn")!.addEventListener("click", () => {
    productos.push({ idproducto: 0, cantidad: 1, subtotal: 0 });
    renderProductos();
});



// Guardar pedido (crear o editar)
pedidoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const clienteId = clienteSelect.value;
    const nroComprobante = (document.getElementById("nroComprobante") as HTMLInputElement).value;

    // Obtener el valor de la fecha y asegurarse de que esté en el formato correcto
    const fechaInput = (document.querySelector('#fechaPedido') as HTMLInputElement).value;
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
            await fetch(`${API_URL}/${currentPedidoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // Crear un nuevo pedido
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }

        fetchPedidos(); // Actualizar la lista de pedidos despues de crear/editar
        pedidoModal.style.display = "none"; // Cerrar el modal
        resetForm(); // Limpiar el formulario
    } catch (error) {
        console.error("Error al guardar pedido:", error);
    }
});

// Funcion para formatear la fecha en 'YYYY-MM-DD' 
function formatDate(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate() + 1;

    // Formatear la fecha para tener el formato correcto 'YYYY-MM-DD'
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedDay = day < 10 ? `0${day}` : day.toString();

    return `${year}-${formattedMonth}-${formattedDay}`;
}
async function searchByComprobante() {
    const nroComprobante = (document.querySelector('#searchComprobante') as HTMLInputElement).value;
    const response = await fetch(`${API_URL}/comprobante/${nroComprobante}`);

    const pedido = await response.json();
    console.log(pedido);
    if (pedido) {
        // Mostrar el pedido en la tabla (al final de la pagina)
        const searchResultContainer = document.getElementById("searchResultContainer")!;
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
    } else {
        alert("No se encontró el pedido con ese número de comprobante.");
    }
}

// Buscar por rango de fechas
async function searchByDateRange() {
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
        // Corregir URL con parametros query
        const response = await fetch(`${API_URL}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        const pedidos: Pedido[] = await response.json();

        const searchResultContainer = document.getElementById("searchResultContainer")!;
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
                    .map(
                        (pedido) => `
                            <tr>
                                <td>${pedido.id}</td>
                                <td>${pedido.cliente.razonSocial}</td>
                                <td>${pedido.fechaPedido}</td>
                                <td>${pedido.nroComprobante}</td>
                                <td>${pedido.formaPago}</td>
                                <td>${pedido.totalPedido != null ? Number(pedido.totalPedido).toFixed(2) : "0.00"}</td>
                            </tr>
                        `
                    )
                    .join("")}
                    </tbody>
                </table>
            `;
        } else {
            searchResultContainer.innerHTML = "<p>No se encontraron pedidos en el rango de fechas proporcionado.</p>";
        }
    } catch (error) {
        console.error("Error al buscar pedidos por rango de fechas:", error);
        alert("Error al buscar pedidos por rango de fechas. Por favor, inténtelo de nuevo.");
    }
}


document.getElementById('searchByFecha')!.addEventListener('click', searchByDateRange);
document.getElementById('searchByComprobante')!.addEventListener('click', searchByComprobante);
// Inicializar
loadClientes();
loadProductos();
fetchPedidos();
