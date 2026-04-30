'use client';

import { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 22, seconds: 53 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        }
        if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 };
        }
        if (prevTime.hours > 0) {
          return { ...prevTime, hours: prevTime.hours - 1, minutes: 59, seconds: 59 };
        }
        clearInterval(timer);
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="timer">
      <div className="time-box">
        <span>{formatTime(timeLeft.hours)}</span>
        <p>Horas</p>
      </div>
      <div className="time-box">
        <span>{formatTime(timeLeft.minutes)}</span>
        <p>Min</p>
      </div>
      <div className="time-box">
        <span>{formatTime(timeLeft.seconds)}</span>
        <p>Seg</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
