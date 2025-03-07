"use client";
import {
  Flex,
  Text,
  Column,
  Row,
  Accordion,
  Input,
  Select,
  PasswordInput,
  Button,
  Background,
} from "@/once-ui/components";
import React from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <Background
      fillWidth
      fillHeight
      background="overlay"
      padding="16"
      radius="xl"
      dots={{
        display: true,
        color: "accent-background-strong",
        size: "xl",
      }}
    >
      <Column>
        <Row direction="row" align="center" gap="xl">
          <Text as="h1" variant="heading-strong-l">
            Dashboard
          </Text>
          <Button
            property="primary"
            onClick={() => {
              router.push("/login");
            }}
          >
            Logout
          </Button>
        </Row>

        <Row gap="16" marginTop="16">
          <Column fillWidth>
            <Accordion title="Section 1">
              <Text>Content for section 1</Text>
            </Accordion>
          </Column>
          <Column fillWidth>
            <Accordion title="Section 2">
              <Text>Content for section 2</Text>
            </Accordion>
          </Column>
        </Row>
        <Row gap="16" marginTop="16">
          <Column fillWidth>
            <Input id="input1" label="Input 1" />
          </Column>
          <Column fillWidth>
            <Select
              id="select1"
              label="Select 1"
              options={[
                { value: "option1", label: "Option 1" },
                { value: "option2", label: "Option 2" },
              ]}
            />
          </Column>
          <Column fillWidth>
            <PasswordInput id="password1" label="Password" />
          </Column>
        </Row>
      </Column>
    </Background>
  );
}
