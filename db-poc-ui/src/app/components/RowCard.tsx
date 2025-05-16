import React from "react";

interface RowCardProps {
  id: string;
  name: string;
  salary: string;
  className?: string;
}

function RowCard({ id, name, salary, className }: RowCardProps) {
  return (
    <div className={`row-${className ? className : ""}`}>
      <div className="id">
        <h1>{id}</h1>
      </div>
      <div className="name">
        <h1>{name}</h1>
      </div>
      <div className="salary">
        <h1>{salary}</h1>
      </div>
    </div>
  );
}

export default RowCard;
