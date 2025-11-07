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
import { Buyer } from "@prisma/client";

const BuyerPage = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    const fetchBuyers = async () => {
      const response = await fetch("/api/buyers");
      const data = await response.json();
      setBuyers(data.buyers);
    };

    fetchBuyers();
  }, []);

  return (
    <Flex direction="column" padding="32" minHeight={"l"}>
      <Flex horizontal="space-between">
        <Heading as="h1" variant="display-default-l" marginBottom="24">
          Buyers
        </Heading>
        <Button label="Add Buyer" href="/buyers/new" />
      </Flex>
      <Line marginY="64" />
      <Column gap="16">
        {buyers.map((buyer) => (
          <Card
            key={buyer.id}
            padding="16"
            shadow="m"
            width={"s"}
            background="brand-weak"
            radius="s"
          >
            <Column gap="8" flex="1">
              <Heading as="h3" variant="heading-default-m" marginBottom="8">
                {buyer.name}
              </Heading>
              <Text>{buyer.contactName}</Text>
              <Text>+91 {buyer.mobile}</Text>
              <Text>Organization: {buyer.orgName}</Text>
              <Text>Address: {buyer.orgAddress}</Text>
            </Column>
            <Column vertical="center" horizontal="end" gap="8">
              <Button label="Edit" href={`/buyer/${buyer.id}/edit`} />
              <Button label="View Orders" href={`/buyer/${buyer.id}/orders`} />
            </Column>
          </Card>
        ))}
      </Column>
    </Flex>
  );
};

export default BuyerPage;
