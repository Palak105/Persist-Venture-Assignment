import React from "react";
import {
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Header = ({ openSidebar, setOpenSidebar, profile }) => {
  const navigate = useNavigate();

  return (
    <>
      <IconButton
        onClick={() => setOpenSidebar(true)}
        sx={{ top: 15, left: 15 }}
      >
        <MenuIcon fontSize="large" />
      </IconButton>

      <Drawer
        anchor="left"
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
      >
        <Container sx={{ width: 250, textAlign: "center", mt: 3 }}>
          <Avatar
            src={profile.avatar}
            sx={{ width: 80, height: 80, mt: 2, mx: "auto", cursor: "pointer" }}
            onClick={() => {
              navigate("/profile");
              setOpenSidebar(false);
            }}
          />
          <Divider sx={{ my: 2 }} />

          <List>
            {[
              { text: "Home", path: "/" },
              { text: "User Profile", path: "/profile" },
              { text: "Explore Memes", path: "/explorer" },
              { text: "Upload Memes", path: "/upload" },
              { text: "LeaderBoard", path: "/leaderboard" },
            ].map(({ text, path }) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  navigate(path);
                  setOpenSidebar(false);
                }}
              >
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Container>
      </Drawer>
    </>
  );
};

export default Header;
