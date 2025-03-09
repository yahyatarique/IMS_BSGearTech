"use client";
import {
  Background,
  Button,
  Column,
  Heading,
  Input,
  Logo,
  PasswordInput,
  Row,
  SmartLink,
  Text,
} from "@/once-ui/components";
import UsersService from "@/services/users/users.service";
import { setCookie } from "@/services/utils";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.scss";

interface LoginPageProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}

export const LoginPage = ({
  username,
  setUsername,
  password,
  setPassword,
}: LoginPageProps) => {
  const router = useRouter();

  const handleLogin = async () => {
    const res = await UsersService.login(username, password);

    console.log(res);

    if (res?.data && res?.data?.token) {
      setCookie("token", res.data.token, 1);
      router.push("/dashboard");
    } else {
      console.log("Failed to log in", res);
    }
  };

  return (
    <Row
      marginY="32"
      background="overlay"
      fillWidth
      fillHeight
      radius="xl"
      border="neutral-alpha-weak"
      overflow="hidden"
      center
      className={styles.LoginContainer}
      onBackground="accent-weak"
    >
      <Column horizontal="center" gap="20" padding="32" position="relative">
        <Background
          mask={{
            x: 100,
            y: 0,
            radius: 75,
          }}
          position="absolute"
          grid={{
            display: true,
            opacity: 50,
            width: "0.5rem",
            color: "neutral-alpha-medium",
            height: "1rem",
          }}
        />
        <Logo wordmark={false} size="l" />
        <Heading
          as="h3"
          variant="display-default-s"
          size="xl"
          defaultValue={""}
        >
          Welcome to BS Gear Tech
        </Heading>
        <Text onBackground="neutral-medium" marginBottom="24">
          Log in
        </Text>
        <Column gap="-1" fillWidth>
          <Input
            id="username"
            label="Username"
            labelAsPlaceholder
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            // validate={validateLogin}
            errorMessage={false}
            radius="top"
          />
          <PasswordInput
            autoComplete="new-password"
            id="password"
            label="Password"
            labelAsPlaceholder
            radius="bottom"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          // validate={validateLogin}
          />
        </Column>
        {/* Login Button */}
        <Button onClick={handleLogin} size="l" variant="primary">
          Log in
        </Button>

        <SmartLink href="/forgot-password" color="neutral-medium">
          Forgot password?
        </SmartLink>
      </Column>
    </Row>
  );
};
