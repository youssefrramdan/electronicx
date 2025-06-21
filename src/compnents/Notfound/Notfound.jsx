import React from 'react'
import Style from './Notfound.module.css'
import img from "../../Assets/images/error.svg"
export default function Notfound() {
  return (
   <>
       <div className='container w-50 d-flex justify-content-center align-items-center mt-5'>
         <img src={img} alt="" className='' />
       </div>

   </>
  )
}
