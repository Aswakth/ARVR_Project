import React, { useRef, useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import angleBetweenThreePoints from "./angle";
import yoga1 from "../assets/images/trikonasana.png";
import { Box, Container, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@material-ui/core";
import { v4 } from "uuid";
import Cookies from "js-cookie";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Trikonasana = () => {
  const navigate = useNavigate();

  // Redirect if user not logged in
  if (!Cookies.get("userID")) {
    alert("Please Login");
    navigate("/");
  }

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const tRef = useRef(new Date().getTime());
  const speech = window.speechSynthesis;

  const speak = (count) => {
    const utterance = new SpeechSynthesisUtterance(count);
    utterance.lang = "en-US";
    speech.speak(utterance);
  };

  const onResult = (results) => {
    if (!results || !results.poseLandmarks) return;
    if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video)
      return;

    const position = results.poseLandmarks;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = webcamRef.current.video.videoWidth;
    canvas.height = webcamRef.current.video.videoHeight;

    const width = canvas.width;
    const height = canvas.height;

    // --- Collect keypoints ---
    const leftHand = [];
    const rightHand = [];
    for (let i = 11; i < 17; i++) {
      const point = {
        x: position[i].x * width,
        y: position[i].y * height,
      };
      if (i % 2 === 0) rightHand.push(point);
      else leftHand.push(point);
    }

    const backIndices = [12, 24, 26];
    const back = backIndices.map((i) => ({
      x: position[i].x * width,
      y: position[i].y * height,
    }));

    // --- Calculate Angles ---
    const angleBack = Math.round(angleBetweenThreePoints(back));
    const angleLeftHand = Math.round(angleBetweenThreePoints(leftHand));
    const angleRightHand = Math.round(angleBetweenThreePoints(rightHand));

    const inRangeBack = angleBack >= 120 && angleBack <= 140;
    const inRangeLeftHand = angleLeftHand >= 165 && angleLeftHand <= 195;
    const inRangeRightHand = angleRightHand >= 165 && angleRightHand <= 195;

    // --- Draw ---
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawLine = (points, condition) => {
      for (let i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.strokeStyle = condition ? "green" : "red";
        ctx.stroke();
      }
    };

    drawLine(back, inRangeBack);
    drawLine(leftHand, inRangeLeftHand);
    drawLine(rightHand, inRangeRightHand);

    const drawDots = (points) => {
      for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#AAFF00";
        ctx.fill();
      }
    };

    drawDots(leftHand);
    drawDots(rightHand);
    drawDots(back);

    if (!(inRangeBack && inRangeLeftHand && inRangeRightHand)) {
      tRef.current = new Date().getTime();
    }

    const seconds = Math.round((new Date().getTime() - tRef.current) / 1000);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`Seconds held: ${seconds}`, 10, 40);

    // Show angles
    ctx.fillStyle = "green";
    ctx.fillText(angleLeftHand, leftHand[1].x + 20, leftHand[1].y + 20);
    ctx.fillText(angleRightHand, rightHand[1].x - 120, rightHand[1].y + 20);
    ctx.fillText(angleBack, back[1].x, back[1].y + 40);

    ctx.restore();
    speak(seconds);
  };

  // --- Setup Pose + Camera ---
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1624666670/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResult);

    if (webcamRef.current && webcamRef.current.video) {
      cameraRef.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            await pose.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }
  }, []);

  const handleClick = () => {
    const ID = Cookies.get("userID");
    const docRef = doc(db, `user/${ID}/trikonasana`, v4());
    setDoc(docRef, {
      timeStamp: serverTimestamp(),
      uid: ID,
    })
      .then(() => console.log("✅ Pose record saved"))
      .catch((e) => console.error("❌ Firestore error:", e));
  };

  return (
    <Container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: { lg: "space-between", sm: "center", xs: "center" },
        height: "100vh",
        width: "100%",
        flexDirection: { lg: "row", sm: "column", xs: "column" },
      }}
    >
      {/* Left - Webcam & Canvas */}
      <Box
        sx={{
          display: "flex",
          position: "relative",
          borderRadius: "2rem",
          width: "100%",
        }}
      >
        <Webcam ref={webcamRef} className="full-width" />
        <canvas
          ref={canvasRef}
          className="full-width"
          style={{
            position: "absolute",
            width: "80%",
          }}
        />
      </Box>

      {/* Right - Reference Image */}
      <Box
        sx={{
          width: "40%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          borderRadius: "2rem",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, textAlign: "center", padding: "1rem" }}
          color="primary"
        >
          Try to mimic this posture to perform Trikonasana
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={yoga1} alt="Trikonasana" width="100%" />
        </Box>
        <Link to="/yoga" className="link">
          <Button
            size="large"
            variant="contained"
            color="primary"
            sx={{ cursor: "pointer", background: "#17edf7", mt: 2 }}
            onClick={handleClick}
          >
            Back
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default Trikonasana;
