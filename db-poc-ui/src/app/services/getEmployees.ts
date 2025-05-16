export interface Employee {
  ID: number;
  NameEmployee: string;
  Salary: number;
}
export const APIURL = "http://localhost:3005/api/v2/";
export async function getEmployees(): Promise<Employee[]> {
  try {
    console.log("Fetching employee data");
    const response = await fetch(
      APIURL+"sorted_employee",
    );
    if (!response.ok) {
      console.log(response);
      throw new Error("Employee data not found");
    }
    const employees = await response.json();
    console.log("Employee data found");
    return employees.data;
  } catch (e) {
    console.log("Employee data not found ${e}");
    if (e instanceof Error) {
      throw new Error("Employee data not found: " + e.message);
    } else {
      throw new Error("Employee data not found");
    }
  }
}
