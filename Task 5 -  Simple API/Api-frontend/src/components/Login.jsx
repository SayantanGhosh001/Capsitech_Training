import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  //  const [email, setEmail] = useState("");
  //  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // const handleEmailChange = (e) => setEmail(e.target.value);
  // const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      login(res.data.token);
      toast.success("Login Successfull🌻!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      navigate("/tasks");
    } catch (error) {
      // alert("Invalid credentials");
      toast.error("Invalid credentials!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  return (
    <>
      <section className="bg-[#F9FAFB] dark:bg-[#111827]">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0">
          <div className="w-full bg-[#FFFFFF] rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-[#1F2937] dark:border-[#374151]">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-[1.25rem] font-bold leading-tight tracking-tight text-[#111827] md:text-[1.5rem] dark:text-[#FFFFFF]">
                Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-[0.875rem] font-medium text-[#111827] dark:text-[#FFFFFF]"
                  >
                    Email
                  </label>
                  <input
                    name="email"
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="bg-[#F9FAFB] border border-[#D1D5DB] text-[#111827] rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB] block w-full p-[0.625rem] dark:bg-[#374151] dark:border-[#4B5563] dark:placeholder-[#9CA3AF] dark:text-[#FFFFFF] dark:focus:ring-[#3B82F6] dark:focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-[0.875rem] font-medium text-[#111827] dark:text-[#FFFFFF]"
                  >
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="bg-[#F9FAFB] border border-[#D1D5DB] text-[#111827] rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB] block w-full p-[0.625rem] dark:bg-[#374151] dark:border-[#4B5563] dark:placeholder-[#9CA3AF] dark:text-[#FFFFFF] dark:focus:ring-[#3B82F6] dark:focus:border-[#3B82F6]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-[#FFFFFF] bg-[#2563EB] hover:bg-[#1E40AF] focus:ring-4 focus:outline-none focus:ring-[#93C5FD] font-medium rounded-lg text-[0.875rem] px-[1.25rem] py-[0.625rem] text-center dark:bg-[#2563EB] dark:hover:bg-[#1E40AF] dark:focus:ring-[#1E3A8A]"
                >
                  Sign in
                </button>
                <p className="text-[0.875rem] font-light text-[#6B7280] dark:text-[#9CA3AF]">
                  Don’t have an account yet?
                  <a
                    href="/register"
                    className="font-medium text-[#2563EB] hover:underline dark:text-[#3B82F6] ml-2"
                  >
                    Sign up
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
