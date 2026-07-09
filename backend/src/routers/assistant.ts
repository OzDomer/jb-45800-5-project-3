import { Router } from "express";
import bodyValidation from "../middlewares/body-validation";
import aiConfigured from "../middlewares/ai-configured";
import { ask } from "../controllers/assistant/controller";
import { assistantValidator } from "../controllers/assistant/validator";

const assistantRouter = Router()

assistantRouter.post('/', aiConfigured, bodyValidation(assistantValidator), ask)

export default assistantRouter