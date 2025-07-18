import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

const userAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accesstoken } = req.headers;

    if (!accesstoken) {
      return res.status(401).json({
        status: false,
        message: "Access token required. Please login to continue.",
      });
    }

    const decoded: any = jwt.verify(
      accesstoken as string,
      process.env.JWT_SECRET!
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid access token. Please login again.",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // JWT verification error
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

const authentication = {
  userAuthentication,
};

export default authentication;
