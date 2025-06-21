import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export let UserContext = createContext();

export default function UserContextProvider(props) {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load token from localStorage when app starts
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is not expired
        if (decoded.exp * 1000 > Date.now()) {
          setUserToken(token);
          // Try to get user data from localStorage or decode from token
          const storedUserData = localStorage.getItem("userData");
          if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
          }
        } else {
          // Token expired, remove it
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
        }
      } catch (error) {
        // Invalid token, remove it
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const setUserLogin = (token, user) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userData", JSON.stringify(user));
    setUserToken(token);
    setUserData(user);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setUserToken(null);
    setUserData(null);
  };

  return (
    <>
      <UserContext.Provider
        value={{
          userToken,
          userData,
          setUserToken,
          setUserLogin,
          logout,
        }}
      >
        {props.children}
      </UserContext.Provider>
    </>
  );
}
