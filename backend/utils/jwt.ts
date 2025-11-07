import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ITokenPayload } from '../../shared/types/user.types';
import { ApiErrorCode } from '../../shared/types/api.types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: ITokenPayload): string => {
  // @ts-ignore - JWT type definitions have compatibility issues
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: ITokenPayload): string => {
  // @ts-ignore - JWT type definitions have compatibility issues
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRATION
  });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: ITokenPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(ApiErrorCode.TOKEN_EXPIRED);
    }
    throw new Error(ApiErrorCode.TOKEN_INVALID);
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(ApiErrorCode.TOKEN_EXPIRED);
    }
    throw new Error(ApiErrorCode.TOKEN_INVALID);
  }
};

/**
 * Decode token without verification (useful for debugging)
 */
export const decodeToken = (token: string): ITokenPayload | null => {
  try {
    return jwt.decode(token) as ITokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
