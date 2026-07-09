import { AllowNull, BelongsToMany, Column, DataType, Default, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import Vacation from "./Vacation";
import Like from "./Like";
import { Role } from "./enums";

// underscored: true means that if i declare a field name firstName in TS
// the SQL equivalent will be first_name
@Table({
    underscored: true
})
export default class User extends Model {

    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string

    @AllowNull(false)
    @Column(DataType.STRING(30))
    firstName: string

    @AllowNull(false)
    @Column(DataType.STRING(30))
    lastName: string

    @AllowNull(false)
    @Index({ unique: true })
    @Column(DataType.STRING)
    email: string

    // nullable: users signing in with google oauth have no password
    @AllowNull(true)
    @Column(DataType.STRING)
    password: string

    @AllowNull(false)
    @Default(Role.User)
    @Column(DataType.ENUM(...Object.values(Role)))
    role: Role

    @BelongsToMany(() => Vacation, () => Like, 'userId', 'vacationId')
    likedVacations: Vacation[]

}