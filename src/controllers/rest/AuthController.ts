import { Request, Response } from 'express';
import * as AuthService from '$services/AuthService';
import { handleServiceErrorWithResponse, response_success } from '$utils/response.utils';

export async function register(req: Request, res: Response): Promise<Response> {
    const userData = req.body;
    
    const serviceResponse = await AuthService.register(userData);
    
    if (!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse);
    
    return response_success(res, serviceResponse.data, "Registration successful!");
}

export async function login(req: Request, res: Response): Promise<Response> {
    const loginData = req.body;
    
    const serviceResponse = await AuthService.login(loginData);
    
    if (!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse);
    
    return response_success(res, serviceResponse.data, "Login successful!");
}