import { Router } from "express";
import { ClienteController } from "../controllers/ClienteController.js";
const router = Router();
// Ruta para crear un cliente
router.post("/clientes", ClienteController.createCliente);
// Ruta para obtener todos los clientes
router.get("/clientes", ClienteController.getAllClientes);
export default router;
