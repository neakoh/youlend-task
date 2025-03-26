import React from "react";
import { Form, Input, Button, addToast, Switch } from "@heroui/react";
import { API_URL } from "@/config/url";

export default function RegisterForm() {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
    isAdmin: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isAdmin: checked
    }));
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          isAdmin: formData.isAdmin,
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
        throw new Error(errorMessage || 'Registration failed');
      }

      const data = await response.json();
      console.log(data)
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);
      
      // Dispatch register and login events since we're automatically logging in
      document.dispatchEvent(new Event("register"));
      document.dispatchEvent(new Event("login"));
      
      addToast({
        title: "Success",
        description: "Registration successful!",
        color: "success",
      });
    } catch (error: Error | any) {
      addToast({
        title: "Error",
        description: error.message,
        color: "danger",
      });
    }
  };

  return (
    <Form
      className="w-full flex flex-row items-center justify-between gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }}
    >
      <div className="flex flex-row gap-2">
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
        <Switch 
          isSelected={formData.isAdmin}
          onValueChange={handleSwitchChange}
        >
          Admin?
        </Switch>
      </div>
      <div className="flex gap-2">
        <Button color="primary" type="submit">
          Register
        </Button>
      </div>
    </Form>
  );
}
