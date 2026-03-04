import { useRef, useState } from "react";

type BallData = { id: number; x: number; y: number; color: string };

export default function App() {
  const [balls, setBalls] = useState<BallData[]>([
    { id: 1, x: 50, y: 50, color: "yellow" },
    { id: 2, x: 200, y: 150, color: "red" },
  ]);

  const draggingId = useRef<number | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    draggingId.current = id;
    const ball = balls.find((b) => b.id === id)!;
    offset.current = { x: e.clientX - ball.x, y: e.clientY - ball.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId.current === null) return;

    setBalls((prev) =>
      prev.map((b) =>
        b.id === draggingId.current
          ? {
              ...b,
              x: e.clientX - offset.current.x,
              y: e.clientY - offset.current.y,
            }
          : b
      )
    );
  };


  const handleMouseUp = () => {
    draggingId.current = null;
  };

  const getRandomPosition = () => {
    const padding = 40;
    return {
      x: Math.random() * (window.innerWidth - padding),
      y: Math.random() * (window.innerHeight - padding),
    };
  };

  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;

  const [selectedColor, setSelectedColor] = useState(getRandomColor());

  const handleAddBall = () => {
    const position = getRandomPosition();

    setBalls((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: position.x,
        y: position.y,
        color: selectedColor,
      },
    ]);

    setSelectedColor(getRandomColor());
  };

  return (
    <div
      className="w-screen h-screen relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="flex items-center gap-4 m-4">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-12 h-10 cursor-pointer"
        />

        <button
          onClick={handleAddBall}
          className="bg-white px-5 py-2 rounded-xl"
        >
          Add Ball
        </button>
      </div>
      {balls.map((ball) => (
        <Ball key={ball.id} ball={ball} onMouseDown={handleMouseDown} />
      ))}
    </div>
  );
}

type BallProps = {
  ball: BallData;
  onMouseDown: (e: React.MouseEvent, id: number) => void;
};

const Ball = ({ ...props }: BallProps) => {
  return (
    <div
      onMouseDown={(e) => props.onMouseDown(e, props.ball.id)}
      style={{
        position: "absolute",
        top: props.ball.y,
        left: props.ball.x,
        backgroundColor: props.ball.color,
      }}
      className="w-10 h-10 rounded-full cursor-grab"
    ></div>
  );
};
