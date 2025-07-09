import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReportPage = () => {
  const [rows, setRows] = useState([]);

  /* загрузка всех задач */
  useEffect(() => {
    axiosInstance.get('tasks/')
      .then(r => {
        // группируем по исполнителю
        const map = {};
        r.data.forEach(t => {
          const uid = t.assignee?.id || '—';
          if (!map[uid]) map[uid] = {
            id:        uid,
            username:  t.assignee?.username || '(не назначен)',
            total:     0,
            done:      0,
            overdue:   0,
          };
          const rec = map[uid];
          rec.total += 1;
          if (t.status === 'done') rec.done += 1;
          if (t.status !== 'done' && new Date(t.deadline) < new Date()) rec.overdue += 1;
        });
        setRows(Object.values(map));
      })
      .catch(console.error);
  }, []);

  const exportExcel = () => {
    const ws  = XLSX.utils.json_to_sheet(rows);
    const wb  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'report.xlsx');
  };

  return (
    <div className="content">
      <h2>Отчёт по сотрудникам</h2>

      <button className="btn" onClick={exportExcel} style={{ marginBottom: 12 }}>
        Выгрузить в Excel
      </button>

      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#e9ecef' }}>
            <th>Сотрудник</th><th>Всего задач</th><th>Выполнено</th><th>Просрочено</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td style={{ border:'1px solid #ced4da', padding:6 }}>{r.username}</td>
              <td style={{ border:'1px solid #ced4da', padding:6 }}>{r.total}</td>
              <td style={{ border:'1px solid #ced4da', padding:6 }}>{r.done}</td>
              <td style={{ border:'1px solid #ced4da', padding:6 }}>{r.overdue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportPage;
