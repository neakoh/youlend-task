import { Tabs, Tab, Card } from "@heroui/react";
import RegisterLoan from "./forms/registerLoan";
import ViewLoans from "./viewLoans";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem("role") === "admin");

    useEffect(() => {
        const handleLogin = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
            setIsAdmin(localStorage.getItem("role") === "admin");
        };

        document.addEventListener("login", handleLogin);
        return () => document.removeEventListener("login", handleLogin);
    }, []);

    return (
        <Card className="w-full flex-row flex items-start">
            {isLoggedIn ? (
                <Tabs className="p-4">
                    <Tab key="register-loan" title="Register a New Loan">
                        <RegisterLoan />
                    </Tab>
                    <Tab key="my-loans" title={isAdmin ? "View All Loans" : "My Loans"}>
                        <ViewLoans />
                    </Tab>
                </Tabs>
            ) : (
                <div className="w-full flex flex-col items-center text-center p-4">
                    <p className="text-lg font-semibold">Must be registered to access & manage loans.</p>
                </div>
            )}
        </Card> 
    );
}
