import React, { useState } from "react";
import emailjs from "emailjs-com";

const responses = [
  "eee, sao tự nhiên mắng em :(((( ",
  "ơ, chị ngốccc",
  "game dễ lắm a, em chơi 1 lần là winn",
  "chơi lại đi màaaa",
  "thế là không thương em nữa rồiii",
  "huhu, sao chị dữ quá vậy 😭",
  "chị ơi, bình tĩnh... chúng ta có thể nói chuyện mà 😅",
  "sao mắng em, bộ tức em dễ thương quá hả 😝",
  "chị giận em 1 tí thôi nhaaa, đừng giận lâu nè",
  "ủa gì dạ, em có làm gì đâu, game khó mà 🤣",
  "chị có chắc là không muốn chơi lại không? 😏",
  "nếu chị thắng thì em cho chị 1 điều ước đó 🤭",
  "ui zời, em nhường chị thắng mà còn mắng em nữa 😭",
  "chị thua là do... định mệnh đã an bài rồi 😆",
  "ơ kìa, chị đánh rớt vương miện 'nữ hoàng chiến thắng' rồi à 👑",
  "chơi lại đi, lần này em sẽ cho chị cơ hội 'tỏa sáng' 🌟",
  "chị ơi, chửi nhẹ thôi kẻo em khóc bây giờ 🥺",
  "chị nói nhỏ thôi nha, game đang nghe lén đó 🎧",
  "có tức thì chơi lại, đừng giận, đừng buồn, chị vẫn là nhất mà! 🥰",
];

const GameOver = ({ onRestart }) => {
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [cheerMessage, setCheerMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isMessageSent, setIsMessageSent] = useState(false);

  const handleCheerSubmit = (e) => {
    e.preventDefault();
    if (!cheerMessage.trim()) return;

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    setResponseMessage(randomResponse);
    setCheerMessage("");
    setIsMessageSent(true);
    sendEmail(cheerMessage);

    // Hiển thị phản hồi 3 giây rồi restart game
    setTimeout(() => {
      setResponseMessage("");
      setIsMessageSent(false);
      onRestart();
    }, 3000);
  };

  const sendEmail = (confession) => {
    const templateParams = {
      message: confession,
    };

    emailjs
      .send(
        "service_ke21ltr", // Service ID từ EmailJS
        "template_hiqldzn", // Template ID từ EmailJS
        templateParams,
        "akh4-rUy0Rhjek-2f" // User ID từ EmailJS
      )
      .then(
        (result) => {
          // console.log("Email sent successfully:", result.text);
        },
        (error) => {
          console.error("Error sending:", error.text);
        }
      );
  };

  return (
    <div style={styles.container}>
      <div style={styles.gameOverBox}>
        <h2 style={styles.title}>😵 eeee, bạn đã bị Hồng hài bắt lại rồiii!</h2>

        {!isSendingMessage ? (
          <div style={styles.buttonGroup}>
            <button onClick={onRestart} style={styles.buttonPrimary}>
              🔄 Chơi lại luôn
            </button>
            <button
              onClick={() => setIsSendingMessage(true)}
              style={styles.buttonSecondary}
            >
              😡 Ghét quá, phải mắng em thôi
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheerSubmit} style={styles.form}>
            <input
              type="text"
              value={cheerMessage}
              onChange={(e) => setCheerMessage(e.target.value)}
              placeholder="Nhập lời mắng chửi..."
              style={styles.input}
              required
              disabled={isMessageSent}
            />
            <button
              type="submit"
              style={{
                ...styles.buttonPrimary,
                background: isMessageSent ? "#ccc" : "#ff5733",
              }}
              disabled={isMessageSent}
            >
              🚀 Gửi
            </button>
          </form>
        )}

        {responseMessage && <p style={styles.response}>{responseMessage}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  },
  gameOverBox: {
    background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
    color: "#333",
    padding: "20px",
    borderRadius: "15px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#d60000",
    marginBottom: "10px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  buttonPrimary: {
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    background: "#ff5733",
    color: "white",
    borderRadius: "8px",
    transition: "0.3s",
  },
  buttonSecondary: {
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    background: "#3498db",
    color: "white",
    borderRadius: "8px",
    transition: "0.3s",
  },
  form: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "90%",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "2px solid #ff5733",
    fontSize: "16px",
    textAlign: "center",
    outline: "none",
  },
  response: {
    fontSize: "16px",
    fontStyle: "italic",
    color: "#d60000",
    marginTop: "10px",
  },
};

export default GameOver;
