import { Router } from "express";
import bodyValidation from "../middlewares/body-validation";
import aiConfigured from "../middlewares/ai-configured";
import { generateItinerary } from "../controllers/itinerary/controller";
import { itineraryValidator } from "../controllers/itinerary/validator";

const itineraryRouter = Router()

itineraryRouter.post('/', aiConfigured, bodyValidation(itineraryValidator), generateItinerary)

export default itineraryRouter