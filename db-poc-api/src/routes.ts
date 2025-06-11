import { Router } from "express";
import { loginUser, logoutUser } from "./controllers/Login.controller";
const router = Router();
import {
  createEmployee,
  createEmployeeV2,
  updateEmployeeV2,
  deleteEmployeeV2,
  impersonateEmployeeV2,
  getEmployees,
  searchEmployees,
  getEmployeeById,
  updateEmployee,
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
router.get("/employees/:id", getEmployeeById);
router.post("/employees", createEmployeeV2);
router.put("/employees/:id", updateEmployeeV2);
router.delete("/employees/:id", deleteEmployeeV2);
router.post("/employees/:id/impersonate", impersonateEmployeeV2);




router.post("/employee", createEmployee);
router.patch("/employee/:DNI", updateEmployee);
router.post("/employee/deleteTry/:IdEmpleado", tryDeleteEmployee);
router.get("/employee/name/:employeeName", getEmployeeByName);
router.get("/employee/DNI/:employeeDNI", getEmployeeByDNI);



export default router;
