import { IoCheckmarkCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import API_URL from "../../utils/apiConfig";
import toast from "react-hot-toast";
import { updateUser } from "../../redux/userSlice";
import { useEffect } from "react";
import { clearCart } from "../../redux/CartSlice";

const SuccessPayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  var currentUser = useSelector((state) => state.currentUser.user);

  const refreshUserOnGoToWallet = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/user/refresh-user`, {
        userID: currentUser._id,
      });
      if (res.data && res.data.success) {
        dispatch(updateUser(res.data.user));
        navigate("/My-Account/Wallet");
        window.location.reload();
        return;
      }
    } catch (error) {
      toast.error("Error while refreshing the user!");
      return;
    }
  };

  useEffect(() => {
    if (!currentUser) dispatch(clearCart());
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-5">
      <div className="flex items-center justify-center text-center gap-2 md:gap-5">
        <IoCheckmarkCircle color="green" className="text-3xl md:text-5xl" />
        {currentUser ? (
          <p className="text-xl font-semibold">
            Your Wallet Has Been Successfully Topped Up!
          </p>
        ) : (
          <p className="text-xl md:text-3xl font-semibold">Success Payment</p>
        )}
      </div>

      <p className="text-xl font-semibold ml-10">Check Your Mail box!</p>

      {currentUser && (
        <button
          className="bg-green-700 px-4 py-2 rounded-md text-white hover:bg-green-600"
          onClick={refreshUserOnGoToWallet}
        >
          Go to wallet
        </button>
      )}
    </div>
  );
};

export default SuccessPayment;
