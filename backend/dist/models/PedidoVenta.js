var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// PedidoVenta.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Cliente } from "./Cliente.js";
import { PedidoVentaDetalle } from "./PedidoVentaDetalle.js";
let PedidoVenta = class PedidoVenta {
    id;
    cliente;
    fechaPedido;
    nroComprobante;
    formaPago;
    totalPedido;
    borrado;
    detalles;
};
__decorate([
    PrimaryGeneratedColumn({ name: "id" }),
    __metadata("design:type", Number)
], PedidoVenta.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Cliente, (cliente) => cliente.id, { eager: true }),
    JoinColumn({ name: "idcliente" }),
    __metadata("design:type", Cliente)
], PedidoVenta.prototype, "cliente", void 0);
__decorate([
    Column({ type: "date", name: "fechaPedido", nullable: false }),
    __metadata("design:type", Date)
], PedidoVenta.prototype, "fechaPedido", void 0);
__decorate([
    Column({ type: "int", name: "nroComprobante", nullable: false }),
    __metadata("design:type", Number)
], PedidoVenta.prototype, "nroComprobante", void 0);
__decorate([
    Column({ type: "varchar", length: 50, name: "formaPago", nullable: false }),
    __metadata("design:type", String)
], PedidoVenta.prototype, "formaPago", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 2, name: "totalPedido", nullable: false }),
    __metadata("design:type", Number)
], PedidoVenta.prototype, "totalPedido", void 0);
__decorate([
    Column({ type: "int", name: "borrado", default: 0 }),
    __metadata("design:type", Number)
], PedidoVenta.prototype, "borrado", void 0);
__decorate([
    OneToMany(() => PedidoVentaDetalle, (detalle) => detalle.pedidoVenta, { lazy: true }),
    __metadata("design:type", Promise)
], PedidoVenta.prototype, "detalles", void 0);
PedidoVenta = __decorate([
    Entity("pedido_venta")
], PedidoVenta);
export { PedidoVenta };
