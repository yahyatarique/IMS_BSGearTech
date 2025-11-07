import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface BuyerPOST {
  name: string;
  contactName: string;
  mobile: string;
  gstNumber?: string;
  panNumber?: string;
  tinNumber?: string;
  orgName: string;
  orgAddress: string;
}

export async function POST(request: NextRequest) {
  const {
    name,
    contactName,
    mobile,
    gstNumber,
    panNumber,
    tinNumber,
    orgName,
    orgAddress,
  } = (await request.json()) as BuyerPOST;

  // Validations
  if (!name || !contactName || !mobile || !orgName || !orgAddress) {
    return NextResponse.json(
      {
        message: "Missing required fields",
      },
      {
        status: 400,
      }
    );
  }

  const buyer = await prisma.buyer.create({
    data: {
      name,
      contactName,
      mobile,
      gstNumber,
      panNumber,
      tinNumber,
      orgName,
      orgAddress,
    },
  });

  return NextResponse.json(
    {
      buyer,
    },
    {
      status: 200,
    }
  );
}

export async function GET(request: NextRequest) {
  const buyers = await prisma.buyer.findMany();

  return NextResponse.json(
    {
      buyers,
    },
    {
      status: 200,
    }
  );
}

export async function PUT(request: NextRequest) {
  const {
    id,
    name,
    contactName,
    mobile,
    gstNumber,
    panNumber,
    tinNumber,
    orgName,
    orgAddress,
  } = (await request.json()) as BuyerPOST & { id: number };

  // Validations
  if (!id || !name || !contactName || !mobile || !orgName || !orgAddress) {
    return NextResponse.json(
      {
        message: "Missing required fields",
      },
      {
        status: 400,
      }
    );
  }

  const buyer = await prisma.buyer.update({
    where: {
      id,
    },
    data: {
      name,
      contactName,
      mobile,
      gstNumber,
      panNumber,
      tinNumber,
      orgName,
      orgAddress,
    },
  });

  return NextResponse.json(
    {
      buyer,
    },
    {
      status: 200,
    }
  );
}
