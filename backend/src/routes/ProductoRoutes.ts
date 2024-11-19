import { Router } from "express";
import { ProductoController } from "../controllers/ProductoController.js";

const router = Router();

router.post("/productos", ProductoController.createProducto);
router.get("/productos", ProductoController.getAllProductos);

export default router;
