var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Producto } from "./Producto.js";
import { PedidoVenta } from "./PedidoVenta.js";
let PedidoVentaDetalle = class PedidoVentaDetalle {
    id;
    idproducto;
    cantidad;
    subtotal;
    // Relación con la entidad Producto
    producto;
    // Relación con la entidad PedidoVenta usando una función flecha para evitar la referencia circular
    pedidoVenta;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], PedidoVentaDetalle.prototype, "id", void 0);
__decorate([
    Column({ type: "int", name: "idproducto" }),
    __metadata("design:type", Number)
], PedidoVentaDetalle.prototype, "idproducto", void 0);
__decorate([
    Column({ type: "int", name: "cantidad", nullable: false }),
    __metadata("design:type", Number)
], PedidoVentaDetalle.prototype, "cantidad", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 2, name: "subtotal", nullable: false }),
    __metadata("design:type", Number)
], PedidoVentaDetalle.prototype, "subtotal", void 0);
__decorate([
    ManyToOne(() => Producto, { eager: true }),
    JoinColumn({ name: "idproducto" }),
    __metadata("design:type", Producto)
], PedidoVentaDetalle.prototype, "producto", void 0);
__decorate([
    ManyToOne(() => PedidoVenta, { lazy: true }),
    JoinColumn({ name: "idpedidoventa" }),
    __metadata("design:type", Promise)
], PedidoVentaDetalle.prototype, "pedidoVenta", void 0);
PedidoVentaDetalle = __decorate([
    Entity("pedido_venta_detalle")
], PedidoVentaDetalle);
export { PedidoVentaDetalle };
