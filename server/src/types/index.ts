import { Request } from 'express';

export enum Role {
  ADMIN = 'admin',
  PLACEMENT_OFFICER = 'placement_officer',
  STUDENT = 'student',
}

export interface IUserPayload {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}