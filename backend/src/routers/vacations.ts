import { Router } from "express";
import bodyValidation from "../middlewares/body-validation";
import paramsValidation from "../middlewares/params-validation";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";
import adminEnforce from "../middlewares/admin-enforce";
import { createVacation, deleteVacation, getVacation, updateVacation } from "../controllers/vacations/controller";
import { newVacationFilesValidator, newVacationValidator, updateVacationFilesValidator, updateVacationValidator, vacationIdValidator } from "../controllers/vacations/validator";

const vacationsRouter = Router()

vacationsRouter.get('/:vacationId', paramsValidation(vacationIdValidator), getVacation)
vacationsRouter.post('/', adminEnforce, bodyValidation(newVacationValidator), filesValidation(newVacationFilesValidator), fileUploader, createVacation)
vacationsRouter.patch('/:vacationId', adminEnforce, paramsValidation(vacationIdValidator), bodyValidation(updateVacationValidator), filesValidation(updateVacationFilesValidator), fileUploader, updateVacation)
vacationsRouter.delete('/:vacationId', adminEnforce, paramsValidation(vacationIdValidator), deleteVacation)

export default vacationsRouter