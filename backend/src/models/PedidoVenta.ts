// PedidoVenta.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Cliente } from "./Cliente.js";
import { PedidoVentaDetalle } from "./PedidoVentaDetalle.js";

@Entity("pedido_venta")
export class PedidoVenta {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.id, { eager: true })
    @JoinColumn({ name: "idcliente" })
    cliente!: Cliente;

    @Column({ type: "date", name: "fechaPedido", nullable: false })
    fechaPedido!: Date;

    @Column({ type: "int", name: "nroComprobante", nullable: false })
    nroComprobante!: number;

    @Column({ type: "varchar", length: 50, name: "formaPago", nullable: false })
    formaPago!: string;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "totalPedido", nullable: false })
    totalPedido!: number;

    @Column({ type: "int", name: "borrado", default: 0 })
    borrado!: number;

    @OneToMany(() => PedidoVentaDetalle, (detalle) => detalle.pedidoVenta, { lazy: true })
    detalles!: Promise<PedidoVentaDetalle[]>;
}
