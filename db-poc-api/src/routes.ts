import { Router } from "express";
import { loginUser, logoutUser } from "./controllers/Login.controller";
const router = Router();
import {
  createEmployee,
  createEmployeeV2,
  updateEmployeeV2,
  deleteEmployeeV2,
  impersonateEmployeeV2,
  stopImpersonationEmployeeV2,
  getDocumentTypes,
  getPositions,
  getEmployees,
  getDepartments,
  getDeductionTypes,
  getWeeklyPayroll,
  getWeeklyDeductions,
  getWeeklyGrossDetail,
  getMonthlyPayroll,
  getMonthlyDeductions,
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
router.post("/employees/:id/stop-impersonation", stopImpersonationEmployeeV2);

//Catalogs routes
router.get("/catalogs/document-types", getDocumentTypes);
router.get("/catalogs/positions", getPositions);
router.get("/catalogs/departments", getDepartments);
router.get("/catalogs/deduction-types", getDeductionTypes);

//planillas routes
router.get("/employees/:id/payroll/weekly", getWeeklyPayroll);
router.get("/employees/:id/payroll/weekly/:weekId/deductions", getWeeklyDeductions);
router.get("/employees/:id/payroll/weekly/:weekId/gross-detail", getWeeklyGrossDetail);
router.get("/employees/:id/payroll/monthly", getMonthlyPayroll);
router.get("/employees/:id/payroll/monthly/:monthId/deductions", getMonthlyDeductions);


router.post("/employee", createEmployee);
router.patch("/employee/:DNI", updateEmployee);
router.post("/employee/deleteTry/:IdEmpleado", tryDeleteEmployee);
router.get("/employee/name/:employeeName", getEmployeeByName);
router.get("/employee/DNI/:employeeDNI", getEmployeeByDNI);



export default router;
