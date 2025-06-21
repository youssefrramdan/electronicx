import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ReactQueryDevtools } from "react-query/devtools";
import { QueryClient, QueryClientProvider } from "react-query";
import UserContextProvider from "./Context/UserContext";
import CartContextProvider from "./Context/CartContext";
import WishContextProvider from "./Context/WishContext";
import OrderContextProvider from "./Context/OrderContext";
import toast, { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));

let queryClient = new QueryClient();
root.render(
  <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      <WishContextProvider>
        <CartContextProvider>
          <OrderContextProvider>
            <App />
            <Toaster />
          </OrderContextProvider>
        </CartContextProvider>
      </WishContextProvider>
    </UserContextProvider>
    <ReactQueryDevtools position="bottom-right" />
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
