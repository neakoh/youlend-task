import { Card } from "@heroui/react";
import RegisterLoan from "./forms/registerLoan";
import ViewLoans from "./viewLoans";
import { useEffect, useState } from "react";
import FormSwitcher from "./formSwitcher";

export default function Dashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem("role") === "admin");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const handleLogin = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
            setIsAdmin(localStorage.getItem("role") === "admin");
        };

        document.addEventListener("login", handleLogin);
        return () => document.removeEventListener("login", handleLogin);
    }, []);

    return (
        <div className="w-full flex-col flex items-start p-4 gap-4">
            <Card className="w-full bg-slate-300/20">
                <FormSwitcher />
            </Card>

            {isLoggedIn ? (
                <div className="w-full flex flex-col items-center text-center gap-4">
                    <Card className="w-full p-2 bg-slate-300/20">
                        <RegisterLoan onLoanCreated={() => setRefreshKey(prev => prev + 1)} />
                    </Card>
                    <Card className="w-full p-2 bg-slate-300/20">
                        <ViewLoans refreshKey={refreshKey} />
                    </Card>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center text-center p-4">
                    <p className="text-lg font-semibold">Must be registered to access & manage loans.</p>
                </div>
            )}
        </div> 
    );
}
