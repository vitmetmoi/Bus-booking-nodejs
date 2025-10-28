import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

type ExceptionEntry = string | RegExp | { path: string | RegExp; methods?: string[] };

let exceptionPaths: ExceptionEntry[] = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/reset-password/confirm',
  '/auth/google',
  '/auth/google/callback',
  '/health-check',
  '/openapi',
  '/api-docs',
  '/docs',
  '/swagger',
  { path: /^\/uploads\//, methods: ['GET'] },
];

export const setAuthExceptionPaths = (paths: ExceptionEntry[]): void => {
  exceptionPaths = paths;
};

const isExceptionPath = (req: Request): boolean => {
  const method = req.method.toUpperCase();
  const url = (req.originalUrl || (req as any).url || (req as any).path) as string;

  return exceptionPaths.some((entry) => {
    if (typeof entry === 'string') {
      return url.startsWith(entry);
    }
    if (entry instanceof RegExp) {
      return entry.test(url);
    }
    const { path, methods } = entry;
    const pathMatch = typeof path === 'string' ? url.startsWith(path) : path.test(url);
    if (!pathMatch) return false;
    if (!methods || methods.length === 0) return true;
    return methods.map((m) => m.toUpperCase()).includes(method);
  });
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  console.log("req", req.originalUrl)
  if (isExceptionPath(req)) {
    console.log("isExceptionPath", isExceptionPath(req))
    next();
    return;
  }
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = (req as any).cookies?.access_token as string | undefined;
  const token = bearerToken || cookieToken;
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập',
      statusCode: 401,
    });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = user;
    console.log("user", user)
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      statusCode: 401
    });

  }
};

export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as { role: string } | undefined;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập',
        statusCode: 401,
      });
      return;
    }

    // if (!roles.includes(user.role)) {
    //   res.status(403).json({
    //     "success": false,
    //     message: 'Bạn không có quyền truy cập',
    //     statusCode: 403,
    //   });
    //   return;
    // }

    next();
  };
};

