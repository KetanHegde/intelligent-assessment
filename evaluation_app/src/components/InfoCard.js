import React from "react";
import '../css/InfoCard.css';
export default function InfoCard({title, desc}) {
  return (
    <div>
      <div className="card" id="infoCard" style={{display:"flex",alignItems:"center"}}>
        <div className="card-body info-card-body">
          <h2 className="card-title" style={{textAlign:"center"}}>{title}</h2>
          <p className="card-text info-desc">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

