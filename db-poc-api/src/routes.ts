import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  tryDeleteEmployee,
  getEmployeeByName,
  getEmployeeByDNI,
} from "./controllers/Employee.controller";
import { loginUser, logoutUser } from "./controllers/Login.controller";
import {
  getEmployeeMovements,
  createMovement,
  getMovementsTypes,
} from "./controllers/Movement.controller";
import { getStats } from "./controllers/Stats.controller";
import { getPositions } from "./controllers/Positions.controller";
import {
  createApplication,
  getApplications,
  issueApplication,
} from "./controllers/Applications.controller";
const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

// Employee routes
router.get("/employee", getEmployees);
router.post("/employee", createEmployee);
router.patch("/employee/:DNI", updateEmployee);
router.delete("/employee/:DNI", deleteEmployee);
router.post("/employee/deleteTry/:IdEmpleado", tryDeleteEmployee);
router.get("/employee/name/:employeeName", getEmployeeByName);
router.get("/employee/DNI/:employeeDNI", getEmployeeByDNI);

// Movement routes
router.get("/movement/:DNI", getEmployeeMovements);
router.post("/movement", createMovement);
router.get("/movementType", getMovementsTypes);

// Position routes
router.get("/position", getPositions);

// Login routes
router.post("/logout", logoutUser);
router.post("/login", loginUser);

// Stats routes
router.get("/stats_salaries", getStats);

// Application routes
router.get("/vacation_request", getApplications);
router.post("/vacation_request", createApplication);
router.post("/vacation_request/:idSolicitud", issueApplication);

//**************************************************
//*******************RUTAS NUEVAS*******************
//**************************************************


export default router;
