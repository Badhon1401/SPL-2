"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Register() {
  const [name, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [biodata, setBiodata] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeRequested, setIsCodeRequested] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const validateForm = () => {
    if (!email.includes("@")) return "Invalid email address.";
    if (password.length < 1)
      return "Password must be at least 8 characters long.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!name.trim() || !role.trim()) return "All fields must be filled.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError("");

    const userData = {
      userName: name,
      email: email,
      password: password,
      shortBiodata: biodata,
      role: role,
      userStatus: "active",
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const result = await response.text();
        setError(result || "Registration failed. Please try again.");
        return;
      }

      const token = await response.text();
      localStorage.setItem("jwtTokenTimeWise", token);
      alert("Registration successful!");

      // After successful registration, show the verification code form
      setIsCodeRequested(true);

    } catch (error) {
      setError("An error occurred. Please try again later.");
    }
  };

  const handleVerificationCodeRequest = async () => {
    try {
      const response = await fetch("/api/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error:', errorText);
        alert('Failed to request registration code.');
      } else {
        alert('Verification code sent to your email!');
      }
    } catch (error) {
      alert('An error occurred while requesting the code.');
    }
  };

  const handleCompleteRegistration = async () => {
    try {
      const response = await fetch("/api/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: verificationCode }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error:', errorText);
        alert('Failed to complete registration.');
      } else {
        alert('Registration completed successfully!');
        router.push("/"); // Redirect to the home page or dashboard
      }
    } catch (error) {
      alert('An error occurred while completing registration.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-gray-400">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-8 max-w-lg w-full"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Image src="/images/timewise_logo.png" alt="TimeWise Logo" width={60} height={60} />
          <h1 className="text-4xl font-bold text-blue-400">TimeWise</h1>
        </div>
        <h2 className="text-3xl font-bold text-white text-center mb-6">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {!isCodeRequested ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Working Professional">Working Professional</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Others">Others</option>
            </select>
            <textarea
              placeholder="Short Biodata"
              value={biodata}
              onChange={(e) => setBiodata(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-300"
              type="submit"
            >
              Register
            </motion.button>
          </form>
        ) : (
          <div>
            <h3 className="text-2xl text-white mb-4">Enter Verification Code</h3>
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-300 mb-4"
              onClick={handleVerificationCodeRequest}
            >
              Request Verification Code
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300"
              onClick={handleCompleteRegistration}
            >
              Complete Registration
            </motion.button>
          </div>
        )}

        <p className="text-center text-sm text-blue-400 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
