import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const STORAGE_KEY = 'exerciseRecords';

export default function App() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activity, setActivity] = useState('걷기');
  const [fieldLaps, setFieldLaps] = useState(0);
  const [gymLaps, setGymLaps] = useState(0);
  const [records, setRecords] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSubmit = () => setSubmitted(true);

  const handleSave = () => {
    const total = fieldLaps * 120 + gymLaps * 50;
    const newRecord = { name, date: selectedDate, meters: total, type: activity };
    const filtered = records.filter(r => !(r.name === name && r.date === selectedDate && r.type === activity));
    setRecords([...filtered, newRecord]);
  };

  const handleDotClick = (date, type) => {
    const confirmDelete = window.confirm(`${date}의 ${type} 기록을 삭제할까요?`);
    if (!confirmDelete) return;
    setRecords(records.filter(r => !(r.name === name && r.date === date && r.type === type)));
  };

  const monthDates = [];
  const daysInMonth = currentMonth.daysInMonth();
  for (let i = 1; i <= daysInMonth; i++) {
    monthDates.push(currentMonth.date(i).format('YYYY-MM-DD'));
  }

  const filtered = records.filter(r => r.name === name && dayjs(r.date).isSame(currentMonth, 'month'));
  const byType = { 걷기: {}, 뛰기: {} };
  monthDates.forEach(date => {
    byType[“걷기”][date] = 0;
    byType[“뛰기”][date] = 0;
  });
  filtered.forEach(r => {
    byType[r.type][r.date] += r.meters;
  });

  const graphData = monthDates.map(date => ({
    date,
    걷기: byType[“걷기”][date],
    뛰기: byType[“뛰기”][date]
  }));

  if (!submitted) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
        <h1>2025 체력증진 프로그램</h1>
        <input
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
        <button onClick={handleSubmit} style={{ marginTop: 12, width: '100%' }}>
          입장하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h2>{name}님의 운동 기록</h2>

      <div style={{ marginBottom: 16 }}>
        <label>
          날짜 선택: 
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </label>
        <br />
        운동 유형: 
        <select value={activity} onChange={(e) => setActivity(e.target.value)}>
          <option>걷기</option>
          <option>뛰기</option>
        </select>
        <br />
        운동장 바퀴(120m):
        <input type="number" value={fieldLaps} onChange={(e) => setFieldLaps(Number(e.target.value))} />
        <br />
        체육관 바퀴(50m):
        <input type="number" value={gymLaps} onChange={(e) => setGymLaps(Number(e.target.value))} />
        <br />
        <button onClick={handleSave} style={{ marginTop: 10 }}>기록 저장</button>
      </div>

      <h3>월별 운동량</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}>← 이전 달</button>
        <span>{currentMonth.format('YYYY년 MM월')}</span>
        <button onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}>다음 달 →</button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={graphData} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="걷기"
            stroke="#8884d8"
            activeDot={{ onClick: (e) => handleDotClick(e.payload.date, '걷기') }}
          />
          <Line
            type="monotone"
            dataKey="뛰기"
            stroke="#82ca9d"
            activeDot={{ onClick: (e) => handleDotClick(e.payload.date, '뛰기') }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
