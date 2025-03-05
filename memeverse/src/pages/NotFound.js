import React, { useEffect, useState } from "react";
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const NotFound = () => {
  const navigate = useNavigate();
  const [openSidebar, setOpenSidebar] = useState(false);

  const [profile, setProfile] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("userProfile")) || {
        name: "Palak",
        bio: "Software Developer",
        avatar: "https://i.pravatar.cc/150?img=5",
      }
    );
  });

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem("userProfile"));
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  return (
    <>
      <Header
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        profile={profile}
      />
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <img
          src="https://i.imgflip.com/3pnmg.jpg"
          alt="404 Meme"
          style={{ width: "350px", height: "300px", marginTop: "50px" }}
        />
        <Typography variant="h4" sx={{ mt: 2 }}>
          Oops! This page doesn't exist 🤷‍♂️
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate("/")}
        >
          Go Home
        </Button>
      </Container>
    </>
  );
};

export default NotFound;
