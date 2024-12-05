import React from "react";

interface TextBarProps {
  history: string[];
  onExpand: () => void;
}

const TextBar: React.FC<TextBarProps> = ({ history, onExpand }) => {
  const latestMessage = history[history.length - 1] || "Ask me anything...";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#222",
        color: "#fff",
        padding: "10px 20px",
        cursor: "pointer",
        zIndex: 10,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
      }}
      onClick={onExpand}
    >
      <div style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
        {latestMessage}
      </div>
    </div>
  );
};

export default TextBar;
