import React, { useContext, useState } from "react";
import Style from "./FeaturedProducts.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import { CartContext } from "../../Context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function FeaturedProducts() {
  let [heartColor, setcolor] = useState(false);
  let {
    addToCart,
    addToWishList,
    color,
    setColor,
    removedColor,
    setRemovedColor,
  } = useContext(CartContext);

  function nottify(msg) {
    toast.success(`${msg}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  }
  function erorr() {
    toast.error(`Error ocurred `, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  }
  async function addproduct(productId) {
    try {
      const response = await addToCart(productId);

      if (response?.data.status === "success") {
        console.log("success");
        nottify("Successfully added to cart");
      } else {
        erorr();
      }
    } catch (error) {
      console.error("Add to cart failed", error);
      erorr(); // أو تقدر تعرض error.message لو حابب
    }
  }

  async function addwish(productId) {
    let response = await addToWishList(productId);
    const updatedColorArray = [...color, productId];
    setColor(updatedColorArray);
    console.log(color, "from featured product ");
    //console.log(color,"from fetured product ")
    if (response?.data.status === "success") {
      console.log("success");
      {
        nottify("successfully Added to wish List");
      }
    } else {
      erorr();
    }
  }
  //  function deletItems(){
  //   data?.data.data.map((product)=>{
  //     if(removedColor.includes(product._id)){

  //       const newArray = color.filter(item => item !== product._id);
  //          setColor(newArray)
  //     }
  //   })
  //  removedColor.splice(0, removedColor.length);
  //  console.log(removedColor)
  //  console.log(color)
  //  }
  // let [isLoading, setIsLoading] = useState(false);
  // let [products, setProducts] = useState([]);
  // async function getFeaturedProducts() {
  //   setIsLoading(true);
  //   let { data } = await axios.get(
  //     "https://ecommerce.routemisr.com/api/v1/products"
  //   );
  //   // console.log(data.data)
  //   setProducts(data.data);
  //   setIsLoading(false);
  // }
  // useEffect(() => {
  //   getFeaturedProducts();
  // }, []);
  function getFeaturedProducts() {
    return axios.get(
      "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/products"
    );
  }

  let { data, isLoading, isError, isFetching, refetch } = useQuery(
    "featuredProducts",
    getFeaturedProducts,

    {
      cacheTime: 3000, //    بتحكم في وقت الكاش
      // refetchOnMount:false     بقلل الريكويستات اللي رايحه علي السيرفر
      //staleTime:3000              عايز الداتا القديمه تفضل معروضه اد ايه
      //refetchInterval:3000            كل اد ايه يعمل ري فيتش
      // enabled:false    ممكن نستخدمها مع refetch لما ادوس علي زرار اجيب الداتا
    }
  );
  //  console.log(data?.data.data)
  return (
    <>
      {isLoading ? (
        ""
      ) : (
        <div className=" container">
          <h1 className="my-3">Featured Products </h1>
          <div className="row">
            {data?.data.data.map((product) => (
              <div className="product col-md-2 p-3" key={product._id}>
                <Link
                  to={`/productdetails/${product._id}`}
                  className="text-decoration-none"
                >
                  <img
                    src={product.imageCover}
                    className="w-100"
                    alt={product.name}
                  ></img>
                  <span className="text-main">
                    {product.category?.name || "Uncategorized"}
                  </span>
                  <p>{product.name}</p>
                  <div className="d-flex justify-content-between">
                    <p>{product.price} EGP</p>
                    <p>
                      <i className="fa fa-star rating-color m-1"></i>
                      {product.ratingsAverage || 0}
                    </p>
                  </div>
                </Link>

                {color.includes(product._id) &&
                !removedColor.includes(product._id) ? (
                  <div className="float-end">
                    {" "}
                    <p
                      className={`${Style.heartt}`}
                      onClick={() => addwish(product._id)}
                    >
                      {" "}
                      <i className=" fa fa-heart ms-5"></i>
                    </p>
                  </div>
                ) : (
                  <div className="float-end">
                    {" "}
                    <p onClick={() => addwish(product._id)}>
                      {" "}
                      <i className=" fa fa-heart ms-5"></i>
                    </p>
                  </div>
                )}
                {/* {deletItems()} */}

                {console.log(color)}

                <button
                  className="btn bg-main text-white my-2 w-100 "
                  onClick={() => addproduct(product._id)}
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      )}
    </>
  );
}
