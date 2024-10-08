import { useEffect, useState } from "react";
import pacman from "../../assets/pacmanenemy.png";
// import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import API_URL from "../../utils/apiConfig";
import LoadingButton from "../../Components/LoadingButton";

const SignIn = () => {
  // const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.currentUser.user);

  const handleChangeData = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
    return emailPattern.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Missing Email!");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Invalid Email!");
      return;
    }

    setLoading(true);
    axios
      .post(`${API_URL}/api/auth/signin-wholesale`, formData, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setLoading(false);
          navigate("/sign-in/verify", {
            replace: true,
            state: { email: res.data.email },
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        if (error.response.data.message === "User Not Found!") {
          toast.error("User Not Found!");
        }
        if (error.response.status === 403) {
          toast.error(error.response.data.message);
        }
      });
  };

  useEffect(() => {
    AOS.init({ duration: 500 });
  }, []);

  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) navigate("/", { replace: true });
    if (currentUser && currentUser.isAdmin)
      navigate("/admin/dashboard", { replace: true });
  }, [navigate, currentUser]);

  return (
    <div
      className="min-h-screen max-w-xl mx-auto flex flex-col items-center gap-5"
      data-aos="fade-right"
    >
      {/* <Toaster position="top-right" reverseOrder={false} /> */}

      <div className="flex flex-col gap-5 my-7">
        <p className="text-2xl md:text-3xl text-center uppercase">Sign In</p>
        <img
          src={pacman}
          className="mx-auto h-7 object-contain px-5 w-5/6 md:w-11/12"
        />
      </div>

      <div className="w-11/12 flex flex-col gap-4 mb-5">
        <p className="text-center text-xl">Are you a Wholesaler?</p>

        <p className="text-center text-sm font-semibold">
          To create an account Fill the form in the Wholesale page with your
          informations!
        </p>

        <p className="text-center text-sm font-semibold text-green-700">
          Or just signIn to your account
        </p>
      </div>

      <div className="w-11/12">
        <form className="flex flex-col gap-7" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            id="email"
            required
            className="border p-3 md:p-4 rounded-md outline outline-1 outline-slate-300 text-sm font-semibold focus-within:ring-2"
            onChange={handleChangeData}
          />
          {/* <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            id="password"
            required
            className="border p-3 md:p-4 rounded-md outline outline-1 outline-slate-300 text-sm font-semibold focus-within:ring-2"
            onChange={handleChangeData}
          /> */}

          {/* <div
            className="flex items-center space-x-2 w-fit cursor-pointer text-sm font-semibold"
            onClick={() => setShowPass(!showPass)}
          >
            <p> {showPass ? <FiEye /> : <FiEyeOff />} </p>
            <p> {showPass ? "Hide Password" : "Show Password"} </p>
          </div> */}

          <button
            className={`bg-[#5956E9] p-2 md:p-3 rounded-md text-white font-semibold uppercase
            outline outline-1 outline-slate-300 hover:opacity-85 disabled:opacity-85
            ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={loading}
          >
            {loading ? <LoadingButton /> : "Sign in"}
          </button>
        </form>

        <div className="flex mt-5 gap-2 text-sm">
          <p>{"Don't have an account?"}</p>
          <Link to="/wholesale">
            <span className="text-blue-700 hover:underline underline-offset-4">
              Create one
            </span>
          </Link>
        </div>

        {/* <div className="flex flex-col gap-3 md:gap-0 md:flex-row mt-5 text-sm md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <p>Don`t have an account?</p>
            <Link to="/sign-up">
              <span className="text-blue-700 hover:underline underline-offset-4">
                Sign Up
              </span>
            </Link>
          </div>

          <p className="text-blue-700 hover:underline underline-offset-4 w-fit cursor-pointer">
            Forget Password?
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default SignIn;
