import { Router } from "express";
import { PedidoVentaController } from "../controllers/PedidoVentaController.js";

const router = Router();

// Rutas para la gestión de pedidos
router.post("/pedidos", PedidoVentaController.createPedido); // Crear un nuevo pedido
router.get("/pedidos", PedidoVentaController.getAllPedidos); // Obtener todos los pedidos (no borrados)
router.get("/pedidos/:id", PedidoVentaController.getPedidoById); // Obtener un pedido por su ID
router.put("/pedidos/:id", PedidoVentaController.updatePedido); // Actualizar un pedido existente
router.delete("/pedidos/:id", PedidoVentaController.deletePedido); // Borrado lógico de un pedido
router.get("/pedidos/:id/pdf", PedidoVentaController.generatePDF); // Generar un PDF para un pedido

export default router;
