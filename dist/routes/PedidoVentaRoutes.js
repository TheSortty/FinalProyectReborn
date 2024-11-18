import { Router } from "express";
import { PedidoVentaController } from "../controllers/PedidoVentaController.js";
const router = Router();
router.post("/pedidos", PedidoVentaController.createPedido);
router.get("/pedidos", PedidoVentaController.getAllPedidos);
router.get("/pedidos/:id", PedidoVentaController.getPedidoById);
export default router;
