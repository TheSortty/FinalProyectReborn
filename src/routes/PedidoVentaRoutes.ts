import { Router } from "express";
import { PedidoVentaController } from "../controllers/PedidoVentaController.js";

const router = Router();

// Crear un nuevo pedido
router.post("/pedidos", PedidoVentaController.createPedido);

// Obtener todos los pedidos
router.get("/pedidos", PedidoVentaController.getAllPedidos);

// Obtener un pedido por su ID
router.get("/pedidos/:id", PedidoVentaController.getPedidoById);

// Actualizar un pedido existente (PUT)
router.put("/pedidos/:id", PedidoVentaController.updatePedido);

// Eliminar un pedido existente (DELETE)
router.delete("/pedidos/:id", PedidoVentaController.deletePedido);

export default router;
