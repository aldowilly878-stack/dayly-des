import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flame, Brain, Sliders, Volume2, Plus, Minus, Bell, VolumeX, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations, Language } from "../translations";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  language: Language;
}

export default function PomodoroTimer({ language }: PomodoroTimerProps) {
  const t = translations[language];
  const [mode, setMode] = useState<TimerMode>("work");
  
  // Custom durations state (in minutes)
  const [workMin, setWorkMin] = useState<number>(25);
  const [shortMin, setShortMin] = useState<number>(5);
  const [longMin, setLongMin] = useState<number>(15);
  
  // Smart Interval Mode States
  const [isSmartMode, setIsSmartMode] = useState<boolean>(true); // Default to true as user requested this smart mode behavior
  const [totalTargetStudyMin, setTotalTargetStudyMin] = useState<number>(60); // e.g. 1 hour (60 mins)
  const [targetIntervals, setTargetIntervals] = useState<number>(4); // e.g. 4 times
  
  // Calculated work time per interval
  const calculatedWorkMin = isSmartMode 
    ? Math.max(1, Math.round(totalTargetStudyMin / targetIntervals)) 
    : workMin;

  // Interval & Sessions states
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  
  // Sound alarm preference
  const [selectedAlarm, setSelectedAlarm] = useState<string>("chime");
  
  // Settings view toggle
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(calculatedWorkMin * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic durations based on customizable settings (soft green emerald theme dominant!)
  const modeSettings = {
    work: { 
      label: t.pomodoroFocusBtn, 
      duration: calculatedWorkMin * 60, 
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60" 
    },
    shortBreak: { 
      label: t.pomodoroShortBreakBtn, 
      duration: shortMin * 60, 
      color: "text-teal-600 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/60" 
    },
    longBreak: { 
      label: t.pomodoroLongBreakBtn, 
      duration: longMin * 60, 
      color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900/60" 
    },
  };

  // Sync settings duration when not running and mode or settings changes
  useEffect(() => {
    if (!isRunning) {
      if (mode === "work") {
        setTimeLeft(calculatedWorkMin * 60);
      } else if (mode === "shortBreak") {
        setTimeLeft(shortMin * 60);
      } else if (mode === "longBreak") {
        setTimeLeft(longMin * 60);
      }
    }
  }, [calculatedWorkMin, shortMin, longMin, mode, isRunning, isSmartMode]);

  // Main timer tick countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, calculatedWorkMin, shortMin, longMin, selectedAlarm, targetIntervals]);

  // Web Audio API Synthesizer Sound Engine for high-quality, reliable, customizable alarms
  const playAlarmSound = (soundType: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      const playNote = (
        freq: number, 
        start: number, 
        duration: number, 
        type: OscillatorType = "sine", 
        gainVal = 0.3
      ) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        // Dynamic volume envelope
        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(gainVal, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      if (soundType === "chime") {
        // Melodic Chime C5 - E5 - G5 with warm decay
        playNote(523.25, now, 0.35, "sine", 0.25);
        playNote(659.25, now + 0.12, 0.35, "sine", 0.25);
        playNote(783.99, now + 0.24, 0.55, "sine", 0.25);
      } else if (soundType === "beep") {
        // Classic Double Beep
        playNote(880, now, 0.08, "square", 0.15);
        playNote(880, now + 0.12, 0.08, "square", 0.15);
        playNote(880, now + 0.24, 0.08, "square", 0.15);
      } else if (soundType === "bell") {
        // Ringing metallic brass bell
        const duration = 1.3;
        playNote(987.77, now, duration, "sine", 0.2);
        playNote(1479.98, now, duration * 0.8, "sine", 0.1);
        playNote(1975.53, now, duration * 0.6, "sine", 0.05);
      } else if (soundType === "retro") {
        // Space retro arcade sweep laser
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.35);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (soundType === "gong") {
        // Soothing deep resonance Zen gong
        const duration = 2.0;
        playNote(196.00, now, duration, "sine", 0.35);
        playNote(293.66, now, duration, "sine", 0.2);
        playNote(392.00, now, duration, "sine", 0.15);
      }
    } catch (e) {
      console.log("AudioContext is blocked or not supported on this browser context.");
    }
  };

  const handleTimerComplete = () => {
    // Play selected alarm sound!
    playAlarmSound(selectedAlarm);

    if (mode === "work") {
      const nextCount = sessionsCompleted + 1;
      setSessionsCompleted(nextCount);
      
      // If completed target sessions interval, switch to long break, else switch to short break
      if (nextCount % targetIntervals === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      switchMode("work");
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    
    // Set custom durations
    if (newMode === "work") {
      setTimeLeft(calculatedWorkMin * 60);
    } else if (newMode === "shortBreak") {
      setTimeLeft(shortMin * 60);
    } else if (newMode === "longBreak") {
      setTimeLeft(longMin * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    
    if (mode === "work") {
      setTimeLeft(calculatedWorkMin * 60);
    } else if (mode === "shortBreak") {
      setTimeLeft(shortMin * 60);
    } else if (mode === "longBreak") {
      setTimeLeft(longMin * 60);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = (timeLeft / modeSettings[mode].duration) * 100;

  return (
    <div id="pomodoro-timer-card" className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#064E3B]/10 dark:border-emerald-500/20 p-6 journal-card-shadow transition-all duration-300">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-500 animate-pulse" />
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm font-display tracking-tight">{t.pomodoroTitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Settings toggle button */}
          <button
            id="toggle-pomodoro-settings"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
              isSettingsOpen 
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                : "bg-slate-50 dark:bg-slate-950 border-[#064E3B]/10 dark:border-slate-800/60 text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
            title={language === "id" ? "Sesuaikan Alarm & Waktu" : "Customize Alarm & Durations"}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border-2 border-[#064E3B]/10">
            <Flame className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 dark:text-emerald-400 animate-bounce" />
            <span className="font-mono">
              {language === "id" ? "Sesi" : "Session"}: {sessionsCompleted}
              {targetIntervals > 0 && `/${targetIntervals}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Helper info banner for Smart Interval Calculation */}
        {isSmartMode && (
          <div className="mb-4 w-full bg-emerald-50/60 dark:bg-emerald-950/15 border-2 border-[#064E3B]/10 rounded-2xl p-3 text-center flex items-center justify-center gap-2 shadow-sm/5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-extrabold leading-relaxed font-sans">
              {language === "id" 
                ? `Mode Pintar: Belajar ${totalTargetStudyMin} m dibagi ${targetIntervals} sesi = @${calculatedWorkMin} m / sesi.` 
                : `Smart Mode: Study ${totalTargetStudyMin} mins split into ${targetIntervals} sessions = @${calculatedWorkMin} mins / session.`
              }
            </p>
          </div>
        )}

        {/* Toggle Modes tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl w-full mb-6 border-2 border-[#064E3B]/10">
          <button
            id="mode-btn-work"
            onClick={() => switchMode("work")}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              mode === "work" ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-black border border-slate-200/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {t.pomodoroFocusBtn} ({calculatedWorkMin}m)
          </button>
          <button
            id="mode-btn-short"
            onClick={() => switchMode("shortBreak")}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              mode === "shortBreak" ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-black border border-slate-200/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {t.pomodoroShortBreakBtn} ({shortMin}m)
          </button>
          <button
            id="mode-btn-long"
            onClick={() => switchMode("longBreak")}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              mode === "longBreak" ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm font-black border border-slate-200/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {t.pomodoroLongBreakBtn} ({longMin}m)
          </button>
        </div>

        {/* Circular Display */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              className={
                mode === "work"
                  ? "stroke-emerald-500"
                  : mode === "shortBreak"
                  ? "stroke-teal-500"
                  : "stroke-cyan-500"
              }
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="276.4"
              animate={{ strokeDashoffset: 276.4 - (276.4 * (100 - progressPercentage)) / 100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </svg>
          <div className="text-center z-10">
            <span id="timer-clock" className="text-3xl font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">
              {formatTime(timeLeft)}
            </span>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
              {mode === "work" ? t.pomodoroFocusText : t.pomodoroBreakText}
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            id="timer-reset-btn"
            onClick={resetTimer}
            className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            title={t.pomodoroResetBtn}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            id="timer-toggle-btn"
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer ${
              isRunning
                ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-slate-200 animate-pulse"
                : mode === "work"
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/10"
                : mode === "shortBreak"
                ? "bg-teal-500 text-white hover:bg-teal-600 shadow-teal-500/10"
                : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-cyan-500/10"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white dark:fill-slate-900" />
                <span>{t.pomodoroPauseBtn}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white dark:fill-white" />
                <span>{t.pomodoroStartBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Customizable alarm settings panel (expandable) */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              id="pomodoro-customizer-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-4 w-full space-y-4"
            >
              {/* Toggle Mode: Classic vs Smart Calculated Intervals */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {language === "id" ? "Kalkulasi Interval Sesi Otomatis" : "Auto Session Calculation"}
                  </h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    {language === "id" 
                      ? "Bagi total waktu belajar Anda ke dalam sesi interval sama rata." 
                      : "Split your total study time into even interval sessions."}
                  </p>
                </div>
                <button
                  id="toggle-smart-mode-btn"
                  onClick={() => {
                    setIsSmartMode(!isSmartMode);
                    resetTimer();
                  }}
                  className="text-emerald-500 hover:opacity-80 transition-all cursor-pointer"
                >
                  {isSmartMode ? (
                    <ToggleRight className="w-9 h-9" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>

              {isSmartMode ? (
                /* SMART INTERVAL CALCULATED MODE CONTROLS */
                <div className="grid grid-cols-2 gap-3.5 bg-emerald-50/30 dark:bg-emerald-950/10 p-3 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800">
                  {/* Total Target Study Time (e.g. 60 mins / 1 hour) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "id" ? "Total Belajar (Mnt)" : "Total Study Time (Mins)"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50">
                      <button
                        id="dec-total-study"
                        type="button"
                        onClick={() => {
                          setTotalTargetStudyMin(prev => Math.max(5, prev - 5));
                          resetTimer();
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {totalTargetStudyMin}m
                      </span>
                      <button
                        id="inc-total-study"
                        type="button"
                        onClick={() => {
                          setTotalTargetStudyMin(prev => Math.min(480, prev + 5));
                          resetTimer();
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Target Intervals (e.g. 4 times) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "id" ? "Jumlah Sesi Belajar" : "Number of Sessions"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50">
                      <button
                        id="dec-target-intervals-smart"
                        type="button"
                        onClick={() => {
                          setTargetIntervals(prev => Math.max(1, prev - 1));
                          resetTimer();
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {targetIntervals}x
                      </span>
                      <button
                        id="inc-target-intervals-smart"
                        type="button"
                        onClick={() => {
                          setTargetIntervals(prev => Math.min(12, prev + 1));
                          resetTimer();
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Short break duration */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "id" ? "Waktu Istirahat per Sesi (Mnt)" : "Break Time per Session (Mins)"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50">
                      <button
                        id="dec-short-time-smart"
                        type="button"
                        onClick={() => setShortMin(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {shortMin} {language === "id" ? "Menit" : "Minutes"}
                      </span>
                      <button
                        id="inc-short-time-smart"
                        type="button"
                        onClick={() => setShortMin(prev => Math.min(60, prev + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* CLASSIC MANUALLY CONFIGURED MODE CONTROLS */
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Custom Work Time */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "id" ? "Waktu Fokus (Menit)" : "Focus Time (Mins)"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50">
                      <button
                        id="dec-work-time"
                        type="button"
                        onClick={() => setWorkMin(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {workMin}
                      </span>
                      <button
                        id="inc-work-time"
                        type="button"
                        onClick={() => setWorkMin(prev => Math.min(180, prev + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Custom Short Break Time */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "id" ? "Istirahat Pendek" : "Short Break"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50">
                      <button
                        id="dec-short-time"
                        type="button"
                        onClick={() => setShortMin(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {shortMin}
                      </span>
                      <button
                        id="inc-short-time"
                        type="button"
                        onClick={() => setShortMin(prev => Math.min(60, prev + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Custom Long Break Time */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "id" ? "Istirahat Panjang" : "Long Break"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50">
                      <button
                        id="dec-long-time"
                        type="button"
                        onClick={() => setLongMin(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {longMin}
                      </span>
                      <button
                        id="inc-long-time"
                        type="button"
                        onClick={() => setLongMin(prev => Math.min(120, prev + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Custom Target Interval count */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "id" ? "Interval Panjang" : "Long Interval"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50">
                      <button
                        id="dec-target-intervals"
                        type="button"
                        onClick={() => setTargetIntervals(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {targetIntervals}
                      </span>
                      <button
                        id="inc-target-intervals"
                        type="button"
                        onClick={() => setTargetIntervals(prev => Math.min(12, prev + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sound Settings & Preview */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {language === "id" ? "Pilihan Suara Alarm" : "Alarm Sound Options"}
                  </span>
                  
                  <button
                    id="test-selected-alarm"
                    type="button"
                    onClick={() => playAlarmSound(selectedAlarm)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 px-2.5 py-0.5 rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <Volume2 className="w-3 h-3 text-emerald-500" />
                    <span>{language === "id" ? "Uji Coba" : "Preview"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {[
                    { id: "chime", label: "🔔 Chime" },
                    { id: "beep", label: "⏰ Beep" },
                    { id: "bell", label: "🔔 Bell" },
                    { id: "retro", label: "⚡ Retro" },
                    { id: "gong", label: "🥁 Gong" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      id={`sound-select-btn-${item.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedAlarm(item.id);
                        playAlarmSound(item.id);
                      }}
                      className={`py-1.5 text-center text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedAlarm === item.id
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm font-bold"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200/40 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
