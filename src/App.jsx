import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const STORAGE_KEY = 'exerciseRecords';

export default function App() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activity, setActivity] = useState('걷기');
  const [fieldLaps, setFieldLaps] = useState(0);
  const [gymLaps, setGymLaps] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);

  // 저장된 기록 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, []);

  // 기록 저장 시 localStorage 업데이트
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleSave = () => {
    const total = fieldLaps * 120 + gymLaps * 50;
    const newRecord = { name, date, meters: total };
    const updated = [...records, newRecord];
    setRecords(updated);
  };

  // 이름 필터 + 날짜별 누적 합산
  const dailySums = records
    .filter((r) => r.name === name)
    .reduce((acc, r) => {
      if (!acc[r.date]) acc[r.date] = 0;
      acc[r.date] += r.meters;
      return acc;
    }, {});

  const graphData = Object.entries(dailySums).map(([date, meters]) => ({ date, meters }));

  // 이름 입력 화면
  if (!submitted) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          2025. 디지털 기반 학생 맞춤교육 체력증진 프로그램
        </h1>
        <input
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
        />
        <button
          onClick={handleSubmit}
          style={{ marginTop: '12px', width: '100%', padding: '10px', fontSize: '16px' }}
        >
          입장하기
        </button>
      </div>
    );
  }

  // 운동 기록 입력 화면
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>{name}님의 운동 기록</h2>

      <div style={{ marginBottom: '1rem' }}>
        <div>
          날짜 선택:{' '}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
        </div>

        <div>
          운동 유형:{' '}
          <select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option>걷기</option>
            <option>뛰기</option>
          </select>
        </div>

        <div>
          운동장 (120m) 몇 바퀴?{' '}
          <input
            type="number"
            value={fieldLaps}
            onChange={(e) => setFieldLaps(Number(e.target.value))}
            style={{ marginLeft: '10px', width: '60px' }}
          />
        </div>

        <div>
          체육관 (50m) 몇 바퀴?{' '}
          <input
            type="number"
            value={gymLaps}
            onChange={(e) => setGymLaps(Number(e.target.value))}
            style={{ marginLeft: '10px', width: '60px' }}
          />
        </div>

        <button
          onClick={handleSave}
          style={{ marginTop: '10px', width: '100%', padding: '10px' }}
        >
          기록 저장
        </button>
      </div>

      <h3>누적 운동량 그래프</h3>
      <LineChart width={500} height={300} data={graphData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="meters" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </div>
  );
}
