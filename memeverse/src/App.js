import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Explorer from "./pages/Explorer";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MemeDetails from "./pages/MemeDetails";
import LeaderBoardPage from "./pages/LeaderBoardPage";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IconButton
        sx={{ position: "absolute", top: 10, right: 10 }}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/memes/:id" element={<MemeDetails />} />
        <Route path="/leaderboard" element={<LeaderBoardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
