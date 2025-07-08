import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const STORAGE_KEY = 'exerciseRecords';

export default function App() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activity, setActivity] = useState('걷기');
  const [fieldLaps, setFieldLaps] = useState(0);
  const [gymLaps, setGymLaps] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setRecords(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleSave = () => {
    const total = fieldLaps * 120 + gymLaps * 50;
    const newRecord = { name, date, activity, meters: total };
    const filtered = records.filter(
      (r) => !(r.name === name && r.date === date && r.activity === activity)
    );
    setRecords([...filtered, newRecord]);
  };

  const handleDelete = (targetDate) => {
    const filtered = records.filter(
      (r) => !(r.name === name && r.date === targetDate)
    );
    setRecords(filtered);
  };

  const userRecords = records.filter((r) => r.name === name);
  const dates = [...new Set(userRecords.map((r) => r.date))].sort();

  const fullDates = [];
  if (dates.length > 0) {
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      fullDates.push(d.toISOString().split('T')[0]);
    }
  }

  const graphData = fullDates.map((d) => {
    const walk = userRecords.find((r) => r.date === d && r.activity === '걷기');
    const run = userRecords.find((r) => r.date === d && r.activity === '뛰기');
    return {
      date: d,
      걷기: walk ? walk.meters : 0,
      뛰기: run ? run.meters : 0,
    };
  });

  if (!submitted) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1>2025. 디지털 기반 학생 맞춤교육 체력증진 프로그램</h1>
        <input
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
        <button onClick={handleSubmit} style={{ marginTop: '10px', width: '100%' }}>
          입장하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>{name}님의 운동 기록</h2>
      <div>
        날짜:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
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
      <button onClick={handleSave} style={{ marginTop: '10px', width: '100%' }}>
        기록 저장
      </button>

      <h3>누적 운동량 그래프</h3>
      <LineChart width={500} height={300} data={graphData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="걷기" stroke="#82ca9d" strokeWidth={2} />
        <Line type="monotone" dataKey="뛰기" stroke="#8884d8" strokeWidth={2} />
      </LineChart>

      <h4>날짜별 기록 삭제</h4>
      <ul>
        {fullDates.map((d) => (
          <li key={d}>
            {d}{' '}
            <button onClick={() => handleDelete(d)} style={{ marginLeft: '10px' }}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}