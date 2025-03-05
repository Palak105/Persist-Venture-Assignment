import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
} from "@mui/material";
import Header from "./Header";

const IMGBB_API_KEY = "14ebb3e34a0e21cf82e38f842bfe2bc0";

const Profile = () => {
  const [profile, setProfile] = useState(() => {
    const savedProfile = JSON.parse(localStorage.getItem("userProfile"));
    return (
      savedProfile || {
        name: "Palak",
        bio: "Software Developer",
        avatar: "https://i.pravatar.cc/150?img=5",
      }
    );
  });

  const [editing, setEditing] = useState(false);
  const [newProfile, setNewProfile] = useState(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  const [memes, setMemes] = useState([]);

  useEffect(() => {
    const keys = Object.keys(localStorage);
    const memeIds = keys
      .filter((key) => key.startsWith("name_")) // Find keys that store meme names
      .map((key) => key.replace("name_", "")); // Extract meme IDs (e.g., "aag", "ackbar")

    const formattedMemes = memeIds.map((id) => ({
      id,
      name: localStorage.getItem(`name_${id}`),
      imageUrl: localStorage.getItem(`url_${id}`),
      likes: parseInt(localStorage.getItem(`likes_${id}`)) || 0,
      comments: JSON.parse(localStorage.getItem(`comments_${id}`) || "[]"),
    }));

    setMemes(formattedMemes);
  }, []);

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem("userProfile"));
    if (savedProfile) {
      setProfile(savedProfile);
      setNewProfile(savedProfile);
    }
  }, []);

  const handleSaveProfile = async () => {
    setUploading(true);
    let updatedProfile = { ...newProfile };

    if (avatarFile) {
      const formData = new FormData();
      formData.append("image", avatarFile);

      try {
        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (data.success) {
          updatedProfile.avatar = data.data.url;
        } else {
          console.error("Failed to upload image");
          alert("Image upload failed. Try again.");
          setUploading(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image.");
        setUploading(false);
        return;
      }
    }

    saveToLocalStorage(updatedProfile);
    setProfile(updatedProfile);
    setEditing(false);
    setUploading(false);
  };

  const saveToLocalStorage = (updatedProfile) => {
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
  };

  return (
    <>
      <Header
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        profile={profile}
      />
      <Container sx={{ textAlign: "center" }}>
        <Avatar
          src={profile.avatar}
          sx={{ width: 100, height: 100, margin: "auto" }}
        />

        {editing ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              style={{ marginTop: "10px" }}
            />
            <TextField
              label="Name"
              fullWidth
              sx={{ mt: 2 }}
              value={newProfile.name}
              onChange={(e) =>
                setNewProfile({ ...newProfile, name: e.target.value })
              }
            />
            <TextField
              label="Bio"
              fullWidth
              multiline
              sx={{ mt: 2 }}
              value={newProfile.bio}
              onChange={(e) =>
                setNewProfile({ ...newProfile, bio: e.target.value })
              }
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleSaveProfile}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save Profile"}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {profile.name}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontStyle: "italic" }}>
              {profile.bio}
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          </>
        )}

        <Typography variant="h4" sx={{ mt: 4 }}>
          Uploaded Memes
        </Typography>
        {memes.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No memes uploaded yet! Start uploading some funny ones.
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {memes.map((meme, index) => (
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
                      image={meme.imageUrl}
                      alt={meme.name}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Card>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default Profile;
