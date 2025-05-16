import { Employee } from "./getEmployees";
import { APIURL } from "./getEmployees";
export async function insertEmployee(
  name: string,
  salary: number,
): Promise<Employee> {
  try {
    console.log("Inserting new employee");
    const response = await fetch(
      APIURL+"employee",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: name,
          Salary: salary,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to insert employee: ${response.status}`);
    }

    const result = await response.json();
    console.log("Employee inserted successfully");
    return result.data;
  } catch (e) {
    console.error("Error inserting employee:", e);
    if (e instanceof Error) {
      throw new Error("Failed to insert employee: " + e.message);
    } else {
      throw new Error("Failed to insert employee");
    }
  }
}
