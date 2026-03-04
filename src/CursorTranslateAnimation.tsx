import { useState } from "react";

type MousePos = {
  X: number;
  Y: number;
};

const BallData = [
  { size: 10, color: "#A9FFCB", latency: "0.5s" },
  { size: 11, color: "#B6EEA6", latency: "0.4s" },
  { size: 12, color: "#C0B298", latency: "0.3s" },
  { size: 13, color: "#A4778B", latency: "0.2s" },
  { size: 14, color: "#AA4586", latency: "0.1s" },
];

const App = () => {
  const [mouse, setMouse] = useState<MousePos>({ X: 0, Y: 0 });

  return (
    <div
      onMouseMove={(item) => {
        setMouse({
          X: item.clientX,
          Y: item.clientY,
        });
      }}
      className="flex justify-center relative items-center h-screen"
    >
      {BallData.map((item) => (
        <Ball
          key={item.color}
          mouse={mouse}
          size={item.size}
          color={item.color}
          latency={item.latency}
        />
      ))}
      <div className="flex flex-col">
        <div className="text-white">X: {mouse?.X}</div>
        <div className="text-white">Y: {mouse?.Y}</div>
      </div>
    </div>
  );
};

export default App;

type BallProps = {
  mouse: MousePos;
  size: number;
  color: string;
  latency: string;
};

const Ball = ({ mouse, size, color, latency }: BallProps) => {
  return (
    <div
      style={{
        width: size * 4,
        height: size * 4,
        position: "absolute",
        backgroundColor: color,
        top: 0,
        left: 0,
        transform: `translate(${(mouse?.X ?? 0) - size * 2}px, ${
          (mouse?.Y ?? 0) - size * 2
        }px)`,
        transition: `transform ${latency} linear`,
      }}
      className={`bg-white  rounded-[50%]`}
    ></div>
  );
};
