import { Router } from "express";
import adminEnforce from "../middlewares/admin-enforce";
import { likesCsv, likesReport } from "../controllers/reports/controller";

const reportsRouter = Router()

// reports are for admins only
reportsRouter.use('/', adminEnforce)
reportsRouter.get('/likes', likesReport)
reportsRouter.get('/csv', likesCsv)

export default reportsRouter