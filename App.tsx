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

const STORAGE_KEYS = {
  STATS: 'nexus_stats',
  HISTORY: 'nexus_history',
  LANGUAGE: 'nexus_language',
  SETTINGS: 'nexus_settings'
};

const App: React.FC = () => {
  // State Initialization with LocalStorage lazy loading
  const [stats, setStats] = useState<CharacterStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch (e) {
      console.error("Failed to load stats", e);
      return INITIAL_STATS;
    }
  });

  const [history, setHistory] = useState<StatHistory>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch (e) {
      console.error("Failed to load history", e);
      return INITIAL_HISTORY;
    }
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved as Language) || 'zh';
  });

  const [activeStat, setActiveStat] = useState<StatKey | null>(null);
  
  // Load UI settings
  const [show3DStats, setShow3DStats] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved).show3DStats : true;
  });
  
  const [showDailyLog, setShowDailyLog] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved).showDailyLog : true;
  });
  
  const [characterModel, setCharacterModel] = useState<ModelData | null>(null);
  const [backgroundModel, setBackgroundModel] = useState<ModelData | null>(null);
  
  // Store the raw file objects to allow saving them to IDB
  const [characterFile, setCharacterFile] = useState<Blob | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<Blob | null>(null);

  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- MOBILE PERSISTENCE CHECK ---
  useEffect(() => {
    // Request persistent storage to prevent OS from clearing data on low disk space
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log("Storage will not be cleared except by explicit user action");
        } else {
          console.log("Storage may be cleared by the UA under storage pressure.");
        }
      });
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ show3DStats, showDailyLog }));
  }, [show3DStats, showDailyLog]);

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

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear local records.')) {
      setStats(INITIAL_STATS);
      setHistory(INITIAL_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.STATS);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      // We don't necessarily clear language or model defaults unless requested separately
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

  // --- DATA BACKUP & RESTORE ---
  
  const handleExportData = () => {
    const data = {
      version: 1,
      timestamp: Date.now(),
      stats,
      history,
      settings: { show3DStats, showDailyLog },
      language
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        
        if (data.version && data.stats && data.history) {
          if (window.confirm("Overwrite current data with this backup?")) {
             setStats(data.stats);
             setHistory(data.history);
             if (data.settings) {
               setShow3DStats(data.settings.show3DStats);
               setShowDailyLog(data.settings.showDailyLog);
             }
             if (data.language) setLanguage(data.language);
             alert("Data restored successfully!");
          }
        } else {
          throw new Error("Invalid backup format");
        }
      } catch (err) {
        console.error("Import failed", err);
        setErrorMsg("Failed to import data: Invalid file format.");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    };
    reader.readAsText(file);
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
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
      </div>
    </div>
  );
};

export default App;