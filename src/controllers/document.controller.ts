import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { successResponse, errorResponse } from '../utils/response';

export class DocumentController {
  static async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const data = await DocumentService.getDocuments(driverId);
      return successResponse(res, data, 'Documents retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to fetch documents', 500, error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const { document_type, expires_at, file_url, category } = req.body;
      const doc = await DocumentService.uploadDocument(driverId, document_type, expires_at, file_url, category);
      return successResponse(res, doc, 'Document uploaded/registered successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to upload document', 400, error);
    }
  }
}
