import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responsePayload);
};

export const errorResponse = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  error?: any
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    ...(error ? { error } : {}),
  };
  return res.status(statusCode).json(responsePayload);
};
