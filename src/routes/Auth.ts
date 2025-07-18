import { Router } from "express";
import * as AuthController from "$controllers/rest/AuthController";
import { validateRegister, validateLogin } from "$validations/authValidation";

const AuthRoutes = Router({ mergeParams: true });

AuthRoutes.post("/register", validateRegister, AuthController.register);
AuthRoutes.post("/login", validateLogin, AuthController.login);

export default AuthRoutes;
