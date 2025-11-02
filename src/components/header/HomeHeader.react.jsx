import React, { useState } from "react";
import "../../App.css";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Divider,
  Button,
  IconButton,
  AppBar,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
// logout removed from header; authentication handled elsewhere
const drawerWidth = `100%`;

const HomeHeader = ({ props }) => {
  // navigation/handleClick removed; logout handled elsewhere
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      {/* Navbar */}

      <Container
        sx={{
          background: "#00040f",
          display: "flex",
          flexDirection: "column",
          justifyContent: { lg: "space-between", xs: "flex-start" },
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        <Link to="/home">
          <Box
            sx={{
              display: { lg: "flex", md: "flex", sm: "flex", xs: "flex" },
              justifyContent: {
                md: "flex-start",
                sm: "flex-start",
                xs: "flex-start",
              },
              alignItems: { md: "center", sm: "center", xs: "center" },
            }}
          />
        </Link>
        <List
          sx={{
            width: "60%",
            color: "#fff",
          }}
        >
          {/* <a href="/bm" className="link" onClick={handleDrawerToggle}>
            <ListItemButton>
              <ListItemText primary="Measurements" />
            </ListItemButton>
          </a>
          <a href="/diet" className="link" onClick={handleDrawerToggle}>
            <ListItemButton>
              <ListItemText primary="Diet" />
            </ListItemButton>
          </a> */}
          <Link to="/yoga" className="link" onClick={handleDrawerToggle}>
            <ListItemButton>
              <ListItemText primary="Yoga" />
            </ListItemButton>
          </Link>
          <Link to="/workout" className="link" onClick={handleDrawerToggle}>
            <ListItemButton>
              <ListItemText primary="Workout" />
            </ListItemButton>
          </Link>
          <Divider
            color="#fff"
            sx={{
              width: "50%",
            }}
          />
          {/* Logout removed per request */}
        </List>
      </Container>
      {/* Navbar */}
    </>
  );
  return (
    <>
      {/* Navbar */}

      <Box
        sx={{
          position: "relative",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <AppBar
          component="nav"
          position="relative"
          sx={{
            boxShadow: " 0 0 10px 0 #ffffff64",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: {
                lg: "center",
                md: "flex-start",
                sm: "flex-start",
                xs: "center",
              },
              aligncenter: "center",
              background: "primary",
            }}
          >
            <IconButton
              color="secondary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { lg: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Link to="/home">
              <Box
                sx={{
                  display: { lg: "flex", md: "flex", sm: "flex", xs: "flex" },
                  justifyContent: {
                    md: "flex-start",
                    sm: "flex-start",
                    xs: "flex-start",
                  },
                  alignItems: { md: "center", sm: "center", xs: "center" },
                }}
              >
                {/* logo removed */}
              </Box>
            </Link>
            <Box
              sx={{
                display: { lg: "flex", xs: "none", md: "none", sm: "none" },
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                textTransform: "capitalize",
                color: "#ffffff",
              }}
            >
              {/* <a href="/bm" className="link">
                <Button variant="h6">Measurements</Button>
              </a>
              <a href="/diet" className="link">
                <Button variant="h6">Diet</Button>
              </a> */}
              <Link to="/yoga" className="link">
                <Button variant="h6">Yoga</Button>
              </Link>
              <Link to="/workout" className="link">
                <Button variant="h6">Workout</Button>
              </Link>
              {/* Logout removed */}
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "block", sm: "flex", md: "flex", lg: "none" },
            height: "100%",
            overflowY: { xs: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "#00040f",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default HomeHeader;
