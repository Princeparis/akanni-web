import React from "react";
import "./Video.css";

function Video() {
  return (
    <div className="vid-cont">
      <video loop preload="auto" autoPlay muted className="vid">
        <source src="bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default Video;
