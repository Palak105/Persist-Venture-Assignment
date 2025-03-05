import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Popover,
  Box,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import MessageIcon from "@mui/icons-material/Message";
import { debounce } from "lodash";
import Header from "./Header";

const Explorer = () => {
  const [memes, setMemes] = useState([]);
  const [filteredMemes, setFilteredMemes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [category, setCategory] = useState("trending");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [localMemes, setLocalMemes] = useState([]);

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

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchMemes = useCallback(async () => {
    try {
      const response = await axios.get(`https://api.memegen.link/templates`);
      let newMemes = response.data;
      newMemes = [...localMemes, ...newMemes];

      if (page === 1) {
        setMemes(newMemes);
        setFilteredMemes(newMemes);
      } else {
        setMemes((prev) => {
          const updatedMemes = [...prev, ...newMemes];
          return Array.from(new Set(updatedMemes.map((m) => m.id))).map((id) =>
            updatedMemes.find((m) => m.id === id)
          );
        });
      }

      setHasMore(newMemes.length > 0);
    } catch (error) {
      console.error("Error fetching memes:", error);
    }
  }, [localMemes, page]);

  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);

  const debouncedHandleSearch = useMemo(
    () =>
      debounce((query) => {
        setSearch(query);
        if (!query) {
          setFilteredMemes(memes);
        } else {
          const filtered = memes.filter((meme) =>
            meme.name.toLowerCase().includes(query.toLowerCase())
          );
          setFilteredMemes(filtered);
        }
      }, 300),
    [memes] // Dependencies
  );

  const handleSearch = useCallback(
    (query) => debouncedHandleSearch(query),
    [debouncedHandleSearch]
  );

  const shareOnFacebook = () => {
    //window.open(`https://www.facebook.com/sharer/sharer.php?u=${meme.url}`, "_blank");
    handleClose();
  };

  const shareOnTwitter = () => {
    //window.open(`https://twitter.com/intent/tweet?url=${meme.url}&text=Check out this meme!`, "_blank");
    handleClose();
  };

  const shareViaMessage = () => {
    navigator.share
      ? navigator.share({
          title: "Check out this meme!",
          //url: meme.url,
        })
      : alert("Sharing is not supported on this browser.");
    handleClose();
  };

  useEffect(() => {
    handleSearch(search);
  }, [memes, search, handleSearch]);

  const handleRedirect = (id) => {
    const url = `${process.env.REACT_APP_BASE_URL}/memes/${id}`;
    window.open(url, "_blank");
  };

  const handleDownload = async (url, id) => {
    const isConfirmed = window.confirm("Do you want to download this meme?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${id}.jpg`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    setFilteredMemes(sortMemes(memes, sort, category));
  }, [sort, category, memes]);

  const sortMemes = (memes, sort, category) => {
    let sortedMemes = [...memes];

    switch (category) {
      case "trending":
        sortedMemes.sort((a, b) => {
          const scoreA =
            (JSON.parse(localStorage.getItem(`likes_${a.id}`)) || 0) * 2 +
            (JSON.parse(localStorage.getItem(`comments_${a.id}`)) || []).length;
          const scoreB =
            (JSON.parse(localStorage.getItem(`likes_${b.id}`)) || 0) * 2 +
            (JSON.parse(localStorage.getItem(`comments_${b.id}`)) || []).length;
          return scoreB - scoreA;
        });
        break;

      case "new":
        console.log("New");
        sortedMemes = sortedMemes.filter((meme) =>
          meme.created_at
            ? new Date(meme.created_at) > Date.now() - 7 * 24 * 60 * 60 * 1000
            : true
        );
        break;
      case "classic":
        console.log("Classic");
        sortedMemes = sortedMemes.filter((meme) =>
          meme.created_at
            ? new Date(meme.created_at) < Date.now() - 365 * 24 * 60 * 60 * 1000
            : true
        );
        break;
      case "random":
        console.log("Random");
        sortedMemes.sort(() => Math.random() - 0.5);
        break;
      default:
        break;
    }

    switch (sort) {
      case "date":
        console.log("date");
        sortedMemes.sort((a, b) =>
          a.created_at && b.created_at
            ? new Date(b.created_at) - new Date(a.created_at)
            : 0
        );
        break;
      case "likes":
        console.log("Likes");
        sortedMemes.sort(
          (a, b) =>
            (JSON.parse(localStorage.getItem(`likes_${b.id}`)) || 0) -
            (JSON.parse(localStorage.getItem(`likes_${a.id}`)) || 0)
        );
        break;
      case "comments":
        console.log("Comments");
        sortedMemes.sort(
          (a, b) =>
            (JSON.parse(localStorage.getItem(`comments_${b.id}`)) || [])
              .length -
            (JSON.parse(localStorage.getItem(`comments_${a.id}`)) || []).length
        );
        break;
      default:
        break;
    }

    return sortedMemes;
  };

  return (
    <>
      <Header
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        profile={profile}
      />

      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h4">Meme Explorer</Typography>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          sx={{ mt: 2, mb: 2 }}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mr: 2 }}
        >
          <MenuItem value="trending">Trending</MenuItem>
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="classic">Classic</MenuItem>
          <MenuItem value="random">Random</MenuItem>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <MenuItem value="date">Sort by Date</MenuItem>
          <MenuItem value="likes">Sort by Likes</MenuItem>
          <MenuItem value="comments">Sort by Comments</MenuItem>
        </Select>

        <InfiniteScroll
          dataLength={filteredMemes.length}
          next={() => setPage((prev) => prev + 1)}
          hasMore={hasMore}
          //loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {filteredMemes &&
              filteredMemes.map((meme, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: 500,
                      display: "flex",
                      flexDirection: "column",
                    }}
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
                          cursor: "pointer",
                        }}
                        onClick={() => handleRedirect(meme.id)}
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
                          color: (theme) => theme.palette.primary.main,
                          "&:hover": { backgroundColor: "transparent" },
                          pointerEvents: "none",
                        }}
                        disableRipple
                      >
                        <FavoriteIcon />
                        <Typography sx={{ ml: 1 }}>
                          {JSON.parse(
                            localStorage.getItem(`likes_${meme.id}`)
                          ) || 0}
                          {" likes"}
                        </Typography>
                      </IconButton>

                      <IconButton
                        sx={{
                          color: (theme) => theme.palette.primary.main,
                          "&:hover": { backgroundColor: "transparent" },
                          pointerEvents: "none",
                        }}
                        disableRipple
                      >
                        <CommentIcon />
                        <Typography sx={{ ml: 1 }}>
                          {(
                            JSON.parse(
                              localStorage.getItem(`comments_${meme.id}`)
                            ) || 0
                          ).length || 0}
                          {" comments"}
                        </Typography>
                      </IconButton>
                      <IconButton
                        sx={{
                          color: (theme) => theme.palette.primary.main,
                          "&:hover": { backgroundColor: "transparent" },
                        }}
                        disableRipple
                        onClick={() =>
                          handleDownload(meme.example.url, meme.id)
                        }
                      >
                        <DownloadIcon />
                        <Typography sx={{ ml: 1 }}></Typography>
                      </IconButton>
                      <IconButton
                        onClick={handleShareClick}
                        sx={{
                          color: (theme) => theme.palette.primary.main,
                          "&:hover": { backgroundColor: "transparent" },
                        }}
                        disableRipple
                      >
                        <ShareIcon />
                      </IconButton>

                      <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "bottom",
                          horizontal: "center",
                        }}
                        sx={{
                          ml: -7,
                          mb: 4,
                          "& .MuiPaper-root": {
                            backgroundColor: "white",
                            boxShadow: "0px 0px 0px rgba(0, 0, 0, 0.1)",
                            borderRadius: "2px",
                            p: 1,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            onClick={shareOnFacebook}
                            sx={{
                              bgcolor: "#1877F2",
                              "&:hover": { bgcolor: "#1565C0" },
                            }}
                          >
                            <FacebookIcon
                              sx={{ color: "white", fontSize: 30 }}
                            />
                          </IconButton>

                          <IconButton
                            onClick={shareOnTwitter}
                            sx={{
                              bgcolor: "#1DA1F2",
                              "&:hover": { bgcolor: "#0d8ae8" },
                            }}
                          >
                            <TwitterIcon
                              sx={{ color: "white", fontSize: 30 }}
                            />
                          </IconButton>

                          <IconButton
                            onClick={shareViaMessage}
                            sx={{
                              bgcolor: "#25D366",
                              "&:hover": { bgcolor: "#1EBE5D" },
                            }}
                          >
                            <MessageIcon
                              sx={{ color: "white", fontSize: 30 }}
                            />
                          </IconButton>
                        </Box>
                      </Popover>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </InfiniteScroll>
      </Container>
    </>
  );
};

export default Explorer;
