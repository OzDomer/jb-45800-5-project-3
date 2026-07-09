import { Router } from "express";
import bodyValidation from "../middlewares/body-validation";
import paramsValidation from "../middlewares/params-validation";
import queryValidation from "../middlewares/query-validation";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";
import adminEnforce from "../middlewares/admin-enforce";
import { createVacation, deleteVacation, getVacation, getVacations, updateVacation } from "../controllers/vacations/controller";
import { listVacationsValidator, newVacationFilesValidator, newVacationValidator, updateVacationFilesValidator, updateVacationValidator, vacationIdValidator } from "../controllers/vacations/validator";
import { like, unlike } from "../controllers/likes/controller";

const vacationsRouter = Router()

vacationsRouter.get('/', queryValidation(listVacationsValidator), getVacations)
vacationsRouter.get('/:vacationId', paramsValidation(vacationIdValidator), getVacation)
vacationsRouter.post('/', adminEnforce, bodyValidation(newVacationValidator), filesValidation(newVacationFilesValidator), fileUploader, createVacation)
vacationsRouter.patch('/:vacationId', adminEnforce, paramsValidation(vacationIdValidator), bodyValidation(updateVacationValidator), filesValidation(updateVacationFilesValidator), fileUploader, updateVacation)
vacationsRouter.delete('/:vacationId', adminEnforce, paramsValidation(vacationIdValidator), deleteVacation)

vacationsRouter.post('/:vacationId/like', paramsValidation(vacationIdValidator), like)
vacationsRouter.delete('/:vacationId/like', paramsValidation(vacationIdValidator), unlike)

export default vacationsRouter