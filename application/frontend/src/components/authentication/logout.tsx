import { Button, addToast } from "@heroui/react";

export default function Logout() {
  return (
    <Button
      color="danger"
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");

        // Dispatch logout event
        document.dispatchEvent(new Event("logout"));
        
        addToast({
          title: "Success",
          description: "You have been logged out successfully",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
        
        window.location.reload();
      }}
    >
      Logout
    </Button>
  );
}
