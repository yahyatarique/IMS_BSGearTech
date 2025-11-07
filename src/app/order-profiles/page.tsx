"use client";
import { useEffect, useState } from "react";
import {
  Flex,
  Column,
  Heading,
  Text,
  Card,
  Button,
  Line,
} from "@/once-ui/components";
import { OrderProfile } from "@prisma/client";

const OrderProfilePage = () => {
  const [orderProfiles, setOrderProfiles] = useState<OrderProfile[]>([]);

  useEffect(() => {
    if (typeof window != "undefined") {
      const fetchOrderProfiles = async () => {
        const response = await fetch("/api/order-profiles");
        const data = await response.json();
        setOrderProfiles(data.orderProfiles);
      };
      fetchOrderProfiles();
    }
  }, []);

  return (
    <Flex direction="column" padding="32" minHeight={"l"}>
      <Flex horizontal="space-between">
        <Heading as="h1" variant="display-default-l" marginBottom="24">
          Order Profiles
        </Heading>
        <Button label="Add Order Profile" href="/order-profiles/new" />
      </Flex>
      <Line marginY="64" />
      <Column gap="16">
        {orderProfiles.map((profile) => (
          <Card
            key={profile.id}
            padding="16"
            shadow="m"
            width={"s"}
            background="brand-weak"
            radius="s"
          >
            <Column gap="8" flex="1">
              <Heading as="h3" variant="heading-default-m" marginBottom="8">
                {profile.name}
              </Heading>
              <Text>Type: {profile.type}</Text>
              <Text>Material: {profile.material}</Text>
              <Text>Material Rate: ₹{profile.materialRate}/mm</Text>
              <Text>
                Cut Size: {profile.cutSizeWidth}mm x {profile.cutSizeHeight}mm
              </Text>
              <Text>Burning Wastage: {profile.burningWastage}%</Text>
              <Text>Heat Treatment Rate: ₹{profile.heatTreatmentRate}/kg</Text>
              <Text>
                Heat Treatment Inefficacy: {profile.heatTreatmentInefficacy}%
              </Text>
              <Text>
                Available Inventory: {profile.availableInventory} units
              </Text>
            </Column>
            <Column vertical="center" horizontal="end" gap="8">
              <Button label="Edit" href={`/order-profiles/${profile.id}/edit`} />
              <Button
                label="View Orders"
                href={`/order-profile/${profile.id}/orders`}
              />
            </Column>
          </Card>
        ))}
      </Column>
    </Flex>
  );
};

export default OrderProfilePage;
