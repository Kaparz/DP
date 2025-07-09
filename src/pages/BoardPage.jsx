// src/pages/BoardPage.jsx
import { useParams } from "react-router-dom";
import KanbanBoard from "../components/KanbanBoard";

const BoardPage = () => {
  const { id } = useParams();           // id проекта из URL
  return (
    <div className="board-page">
      <h2>Доска проекта #{id}</h2>
      <KanbanBoard projectId={id} />
    </div>
  );
};

export default BoardPage;
