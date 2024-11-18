import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50 })
    codigoProducto!: string;

    @Column({ type: "varchar", length: 100 })
    denominacion!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    precioVenta!: number;
}
