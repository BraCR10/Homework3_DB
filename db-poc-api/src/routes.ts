import { Router } from "express";
import { loginUser, logoutUser } from "./controllers/Login.controller";
const router = Router();
import {
  createEmployee,
  getEmployees,
  searchEmployees,
  updateEmployee,
  deleteEmployee,
  tryDeleteEmployee,
  getEmployeeByName,
  getEmployeeByDNI,
} from "./controllers/Employee.controller";

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

// Login routes
router.post("/logout", logoutUser);
router.post("/login", loginUser);

// Employee routes
router.get("/employees", getEmployees);
router.get("/employees/search", searchEmployees);



router.post("/employee", createEmployee);
router.patch("/employee/:DNI", updateEmployee);
router.delete("/employee/:DNI", deleteEmployee);
router.post("/employee/deleteTry/:IdEmpleado", tryDeleteEmployee);
router.get("/employee/name/:employeeName", getEmployeeByName);
router.get("/employee/DNI/:employeeDNI", getEmployeeByDNI);



export default router;
