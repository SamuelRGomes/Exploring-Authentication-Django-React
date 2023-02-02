import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import axios from "axios";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const getAuthToken = (callback) => {
    return localStorage.getItem("authTokens") ? callback(localStorage.getItem("authTokens")) : null;
  };
  let [userToken, setUserToken] = useState(() => getAuthToken(JSON.parse)?.access);
  let [refreshToken, setRefreshToken] = useState(() => getAuthToken(JSON.parse)?.refresh);
  let [user, setUser] = useState(() => getAuthToken(jwt_decode)?.access);
  let [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  let loginUser = async (e) => {
    e.preventDefault();
    const response = await axios.post(
      "http://127.0.0.1:8000/api/token/",
      JSON.stringify({ username: e.target.username.value, password: e.target.password.value }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status === 200) {
      setUserToken(response.data.access);
      setRefreshToken(response.data.refresh);
      setUser(jwt_decode(response.data.access));
      localStorage.setItem("authTokens", JSON.stringify(response.data));
      navigate("/");
    } else {
      alert("Something went wrong!");
    }
  };

  let logoutUser = () => {
    setUserToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    navigate("/login");
  };
  useEffect(() => {
    if (userToken) {
      setUser(jwt_decode(userToken));
    }
    setLoading(false);
  }, [userToken, loading]);

  let contextData = {
    user: user,
    userToken: userToken,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };

  return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
};
