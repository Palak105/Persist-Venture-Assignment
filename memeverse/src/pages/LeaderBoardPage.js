import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Box,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import Header from "./Header";
import axios from "axios";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

const LeaderBoardPage = () => {
  const [memes, setMemes] = useState([]);
  const [topMemes, setTopMemes] = useState([]);
  const [userRankings, setUserRankings] = useState([]);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [localMemes, setLocalMemes] = useState([]);

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
    const keys = Object.keys(localStorage);
    const memeIds = keys
      .filter((key) => key.startsWith("name_"))
      .map((key) => key.replace("name_", ""));

    const formattedMemes = memeIds.map((id) => ({
      id,
      name: localStorage.getItem(`name_${id}`),
      example: { url: localStorage.getItem(`url_${id}`) },
    }));
    setLocalMemes(formattedMemes);
  }, []);

  useEffect(() => {
    const filterMemes = memes
      .map((meme) => {
        const likes = JSON.parse(localStorage.getItem(`likes_${meme.id}`)) || 0;
        return { ...meme, likes };
      })
      .filter((meme) => meme.likes > 0)
      .sort((a, b) => b.likes - a.likes);

    setTopMemes(filterMemes);
  }, [memes]);

  useEffect(() => {
    if (localMemes.length > 0) {
      fetchMemes();
    }
  }, [localMemes]);

  const fetchMemes = async () => {
    try {
      const response = await axios.get(`https://api.memegen.link/templates`);
      let newMemes = response.data;
      newMemes = [...localMemes, ...newMemes];

      setMemes((prev) => {
        const updatedMemes = [...prev, ...newMemes];
        return Array.from(new Set(updatedMemes.map((m) => m.id))).map((id) =>
          updatedMemes.find((m) => m.id === id)
        );
      });
    } catch (error) {
      console.error("Error fetching memes:", error);
    }
  };

  useEffect(() => {
    const defaultUsers = [
      { userId: "User1", likes: 10, comments: 5 },
      { userId: "User2", likes: 7, comments: 3 },
      { userId: "User3", likes: 5, comments: 2 },
    ];

    const users = {};

    const allMemes = JSON.parse(localStorage.getItem("memes")) || [];
    allMemes.forEach((meme) => {
      const memeId = meme.id;
      const likes = JSON.parse(localStorage.getItem(`likes_${memeId}`)) || 0;
      const comments =
        JSON.parse(localStorage.getItem(`comments_${memeId}`)) || [];

      const userId = meme.creator || "Anonymous";

      if (!users[userId]) {
        users[userId] = { userId, likes: 0, comments: 0 };
      }
      users[userId].likes += likes;
      users[userId].comments += comments.length;
    });

    let sortedUsers = Object.values(users)
      .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
      .slice(0, 10);

    if (sortedUsers.length === 0) {
      sortedUsers = defaultUsers;
    }

    setUserRankings(sortedUsers);
  }, []);

  return (
    <>
      <Header
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        profile={profile}
      />
      <Container sx={{ textAlign: "center" }}>
        <Typography variant="h4">Leaderboard</Typography>

        <Typography variant="h5" sx={{ mt: 3 }}>
          Top Most Liked Memes
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {topMemes.length > 0 ? (
            topMemes.map((meme, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
                      image={meme?.example?.url}
                      alt={meme.name}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Card>
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <IconButton
                      sx={{
                        //color: (theme) => theme.palette.primary.main,
                        "&:hover": { backgroundColor: "transparent" },
                      }}
                      disableRipple
                    >
                      <FavoriteIcon />
                      <Typography sx={{ ml: 1 }}>
                        {JSON.parse(localStorage.getItem(`likes_${meme.id}`)) ||
                          0}
                        {" likes"}
                      </Typography>
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No memes ranked yet.</Typography>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="h5"
          sx={{ mt: 3, fontWeight: "bold", color: "primary.main" }}
        >
          🔥 Top Engaged Users
        </Typography>

        <Box
          sx={{
            mt: 2,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "background.paper",
            boxShadow: 3,
          }}
        >
          <List>
            {userRankings.length > 0 ? (
              userRankings.map((user, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bordercolor: index % 2 === 0 ? "grey.100" : "grey.50",
                    borderRadius: 4,
                    my: 1,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={`https://i.pravatar.cc/150?img=${index + 5}`}
                    />
                  </ListItemAvatar>
                  <ListItem
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      {index + 1}. {user.userId}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <ThumbUpIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {user.likes} Likes
                      </Typography>
                      <CommentIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {user.comments} Comments
                      </Typography>
                    </Box>
                  </ListItem>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: "center" }}>
                No users ranked yet.
              </Typography>
            )}
          </List>
        </Box>
      </Container>
    </>
  );
};

export default LeaderBoardPage;
