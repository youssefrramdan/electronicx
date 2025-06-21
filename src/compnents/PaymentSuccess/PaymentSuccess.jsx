import React, { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { OrderContext } from "../../Context/OrderContext";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import Style from "./PaymentSuccess.module.css";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPaymentSuccess, loading } = useContext(OrderContext);

  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [orderDetails, setOrderDetails] = useState(null);
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId && !hasVerified) {
      setHasVerified(true);
      verifyPaymentSuccess(sessionId)
        .then((result) => {
          if (result.success) {
            setVerificationStatus("success");
            setOrderDetails(result.data);

            // Redirect to orders page after 3 seconds
            setTimeout(() => {
              navigate("/allorders");
            }, 3000);
          } else {
            setVerificationStatus("error");
          }
        })
        .catch((error) => {
          setVerificationStatus("error");
        });
    } else if (!hasVerified) {
      setVerificationStatus("error");
    }
  }, [searchParams, verifyPaymentSuccess, navigate, hasVerified]);

  if (loading || verificationStatus === "verifying") {
    return (
      <div className={Style.container}>
        <LoadingScreen />
        <div className={Style.message}>
          <h2>Verifying your payment...</h2>
          <p>Please wait while we confirm your order.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className={Style.container}>
        <div className={Style.successCard}>
          <div className={Style.checkIcon}>✅</div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your order. We're processing it now.</p>
          {orderDetails && (
            <div className={Style.orderInfo}>
              <p>
                <strong>Order ID:</strong> {orderDetails.order}
              </p>
            </div>
          )}
          <div className={Style.actions}>
            <button
              onClick={() => navigate("/allorders")}
              className={Style.viewOrdersBtn}
            >
              View My Orders
            </button>
          </div>
          <p className={Style.autoRedirect}>
            You'll be redirected to your orders in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.container}>
      <div className={Style.errorCard}>
        <div className={Style.errorIcon}>❌</div>
        <h1>Payment Verification Failed</h1>
        <p>
          We couldn't verify your payment. Please contact support if you were
          charged.
        </p>
        <div className={Style.actions}>
          <button
            onClick={() => navigate("/cart")}
            className={Style.backToCartBtn}
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate("/allorders")}
            className={Style.viewOrdersBtn}
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
}
