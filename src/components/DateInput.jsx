import React from "react";
import { format, parse } from "date-fns";

export const DateInput = (props) => {
  const formatDate = (date) => {
    const year = String(date.getFullYear()).padStart(4, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <input
        type="date"
        value={formatDate(props.date)}
        onChange={(e) => {
          const time = formatTime(props.date);
          const limit = parse(
            `${e.target.value} ${time}`,
            "yyyy-MM-dd HH:mm",
            new Date(),
          );
          if (Number.isNaN(limit.getTime())) {
            return;
          }
          props.setDate(limit);
        }}
        style={{ marginRight: "1rem" }}
      ></input>
      <input
        type="time"
        value={formatTime(props.date)}
        onChange={(e) => {
          const day = formatDate(props.date);
          const limit = parse(
            `${day} ${e.target.value}`,
            "yyyy-MM-dd HH:mm",
            new Date(),
          );
          if (Number.isNaN(limit.getTime())) {
            return;
          }
          props.setDate(limit);
        }}
      />
    </>
  );
};
