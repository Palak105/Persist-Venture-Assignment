import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardMedia,
  Grid,
  CardActionArea,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import Header from "./Header";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const Upload = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [aiCaption, setAiCaption] = useState("");
  const [caption, setCaption] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);

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
    const fetchMemeTemplates = async () => {
      try {
        const response = await fetch("https://api.memegen.link/templates");
        const templates = await response.json();
        setFilteredTemplates(templates);
      } catch (error) {
        console.error("Error fetching meme templates:", error);
      }
    };
    fetchMemeTemplates();
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setOpenDialog(false);
  };

  const generateMeme = () => {
    if (!selectedTemplate) {
      alert("Please select a meme template!");
      return;
    }

    if (!text1 && !text2) {
      alert("Please enter at least one text field!");
      return;
    }

    setLoading(true);

    const formattedText1 = text1.trim()
      ? encodeURIComponent(text1).replace(/_/g, "__").replace(/-/g, "--")
      : "_";
    const formattedText2 = text2.trim()
      ? encodeURIComponent(text2).replace(/_/g, "__").replace(/-/g, "--")
      : "_";

    const memeUrl = `https://api.memegen.link/images/${selectedTemplate.id}/${formattedText1}/${formattedText2}.png`;

    setGeneratedMemeUrl(memeUrl);
    setLoading(false);
  };

  const generateAICaption = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://api.memegen.link/templates");
      console.log(response.data.name);
      const randomMeme =
        response.data[Math.floor(Math.random() * response.data.length)];
      setAiCaption(randomMeme.name);
    } catch (error) {
      console.error("Error generating AI caption:", error);
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    const formattedText1 = text1.trim()
      ? encodeURIComponent(text1).replace(/_/g, "__").replace(/-/g, "--")
      : "_";
    const formattedText2 = text2.trim()
      ? encodeURIComponent(text2).replace(/_/g, "__").replace(/-/g, "--")
      : "_";
    formData.append("template_id", selectedTemplate.id);
    formData.append("text", formattedText1);
    formData.append("text", formattedText2);

    try {
      const response = await axios.post(
        "https://api.memegen.link/images",
        formData
      );
      console.log("Uploaded Meme URL:", response);
      //console.log(response.data.data.image.name.split("-")[0]);
      localStorage.setItem(`url_${selectedTemplate.id}`, response.data.url);
      localStorage.setItem(`name_${selectedTemplate.id}`, aiCaption);
      alert("Meme uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <Header
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        profile={profile}
      />
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h4">Upload a Meme</Typography>

        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={() => setOpenDialog(true)}
        >
          Select Template
        </Button>
        {selectedTemplate && (
          <Card sx={{ mt: 2, p: 2 }}>
            <CardMedia
              component="img"
              image={selectedTemplate.blank}
              alt="Selected Meme"
              sx={{ maxHeight: 300, objectFit: "contain" }}
            />
          </Card>
        )}

        <TextField
          label="Text 1 (Top Text)"
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          value={text1}
          onChange={(e) => setText1(e.target.value)}
        />
        <TextField
          label="Text 2 (Bottom Text)"
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          value={text2}
          onChange={(e) => setText2(e.target.value)}
        />

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateMeme}
            disabled={loading}
          >
            {loading ? "Generating Meme..." : "Generate Meme"}
          </Button>
        </Box>

        {generatedMemeUrl && (
          <>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Your Generated Meme:</Typography>
              <Card sx={{ mt: 1 }}>
                <CardMedia
                  component="img"
                  image={generatedMemeUrl}
                  alt="Generated Meme"
                />
              </Card>
            </Box>
            <TextField
              label="Add a Caption"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={generateAICaption}
            >
              Generate AI Caption
            </Button>
            {aiCaption && (
              <Typography variant="body1" sx={{ mt: 1, fontStyle: "italic" }}>
                AI Suggestion: {aiCaption}
              </Typography>
            )}
            <Box sx={{ mt: 3, mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Meme"}
              </Button>
            </Box>
          </>
        )}
      </Container>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Select a Meme Template
          <IconButton onClick={() => setOpenDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ maxHeight: 400, overflowY: "auto", p: 3 }}>
          <Grid container spacing={2}>
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <Grid item xs={6} sm={4} md={3} key={template.id}>
                  <Card
                    sx={{
                      border:
                        selectedTemplate && selectedTemplate.id === template.id
                          ? "3px solid #1976d2"
                          : "none",
                      borderRadius: "8px",
                      boxShadow: 2,
                      "&:hover": {
                        transform: "scale(1.05)",
                        transition: "0.3s",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardMedia
                        component="img"
                        image={template.blank}
                        alt={template.name}
                        sx={{ height: 120, objectFit: "cover" }}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography sx={{ textAlign: "center", width: "100%", mt: 2 }}>
                No templates found.
              </Typography>
            )}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Upload;
