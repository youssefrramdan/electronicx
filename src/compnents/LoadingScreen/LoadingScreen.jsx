import React from "react";
import Style from "./LoadingScreen.module.css";

export default function LoadingScreen({
  fullScreen = false,
  title = "Loading",
  message = "Please wait while we load your content...",
}) {
  const containerClass = fullScreen
    ? Style.fullScreenLoading
    : Style.loadingScreen;

  return (
    <div className={containerClass}>
      <div className={Style.spinner}>
        <div className={Style.bounce1}></div>
        <div className={Style.bounce2}></div>
        <div className={Style.bounce3}></div>
      </div>
      <h3 className={Style.loadingTitle}>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
