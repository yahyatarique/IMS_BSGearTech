import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/models';
import { CreateUserSchema } from '@/schemas/user.schema';
import { testConnection } from '@/db/connection';
import { USER_ROLES } from '@/enums/users.enum';
import { jwtVerify } from 'jose';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    // Get and verify access token
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret);
    const userRole = payload.role as string;

    // Check if user is admin (Super Admin or Admin)
    if (userRole !== USER_ROLES.SUPER_ADMIN && userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    // Get and verify access token
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret);
    const userRole = payload.role as string;

    // Check if user is admin (Super Admin or Admin)
    if (userRole !== USER_ROLES.SUPER_ADMIN && userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = CreateUserSchema.parse(body);

    // Only allow creating users with role '2' (USER)
    // Admins cannot create other admins through this endpoint
    if (validatedData.role && validatedData.role !== USER_ROLES.USER) {
      return NextResponse.json(
        { error: 'You can only create users with USER role' },
        { status: 403 }
      );
    }

    // Check if username already exists
    const existingUser = await User.findOne({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Create new user with role '2' (USER)
    const newUser = await User.create({
      username: validatedData.username,
      password: validatedData.password,
      role: USER_ROLES.USER, // Force USER role
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      status: 'active',
    });

    // Return user data (exclude password)
    const userData = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      status: newUser.status,
      created_at: newUser.created_at,
    };

    return NextResponse.json({
      message: 'User created successfully',
      user: userData,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}