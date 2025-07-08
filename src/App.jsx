import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Dot
} from 'recharts';

const STORAGE_KEY = 'exerciseRecords';

export default function App() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activity, setActivity] = useState('걷기');
  const [fieldLaps, setFieldLaps] = useState(0);
  const [gymLaps, setGymLaps] = useState(0);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [records, setRecords] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);

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
    const newRecord = { name, date, activity, meters: total };

    const updated = records.filter(r => !(r.name === name && r.date === date && r.activity === activity));
    updated.push(newRecord);
    setRecords(updated);
  };

  const handleDelete = (targetDate, type) => {
    setRecords(records.filter(r => !(r.name === name && r.date === targetDate && r.activity === type)));
  };

  const monthStart = dayjs().add(monthOffset, 'month').startOf('month');
  const monthEnd = dayjs().add(monthOffset, 'month').endOf('month');
  const monthDates = [];

  for (let d = monthStart; d.isBefore(monthEnd) || d.isSame(monthEnd); d = d.add(1, 'day')) {
    monthDates.push(d.format('YYYY-MM-DD'));
  }

  const filtered = records.filter(r => r.name === name && dayjs(r.date).isSame(monthStart, 'month'));
  const byType = { '걷기': {}, '뛰기': {} };

  monthDates.forEach(date => {
    byType['걷기'][date] = 0;
    byType['뛰기'][date] = 0;
  });

  filtered.forEach(r => {
    byType[r.activity][r.date] += r.meters;
  });

  const graphData = monthDates.map(date => ({
    date,
    걷기: byType['걷기'][date],
    뛰기: byType['뛰기'][date],
  }));

  if (!submitted) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1>2025. 디지털 기반 학생 맞춤교육 체력증진 프로그램</h1>
        <input
          placeholder='이름을 입력하세요'
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
        />
        <button onClick={handleSubmit} style={{ marginTop: '12px', width: '100%' }}>입장하기</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>{name}님의 운동 기록</h2>
      <label>날짜 선택: <input type='date' value={date} onChange={e => setDate(e.target.value)} /></label>
      <div>
        운동 유형: 
        <select value={activity} onChange={e => setActivity(e.target.value)}>
          <option>걷기</option>
          <option>뛰기</option>
        </select>
      </div>
      <div>
        운동장(120m) 몇 바퀴? 
        <input type='number' value={fieldLaps} onChange={e => setFieldLaps(Number(e.target.value))} />
      </div>
      <div>
        체육관(50m) 몇 바퀴? 
        <input type='number' value={gymLaps} onChange={e => setGymLaps(Number(e.target.value))} />
      </div>
      <button onClick={handleSave}>기록 저장</button>

      <h3>누적 운동량 그래프</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setMonthOffset(m => m - 1)}>&lt; 이전 달</button>
        <strong>{monthStart.format('YYYY년 MM월')}</strong>
        <button onClick={() => setMonthOffset(m => m + 1)}>다음 달 &gt;</button>
      </div>

      <ResponsiveContainer width='100%' height={300}>
        <LineChart data={graphData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type='monotone' dataKey='걷기' stroke='#82ca9d' dot={{ onClick: (e) => handleDelete(e.payload.date, '걷기') }} />
          <Line type='monotone' dataKey='뛰기' stroke='#8884d8' dot={{ onClick: (e) => handleDelete(e.payload.date, '뛰기') }} />
        </LineChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '14px', color: 'gray' }}>
        그래프 점을 클릭하면 해당 날짜의 운동 기록이 삭제됩니다.
      </p>
    </div>
  );
}