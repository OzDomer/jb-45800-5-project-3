import { AllowNull, BelongsToMany, Column, DataType, Default, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "./User";
import Like from "./Like";

@Table({
    underscored: true
})
export default class Vacation extends Model {

    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string

    @AllowNull(false)
    @Column(DataType.STRING)
    destination: string

    @AllowNull(false)
    @Column(DataType.TEXT)
    description: string

    @AllowNull(false)
    @Column(DataType.DATEONLY)
    startDate: string

    @AllowNull(false)
    @Column(DataType.DATEONLY)
    endDate: string

    // MySQL returns DECIMAL as a string - cast with Number() when serializing
    @AllowNull(false)
    @Column(DataType.DECIMAL(8, 2))
    price: number

    @AllowNull(true)
    @Column(DataType.STRING)
    imageUrl: string

    @BelongsToMany(() => User, () => Like, 'vacationId', 'userId')
    likers: User[]

}