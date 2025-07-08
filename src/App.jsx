import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
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
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDateForDelete, setSelectedDateForDelete] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const meters = fieldLaps * 120 + gymLaps * 50;
    const newRecord = { name, date: today, meters, activity };

    const updated = [...records.filter(r => !(r.name === name && r.date === today && r.activity === activity)), newRecord];
    setRecords(updated);
  };

  const filteredRecords = records.filter(r =>
    r.name === name && dayjs(r.date).isSame(currentMonth, 'month')
  );

  const allDatesInMonth = Array.from({ length: currentMonth.daysInMonth() }, (_, i) =>
    currentMonth.date(i + 1).format('YYYY-MM-DD')
  );

  const dailyData = allDatesInMonth.map(date => {
    const walk = filteredRecords
      .filter(r => r.date === date && r.activity === '걷기')
      .reduce((sum, r) => sum + r.meters, 0);
    const run = filteredRecords
      .filter(r => r.date === date && r.activity === '뛰기')
      .reduce((sum, r) => sum + r.meters, 0);
    return { date, 걷기: walk, 뛰기: run };
  });

  const handlePointClick = (data) => {
    setSelectedDateForDelete(data.date);
  };

  const deleteRecord = () => {
    if (!selectedDateForDelete) return;
    const updated = records.filter(r =>
      !(r.name === name && r.date === selectedDateForDelete)
    );
    setRecords(updated);
    setSelectedDateForDelete(null);
  };

  if (!submitted) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1>2025. 디지털 기반 학생 맞춤교육 체력증진 프로그램</h1>
        <input
          placeholder="이름을 입력하세요"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
        <button onClick={handleSubmit} style={{ width: '100%', marginTop: '10px' }}>
          입장하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <h2>{name}님의 운동 기록</h2>
      <div>
        <div>
          운동 유형:{' '}
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
            onChange={e => setFieldLaps(Number(e.target.value))}
          />
        </div>
        <div>
          체육관 (50m) 몇 바퀴?
          <input
            type="number"
            value={gymLaps}
            onChange={e => setGymLaps(Number(e.target.value))}
          />
        </div>
        <button onClick={handleSave}>기록 저장</button>
      </div>

      <h3>누적 운동량 그래프 ({currentMonth.format('YYYY년 M월')})</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}>← 이전 달</button>
        <button onClick={() => setCurrentMonth(prev => prev.add(1, 'month'))}>다음 달 →</button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="걷기"
            stroke="#82ca9d"
            strokeWidth={2}
            activeDot={{ onClick: (e, payload) => handlePointClick(payload.payload) }}
          />
          <Line
            type="monotone"
            dataKey="뛰기"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ onClick: (e, payload) => handlePointClick(payload.payload) }}
          />
        </LineChart>
      </ResponsiveContainer>

      {selectedDateForDelete && (
        <div style={{ marginTop: '20px', border: '1px solid red', padding: '10px' }}>
          <strong>{selectedDateForDelete} 기록을 삭제하시겠습니까?</strong><br />
          <button onClick={deleteRecord} style={{ color: 'white', backgroundColor: 'red' }}>삭제</button>
          <button onClick={() => setSelectedDateForDelete(null)} style={{ marginLeft: '10px' }}>취소</button>
        </div>
      )}
    </div>
  );
}
