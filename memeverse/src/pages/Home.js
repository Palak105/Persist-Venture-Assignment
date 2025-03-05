import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { motion } from "framer-motion";
import Header from "./Header";

const Home = () => {
  const [memes, setMemes] = useState([]);
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

  useEffect(() => {
    axios.get("https://api.memegen.link/templates").then((response) => {
      setMemes(response.data.slice(0, 6));
    });
  }, []);

  return (
    <>
      <Header
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        profile={profile}
      />
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h3" color="primary">
          Welcome to MemeVerse!
        </Typography>
        <Grid container spacing={2} sx={{ mt: 4 }}>
          {memes.map((meme) => (
            <Grid item xs={12} sm={6} md={4} key={meme.id}>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Card
                  sx={{ height: 500, display: "flex", flexDirection: "column" }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ textAlign: "center" }}>
                      {meme.name}
                    </Typography>
                  </CardContent>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 400,
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={meme.example.url}
                      alt={meme.name}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Card>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home;
