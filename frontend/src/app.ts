interface PedidoVenta {
  id: number;
  cliente: {
    id: number;
    cuit: string;
    razonSocial: string;
  };
  fechaPedido: string;
  nroComprobante: number;
  formaPago: string;
  totalPedido: number;
  borrado: number;
  detalles: {
    id: number;
    idproducto: number;
    cantidad: number;
    subtotal: number;
    producto?: {
      id: number;
      codigoProducto: string;
      denominacion: string;
      precioVenta: number;
    };
  }[];
}

// Función para obtener pedidos desde el backend
async function fetchPedidos(): Promise<PedidoVenta[]> {
  try {
    const response = await fetch("http://localhost:3000/api/pedidos"); // Cambia la URL según tu servidor
    if (!response.ok) {
      throw new Error("Error al obtener pedidos");
    }
    const pedidos: PedidoVenta[] = await response.json();
    return pedidos.filter(pedido => pedido.borrado === 0); // Filtrar pedidos no borrados
  } catch (error) {
    console.error("Error fetching pedidos:", error);
    return [];
  }
}

// Función para crear la tabla HTML
function renderPedidos(pedidos: PedidoVenta[]): void {
  const container = document.getElementById("pedidos-container");

  if (!container) {
    console.error("Contenedor de pedidos no encontrado");
    return;
  }

  if (pedidos.length === 0) {
    container.innerHTML = "<p>No hay pedidos disponibles.</p>";
    return;
  }

  // Crear la tabla
  const table = document.createElement("table");
  table.classList.add("pedidos-table");

  // Crear la cabecera
  table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Nro. Comprobante</th>
          <th>Forma de Pago</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${pedidos
      .map(
        (pedido) => `
          <tr>
            <td>${pedido.id}</td>
            <td>${pedido.cliente.razonSocial}</td>
            <td>${new Date(pedido.fechaPedido).toLocaleDateString()}</td>
            <td>${pedido.nroComprobante}</td>
            <td>${pedido.formaPago}</td>
            <td>$${parseFloat(pedido.totalPedido as any).toFixed(2)}</td>
            <td>
              <button class="btn-edit" data-id="${pedido.id}">Editar</button>
              <button class="btn-delete" data-id="${pedido.id}">Eliminar</button>
            </td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    `;

  // Agregar la tabla al contenedor
  container.innerHTML = ""; // Limpiar contenido anterior
  container.appendChild(table);

  // Agregar eventos a los botones de editar y eliminar
  const editButtons = document.querySelectorAll(".btn-edit");
  const deleteButtons = document.querySelectorAll(".btn-delete");

  editButtons.forEach((button) =>
    button.addEventListener("click", (event) =>
      handleEditClick((event.target as HTMLElement).dataset.id)
    )
  );

  /* deleteButtons.forEach((button) =>
    button.addEventListener("click", (event) =>
      handleDeleteClick((event.target as HTMLElement).dataset.id)
    )
  );*/
}
//Obtener productos
async function fetchProductos(): Promise<
  { id: number; codigoProducto: string; denominacion: string; precioVenta: number }[]
> {
  try {
    const response = await fetch("http://localhost:3000/api/productos");
    if (!response.ok) {
      throw new Error("Error al obtener la lista de productos.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}
//Obtener un Producto
async function fetchProductoById(idproducto: number): Promise<{ id: number; codigoProducto: string; denominacion: string; precioVenta: number } | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/productos/${idproducto}`);
    if (!response.ok) {
      console.warn(`Producto con ID ${idproducto} no encontrado.`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return null;
  }
}

//Obtener Clientes
async function fetchClientes(): Promise<{ id: number; razonSocial: string }[]> {
  try {
    const response = await fetch("http://localhost:3000/api/clientes");
    if (!response.ok) {
      throw new Error("Error al obtener la lista de clientes.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
}




async function handleEditClick(pedidoId: string | undefined): Promise<void> {
  if (!pedidoId) {
    console.error("ID de pedido no proporcionado.");
    return;
  }

  try {
    // Obtener el pedido con sus detalles desde el backend
    const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`);
    if (!response.ok) {
      throw new Error("Error al obtener los datos del pedido.");
    }
    const pedido: PedidoVenta = await response.json();

    // Mostrar el formulario de edición
    showEditForm(pedido);
  } catch (error) {
    console.error("Error al manejar la edición del pedido:", error);
  }
}

async function showEditForm(pedido: PedidoVenta): Promise<void> {
  const container = document.getElementById("app");

  if (!container) {
    console.error("Contenedor principal no encontrado.");
    return;
  }

  try {
    // Obtener la lista de clientes
    const clientes = await fetchClientes();

    // Obtener todos los productos disponibles
    const productos = await fetchProductos();

    // Crear el formulario de edición
    container.innerHTML = `
        <h2>Editar Pedido</h2>
        <form id="edit-form">
          <label for="cliente">Cliente:</label>
          <select id="cliente" required>
            ${clientes
        .map(
          (cliente) => `
              <option value="${cliente.id}" ${cliente.id === pedido.cliente.id ? "selected" : ""
            }>${cliente.razonSocial}</option>
            `
        )
        .join("")}
          </select>
          
          <label for="fechaPedido">Fecha del Pedido:</label>
          <input type="date" id="fechaPedido" value="${pedido.fechaPedido.slice(0, 10)}" required>
          
          <label for="nroComprobante">Nro. Comprobante:</label>
          <input type="number" id="nroComprobante" value="${pedido.nroComprobante}" required>
          
          <label for="formaPago">Forma de Pago:</label>
          <input type="text" id="formaPago" value="${pedido.formaPago}" required>
          
          <h3>Detalles del Pedido</h3>
          <div id="detalles-container">
            ${pedido.detalles
        .map(
          (detalle) => `
              <div class="detalle-item" data-id="${detalle.id}">
                <label>Producto:</label>
                <select class="producto-select" data-id="${detalle.id}">
                  ${productos
              .map(
                (producto) => `
                    <option value="${producto.id}" ${producto.id === detalle.idproducto ? "selected" : ""
                  }>${producto.denominacion}</option>
                  `
              )
              .join("")}
                </select>
                <label>Cantidad:</label>
                <input type="number" value="${detalle.cantidad}" data-id="${detalle.id}" required>
                <button type="button" class="remove-detail" data-id="${detalle.id}">Eliminar</button>
              </div>
            `
        )
        .join("")}
          </div>
          
          <button type="submit">Guardar Cambios</button>
          <button type="button" id="cancel-button">Cancelar</button>
        </form>
      `;

    // Manejar el envío del formulario
    const form = document.getElementById("edit-form");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await handleEditSubmit(pedido.id);
    });

    // Manejar eliminación de productos
    document.querySelectorAll(".remove-detail").forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.target as HTMLButtonElement;
        const detailId = target.dataset.id;

        if (detailId) {
          // Eliminar visualmente el detalle del pedido
          const detailElement = document.querySelector(
            `.detalle-item[data-id="${detailId}"]`
          );
          detailElement?.remove();
        }
      });
    });

    // Manejar cancelación
    const cancelButton = document.getElementById("cancel-button");
    cancelButton?.addEventListener("click", () => {
      main(); // Volver a la vista principal
    });
  } catch (error) {
    console.error("Error al mostrar el formulario de edición:", error);
    alert("Error al cargar los datos del pedido.");
  }
}


async function handleEditSubmit(pedidoId: number): Promise<void> {
  const clienteId = parseInt(
    (document.getElementById("cliente") as HTMLSelectElement).value,
    10
  );
  const fechaPedido = (document.getElementById("fechaPedido") as HTMLInputElement).value;
  const nroComprobante = parseInt(
    (document.getElementById("nroComprobante") as HTMLInputElement).value,
    10
  );
  const formaPago = (document.getElementById("formaPago") as HTMLInputElement).value;

  const detalles = Array.from(document.querySelectorAll(".detalle-item")).map(
    (item) => {
      const productoId = parseInt(
        (item.querySelector(".producto-select") as HTMLSelectElement).value,
        10
      );
      const cantidad = parseInt(
        (item.querySelector("input[type='number']") as HTMLInputElement).value,
        10
      );
      const detailId = parseInt(item.getAttribute("data-id")!, 10);

      return {
        id: detailId, // ID del detalle existente
        idproducto: productoId, // Nuevo ID del producto seleccionado
        cantidad,
      };
    }
  );

  // Verificar los datos que se están enviando
  console.log("Datos enviados al backend:", {
    idcliente: clienteId,
    fechaPedido,
    nroComprobante,
    formaPago,
    detalles,
  });

  try {
    const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idcliente: clienteId,
        fechaPedido,
        nroComprobante,
        formaPago,
        detalles,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error del servidor: ${errorData.message}`);
    }

    alert("Pedido actualizado exitosamente.");
    main(); 
  } catch (error) {
    console.error("Error al enviar los datos del pedido editado:", error);
    alert(`Error al actualizar el pedido: ${error}`);
  }
}

// Función principal
async function main(): Promise<void> {
  const pedidos = await fetchPedidos();
  renderPedidos(pedidos);
}

// Ejecutar la función principal
main();
