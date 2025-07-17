import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ServiceResponse, INTERNAL_SERVER_ERROR_SERVICE_RESPONSE } from '$entities/Service';
import Logger from '$pkg/logger';

const prisma = new PrismaClient();

export async function register(userData: any): Promise<ServiceResponse<any>> {
  try {
    const isUserExist = await prisma.user.findUnique({
        where: { email: userData.email }
    });
    
    if (isUserExist) {
        return {
            status: false,
            err: {
            message: 'Email already exists',
            code: 409
            }
        };
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])^.{8,}$/.test(userData.password)) {
        throw new Error(
            'Password should be at least 8 characters and has to contain a mixture of letters, numbers and at least one special character',
        );
    }
    
    if (userData.password !== userData.confirmPassword) {
        throw new Error("password & confirm password didn't match");
    };

    const hashPassword = await bcrypt.hash(userData.password, 10);

    const createUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashPassword,
        fullName: userData?.firstName + userData?.lastName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'USER',
        phoneNumber: userData.phoneNumber,
        country: userData.country,
        aboutYou: userData.aboutYou || "",
      },
    });

    const tokenPayload = {
        id: createUser.id,
        email: createUser.email,
        fullName: createUser.fullName,
        role: createUser.role
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    
    const token = jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: '24h',
    });
    
    return {
      status: true,
      data: {
        id: createUser.id,
        email: createUser.email,
        fullName: createUser.fullName,
        firstName: createUser.firstName,
        lastName: createUser.lastName,
        phoneNumber: createUser.phoneNumber,
        country: createUser.country,
        aboutYou: createUser.aboutYou,
        role: createUser.role,
        token
      }
    };
  } catch (err) {
    Logger.error(`AuthService.register : ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function login(loginData: any): Promise<ServiceResponse<any>> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: loginData.email }
    });

    if (!user) {
      return {
        status: false,
        err: {
          message: 'Invalid email or password',
          code: 401
        }
      };
    }

    const isValidPassword = await bcrypt.compare(loginData.password, user.password);

    if (!isValidPassword) {
      return {
        status: false,
        err: {
          message: 'Invalid email or password',
          code: 401
        }
      };
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: "24h",
    });

    return {
      status: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          token
        },
      }
    };

  } catch (err) {
    Logger.error(`AuthService.login : ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}