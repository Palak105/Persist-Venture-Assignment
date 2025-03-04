import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import axios from "axios";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { motion } from "framer-motion";
import Header from "./Header";

const MemeDetails = () => {
  const { id } = useParams();
  const [meme, setMeme] = useState(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
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

  const fetchMemes = async () => {
    try {
      const response = await axios.get(`https://api.memegen.link/templates`);
      if (response) {
        let arr = response.data;
        const selectedMeme = arr.find((meme) => meme.id === id);
        setMeme(selectedMeme);
        setLikes(parseInt(localStorage.getItem(`likes_${id}`)) || 0);
        setComments(JSON.parse(localStorage.getItem(`comments_${id}`)) || []);
      } else {
        console.error("Meme not found");
      }
    } catch (error) {
      console.error("Error fetching memes:", error);
    }
  };

  useEffect(() => {
    fetchMemes();
  });

  const handleLike = () => {
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem(`likes_${id}`, newLikes.toString());
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));
    setNewComment("");
  };

  if (!meme) return <Typography>Loading...</Typography>;

  return (
    <>
      <Header
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        profile={profile}
      />
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Card sx={{ maxWidth: 600, mx: "auto", p: 2, boxShadow: 3 }}>
          <CardMedia
            component="img"
            image={meme.example.url}
            alt={meme.name}
            height="300"
            sx={{ borderRadius: 2, objectFit: "contain" }}
          />

          <CardContent>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
              {meme.name}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <motion.div whileTap={{ scale: 1.2 }}>
                <Button
                  startIcon={<FavoriteIcon />}
                  color="error"
                  onClick={handleLike}
                  variant="contained"
                  sx={{ borderRadius: "20px" }}
                >
                  {likes} Likes
                </Button>
              </motion.div>
            </Box>

            <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>
              Comments
            </Typography>

            <TextField
              label="Add a Comment"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2, borderRadius: "20px" }}
              onClick={handleCommentSubmit}
            >
              Post Comment
            </Button>

            <List sx={{ mt: 2, maxHeight: 200, overflowY: "auto" }}>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <ListItem key={index} sx={{ borderBottom: "1px solid #ddd" }}>
                    <ListItemText primary={comment} />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No comments yet. Be the first to comment!
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default MemeDetails;
