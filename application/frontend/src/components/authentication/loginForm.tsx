import React from "react";
import { Form, Input, Button, addToast } from "@heroui/react";
import { API_URL } from "@/config/url";

export default function LoginForm() {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message;
        } catch {
          errorMessage = text;
        }
        throw new Error(errorMessage || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);
      
      // Dispatch login event
      document.dispatchEvent(new Event("login"));
      
      addToast({
        title: "Success",
        description: "Login successful!",
        color: "success",
      });
    } catch (error: Error | any) {
      addToast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        color: "danger",
      });
    }
  };

  return (
    <Form
      className="w-full flex flex-row gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <Input
        isRequired
        errorMessage="Please enter a valid username"
        name="username"
        placeholder="Enter your username"
        type="text"
        value={formData.username}
        onChange={handleInputChange}
      />
      <Input
        isRequired
        errorMessage="Please enter a valid password"
        name="password"
        placeholder="Enter your password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
      />
      <div className="flex gap-2">
        <Button color="primary" type="submit">
          Login
        </Button>
      </div>
    </Form>
  );
}
