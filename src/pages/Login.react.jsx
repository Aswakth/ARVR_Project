import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Container, Box, Typography, Button, TextField } from "@mui/material";
import loginImg from "../assets/images/login.svg";
import Header from "../components/header/header.react";

function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    const uid = Math.random().toString(36).slice(2, 10);
    Cookies.set("userID", uid, { expires: 7 });
    localStorage.setItem("name", name || "User");
    localStorage.setItem("email", email || "");
    localStorage.setItem("photo", "");
    navigate("/home");
  };

  return (
    <>
      <Header />
      <Container
        sx={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          width: { lg: "80%", sm: "80%", xs: "80%" },
          borderRadius: "24px",
        }}
        className="glassmorphism"
      >
        <Box sx={{ width: { lg: "40%", sm: "50%", xs: "100%" } }}>
          <img src={loginImg} alt="login" width="100%" />
        </Box>
        <Box
          sx={{
            width: { lg: "50%", sm: "100%", xs: "100%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            padding: "10px",
          }}
        >
          <Typography
            variant="h4"
            color="secondary"
            sx={{ fontSize: { lg: "2rem", xs: "1.5rem" } }}
          >
            Sign in (Local)
          </Typography>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogin}
              size="small"
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
export default Login;
