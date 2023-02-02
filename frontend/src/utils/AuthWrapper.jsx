import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
const AuthWrapper = () => {
  let { userToken } = useContext(AuthContext);
  return userToken ? <Outlet /> : <Navigate to={"/login"} replace />;
};
export default AuthWrapper;
