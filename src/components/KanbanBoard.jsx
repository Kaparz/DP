import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axios';
import TaskForm from './TaskForm';
import { useAuth } from '../context/AuthContext';

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const columns = ['todo', 'in_progress', 'pause', 'review', 'done'];
const columnLabels = {
  todo: 'К выполнению',
  in_progress: 'В процессе',
  pause: 'Пауза',
  review: 'Ожидает проверки',
  done: 'Готово',
};

/* ---------- Карточка ---------- */
const Card = ({ task, onDelete }) => {
  const { setNodeRef, listeners, attributes, transform, transition } =
    useSortable({ id: String(task.id) });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <small>
        Исполнитель:&nbsp;
        {task.assignee ? task.assignee.username : '—'}
      </small>
      <br />
      <small>Дедлайн: {task.deadline}</small>

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          style={{
            marginTop: 6,
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '3px 6px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Удалить
        </button>
      )}
    </div>
  );
};

/* ---------- Droppable-колонка ---------- */
const DroppableColumn = ({ status, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className="kanban-column"
      style={{ background: isOver ? '#dfe3e6' : undefined }}
    >
      <h3>{columnLabels[status]}</h3>
      {children}
    </div>
  );
};

/* ---------- Доска ---------- */
const KanbanBoard = ({ projectId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = useCallback(() => {
    axiosInstance
      .get('tasks/', { params: { project: projectId } })
      .then(r => setTasks(r.data));
  }, [projectId]);

  useEffect(() => fetchTasks(), [fetchTasks]);

  const tasksByStatus = useMemo(
    () =>
      columns.reduce((acc, st) => {
        acc[st] = tasks.filter(t => t.status === st);
        return acc;
      }, {}),
    [tasks]
  );

  const sensors = useSensors(useSensor(PointerSensor));

  /* --- DELETE task --- */
  const handleDeleteTask = id => {
    if (!window.confirm('Удалить задачу?')) return;
    axiosInstance
      .delete(`tasks/${id}/`)
      .then(fetchTasks)
      .catch(() => alert('Не удалось удалить'));
  };

  /* --- Drag end --- */
  const onDragEnd = ({ active, over }) => {
    if (!over) return;

    const taskId     = Number(active.id);
    const fromTask   = tasks.find(t => t.id === taskId);
    const fromStatus = fromTask?.status;

    const toStatus =
      columns.includes(over.id)
        ? over.id
        : tasks.find(t => t.id === Number(over.id))?.status;

    if (!toStatus || toStatus === fromStatus) return;

    if (
      toStatus === 'done' &&
      !['admin', 'manager'].includes(user.role)
    ) {
      alert('Только руководитель или админ могут переносить в «Готово»');
      return;
    }

    /* optimistic UI */
    const prev = tasks;
    setTasks(prev.map(t => (t.id === taskId ? { ...t, status: toStatus } : t)));

    axiosInstance
      .patch(`tasks/${taskId}/`, { status: toStatus })
      .catch(() => {
        alert('Ошибка сервера — статус не изменён');
        setTasks(prev);
      });
  };

  return (
    <>
      <TaskForm projectId={projectId} onTaskCreated={fetchTasks} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
      >
        <div className="kanban-board">
          {columns.map(status => (
            <SortableContext
              key={status}
              id={status}
              items={tasksByStatus[status].map(t => String(t.id))}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn status={status}>
                {tasksByStatus[status].map(task => (
                  <Card
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </DroppableColumn>
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </>
  );
};

export default KanbanBoard;
