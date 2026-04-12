import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import API from "../api";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // fake login
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          role: isSignup ? "signup" : "login",
        })
      );

      // TEMP: no backend yet
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Auth failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="logo center">ShohojTrust</h2>

        <div className="auth-toggle">
          <button
            type="button"
            className={!isSignup ? "active" : ""}
            onClick={() => setIsSignup(false)}
          >
            Login
          </button>

          <button
            type="button"
            className={isSignup ? "active" : ""}
            onClick={() => setIsSignup(true)}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignup && (
            <input type="password" placeholder="Confirm Password" required />
          )}

          {!isSignup && <p className="forgot">Forgot Password?</p>}

          <button type="submit" className="btn primary full">
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="switch-text">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? " Login" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api";

// const Auth = () => {
//     const [isSignup, setIsSignup] = useState(false);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const navigate = useNavigate();

//     const [form, setForm] = useState({
//     email: "",
//     password: "",
// });

//     const handleSubmit = async (e) => {
//     e.preventDefault();

//         // fake login
//         localStorage.setItem("user", JSON.stringify({
//             email,
//             role: isSignup ? "signup" : "login"
//         }));
//         // TEMP: no backend yet
//         navigate("/dashboard");
//         }
//     } catch (err) {
//         alert(err.response?.data?.msg || "Auth failed");
//     }



//     return (
//         <div className="auth-page">
//         <div className="auth-card">

//             <h2 className="logo center">ShohojTrust</h2>

//             <div className="auth-toggle">
//             <button
//                 className={!isSignup ? "active" : ""}
//                 onClick={() => setIsSignup(false)}
//             >
//                 Login
//             </button>

//             <button
//                 className={isSignup ? "active" : ""}
//                 onClick={() => setIsSignup(true)}
//             >
//                 Sign Up
//             </button>
//             </div>

//             <form className="auth-form" onSubmit={handleSubmit}>
//             <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//             />
//             <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//             />

//             {isSignup && (
//                 <input type="password" placeholder="Confirm Password" required />
//             )}

//             {!isSignup && <p className="forgot">Forgot Password?</p>}

//             <button className="btn primary full">
//                 {isSignup ? "Create Account" : "Login"}
//             </button>
//             </form>

//             <p className="switch-text">
//             {isSignup ? "Already have an account?" : "Don’t have an account?"}
//             <span onClick={() => setIsSignup(!isSignup)}>
//                 {isSignup ? " Login" : " Sign Up"}
//             </span>
//             </p>

//         </div>
//         </div>
//     );
// // };

// export default Auth;
