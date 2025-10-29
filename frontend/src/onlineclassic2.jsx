import React, { useEffect, useRef } from "react";
import { TwoPlayer } from "./game/1token/scenes/TwoPlayer";
import { AUTO, Scale, Game } from "phaser";
import { TwoPlayerWaiting } from "./game/1token/scenes/TwoPlayerWaiting";
import { Splash } from "./game/1token/scenes/Splash";
import { Loading } from "./game/1token/scenes/Loading";
import { useNavigate, useParams } from "react-router";
import { io } from "socket.io-client";
import {
  CLASSIC_1TOKEN_SERVER,
  CLASSIC_ONLINE_SERVER,
} from "./utils/constants";
import { useSelector } from "react-redux";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const OnlineClassic2 = () => {
  const { isAuth } = useSelector((store) => store.auth);
  const gameRef = useRef(null);
  const params = useParams("gameUid");
  const navigate = useNavigate();
  const socketRef = useRef(null); // Store the socket instance
  const handle = useFullScreenHandle();
  const isIphone = /iPhone/i.test(navigator.userAgent);
  useEffect(() => {
    if (!isAuth) navigate("/login");
    const handleNavigate = (event) => {
      if (event.detail.path) {
        navigate(event.detail.path);
        for (let i = 1; i <= 1000; i++) {
          clearInterval(i);
        }
      }
    };

    window.addEventListener("navigate", handleNavigate);

    if (!params.gameUid) navigate("/classic-1token");

    // Retrieve required data from localStorage
    const gameUid = params.gameUid;
    const deviceId = localStorage.getItem("_di");
    const token = localStorage.getItem("_tk");

    // Initialize socket connection
    socketRef.current = io(CLASSIC_1TOKEN_SERVER, {
      query: { gameUid, deviceId, token },
    });
    if (!isIphone) {
      handle.enter();
    }

    //console.log("Socket connected:", socketRef.current);

    if (!gameRef.current) {
      const config = {
        type: AUTO,
        width: 1080,
        height: 1920,
        parent: "game-container",
        backgroundColor: "0x000000",
        scale: {
          mode: Scale.FIT,
          autoCenter: Scale.CENTER_BOTH,
        },
        scene: [Loading, Splash, TwoPlayerWaiting, TwoPlayer],
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
      };

      localStorage.setItem("gameUid", params.gameUid);

      gameRef.current = new Game(config);
      gameRef.current.registry.set("socket", socketRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.scene.scenes.forEach((scene) => {
          scene.sys.events.off(); // Remove all event listeners
          scene.sound?.stopAll(); // Stop all sounds
          scene.scene.stop(); // Stop the scene
        });

        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (socketRef.current) {
        //console.log("Socket disconnected");
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      window.removeEventListener("navigate", handleNavigate);
      if (!isIphone) {
        handle.exit();
      }
    };
  }, [navigate]);

  return (
    <FullScreen handle={handle}>
      <div style={{ height: "100vh", backgroundColor: "black" }}>
        <div
          id="game-container"
          style={{
            width: "100%",

            height: "90vh",
            backgroundColor: "black",
          }}
        ></div>
      </div>
    </FullScreen>
  );
};

export default OnlineClassic2;
