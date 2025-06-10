//"use client";

//export default function Page() {
//    return (
//        <div className="page">
//            <h1>Bienvenido a la aplicación</h1>
//            <p>Visita <a href="/login">/login</a> para iniciar sesión.</p>
//        </div>
//    );
//}

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
            // Si no hay usuario, espera a que el layout lo maneje
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