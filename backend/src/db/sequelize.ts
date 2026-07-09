import { Sequelize } from "sequelize-typescript";
import config from 'config'
import User from "../models/User";
import Vacation from "../models/Vacation";
import Like from "../models/Like";

const sequelize = new Sequelize({
    dialect: 'mysql',
    models: [User, Vacation, Like],
    logging: console.log,
    ...config.get('db')
})

console.log(`connected to database on `, config.get('db'))

export default sequelize