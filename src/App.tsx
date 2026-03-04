import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate, useParams } from "react-router";

type BallData = { id: number; x: number; y: number; color: string };

export default function App() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [boardId, setBoardId] = useState<string | null>(paramId ?? null);
  const [loading, setLoading] = useState(!!paramId);
  const [creating, setCreating] = useState(false);
  const [balls, setBalls] = useState<BallData[]>([]);

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
  const saveBoard = async () => {
    if (!boardId) return;

    const { error } = await supabase
      .from("boards")
      .update({ balls })
      .eq("id", boardId);

    if (error) {
      console.error(error);
      return;
    }

    alert("Board updated");
  };

  const handleCopyLink = async () => {
    if (boardId) {
      const link = `${window.location.origin}/${boardId}`;
      await navigator.clipboard.writeText(link);
      alert("Link copied");
      return;
    }

    setCreating(true);

    const { data, error } = await supabase
      .from("boards")
      .insert([{ balls }])
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      setCreating(false);
      return;
    }

    const newId = data.id;

    setBoardId(newId);
    window.history.replaceState({}, "", `/${newId}`);

    const link = `${window.location.origin}/${newId}`;
    await navigator.clipboard.writeText(link);

    alert("Link copied");
    setCreating(false);
  };
  useEffect(() => {
    if (!boardId) return;

    const fetchBoard = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("boards")
        .select("balls")
        .eq("id", boardId)
        .single();

      if (!error && data?.balls) {
        setBalls(data.balls);
      }

      setLoading(false);
    };

    fetchBoard();
  }, [boardId]);

  return (
    <div
      className="w-screen h-screen relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="absolute top-1 right-4">
        <button
          onClick={() => {
            setBalls([]);
            navigate("/");
          }}
          className="bg-white text-black px-4 py-2 rounded-xl"
        >
          Create New
        </button>
      </div>
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
        {boardId && (
          <button
            onClick={saveBoard}
            disabled={loading}
            className="bg-blue-500 text-white px-5 py-2 rounded-xl disabled:opacity-50"
          >
            Update
          </button>
        )}

        <button
          onClick={handleCopyLink}
          disabled={loading || creating}
          className="bg-green-500 text-white px-5 py-2 rounded-xl disabled:opacity-50"
        >
          {creating ? "Creating..." : "Copy Link"}
        </button>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">
          Loading...
        </div>
      )}
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
