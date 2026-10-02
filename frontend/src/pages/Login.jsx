import { useState } from "react";
import "./Login.css";
import API_URL from "../api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            console.log("Login successful:", data);

            localStorage.setItem("token", data.token);

           window.location.href = "/home";

        } catch (error) {
            console.error(error);
            alert("Unable to connect to server");
        }
    };

    return (
        <div className="login-page">

            <div className="login-left">
                <h1>Smart Freelancer</h1>

                <p>
                    Project & Client Management System
                </p>
            </div>

            <div className="login-right">
                <div className="login-card">

                    <h2 className="login-title">
                        Login
                    </h2>

                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        <button
                            type="submit"
                            className="login-button"
                        >
                            Login
                        </button>

                    </form>

                </div>
            </div>

        </div>
    );
}

export default Login;