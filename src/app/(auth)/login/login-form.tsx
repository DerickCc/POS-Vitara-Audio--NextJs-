"use client";

import { routes } from "@/config/routes";
import { saveSession } from "@/utils/authlib";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PiArrowRightBold } from "react-icons/pi";
import { Button, Input, Password } from "rizzui";

export default function LogInForm() {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");
  const router = useRouter();

  const validations = {
    username: { required: "Username harus diisi" },
    password: {
      required: "Password harus diisi",
      minLength: { value: 6, message: "Password harus minimal 6 karakter " },
    },
  };

  async function login (event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username || !password) {
      setError("Username dan Password harus diisi");
      return;
    }

    try {
      const res = await fetch("api/user/check-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      await saveSession(data.result);
      router.push(routes.dashboard);
    } catch (e) {
      console.log("Login error: " + e);
      setError("Gagal login, mohon dicoba lagi");
    }
  };

  return (
    <form onSubmit={login}>
      <div className="space-y-5">
        <Input
          type="text"
          size="lg"
          label="Username"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          placeholder="Masukkan username Anda"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error=""
        />
        <Password
          size="lg"
          label="Password"
          name="password"
          className="pb-2 [&>label>span]:font-medium"
          inputClassName="text-sm"
          placeholder="Masukkan password Anda"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <Button className="w-full" type="submit" size="lg">
          <span>Log in</span>
          <PiArrowRightBold className="ms-2"></PiArrowRightBold>
        </Button>
      </div>
    </form>
  );
}
