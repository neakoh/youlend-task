import { Tabs, Tab, Card } from "@heroui/react";
import LoginForm from "./forms/loginForm";
import RegisterForm from "./forms/registerForm";
import { motion, AnimatePresence } from "framer-motion";
import Logout from "./logout";
import { useState, useEffect } from "react";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0
  })
};

const welcomeVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export default function FormSwitcher() {
  const [selectedTab, setSelectedTab] = useState("login");
  const [[page, direction], setPage] = useState([0, 0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    setIsLoggedIn(!!token);
    setUsername(storedUsername || "");

    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newUsername = localStorage.getItem("username");
      setIsLoggedIn(!!newToken);
      setUsername(newUsername || "");
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("login", handleStorageChange);
    document.addEventListener("register", handleStorageChange);
    document.addEventListener("logout", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("login", handleStorageChange);
      document.removeEventListener("register", handleStorageChange);
      document.removeEventListener("logout", handleStorageChange);
    };
  }, []);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleTabChange = (key: string) => {
    setSelectedTab(key);
    paginate(key === "login" ? -1 : 1);
  };

  return (
    <Card className="p-2 w-full flex flex-row items-center justify-between overflow-hidden">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="auth-forms"
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            custom={direction}
            className="w-full flex flex-row items-center"
          >
            <Tabs 
              className="flex flex-row pr-4"
              selectedKey={selectedTab}
              onSelectionChange={(key) => handleTabChange(key.toString())}
            >
              <Tab key="login" title="Login">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="login"
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  >
                    <LoginForm />
                  </motion.div>
                </AnimatePresence>
              </Tab>
              <Tab key="register" title="Register">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="register"
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  >
                    <RegisterForm />
                  </motion.div>
                </AnimatePresence>
              </Tab>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div 
            key="welcome"
            className="flex w-full flex-row gap-2 p-4 justify-between items-center"
            variants={welcomeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <h2 className="text-2xl font-bold">Welcome, {username}</h2>
            <Logout />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
