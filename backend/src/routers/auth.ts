import { json, Router } from "express";
import bodyValidation from "../middlewares/body-validation";
import { googleValidator, loginValidator, signupValidator } from "../controllers/auth/validator";
import { google, login, signup } from "../controllers/auth/controller";

const authRouter = Router()

authRouter.use('/', json())
authRouter.post('/signup', bodyValidation(signupValidator), signup)
authRouter.post('/login', bodyValidation(loginValidator), login)
authRouter.post('/google', bodyValidation(googleValidator), google)

export default authRouter