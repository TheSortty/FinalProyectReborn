import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Producto } from "./Producto.js";
import { PedidoVenta } from "./PedidoVenta.js";

@Entity("pedido_venta_detalle")
export class PedidoVentaDetalle {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int", name: "idproducto" })
    idproducto!: number;

    @Column({ type: "int", name: "cantidad", nullable: false })
    cantidad!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "subtotal", nullable: false })
    subtotal!: number;

    // Relación con la entidad Producto
    @ManyToOne(() => Producto, { eager: true })
    @JoinColumn({ name: "idproducto" })
    producto!: Producto;

    // Relación con la entidad PedidoVenta usando una función flecha para evitar la referencia circular
    @ManyToOne(() => PedidoVenta, { lazy: true })
    @JoinColumn({ name: "idpedidoventa" })
    pedidoVenta!: Promise<PedidoVenta>;
}
