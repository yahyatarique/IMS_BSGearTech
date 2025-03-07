import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface LoginPOST {
  username: string;
  password: string;
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log(request);

  const { username, password } = (await request.json()) as LoginPOST;

  if (username && password) {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
        password: password,
      },
    });

    console.log(user);

    if (!user) {
      // User not found
      return Response.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const token = "HELLO!@#$TOKENMASTER!@#$%";
    return NextResponse.json(
      {
        token,
        user,
      },
      {
        status: 200,
      }
    );
  } else {
    return NextResponse.json(
      {
        message: "Username and password are required",
        status: 400,
      },
      {
        status: 400,
      }
    );
  }
}
