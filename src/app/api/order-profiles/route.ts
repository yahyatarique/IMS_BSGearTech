import { MaterialType, PrismaClient, ProfileType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface OrderProfilePOST {
  name: string;
  type: ProfileType;
  material: MaterialType;
  materialRate: number;
  cutSizeWidth: number;
  cutSizeHeight: number;
  burningWastage: number;
  heatTreatmentRate: number;
  heatTreatmentInefficacy: number;
  availableInventory: number;
}

export async function POST(request: NextRequest) {
  const {
    name,
    type,
    material,
    materialRate,
    cutSizeWidth,
    cutSizeHeight,
    burningWastage,
    heatTreatmentRate,
    heatTreatmentInefficacy,
    availableInventory,
  } = (await request.json()) as OrderProfilePOST;

  // Validations
  if (
    !name ||
    !type ||
    !material ||
    materialRate === undefined ||
    cutSizeWidth === undefined ||
    cutSizeHeight === undefined ||
    burningWastage === undefined ||
    heatTreatmentRate === undefined ||
    heatTreatmentInefficacy === undefined ||
    availableInventory === undefined
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

  const orderProfile = await prisma.orderProfile.create({
    data: {
      name,
      type,
      material,
      materialRate,
      cutSizeWidth,
      cutSizeHeight,
      burningWastage,
      heatTreatmentRate,
      heatTreatmentInefficacy,
      availableInventory,
    },
  });

  return NextResponse.json(
    {
      orderProfile,
    },
    {
      status: 200,
    }
  );
}

export async function GET(request: NextRequest) {
  const orderProfiles = await prisma.orderProfile.findMany();

  return NextResponse.json(
    {
      orderProfiles,
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
    type,
    material,
    materialRate,
    cutSizeWidth,
    cutSizeHeight,
    burningWastage,
    heatTreatmentRate,
    heatTreatmentInefficacy,
    availableInventory,
  } = (await request.json()) as OrderProfilePOST & { id: number };

  // Validations
  if (
    !id ||
    !name ||
    !type ||
    !material ||
    materialRate === undefined ||
    cutSizeWidth === undefined ||
    cutSizeHeight === undefined ||
    burningWastage === undefined ||
    heatTreatmentRate === undefined ||
    heatTreatmentInefficacy === undefined ||
    availableInventory === undefined
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

  const orderProfile = await prisma.orderProfile.update({
    where: {
      id,
    },
    data: {
      name,
      type,
      material,
      materialRate,
      cutSizeWidth,
      cutSizeHeight,
      burningWastage,
      heatTreatmentRate,
      heatTreatmentInefficacy,
      availableInventory,
    },
  });

  return NextResponse.json(
    {
      orderProfile,
    },
    {
      status: 200,
    }
  );
}
