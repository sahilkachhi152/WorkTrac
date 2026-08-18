import { useState } from "react";

import Login from "./auth/Login";
import AdminLayout from "./components/AdminLayout";
import EmployeeLayout from "./components/EmployeeLayout";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogin = (data) => {

    console.log(
      "USER LOGGED IN:",
      data
    );

    setIsLoggedIn(true);
  };

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }

  // ==========================================
  // 🚀 DECISION LOGIC: Admin vs Employee
  // ==========================================
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdminOrSuperior = user.role === "admin" || user.role === "superior";

  // If Admin or Superior, show the Sidebar layout
  if (isAdminOrSuperior) {
    return (
      <AdminLayout
        onLogout={handleLogout}
      />
    );
  }

  // Otherwise, show the Employee Mobile-friendly layout
  return (
    <EmployeeLayout
      onLogout={handleLogout}
    />
  );
}

export default App;