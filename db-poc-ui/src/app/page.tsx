"use client";

import EmployeeList from "./components/employeeListComponents/EmployeeList";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (!usuario.Role) {
      // Si no hay usuario, redirige al login
      router.push("/login");
      return;
    }
    if (usuario.Role !== "Administrador") {
      router.push("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="admin-panel">
      <h1>Panel de Administración</h1>
      <EmployeeList />
    </div>
  );
}