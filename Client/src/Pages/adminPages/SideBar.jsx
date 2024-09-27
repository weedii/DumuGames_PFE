import { CgProfile } from "react-icons/cg";
import { RiGameLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { FiUser } from "react-icons/fi";
import { TbLayoutGridAdd } from "react-icons/tb";
import { NavLink } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import axios from "axios";
import { useDispatch } from "react-redux";
import { signOut } from "../../redux/userSlice";
import { LuClipboardList } from "react-icons/lu";
import { MdSupervisorAccount } from "react-icons/md";
import API_URL from "../../utils/apiConfig";

// eslint-disable-next-line react/prop-types
const SideBar = ({ menu }) => {
  const currentUser = useSelector((state) => state.currentUser.user);
  const dispatch = useDispatch();

  const navItems = [
    {
      path: "all-users",
      tittle: "Users",
      icon: <FiUser size={25} className="min-w-max" />,
    },
    {
      path: "all-admins",
      tittle: "Admins",
      icon: <MdSupervisorAccount size={25} className="min-w-max" />,
    },
    {
      path: "cards",
      tittle: "Cards",
      icon: <TbLayoutGridAdd size={25} className="min-w-max" />,
    },
    {
      path: "Wholesaler-Orders",
      tittle: "Wholesaler Orders",
      icon: <LuClipboardList size={25} className="min-w-max" />,
    },
    {
      path: "Orders",
      tittle: "Individual Orders",
      icon: <LuClipboardList size={25} className="min-w-max" />,
    },
    // {
    //   path: "Profile",
    //   tittle: "Personal Info",
    //   icon: <IoPersonCircleOutline size={25} className="min-w-max" />,
    // },
  ];

  const handleSignOut = () => {
    axios
      .get(`${API_URL}/api/auth/signout`, { withCredentials: true })
      .then(() => {
        dispatch(signOut());
        window.location.href = "/";
      })
      .catch((err) => console.log(err));
  };

  return (
    <div
      className={`bg-white lg:w-[16rem]  min-h-screen h-full shadow-xl border-r-[1px] border-black overflow-hidden transition-all ease-out duration-200
      ${menu ? "w-[70%] fixed" : "w-0 relative"}`}
    >
      <div className={`h-12 flex items-center justify-center`}>
        <a
          href="/admin/dashboard/all-users"
          className="text-[#5956E9] text-lg md:text-xl font-bold flex items-center hover:opacity-80 to-left"
        >
          <RiGameLine className="to-left" />
          DumuGames
        </a>
      </div>

      <div
        className={`flex flex-col justify-center items-center gap-5 border-b-2 border-b-blue-500 pb-3 mx-3`}
      >
        <CgProfile
          size={50}
          color="#5956E9"
          className="hover:opacity-85 cursor-pointer"
        />
        <p>Hello {currentUser.name}</p>
      </div>

      <ul className="mt-5 px-2 flex flex-col gap-5 h-full">
        {navItems.map((item, idx) => (
          <li key={idx}>
            <NavLink
              to={item.path}
              reloadDocument
              className="p-2 flex rounded-md gap-7 items-center cursor-pointer font-medium hover:bg-blue-400 hover:bg-opacity-20"
              style={({ isActive }) => {
                return isActive
                  ? { color: "white", backgroundColor: "#5956E9" }
                  : {};
              }}
            >
              {item.icon}
              {item.tittle}
            </NavLink>
          </li>
        ))}

        <li className="absolute bottom-5 w-full pr-5">
          <button
            className="bg-white w-full p-3 flex items-center rounded-md gap-7 text-lg font-semibold border-b hover:bg-blue-400 hover:bg-opacity-20"
            onClick={handleSignOut}
          >
            <IoLogOutOutline className="text-red-700" />
            Signout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
