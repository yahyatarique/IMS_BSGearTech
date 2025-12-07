import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { CreateUserSchema } from '@/schemas/user.schema';
import sequelize, { testConnection } from '@/db/connection';
import { User } from '@/db/models';
import {
  errorResponse,
  sendResponse,
  validationErrorResponse
} from '../../../../utils/api-response';

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    const body = await request.json();

    // Validate request body
    const validatedData = CreateUserSchema.parse(body);
    const { username, password, firstName, lastName, role } = validatedData;

    // Start a transaction for database mutations
    const transaction = await sequelize.transaction();

    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { username },
        transaction
      });

      if (existingUser) {
        await transaction.rollback();
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }

      // Create new user
      const newUser = await User.create(
        {
          username,
          password: password,
          first_name: firstName,
          last_name: lastName,
          role: role
        },
        { transaction, hooks: true }
      );

      // Commit the transaction
      await transaction.commit();

      // Generate tokens
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

      // Access token (15 minutes)
      const accessToken = await new SignJWT({
        userId: newUser.dataValues.id,
        role: newUser.dataValues.role
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(secret);

      // Refresh token (7 days)
      const refreshToken = await new SignJWT({
        userId: newUser.dataValues.id,
        role: newUser.dataValues.role,
        type: 'refresh'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(refreshSecret);

      // Prepare user data (exclude sensitive information)
      const userData = {
        id: newUser.dataValues.id,
        username: newUser.dataValues.username,
        role: newUser.dataValues.role,
        first_name: newUser.dataValues.first_name,
        last_name: newUser.dataValues.last_name,
        created_at: newUser.dataValues.created_at
      };

      // Create response with user data only (tokens will be in cookies)
      const response = sendResponse(
        {
          user: userData
        },
        'Registration successful',
        201
      );

      // Set HTTP-only cookies for tokens
      // Access token - short lived (15 minutes)
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        // maxAge: 15 * 60, // 15 minutes in seconds
        path: '/'
      });

      // Refresh token - long lived (7 days)
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/'
      });

      return response;
    } catch (error: any) {
      // Rollback transaction on any error
      await transaction.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return validationErrorResponse('Validation Failed', error.errors);
    }

    // Handle Sequelize unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse('Username already exists', 409);
    }

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return validationErrorResponse('Validation failed', error);
    }

    // Generic error response
    return errorResponse('Internal server error', 500);
  }
}
