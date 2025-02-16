import { useRef, useEffect, useState } from "react";
import carImageSrc from "../assets/dan_tam.jpg";
import obstacleImageSrc from "../assets/hoang_anh.jpg";
import GameOver from "./GameOver";
import emailjs from "emailjs-com";

// Các biến hằng số cấu hình game
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;

const INITIAL_ROUND_TIME = 1; // Thời gian round ban đầu (giây)
const TIME_ADDITION = 1; // Thời gian cộng thêm mỗi round thắng (giây)

const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 30;
const OBSTACLE_BASE_SPEED = 2;
const OBSTACLE_RANDOM_SPEED = 3;
const OBSTACLE_SPAWN_INTERVAL = 3000; // ms

const INITIAL_MAX_OBSTACLES = 4;

const Game = () => {
  const canvasRef = useRef(null);

  // Số vòng thắng hiện tại (mỗi vòng thắng tăng độ khó)
  const [roundWins, setRoundWins] = useState(0);

  // Trạng thái game: isGameOver = true khi thua hoặc khi đạt điều kiện thắng (ví dụ: 5 vòng thắng)
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [cheerMessage, setCheerMessage] = useState("");
  const [isWin, setIsWin] = useState(false); // Thêm state isWin để xác định thắng hay thua

  // Thời gian round: ban đầu là INITIAL_ROUND_TIME giây, mỗi round thắng cộng thêm TIME_ADDITION giây.
  const [roundTime, setRoundTime] = useState(INITIAL_ROUND_TIME);

  // Vị trí ban đầu của xe
  const initialCarPos = {
    x: (CANVAS_WIDTH - CAR_WIDTH) / 2,
    y: CANVAS_HEIGHT - CAR_HEIGHT - 10,
  };
  const [carPos, setCarPos] = useState(initialCarPos);

  // Lưu danh sách các chướng ngại vật
  const obstaclesRef = useRef([]);

  // Dùng ref để cập nhật giá trị roundWins liên tục cho việc tính số lượng obstacle cho phép
  const roundWinsRef = useRef(roundWins);
  useEffect(() => {
    roundWinsRef.current = roundWins;
  }, [roundWins]);

  // Tạo đối tượng hình ảnh cho xe và obstacle
  const carImage = useRef(new Image());
  const obstacleImage = useRef(new Image());

  useEffect(() => {
    carImage.current.src = carImageSrc;
    obstacleImage.current.src = obstacleImageSrc;
  }, []);

  // -------------------------------
  // Game loop sử dụng requestAnimationFrame
  // -------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let lastTime = 0;
    let obstacleSpawnTimer = 0;

    const gameLoop = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      if (!isGameOver) {
        obstacleSpawnTimer += deltaTime;
        if (obstacleSpawnTimer > OBSTACLE_SPAWN_INTERVAL) {
          spawnObstacle();
          obstacleSpawnTimer = 0;
        }

        updateObstacles();
        checkCollisions();
        draw(ctx);
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    // Hàm spawn obstacle với số lượng tối đa tăng dần:
    // maxObstacles = INITIAL_MAX_OBSTACLES + số vòng thắng hiện tại
    const spawnObstacle = () => {
      const maxObstacles = INITIAL_MAX_OBSTACLES + roundWinsRef.current;
      if (obstaclesRef.current.length >= maxObstacles) return;

      const x = Math.random() * (CANVAS_WIDTH - OBSTACLE_WIDTH);
      obstaclesRef.current.push({
        x,
        y: -OBSTACLE_HEIGHT,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT,
        speed: OBSTACLE_BASE_SPEED + Math.random() * OBSTACLE_RANDOM_SPEED,
      });
    };

    const updateObstacles = () => {
      obstaclesRef.current.forEach((obstacle) => {
        obstacle.y += obstacle.speed;
      });
      obstaclesRef.current = obstaclesRef.current.filter(
        (obstacle) => obstacle.y < CANVAS_HEIGHT
      );
    };

    const checkCollisions = () => {
      for (let obstacle of obstaclesRef.current) {
        if (
          rectIntersect(
            carPos.x,
            carPos.y,
            CAR_WIDTH,
            CAR_HEIGHT,
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
          )
        ) {
          setIsGameOver(true);
          setGameMessage("Thua rồi, mắng anh nào!");
          setIsWin(false); // Nếu thua thì là false
          return;
        }
      }
    };

    const draw = (ctx) => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#ddd";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Vẽ xe với hiệu ứng bóng
      if (carImage.current.complete) {
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(
          carImage.current,
          carPos.x,
          carPos.y,
          CAR_WIDTH,
          CAR_HEIGHT
        );
        ctx.restore();
      } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(carPos.x, carPos.y, CAR_WIDTH, CAR_HEIGHT);
      }

      // Vẽ obstacle bằng hình ảnh nếu đã load, nếu chưa load dùng placeholder
      obstaclesRef.current.forEach((obstacle) => {
        if (obstacleImage.current.complete) {
          ctx.drawImage(
            obstacleImage.current,
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
          );
        } else {
          ctx.fillStyle = "red";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
      });

      // Vẽ đồng hồ đếm thời gian
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText(`Time: ${roundTime}`, 10, 30);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [carPos, isGameOver, roundTime]);

  // -------------------------------
  // Timer effect: giảm roundTime mỗi giây
  // Nếu hết thời gian (<=1), coi như round thắng
  // -------------------------------
  useEffect(() => {
    if (!isGameOver) {
      const interval = setInterval(() => {
        setRoundTime((prevTime) => {
          if (prevTime <= 1) {
            if (!isGameOver) {
              // Kiểm tra lại tránh set sai state
              setRoundWins((wins) => {
                const newWins = wins + 1;
                if (newWins >= 5) {
                  setGameMessage(
                    "Chúc mừng! Trà sữa đang chờ – Anh mua ngay nhé!"
                  );
                  setIsGameOver(true);
                  setIsWin(true); // Đặt thắng khi đạt 5 vòng
                } else {
                  resetRound(newWins);
                }
                return newWins;
              });
            }
            return INITIAL_ROUND_TIME; // Reset lại đúng thời gian
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isGameOver]);

  // -------------------------------
  // Sự kiện điều khiển xe bằng phím mũi tên
  // -------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;
      let newX = carPos.x;
      const step = 20;
      if (e.key === "ArrowLeft") {
        newX = Math.max(0, carPos.x - step);
      } else if (e.key === "ArrowRight") {
        newX = Math.min(CANVAS_WIDTH - CAR_WIDTH, carPos.x + step);
      }
      setCarPos({ ...carPos, x: newX });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [carPos, isGameOver]);

  // -------------------------------
  // Hàm reset round: xoá obstacle, reset vị trí xe và cập nhật thời gian mới
  // -------------------------------
  const resetRound = (newWins) => {
    obstaclesRef.current = [];
    setCarPos(initialCarPos);
    setRoundTime(INITIAL_ROUND_TIME + newWins * TIME_ADDITION);
  };

  // -------------------------------
  // Xử lý khi nhập lời mắng sau khi thua
  // -------------------------------
  const handleCheerSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get("cheer");
    setCheerMessage(message);
    setIsGameOver(false);
    setIsWin(false); // Reset lại trạng thái thắng khi bắt đầu lại
    resetRound(roundWins);
  };

  const handleTouchStart = (e, direction) => {
    if (isGameOver) return;
    let newX = carPos.x;
    const step = 20;

    if (direction === "left") {
      newX = Math.max(0, carPos.x - step);
    } else if (direction === "right") {
      newX = Math.min(CANVAS_WIDTH - CAR_WIDTH, carPos.x + step);
    }

    setCarPos({ ...carPos, x: newX });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Đua Xe Tình Yêu</h1>
      <p>Round wins: {roundWins} / 5</p>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: "1px solid black" }}
      />
      {isGameOver && isWin == false && (
        <GameOver
          onRestart={() => {
            setIsGameOver(false);
            setIsWin(false); // Reset trạng thái thắng khi restart
            setRoundWins(0);
            resetRound(0);
          }}
          roundWins={roundWins}
          isWin={isWin} // Pass thêm isWin để hiển thị đúng trạng thái thắng/thua
          onSendMessage={(message) => setCheerMessage(message)}
        />
      )}
      {isGameOver && isWin && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "30px 40px",
            borderRadius: "15px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          <h2
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "24px",
              marginBottom: "15px",
            }}
          >
            Woaaa, chị giỏi quá trời đii!
          </h2>
          <p style={{ fontFamily: "'Arial', sans-serif", fontSize: "18px" }}>
            Mật khẩu để truy cập vào sách là{" "}
            <strong style={{ color: "#f5a623" }}>29280906</strong>
          </p>
        </div>
      )}

      {/* Các nút điều khiển trên mobile */}
      {!isGameOver && (
        <div style={{ marginTop: 20 }}>
          <button
            onTouchStart={(e) => handleTouchStart(e, "left")}
            style={{ fontSize: "20px", marginRight: "10px" }}
          >
            Trái
          </button>
          <button
            onTouchStart={(e) => handleTouchStart(e, "right")}
            style={{ fontSize: "20px" }}
          >
            Phải
          </button>
        </div>
      )}
    </div>
  );
};

// Hàm kiểm tra va chạm giữa 2 hình chữ nhật
const rectIntersect = (x1, y1, w1, h1, x2, y2, w2, h2) => {
  return !(x2 > x1 + w1 || x2 + w2 < x1 || y2 > y1 + h1 || y2 + h2 < y1);
};

export default Game;
