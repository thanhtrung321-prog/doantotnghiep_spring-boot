import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { proceedPayment } from "../../api/payment";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePayment = async () => {
      try {
        const bookingDetails = JSON.parse(
          Cookies.get("bookingDetails") || "{}"
        );
        const { paymentLinkId } = bookingDetails;
        // Payment ID typically comes from query params or provider callback
        const paymentId =
          new URLSearchParams(window.location.search).get("paymentId") ||
          "PAYMENT_ID_FROM_PROVIDER";
        const success = await proceedPayment(paymentId, paymentLinkId);
        if (success) {
          toast.success("Thanh toán thành công!");
          Cookies.remove("selectedServices");
          Cookies.remove("bookingDetails");
          navigate("/booking-confirmation", {
            state: { booking: bookingDetails },
          });
        } else {
          toast.error("Thanh toán thất bại.");
          navigate("/booking");
        }
      } catch (err) {
        toast.error("Lỗi xử lý thanh toán: " + err.message);
        navigate("/booking");
      }
    };
    handlePayment();
  }, [navigate]);

  return <div className="text-center py-10">Đang xử lý thanh toán...</div>;
};

export default PaymentSuccess;
