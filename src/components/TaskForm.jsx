// src/components/TaskForm.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const TaskForm = ({ projectId, onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [workers, setWorkers] = useState([]);

  /* получаем работников один раз */
  useEffect(() => {
    axiosInstance.get("/users/", { params: { role: "worker" } }).then((res) => setWorkers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("tasks/", {
        title,
        description,
        project_id: projectId,
        assignee_id: assigneeId || null,
        deadline,
        status: "todo",
      });
      onTaskCreated();
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDeadline("");
    } catch (err) {
      console.error("Ошибка при создании задачи:", err);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>Новая задача</h3>
      <input placeholder="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
      <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
        <option value="">Назначить работника</option>
        {workers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>
      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
      <button type="submit">Добавить</button>
    </form>
  );
};

export default TaskForm;
