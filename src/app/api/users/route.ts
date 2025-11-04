import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../db/models';
import { CreateUserSchema } from '../../../schemas/user.schema';
import { testConnection } from '../../../db/connection';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    // Check if user has admin role (from middleware headers)
    const userRole = request.headers.get('x-user-role');
    if (userRole !== '0') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'created_at'],
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

    // Check if user has admin role (from middleware headers)
    const userRole = request.headers.get('x-user-role');
    if (userRole !== '0') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = CreateUserSchema.parse(body);

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

    // Create new user
    const newUser = await User.create({
      username: validatedData.username,
      password: validatedData.password,
      role: validatedData.role || '2',
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
    });

    // Return user data (exclude password)
    const userData = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
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