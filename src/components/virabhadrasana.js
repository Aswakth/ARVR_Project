import React, { useRef, useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import angleBetweenThreePoints from "./angle";
import yoga1 from "../assets/images/yogapose.png";
import { Box, Container, Typography, Button } from "@mui/material";
import Cookies from "js-cookie";
import { db } from "../firebase";
import { v4 } from "uuid";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

// 🔊 Speech synthesis setup
const speech = window.speechSynthesis;
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speech.speak(utterance);
};

const Virabhadrasana = () => {
  const navigate = useNavigate();

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!Cookies.get("userID")) {
      alert("Please login first");
      navigate("/");
    }
  }, [navigate]);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const tRef = useRef(Date.now());

  useEffect(() => {
    // 🧠 Called every frame from MediaPipe Pose
    function onResult(results) {
      if (!results?.poseLandmarks || !canvasRef.current || !webcamRef.current?.video)
        return;

      const position = results.poseLandmarks;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = webcamRef.current.video.videoWidth;
      canvas.height = webcamRef.current.video.videoHeight;

      const width = canvas.width;
      const height = canvas.height;

      // 🦴 Key points for arms and legs
      const leftHand = [];
      const rightHand = [];
      const leftLeg = [];
      const rightLeg = [];

      // Arms (11–16)
      for (let i = 11; i < 17; i++) {
        const point = {
          x: position[i].x * width,
          y: position[i].y * height,
        };
        if (i % 2 === 0) rightHand.push(point);
        else leftHand.push(point);
      }

      // Legs (23–28)
      for (let i = 23; i < 29; i++) {
        const point = {
          x: position[i].x * width,
          y: position[i].y * height,
        };
        if (i % 2 === 0) rightLeg.push(point);
        else leftLeg.push(point);
      }

      // 📐 Calculate joint angles
      const leftHandAngle = Math.round(angleBetweenThreePoints(leftHand));
      const rightHandAngle = Math.round(angleBetweenThreePoints(rightHand));
      const leftLegAngle = Math.round(angleBetweenThreePoints(leftLeg));
      const rightLegAngle = Math.round(angleBetweenThreePoints(rightLeg));

      // ✅ Target pose angle ranges
      const inRangeRightHand = rightHandAngle >= 170 && rightHandAngle <= 190;
      const inRangeLeftHand = leftHandAngle >= 170 && leftHandAngle <= 190;
      const inRangeRightLeg = rightLegAngle >= 170 && rightLegAngle <= 190;
      const inRangeLeftLeg = leftLegAngle >= 110 && leftLegAngle <= 130;

      // 🖌️ Draw skeleton
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 8;

      const drawLine = (a, b, inRange) => {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = inRange ? "green" : "red";
        ctx.stroke();
      };

      for (let i = 0; i < 2; i++) {
        drawLine(rightHand[i], rightHand[i + 1], inRangeRightHand);
        drawLine(leftHand[i], leftHand[i + 1], inRangeLeftHand);
        drawLine(rightLeg[i], rightLeg[i + 1], inRangeRightLeg);
        drawLine(leftLeg[i], leftLeg[i + 1], inRangeLeftLeg);
      }

      // 🟢 Draw joints
      const drawCircle = (p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#AAFF00";
        ctx.fill();
      };

      [...leftHand, ...rightHand, ...leftLeg, ...rightLeg].forEach(drawCircle);

      // ⏱️ Reset timer if not in correct posture
      if (!(inRangeRightLeg && inRangeLeftLeg && inRangeLeftHand && inRangeRightHand)) {
        tRef.current = Date.now();
      }

      // 🕒 Display angles and seconds
      const seconds = Math.round((Date.now() - tRef.current) / 1000);
      ctx.font = "24px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`Left Hand: ${leftHandAngle}`, leftHand[1].x + 10, leftHand[1].y + 20);
      ctx.fillText(`Right Hand: ${rightHandAngle}`, rightHand[1].x - 100, rightHand[1].y + 20);
      ctx.fillText(`Left Leg: ${leftLegAngle}`, leftLeg[1].x + 10, leftLeg[1].y + 20);
      ctx.fillText(`Right Leg: ${rightLegAngle}`, rightLeg[1].x - 100, rightLeg[1].y + 20);
      ctx.fillText(`Seconds held: ${seconds}`, 20, 40);
      ctx.restore();

      speak(seconds);
    }

    // 🎯 Initialize Pose
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

    // 🎥 Setup camera
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

    return () => {
      if (cameraRef.current?.stop) cameraRef.current.stop();
    };
  }, []);

  // 🧾 Save yoga session
  const handleClick = async () => {
    try {
      const ID = Cookies.get("userID");
      const docRef = doc(db, `user/${ID}/virabhadrasana`, v4());
      await setDoc(docRef, {
        timeStamp: serverTimestamp(),
        uid: ID,
      });
      console.log("✅ Pose record saved!");
    } catch (error) {
      console.error("❌ Firestore Error:", error);
    }
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
      {/* 🎥 Live feed with pose overlay */}
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

      {/* 🧘 Right panel - instructions */}
      <Box
        sx={{
          width: { lg: "40%", xs: "80%" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "secondary",
          backgroundColor: "#fff",
          borderRadius: "2rem",
          mt: { xs: 3, lg: 0 },
          p: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, textAlign: "center" }}
          color="primary"
        >
          Try to mimic this posture to perform <strong>Virabhadrasana</strong>
        </Typography>

        <Box
          sx={{
            width: "70%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={yoga1} alt="Yoga Pose" width="100%" />
        </Box>

        <Link to="/yoga" className="link">
          <Button
            size="large"
            variant="contained"
            color="primary"
            sx={{ mt: 3, background: "#17edf7" }}
            onClick={handleClick}
          >
            Back
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default Virabhadrasana;
