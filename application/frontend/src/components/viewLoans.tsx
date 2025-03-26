import { Accordion, AccordionItem, addToast, Chip, Button, Input } from "@heroui/react";
import { API_URL } from "@/config/url";
import { useState, useEffect } from "react";

interface Loan {
  id: number;
  borrower_name: string;
  initial_funding_amount: number;
  current_loan_balance: number;
  created_at: string;
  repayments: Array<{
    repayment_amount: number;
    created_at: string;
  }>;
}

export default function ViewLoans() {
  const [data, setData] = useState<Loan[]>([]);
  const [repaymentAmount, setRepaymentAmount] = useState<{ [key: number]: string }>({});
  const isAdmin = localStorage.getItem("role") === "admin";

  const url = isAdmin ? `${API_URL}/loans` : `${API_URL}/loans/name`;

  const getLoans = async () => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
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
      setData(data);
      console.log(data)
    } catch (error: Error | any) {
      addToast({
        title: "Error",
        description: error.message,
        color: "danger",
      });
    }
  };
  
  useEffect(() => {
    getLoans();
  }, []);

  const handleRepayment = async (loanId: number) => {
    try {
      const amount = parseFloat(repaymentAmount[loanId]);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid repayment amount");
      }

      const response = await fetch(`${API_URL}/loans`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          repayment_amount: amount,
          loan_id: loanId
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
        throw new Error(errorMessage || 'Repayment failed');
      }

      // Clear the repayment amount
      setRepaymentAmount(prev => ({ ...prev, [loanId]: '' }));
      
      getLoans();

      addToast({
        title: "Success",
        description: "Repayment processed successfully!",
        color: "success",
        timeout: 3000,
      });
    } catch (error: Error | any) {
      addToast({
        title: "Error",
        description: error.message,
        color: "danger",
      });
    }
  };

  const handleDelete = async (loanId: number) => {
    try {
      const response = await fetch(`${API_URL}/loans`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          id: loanId
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
        throw new Error(errorMessage || 'Couldn\'t delete loan');
      }

      getLoans();

      addToast({
        title: "Success",
        description: "Loan deleted successfully!",
        color: "success",
        timeout: 3000,
      });
    } catch (error: Error | any) {
      addToast({
        title: "Error",
        description: error.message,
        color: "danger",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <>
    {data.length > 0 ? (
      <Accordion>
      {data.map((loan) => (
        <AccordionItem
          key={loan.id}
          aria-label={`Loan ${loan.id}`}
          title={
            <div className="grid grid-cols-12 gap-4 items-center w-full pt-0">
              <div className="col-span-1">
                <Chip color="primary" size="sm" className="justify-center">#{loan.id}</Chip>
              </div>
              
              {isAdmin && (
                <div className="col-span-2 truncate">
                  <span className="text-gray-600 font-medium">{loan.borrower_name}</span>
                </div>
              )}
              
              <div className="col-span-2">
                <span className="font-semibold text-primary">{formatCurrency(loan.initial_funding_amount)}</span>
              </div>
              
              <div className="col-span-3">
                <span className="font-semibold text-default-600">Balance: {formatCurrency(loan.current_loan_balance)}</span>
              </div>
              
              <div className="col-span-2">
                <Chip 
                  color={loan.current_loan_balance === 0 ? "success" : (loan.repayments?.length ?? 0) > 0 ? "primary" : "warning"} 
                  size="sm" 
                  variant="flat"
                  className="w-full justify-center"
                >
                  {loan.current_loan_balance === 0 ? "Paid" : (loan.repayments?.length ?? 0) > 0 ? "Active" : "No Repayments"}
                </Chip>
              </div>
              
              <div className="col-span-2 text-right">
                <span className="text-sm text-gray-500">{formatDate(loan.created_at)}</span>
              </div>
            </div>
          }
        >
          <div className="p-6 space-y-6 bg-gray-50 rounded-b-lg">
            <div className="flex gap-4 items-end">
              <Input
                label="Repayment Amount"
                placeholder="Enter amount"
                type="number"
                min="0"
                step="0.01"
                value={repaymentAmount[loan.id] || ''}
                onChange={(e) => setRepaymentAmount(prev => ({
                  ...prev,
                  [loan.id]: e.target.value
                }))}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button 
                  color="primary"
                  onClick={() => handleRepayment(loan.id)}
                >
                  Make Repayment
                </Button>
                {isAdmin && (
                  <Button 
                    color="danger"
                    variant="flat"
                    onClick={() => handleDelete(loan.id)}
                  >
                    Delete Loan
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700">Repayment History</h4>
              {(loan.repayments?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {loan.repayments?.map((repayment, index) => (
                    <div 
                      key={index}
                      className="grid grid-cols-12 gap-4 items-center p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="col-span-5">
                        <span className="font-medium">{formatCurrency(repayment.repayment_amount)}</span>
                      </div>
                      <div className="col-span-5 text-right">
                        <span className="text-sm text-gray-500">{formatDate(repayment.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No repayments made yet</p>
              )}
            </div>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
    ) : (
      <div className="flex items-center justify-center">
        <p className="text-gray-500 italic">No loans found</p>
      </div>
    )}
    </>
  );
}
