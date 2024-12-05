import React from "react";
import SvgComponent from "./SvgComponent";
import { Link } from "react-router-dom";

export default function Card({
  title,
  desc,
  card_width = "22rem",
  link = "/",
  width = 230,
  height = 190,
  svgContent,
  color,
  viewBox,
  max_width = "100%",
}) {
  return (
    <div>
      <div
        className="card"
        style={{
          width: card_width,
          display: "flex",
          alignItems: "center",
          padding: "3%",
          maxWidth: "75vw",
        }}
      >
        <SvgComponent
          color={color}
          max_width={max_width}
          width={width}
          height={height}
          viewBox={viewBox}
        >
          {svgContent}
        </SvgComponent>
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{desc}</p>

          <Link to={link} className="btn btn-primary">
            Click Here to Go
          </Link>
        </div>
      </div>
    </div>
  );
}
