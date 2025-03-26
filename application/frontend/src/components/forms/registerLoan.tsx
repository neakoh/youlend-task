import React from "react";
import { Form, Input, Button, addToast  } from "@heroui/react";
import { API_URL } from "@/config/url";

export default function RegisterLoanForm() {
  const [formData, setFormData] = React.useState({
    initial_funding_amount: "",
    borrower_name: "",
  });

  const isAdmin = localStorage.getItem("role") === "admin";
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateLoan = async () => {
    try {
      const response = await fetch(`${API_URL}/loans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          initial_funding_amount: formData.initial_funding_amount,
          borrower_name: formData.borrower_name,
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
      
      addToast({
        title: "Success",
        description: "Loan registered successfully!",
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
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
      className="w-full flex flex-row items-start p-1"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateLoan();
      }}
    >
      <Input
        isRequired
        errorMessage="Please enter a valid funding amount"
        name="initial_funding_amount"
        placeholder="Enter your desired loan value."
        type="number"
        value={formData.initial_funding_amount}
        onChange={handleInputChange}
      />
      {isAdmin && (
        <Input
          isRequired
          errorMessage="Please enter a valid borrower name"
          label="Borrower Name"
          labelPlacement="outside"
          name="borrower_name"
          placeholder="Enter borrower name"
          type="text"
          value={formData.borrower_name}
          onChange={handleInputChange}
        />
      )}
      <div className="flex gap-2">
        <Button color="primary" type="submit">
          Apply for loan
        </Button>
      </div>
    </Form>
  );
}
