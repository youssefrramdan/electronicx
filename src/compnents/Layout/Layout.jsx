import React, { useContext, useEffect } from "react";
import Style from "./Layout.module.css";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { Offline, Online } from "react-detect-offline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Layout() {
  function notifiy() {
    toast("You are offline");
  }

  return (
    <>
      <Navbar />
      <Outlet></Outlet>
      <Offline>
        
        <div className="shadow-lg">
        <div className="offline d-flex rounded-2 align-items-center">
              <i className="fa fa-wifi"></i>
               <p className="m-2">You Are offline now </p>
          </div>
        </div>
        
       {/* <ToastContainer
           position="bottom-right"
           autoClose={false}
           newestOnTop={false}
           closeOnClick
           rtl={false}
           pauseOnFocusLoss
           draggable
           theme="dark"
         /> */}
     </Offline>
      <Footer />  
    </>
  );
}
