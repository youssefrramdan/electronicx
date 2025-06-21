import React from 'react'
import Style from './CategorySlider.module.css'
import { useQuery } from 'react-query'
import axios from 'axios'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
// import './CategorySlider.module.css';
export default function CategorySlider() {
  var settings = {
    dots: true,
     infinite: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll:2,
   //  scrollY:true,
   //  autoplay: true,
   //  autoplaySpeed: 1000,
  
   // className: "center",
   // centerMode: true,
   // infinite: true,
   // centerPadding: "60px",
   // slidesToShow: 2,
   // speed: 500,
   // rows: 1,
   // slidesPerRow: 2
    

   
  };
   function getCategories(){
      return axios.get('https://ecommerce.routemisr.com/api/v1/categories')
   }

   let {isLoading,isError,data}=useQuery('CategorySlider',getCategories)
   console.log(data?.data.data)
  return (
   <>
 <div className='container'>
    {data?.data.data?<Slider {...settings}>
   
       {
       
           data?.data.data.map((category)=><img key={category._id} src={category.image} height={200}></img> )
       
       }
       
    </Slider>:''}
    </div>
 
   </>
  )
}
