import React, { useState, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import Interface, { TRANSLATIONS, COLORS } from './components/Interface';
import { CharacterStats, StatHistory, INITIAL_STATS, INITIAL_HISTORY, StatKey, Language, getLevelInfo, StatRecord } from './types';
import { saveAsset, getAsset, deleteAsset } from './services/storageService';

// Motivational Quotes for Level Up
const QUOTES = [
  { zh: "伟大的旅程始于足下。", en: "A journey of a thousand miles begins with a single step." },
  { zh: "每一个台阶都是通往巅峰的基石。", en: "Every step is a cornerstone to the peak." },
  { zh: "力量不仅仅是数值，更是内心的成长。", en: "Power is not just numbers, but inner growth." },
  { zh: "坚持不懈，奇迹就在前方。", en: "Persevere, and miracles are just ahead." },
  { zh: "你的潜力无限，继续突破极限吧！", en: "Your potential is infinite, keep breaking limits!" },
  { zh: "今日的努力是明日传奇的开端。", en: "Today's effort is the beginning of tomorrow's legend." },
  { zh: "强者不是没有眼泪，而是含着眼泪奔跑。", en: "The strong run with tears in their eyes." },
  { zh: "星辰大海，才是你的征途。", en: "The stars and the sea are your journey." }
];

export interface LevelUpEvent {
  show: boolean;
  statKey: StatKey;
  level: number;
  quote: { zh: string, en: string };
}

export interface ModelData {
  url: string;
  ext: string; // 'glb' | 'gltf' | 'fbx' | 'obj'
}

const App: React.FC = () => {
  // State
  const [stats, setStats] = useState<CharacterStats>(INITIAL_STATS);
  const [history, setHistory] = useState<StatHistory>(INITIAL_HISTORY);
  const [language, setLanguage] = useState<Language>('zh');
  const [activeStat, setActiveStat] = useState<StatKey | null>(null);
  const [show3DStats, setShow3DStats] = useState(true);
  const [showDailyLog, setShowDailyLog] = useState(true);
  
  const [characterModel, setCharacterModel] = useState<ModelData | null>(null);
  const [backgroundModel, setBackgroundModel] = useState<ModelData | null>(null);
  
  // Store the raw file objects to allow saving them to IDB
  const [characterFile, setCharacterFile] = useState<Blob | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<Blob | null>(null);

  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load default models from IndexedDB on startup
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const charData = await getAsset('default_character');
        if (charData) {
          const url = URL.createObjectURL(charData.file);
          setCharacterModel({ url, ext: charData.ext });
          setCharacterFile(charData.file);
        }

        const bgData = await getAsset('default_background');
        if (bgData) {
          const url = URL.createObjectURL(bgData.file);
          setBackgroundModel({ url, ext: bgData.ext });
          setBackgroundFile(bgData.file);
        }
      } catch (err) {
        console.error("Failed to load default models:", err);
      }
    };
    loadDefaults();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (characterModel) URL.revokeObjectURL(characterModel.url);
      if (backgroundModel) URL.revokeObjectURL(backgroundModel.url);
    };
  }, []);

  // Centralized update function to handle stats and level up checks
  const updateStat = (key: StatKey, newValue: number, record?: { reason: string, amount: number }) => {
    setStats(prevStats => {
      const oldVal = prevStats[key];
      const safeNewVal = Math.max(0, newValue);
      
      const oldLevelInfo = getLevelInfo(oldVal);
      const newLevelInfo = getLevelInfo(safeNewVal);
      
      const newHistoryRecords: StatRecord[] = [];
      const timestamp = Date.now();

      // 1. Add the explicit event record if provided
      if (record) {
        newHistoryRecords.push({
          id: crypto.randomUUID(),
          amount: record.amount,
          reason: record.reason,
          timestamp: timestamp,
          type: 'event'
        });
      }

      // 2. Check for Level Up
      if (newLevelInfo.level > oldLevelInfo.level) {
        newHistoryRecords.push({
          id: crypto.randomUUID(),
          amount: 0,
          reason: `Level Up! (Lv.${newLevelInfo.level})`,
          timestamp: timestamp + 1, // Ensure it appears after the event in sorting if needed
          type: 'levelup'
        });

        // Trigger Level Up Modal
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setLevelUpEvent({
          show: true,
          statKey: key,
          level: newLevelInfo.level,
          quote: randomQuote
        });
      }

      // 3. Check for Level Down (Optional, maybe for punishment? For now we just record it if explicit, but usually we don't celebrate level down)
      
      if (newHistoryRecords.length > 0) {
        setHistory(prevHistory => ({
          ...prevHistory,
          [key]: [...newHistoryRecords, ...prevHistory[key]]
        }));
      }

      return {
        ...prevStats,
        [key]: safeNewVal
      };
    });
  };

  // Called by +/- buttons
  const handleStatUpdate = (key: StatKey, newValue: number) => {
    // For direct updates, we treat difference as the amount, reason is "Manual Adjustment" if we wanted to record it,
    // but typically simple clicks might just adjust stats. 
    // However, to trigger "Level Up" history, we need to use the central updater.
    updateStat(key, newValue);
  };

  // Called by Record Form
  const handleRecordEvent = (key: StatKey, amount: number, reason: string) => {
    const currentVal = stats[key];
    updateStat(key, currentVal + amount, { amount, reason });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data?')) {
      setStats(INITIAL_STATS);
      setHistory(INITIAL_HISTORY);
    }
  };

  const handleUploadCharacter = (file: File) => {
    if (characterModel) URL.revokeObjectURL(characterModel.url);
    const url = URL.createObjectURL(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'glb';
    setCharacterModel({ url, ext });
    setCharacterFile(file);
  };

  const handleUploadBackground = (file: File) => {
    if (backgroundModel) URL.revokeObjectURL(backgroundModel.url);
    const url = URL.createObjectURL(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'glb';
    setBackgroundModel({ url, ext });
    setBackgroundFile(file);
  };

  const handleSaveAsDefault = async (type: 'character' | 'background') => {
    try {
      if (type === 'character' && characterFile && characterModel) {
        await saveAsset('default_character', characterFile, characterModel.ext);
      } else if (type === 'background' && backgroundFile && backgroundModel) {
        await saveAsset('default_background', backgroundFile, backgroundModel.ext);
      }
    } catch (e) {
      console.error("Failed to save default asset", e);
      alert("Failed to save default model. Browser storage might be full or restricted.");
    }
  };

  const handleClearDefault = async (type: 'character' | 'background') => {
    try {
      if (type === 'character') {
        await deleteAsset('default_character');
        if (characterModel) URL.revokeObjectURL(characterModel.url);
        setCharacterModel(null);
        setCharacterFile(null);
      } else {
        await deleteAsset('default_background');
        if (backgroundModel) URL.revokeObjectURL(backgroundModel.url);
        setBackgroundModel(null);
        setBackgroundFile(null);
      }
    } catch (e) {
      console.error("Failed to clear default asset", e);
    }
  };

  const handleStatSelect = (key: StatKey) => {
    setActiveStat(key);
  };

  // Prepare labels for 3D scene based on current language
  const currentLabels: Record<string, string> = {};
  const t = TRANSLATIONS[language];
  (Object.keys(stats) as StatKey[]).forEach(key => {
    currentLabels[key] = t[key];
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans text-white">
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <ThreeScene 
          characterModel={characterModel} 
          backgroundModel={backgroundModel} 
          stats={stats}
          labels={currentLabels}
          colors={COLORS}
          showStats={show3DStats}
          onSelectStat={handleStatSelect}
          onModelError={(msg) => {
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(null), 5000);
          }}
        />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Interface 
          stats={stats}
          history={history}
          language={language}
          activeStat={activeStat}
          show3DStats={show3DStats}
          showDailyLog={showDailyLog}
          levelUpEvent={levelUpEvent}
          errorMsg={errorMsg}
          onLanguageChange={setLanguage}
          onUpdateStat={handleStatUpdate}
          onRecordEvent={handleRecordEvent}
          onReset={handleReset}
          onUploadCharacter={handleUploadCharacter}
          onUploadBackground={handleUploadBackground}
          onCloseDetail={() => setActiveStat(null)}
          onCloseLevelUp={() => setLevelUpEvent(null)}
          onToggle3DStats={setShow3DStats}
          onToggleDailyLog={setShowDailyLog}
          onSaveAsDefault={handleSaveAsDefault}
          onClearDefault={handleClearDefault}
          onErrorClose={() => setErrorMsg(null)}
        />
      </div>
    </div>
  );
};

export default App;