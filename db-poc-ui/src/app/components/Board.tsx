import React, { useState, useEffect } from "react";
import RowCard from "./RowCard";
import { getEmployees, Employee } from "../services/getEmployees";

function Board() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getEmployees();
      setLoading(false);
      setEmployees(data);
    };

    fetchData();
  }, []);

  return (
    <div className="board">
      {loading ? (
        <h1>Cargando datos...</h1>
      ) : (
        employees.map((empl, index) => (
          <RowCard
            key={index}
            id={String(empl.ID)}
            name={empl.NameEmployee}
            salary={"$ " + String(empl.Salary)}
            className="board"
          />
        ))
      )}
    </div>
  );
}

export default Board;
