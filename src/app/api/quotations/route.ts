import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface QuotationPOST {
  purchaserId: number;
  poNumber: string;
  profileId: number;
  finishSizeWidth: number;
  finishSizeHeight: number;
  turningRate: number;
  teethCount: number;
  module: number;
  face: number;
  weight: number;
  materialCost: number;
  tcTgPrice: number;
  htCost: number;
  processCosts: Record<string, number>;
  grandTotal: number;
  profitMargin: number;
  totalOrderValue: number;
}

export async function POST(request: NextRequest) {
  const {
    purchaserId,
    poNumber,
    profileId,
    finishSizeWidth,
    finishSizeHeight,
    turningRate,
    teethCount,
    module,
    face,
    weight,
    materialCost,
    tcTgPrice,
    htCost,
    processCosts,
    grandTotal,
    profitMargin,
    totalOrderValue,
  } = (await request.json()) as QuotationPOST;

  // Validations
  if (
    !purchaserId ||
    !poNumber ||
    !profileId ||
    finishSizeWidth === undefined ||
    finishSizeHeight === undefined ||
    turningRate === undefined ||
    teethCount === undefined ||
    module === undefined ||
    face === undefined ||
    weight === undefined ||
    materialCost === undefined ||
    tcTgPrice === undefined ||
    htCost === undefined ||
    !processCosts ||
    grandTotal === undefined ||
    profitMargin === undefined ||
    totalOrderValue === undefined
  ) {
    return NextResponse.json(
      {
        message: "Missing required fields",
      },
      {
        status: 400,
      }
    );
  }

  const quotation = await prisma.quotation.create({
    data: {
      purchaserId,
      poNumber,
      profileId,
      finishSizeWidth,
      finishSizeHeight,
      turningRate,
      teethCount,
      module,
      face,
      weight,
      materialCost,
      tcTgPrice,
      htCost,
      processCosts,
      grandTotal,
      profitMargin,
      totalOrderValue,
    },
  });

  return NextResponse.json(
    {
      quotation,
    },
    {
      status: 200,
    }
  );
}

export async function GET(request: NextRequest) {
  const quotations = await prisma.quotation.findMany();

  return NextResponse.json(
    {
      quotations,
    },
    {
      status: 200,
    }
  );
}

export async function PUT(request: NextRequest) {
  const {
    id,
    purchaserId,
    poNumber,
    profileId,
    finishSizeWidth,
    finishSizeHeight,
    turningRate,
    teethCount,
    module,
    face,
    weight,
    materialCost,
    tcTgPrice,
    htCost,
    processCosts,
    grandTotal,
    profitMargin,
    totalOrderValue,
  } = (await request.json()) as QuotationPOST & { id: number };

  // Validations
  if (
    !id ||
    !purchaserId ||
    !poNumber ||
    !profileId ||
    finishSizeWidth === undefined ||
    finishSizeHeight === undefined ||
    turningRate === undefined ||
    teethCount === undefined ||
    module === undefined ||
    face === undefined ||
    weight === undefined ||
    materialCost === undefined ||
    tcTgPrice === undefined ||
    htCost === undefined ||
    !processCosts ||
    grandTotal === undefined ||
    profitMargin === undefined ||
    totalOrderValue === undefined
  ) {
    return NextResponse.json(
      {
        message: "Missing required fields",
      },
      {
        status: 400,
      }
    );
  }

  const quotation = await prisma.quotation.update({
    where: {
      id,
    },
    data: {
      purchaserId,
      poNumber,
      profileId,
      finishSizeWidth,
      finishSizeHeight,
      turningRate,
      teethCount,
      module,
      face,
      weight,
      materialCost,
      tcTgPrice,
      htCost,
      processCosts,
      grandTotal,
      profitMargin,
      totalOrderValue,
    },
  });

  return NextResponse.json(
    {
      quotation,
    },
    {
      status: 200,
    }
  );
}
