import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const STORAGE_KEY = 'exerciseRecords';

export default function App() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activity, setActivity] = useState('걷기');
  const [fieldLaps, setFieldLaps] = useState(0);
  const [gymLaps, setGymLaps] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // 로컬 저장 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, []);

  // 로컬 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSubmit = () => setSubmitted(true);

  const handleSave = () => {
    const total = fieldLaps * 120 + gymLaps * 50;
    const newRecord = { name, date, activity, meters: total };
    const filtered = records.filter(r => !(r.name === name && r.date === date && r.activity === activity));
    setRecords([...filtered, newRecord]);
  };

  // 월별 데이터 추출
  const monthlyRecords = records
    .filter(r => r.name === name && r.date.startsWith(currentMonth))
    .reduce((acc, cur) => {
      if (!acc[cur.date]) acc[cur.date] = { 걷기: 0, 뛰기: 0 };
      acc[cur.date][cur.activity] += cur.meters;
      return acc;
    }, {});

  // 월 내 모든 날짜 생성
  const getAllDaysInMonth = (year, month) => {
    const days = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      days.push(date.toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const year = Number(currentMonth.split('-')[0]);
  const month = Number(currentMonth.split('-')[1]) - 1;
  const allDays = getAllDaysInMonth(year, month);

  const graphData = allDays.map(d => ({
    date: d,
    걷기: monthlyRecords[d]?.걷기 || 0,
    뛰기: monthlyRecords[d]?.뛰기 || 0
  }));

  const changeMonth = (offset) => {
    const date = new Date(year, month + offset, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  if (!submitted) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
        <h1>2025. 디지털 기반 체력증진 프로그램</h1>
        <input
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: 8, fontSize: 16 }}
        />
        <button onClick={handleSubmit} style={{ marginTop: 12, width: '100%', padding: 10 }}>
          입장하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h2>{name}님의 운동 기록</h2>
      <div style={{ marginBottom: '1rem' }}>
        <div>
          날짜 선택:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          운동 유형:
          <select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option>걷기</option>
            <option>뛰기</option>
          </select>
        </div>
        <div>
          운동장 (120m) 몇 바퀴?
          <input
            type="number"
            value={fieldLaps}
            onChange={(e) => setFieldLaps(Number(e.target.value))}
            style={{ marginLeft: '10px', width: '60px' }}
          />
        </div>
        <div>
          체육관 (50m) 몇 바퀴?
          <input
            type="number"
            value={gymLaps}
            onChange={(e) => setGymLaps(Number(e.target.value))}
            style={{ marginLeft: '10px', width: '60px' }}
          />
        </div>
        <button onClick={handleSave} style={{ marginTop: 10, width: '100%', padding: 10 }}>
          기록 저장
        </button>
      </div>

      <h3>
        <button onClick={() => changeMonth(-1)}>{'←'}</button>
        {' '} {currentMonth} {' '}
        <button onClick={() => changeMonth(1)}>{'→'}</button>
      </h3>

      <LineChart width={500} height={300} data={graphData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="걷기" stroke="#82ca9d" strokeWidth={2} />
        <Line type="monotone" dataKey="뛰기" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </div>
  );
}
