import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

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
    let response = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value }),
    });
    let data = await response.json();

    if (response.status === 200) {
      setUserToken(data.access);
      setRefreshToken(data.refresh);
      setUser(jwt_decode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
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

  let updateToken = async () => {
    let response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    let data = await response.json();

    if (response.status === 200) {
      setUserToken(data.access);
      setRefreshToken(data.refresh);
      setUser(jwt_decode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
    } else {
      logoutUser();
    }

    if (loading) {
      setLoading(false);
    }
  };

  let contextData = {
    user: user,
    userToken: userToken,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };

  useEffect(() => {
    if (loading) {
      updateToken();
    }

    let interval = setInterval(() => {
      if (userToken) {
        updateToken();
      }
    }, 1000 * 60 * 4.8);
    return () => clearInterval(interval);
  }, [userToken, loading]);

  return <AuthContext.Provider value={contextData}>{loading ? null : children}</AuthContext.Provider>;
};
