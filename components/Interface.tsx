import React, { useState, useRef, useEffect } from 'react';
import { CharacterStats, StatHistory, StatKey, Language, StatRecord, getLevelInfo } from '../types';
import { 
  Settings, Upload, RefreshCw, X, Plus, Minus, History, 
  Brain, Heart, Crown, Zap, Coins, Clover, ChevronLeft, ChevronRight, Save,
  Eye, EyeOff, Trophy, Check, Trash2, AlertTriangle, Star, PartyPopper, Calendar
} from 'lucide-react';
import { LevelUpEvent } from '../App';

// --- Translations ---
export const TRANSLATIONS = {
  zh: {
    intelligence: '智力',
    vitality: '体力',
    charisma: '魅力',
    skill: '技能',
    wealth: '财富',
    luck: '幸运',
    settings: '设置',
    language: '语言',
    importModel: '导入人物模型',
    importScene: '导入场景模型',
    reset: '重置数据',
    recordEvent: '记录事件',
    amount: '数值变动',
    reason: '事件原因',
    add: '增加',
    history: '历史记录',
    noHistory: '暂无记录',
    back: '返回',
    save: '记录',
    current: '当前数值',
    modelSettings: '模型设置',
    showStats: '显示3D属性',
    hideStats: '隐藏3D属性',
    visibility: '界面显示',
    level: '等级',
    nextLevel: '下一级进度',
    showMore: '展开更多',
    showLess: '收起记录',
    levelUp: '等级提升',
    congrats: '恭喜！',
    continue: '继续征程',
    dailyLog: '今日记录',
    noEventsToday: '今日暂无事件',
    showDailyLog: '显示今日记录',
    hideDailyLog: '隐藏今日记录',
    prevPage: '上一页',
    nextPage: '下一页',
    page: '页',
    setDefault: '设为默认',
    defaultSaved: '已设为默认',
    clearDefault: '恢复初始',
    defaultCleared: '已恢复',
  },
  en: {
    intelligence: 'Intelligence',
    vitality: 'Vitality',
    charisma: 'Charisma',
    skill: 'Skill',
    wealth: 'Wealth',
    luck: 'Luck',
    settings: 'Settings',
    language: 'Language',
    importModel: 'Import Character',
    importScene: 'Import Scene',
    reset: 'Reset Data',
    recordEvent: 'Record Event',
    amount: 'Amount Change',
    reason: 'Event Reason',
    add: 'Add',
    history: 'History',
    noHistory: 'No History',
    back: 'Back',
    save: 'Record',
    current: 'Current Value',
    modelSettings: 'Model Settings',
    showStats: 'Show 3D Stats',
    hideStats: 'Hide 3D Stats',
    visibility: 'Interface Visibility',
    level: 'Level',
    nextLevel: 'To Next Level',
    showMore: 'Show More',
    showLess: 'Show Less',
    levelUp: 'Level Up',
    congrats: 'Congratulations!',
    continue: 'Continue',
    dailyLog: 'Daily Log',
    noEventsToday: 'No events today',
    showDailyLog: 'Show Daily Log',
    hideDailyLog: 'Hide Daily Log',
    prevPage: 'Prev',
    nextPage: 'Next',
    page: 'Page',
    setDefault: 'Set Default',
    defaultSaved: 'Saved',
    clearDefault: 'Reset Default',
    defaultCleared: 'Reset',
  },
  es: {
    intelligence: 'Inteligencia',
    vitality: 'Vitalidad',
    charisma: 'Carisma',
    skill: 'Habilidad',
    wealth: 'Riqueza',
    luck: 'Suerte',
    settings: 'Ajustes',
    language: 'Idioma',
    importModel: 'Importar Personaje',
    importScene: 'Importar Escena',
    reset: 'Reiniciar Datos',
    recordEvent: 'Registrar Evento',
    amount: 'Cambio',
    reason: 'Razón',
    add: 'Añadir',
    history: 'Historial',
    noHistory: 'Sin Historial',
    back: 'Volver',
    save: 'Guardar',
    current: 'Valor Actual',
    modelSettings: 'Ajustes de Modelo',
    showStats: 'Mostrar Estadísticas 3D',
    hideStats: 'Ocultar Estadísticas 3D',
    visibility: 'Visibilidad',
    level: 'Nivel',
    nextLevel: 'Al Siguiente Nivel',
    showMore: 'Mostrar Más',
    showLess: 'Mostrar Menos',
    levelUp: 'Subir de Nivel',
    congrats: '¡Felicidades!',
    continue: 'Continuar',
    dailyLog: 'Registro Diario',
    noEventsToday: 'Sin eventos hoy',
    showDailyLog: 'Mostrar Registro',
    hideDailyLog: 'Ocultar Registro',
    prevPage: 'Ant',
    nextPage: 'Sig',
    page: 'Pág',
    setDefault: 'Fijar Default',
    defaultSaved: 'Guardado',
    clearDefault: 'Borrar Default',
    defaultCleared: 'Borrado',
  },
  fr: {
    intelligence: 'Intelligence',
    vitality: 'Vitalité',
    charisma: 'Charisme',
    skill: 'Compétence',
    wealth: 'Richesse',
    luck: 'Chance',
    settings: 'Paramètres',
    language: 'Langue',
    importModel: 'Importer Perso',
    importScene: 'Importer Scène',
    reset: 'Réinitialiser',
    recordEvent: 'Enregistrer',
    amount: 'Montant',
    reason: 'Raison',
    add: 'Ajouter',
    history: 'Historique',
    noHistory: 'Aucun historique',
    back: 'Retour',
    save: 'Enregistrer',
    current: 'Valeur Actuelle',
    modelSettings: 'Paramètres du Modèle',
    showStats: 'Afficher Stats 3D',
    hideStats: 'Masquer Stats 3D',
    visibility: 'Visibilité',
    level: 'Niveau',
    nextLevel: 'Niveau Suivant',
    showMore: 'Afficher Plus',
    showLess: 'Afficher Moins',
    levelUp: 'Niveau Supérieur',
    congrats: 'Félicitations!',
    continue: 'Continuer',
    dailyLog: 'Journal Quotidien',
    noEventsToday: "Pas d'événements",
    showDailyLog: 'Afficher Journal',
    hideDailyLog: 'Masquer Journal',
    prevPage: 'Préc',
    nextPage: 'Suiv',
    page: 'Page',
    setDefault: 'Défaut',
    defaultSaved: 'Sauvegardé',
    clearDefault: 'Réinitialiser',
    defaultCleared: 'Réinitialisé',
  },
  hi: {
    intelligence: 'बुद्धि (Intelligence)',
    vitality: 'प्राण (Vitality)',
    charisma: 'करिश्मा (Charisma)',
    skill: 'कौशल (Skill)',
    wealth: 'धन (Wealth)',
    luck: 'भाग्य (Luck)',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    importModel: 'चरित्र आयात करें',
    importScene: 'दृश्य आयात करें',
    reset: 'डेटा रीसेट करें',
    recordEvent: 'घटना रिकॉर्ड करें',
    amount: 'राशि परिवर्तन',
    reason: 'कारण',
    add: 'जोड़ें',
    history: 'इतिहास',
    noHistory: 'कोई इतिहास नहीं',
    back: 'वापस',
    save: 'सहेजें',
    current: 'वर्तमान मूल्य',
    modelSettings: 'मॉडल सेटिंग्स',
    showStats: '3D आँकड़े दिखाएँ',
    hideStats: '3D आँकड़े छिपाएँ',
    visibility: 'दृश्यता',
    level: 'स्तर',
    nextLevel: 'अगले स्तर के लिए',
    showMore: 'और दिखाएं',
    showLess: 'कम दिखाएं',
    levelUp: 'स्तर ऊपर',
    congrats: 'बधाई हो!',
    continue: 'जारी रखें',
    dailyLog: 'दैनिक लॉग',
    noEventsToday: 'आज कोई घटना नहीं',
    showDailyLog: 'लॉग दिखाएँ',
    hideDailyLog: 'लॉग छिपाएँ',
    prevPage: 'पिछला',
    nextPage: 'अगला',
    page: 'पृष्ठ',
    setDefault: 'डिफ़ॉल्ट सेट करें',
    defaultSaved: 'सहेजा गया',
    clearDefault: 'डिफ़ॉल्ट हटाएं',
    defaultCleared: 'हटा दिया',
  },
  ar: {
    intelligence: 'الذكاء',
    vitality: 'الحيوية',
    charisma: 'الجاذبية',
    skill: 'المهارة',
    wealth: 'الثروة',
    luck: 'الحظ',
    settings: 'الإعدادات',
    language: 'اللغة',
    importModel: 'استيراد شخصية',
    importScene: 'استيراد مشهد',
    reset: 'إعادة تعيين',
    recordEvent: 'تسجيل حدث',
    amount: 'تغيير القيمة',
    reason: 'السبب',
    add: 'إضافة',
    history: 'التاريخ',
    noHistory: 'لا يوجد سجل',
    back: 'رجوع',
    save: 'حفظ',
    current: 'القيمة الحالية',
    modelSettings: 'إعدادات النموذج',
    showStats: 'إظهار الإحصائيات 3D',
    hideStats: 'إخفاء الإحصائيات 3D',
    visibility: 'الرؤية',
    level: 'مستوى',
    nextLevel: 'للمستوى التالي',
    showMore: 'عرض المزيد',
    showLess: 'عرض أقل',
    levelUp: 'ارتقاء المستوى',
    congrats: 'تهانينا!',
    continue: 'استمر',
    dailyLog: 'السجل اليومي',
    noEventsToday: 'لا توجد أحداث اليوم',
    showDailyLog: 'إظهار السجل',
    hideDailyLog: 'إخفاء السجل',
    prevPage: 'سابق',
    nextPage: 'التالي',
    page: 'صفحة',
    setDefault: 'تعيين كافتراضي',
    defaultSaved: 'تم الحفظ',
    clearDefault: 'مسح الافتراضي',
    defaultCleared: 'تم المسح',
  },
  pt: {
    intelligence: 'Inteligência',
    vitalidade: 'Vitalidade',
    charisma: 'Carisma',
    skill: 'Habilidade',
    wealth: 'Riqueza',
    luck: 'Sorte',
    settings: 'Configurações',
    language: 'Idioma',
    importModel: 'Importar Personagem',
    importScene: 'Importar Cena',
    reset: 'Resetar Dados',
    recordEvent: 'Registrar Evento',
    amount: 'Mudança',
    reason: 'Razão',
    add: 'Adicionar',
    history: 'Histórico',
    noHistory: 'Sem histórico',
    back: 'Voltar',
    save: 'Salvar',
    current: 'Valor Atual',
    modelSettings: 'Configurações de Modelo',
    showStats: 'Mostrar Stats 3D',
    hideStats: 'Ocultar Stats 3D',
    visibility: 'Visibilidade',
    level: 'Nível',
    nextLevel: 'Para o Próximo Nível',
    showMore: 'Mostrar Mais',
    showLess: 'Mostrar Menos',
    levelUp: 'Subir de Nível',
    congrats: 'Parabéns!',
    continue: 'Continuar',
    dailyLog: 'Diário de Bordo',
    noEventsToday: 'Sem eventos hoje',
    showDailyLog: 'Mostrar Diário',
    hideDailyLog: 'Ocultar Diário',
    prevPage: 'Ant',
    nextPage: 'Próx',
    page: 'Pág',
    setDefault: 'Definir Padrão',
    defaultSaved: 'Salvo',
    clearDefault: 'Limpar Padrão',
    defaultCleared: 'Limpo',
  }
};

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'zh', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
  { code: 'pt', label: 'Português' },
];

export const ICONS: Record<StatKey, any> = {
  intelligence: Brain,
  vitality: Heart,
  charisma: Crown,
  skill: Zap,
  wealth: Coins,
  luck: Clover,
};

export const COLORS: Record<StatKey, string> = {
  intelligence: 'text-blue-400 border-blue-400 shadow-blue-500/50',
  vitality: 'text-red-400 border-red-400 shadow-red-500/50',
  charisma: 'text-purple-400 border-purple-400 shadow-purple-500/50',
  skill: 'text-cyan-400 border-cyan-400 shadow-cyan-500/50',
  wealth: 'text-amber-400 border-amber-400 shadow-amber-500/50',
  luck: 'text-green-400 border-green-400 shadow-green-500/50',
};

const getStatGradient = (key: StatKey) => {
  switch (key) {
    case 'intelligence': return 'from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]';
    case 'vitality': return 'from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
    case 'charisma': return 'from-purple-600 to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]';
    case 'skill': return 'from-cyan-600 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]';
    case 'wealth': return 'from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
    case 'luck': return 'from-green-600 to-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]';
    default: return 'from-gray-600 to-gray-400';
  }
};

// --- Custom Components ---

interface RippleButtonProps {
  children?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const RippleButton = ({ children, onClick, className }: RippleButtonProps) => {
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick();
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {ripples.map(r => (
        <span 
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{ left: r.x, top: r.y, width: 20, height: 20, transform: 'translate(-50%, -50%)' }}
        />
      ))}
      {children}
    </button>
  );
};

// --- Daily Log Panel ---

const DailyLogPanel = ({ history, t }: { history: StatHistory, t: any }) => {
  // Aggregate and filter today's records
  const getTodayRecords = () => {
    const today = new Date().toDateString();
    const allRecords: (StatRecord & { statKey: StatKey })[] = [];
    
    (Object.keys(history) as StatKey[]).forEach(key => {
      const records = history[key].filter(r => new Date(r.timestamp).toDateString() === today);
      records.forEach(r => allRecords.push({ ...r, statKey: key }));
    });
    
    // Sort by timestamp desc (newest first)
    return allRecords.sort((a, b) => b.timestamp - a.timestamp);
  };

  const todaysRecords = getTodayRecords();

  return (
    <div className="absolute top-4 left-4 z-30 pointer-events-auto">
      <div className="w-64 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg shadow-black/30 flex flex-col max-h-[50vh]">
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
          <Calendar size={14} className="text-cyan-400" />
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">{t.dailyLog}</h3>
        </div>
        
        <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {todaysRecords.length === 0 ? (
             <div className="text-center py-8 text-[10px] text-gray-500 italic">
               {t.noEventsToday}
             </div>
          ) : (
            todaysRecords.map(record => {
              const Icon = ICONS[record.statKey];
              const isLevelUp = record.type === 'levelup';
              
              return (
                <div key={record.id} className="bg-black/40 border border-white/5 rounded-lg p-2.5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-full bg-gray-900 border ${COLORS[record.statKey].replace('text-', 'border-').split(' ')[1]} shrink-0`}>
                       {isLevelUp ? <Star size={10} className="text-yellow-400" /> : <Icon size={10} className={COLORS[record.statKey].split(' ')[0]} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                         <span className={`text-[10px] font-bold truncate ${isLevelUp ? 'text-yellow-400' : 'text-gray-300'}`}>
                           {record.reason}
                         </span>
                         <span className="text-[9px] font-mono text-gray-600 ml-1 shrink-0">
                           {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                         </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-gray-500 capitalize">{t[record.statKey]}</span>
                        <span className={`text-[10px] font-mono font-bold ${
                          isLevelUp ? 'text-yellow-500' :
                          record.amount >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {!isLevelUp && (record.amount > 0 ? '+' : '')}{!isLevelUp && record.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// --- Level Up Modal ---

const LevelUpModal = ({ event, onClose, t, language }: { event: LevelUpEvent, onClose: () => void, t: any, language: Language }) => {
  const Icon = ICONS[event.statKey];
  // Logic: Use Chinese if language is 'zh', otherwise default to English (with fallback to zh if en is missing)
  const quote = language === 'zh' ? event.quote.zh : (event.quote.en || event.quote.zh);

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 pointer-events-auto">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-gradient-to-b from-yellow-900/40 to-gray-900 border border-yellow-500/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-in zoom-in-50 duration-500 ring-1 ring-yellow-500/20">
        {/* Decorative Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/20 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="mb-4 relative">
           <Trophy size={64} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-bounce" />
           <PartyPopper size={32} className="text-yellow-200 absolute -top-2 -right-4 animate-pulse" />
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 uppercase tracking-widest mb-1 drop-shadow-sm">
          {t.congrats}
        </h2>
        
        <div className="text-sm font-bold text-yellow-500/80 mb-6 uppercase tracking-widest border-b border-yellow-500/30 pb-2 w-full">
          {t.levelUp}
        </div>

        <div className="flex items-center gap-3 mb-6 bg-black/40 px-6 py-3 rounded-2xl border border-yellow-500/20">
           <Icon size={24} strokeWidth={2.5} className={COLORS[event.statKey].split(' ')[0]} />
           <span className="text-lg text-white font-bold">{t[event.statKey]}</span>
           <span className="text-2xl font-black text-yellow-400 font-mono ml-2">Lv.{event.level}</span>
        </div>

        <div className="mb-8 relative">
           <span className="text-4xl absolute -top-4 -left-2 text-yellow-700/50 font-serif">"</span>
           <p className="text-gray-200 italic font-medium px-4 leading-relaxed">
             {quote}
           </p>
           <span className="text-4xl absolute -bottom-6 -right-2 text-yellow-700/50 font-serif">"</span>
        </div>

        <RippleButton 
          onClick={onClose} 
          className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 active:scale-95"
        >
          {t.continue}
        </RippleButton>
      </div>
    </div>
  );
};

// --- Detail Panel ---

interface DetailPanelProps {
  statKey: StatKey;
  value: number;
  history: StatRecord[];
  t: any;
  onClose: () => void;
  onUpdate: (val: number) => void;
  onRecord: (amount: number, reason: string) => void;
  isClosing?: boolean;
}

const DetailPanel = ({ statKey, value, history, t, onClose, onUpdate, onRecord, isClosing }: DetailPanelProps) => {
  const Icon = ICONS[statKey];
  const [recordAmount, setRecordAmount] = useState<string>('1');
  const [recordReason, setRecordReason] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [bump, setBump] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const levelInfo = getLevelInfo(value);
  const level = levelInfo.level;
  
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
  
  const displayedHistory = history.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Trigger bump animation when value changes
  useEffect(() => {
    setBump(true);
    const timer = setTimeout(() => setBump(false), 200);
    return () => clearTimeout(timer);
  }, [value]);

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(recordAmount);
    if (!isNaN(amt) && amt !== 0 && recordReason.trim()) {
      onRecord(amt, recordReason);
      setRecordReason('');
      setRecordAmount('1');
      setIsRecording(false);
      setCurrentPage(1); // Reset to first page to see new record
    }
  };

  const statGradient = getStatGradient(statKey);

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

      <div className={`relative w-full max-w-md bg-gray-900/95 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-white/10 ${isClosing ? 'anim-exit' : 'anim-enter'}`}>
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700 flex items-center justify-between shrink-0">
          <RippleButton onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors group">
            <ChevronLeft className="text-gray-400 group-hover:text-white transition-colors" />
          </RippleButton>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-800 border border-gray-700 shadow-inner`}>
              <Icon size={20} strokeWidth={2.5} className={`${COLORS[statKey].split(' ')[0]}`} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-widest uppercase">{t[statKey]}</h2>
          </div>
          {/* Spacer to balance header since we removed the level badge */}
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Main Value Control */}
          <div className="flex flex-col items-center space-y-4">
             <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">{t.current}</div>
             
             {/* Large Value Display */}
             <div className="relative group cursor-default">
                <div className={`text-5xl font-mono font-black tracking-tighter transition-all duration-300 ${COLORS[statKey].split(' ')[0]} drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] ${bump ? 'anim-bump' : ''}`}>
                  {value}
                </div>
             </div>
             
             {/* Prominent Level Display */}
             <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-900/20 to-yellow-600/20 border border-yellow-500/30 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.1)] mb-2 transform hover:scale-105 transition-transform duration-300 cursor-help" title={t.level}>
                <Trophy size={18} className="text-yellow-400 animate-pulse" />
                <span className="text-2xl font-black text-yellow-400 font-mono tracking-widest drop-shadow-sm">LV.{level}</span>
             </div>
             
             {/* Progress Bar Container */}
             <div className="w-full px-2 pt-2 pb-4">
               <div className="flex justify-between items-end mb-1">
                 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{t.nextLevel}</span>
                 <span className="text-[9px] font-mono text-gray-400">{Math.round(levelInfo.currentXp)} / {levelInfo.reqXp} XP</span>
               </div>
               
               <div className="relative h-6 bg-gray-950 rounded-md border border-gray-800 shadow-inner overflow-hidden">
                 {/* Grid Pattern */}
                 <div className="absolute inset-0 opacity-10" 
                      style={{ backgroundImage: 'linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '20px 100%' }}>
                 </div>

                 {/* Animated Bar */}
                 <div 
                    className={`h-full relative transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) bg-gradient-to-r ${statGradient}`}
                    style={{ width: `${levelInfo.progress}%` }} 
                 >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_10px_white]" />
                 </div>
               </div>
             </div>

             {/* Controls */}
             <div className="flex items-center gap-8">
                <RippleButton 
                  onClick={() => onUpdate(value - 1)} 
                  className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center transition-all hover:bg-red-500/20 hover:border-red-500 active:scale-90 shadow-lg"
                >
                  <Minus size={24} className="text-gray-400" />
                </RippleButton>
                <RippleButton 
                  onClick={() => onUpdate(value + 1)} 
                  className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center transition-all hover:bg-green-500/20 hover:border-green-500 active:scale-90 shadow-lg"
                >
                  <Plus size={24} className="text-gray-400" />
                </RippleButton>
             </div>
          </div>

          <div className="h-px bg-gray-800 w-full" />

          {/* Record Event Section */}
          <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
             <div className="flex items-center justify-between mb-2 cursor-pointer select-none" onClick={() => setIsRecording(!isRecording)}>
                <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wide text-gray-300">
                  <Save size={14} className="text-cyan-400" /> {t.recordEvent}
                </h3>
                <span className={`text-lg text-cyan-400 transition-transform duration-300 ${isRecording ? 'rotate-180' : ''}`}>
                  {isRecording ? '−' : '+'}
                </span>
             </div>
             
             {isRecording && (
               <form onSubmit={handleSubmitRecord} className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="grid grid-cols-3 gap-3">
                   <div className="col-span-1">
                     <label className="text-[9px] text-gray-500 uppercase tracking-wider mb-1 block">{t.amount}</label>
                     <input 
                       type="number" 
                       value={recordAmount} 
                       onChange={(e) => setRecordAmount(e.target.value)} 
                       className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-center font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
                     />
                   </div>
                   <div className="col-span-2">
                     <label className="text-[9px] text-gray-500 uppercase tracking-wider mb-1 block">{t.reason}</label>
                     <input 
                       type="text" 
                       value={recordReason} 
                       onChange={(e) => setRecordReason(e.target.value)} 
                       placeholder="..."
                       className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                     />
                   </div>
                 </div>
                 <RippleButton onClick={() => {}} className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2.5 rounded-lg text-xs font-bold tracking-wide shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]">
                   {t.save}
                 </RippleButton>
               </form>
             )}
          </div>

          {/* History List */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                <History size={14} /> {t.history}
              </h3>
            </div>
            
            <div className="space-y-2 min-h-[160px]">
              {history.length === 0 ? (
                <div className="text-center text-gray-600 py-8 italic text-xs border border-dashed border-gray-800 rounded-lg">{t.noHistory}</div>
              ) : (
                displayedHistory.map((record) => {
                  const isLevelUp = record.type === 'levelup';
                  return (
                    <div 
                      key={record.id} 
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                        isLevelUp 
                          ? 'bg-yellow-900/20 border-yellow-700/50 shadow-sm' 
                          : 'bg-black/20 border-gray-800 hover:bg-black/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isLevelUp && <Star size={14} className="text-yellow-500" fill="currentColor" />}
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-medium ${isLevelUp ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                            {record.reason}
                          </span>
                          <span className={`text-[9px] font-mono ${isLevelUp ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className={`font-mono font-bold text-sm ${
                        isLevelUp ? 'text-yellow-400' : 
                        record.amount >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {!isLevelUp && (record.amount > 0 ? '+' : '')}{!isLevelUp && record.amount}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {history.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-2 pt-2 border-t border-gray-800/50">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft size={14} className="text-gray-400" />
                </button>
                
                <span className="text-[10px] text-gray-500 font-mono">
                  {currentPage} / {totalPages}
                </span>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight size={14} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Main Interface Component ---

interface InterfaceProps {
  stats: CharacterStats;
  history: StatHistory;
  language: Language;
  activeStat: StatKey | null;
  show3DStats: boolean;
  showDailyLog: boolean;
  levelUpEvent: LevelUpEvent | null;
  errorMsg?: string | null;
  onLanguageChange: (lang: Language) => void;
  onUpdateStat: (key: StatKey, val: number) => void;
  onRecordEvent: (key: StatKey, amount: number, reason: string) => void;
  onReset: () => void;
  onUploadCharacter: (file: File) => void;
  onUploadBackground: (file: File) => void;
  onCloseDetail: () => void;
  onToggle3DStats: (show: boolean) => void;
  onToggleDailyLog: (show: boolean) => void;
  onCloseLevelUp: () => void;
  onSaveAsDefault: (type: 'character' | 'background') => Promise<void>;
  onClearDefault: (type: 'character' | 'background') => Promise<void>;
  onErrorClose?: () => void;
}

const Interface = ({
  stats,
  history,
  language,
  activeStat,
  show3DStats,
  showDailyLog,
  levelUpEvent,
  errorMsg,
  onLanguageChange,
  onUpdateStat,
  onRecordEvent,
  onReset,
  onUploadCharacter,
  onUploadBackground,
  onCloseDetail,
  onToggle3DStats,
  onToggleDailyLog,
  onCloseLevelUp,
  onSaveAsDefault,
  onClearDefault,
  onErrorClose
}: InterfaceProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{key: string, msg: string} | null>(null);
  
  const t = TRANSLATIONS[language];
  const charInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Reset closing state when active stat changes from outside
  useEffect(() => {
    if (activeStat) setIsClosing(false);
  }, [activeStat]);

  const handleCloseWrapped = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCloseDetail();
      setIsClosing(false);
    }, 200);
  };

  const handleSaveDefault = async (type: 'character' | 'background') => {
    await onSaveAsDefault(type);
    setSaveStatus({ key: type, msg: t.defaultSaved });
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleClearDefault = async (type: 'character' | 'background') => {
    await onClearDefault(type);
    setSaveStatus({ key: type, msg: t.defaultCleared });
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="w-full h-full relative font-sans">
      
      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="flex items-center gap-3 bg-red-900/90 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md">
            <AlertTriangle className="text-red-400" size={20} />
            <span className="text-xs font-bold">{errorMsg}</span>
            <button onClick={onErrorClose} className="ml-2 text-red-300 hover:text-white transition-colors"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Daily Log Panel (Top Left) */}
      {showDailyLog && (
        <DailyLogPanel history={history} t={t} />
      )}

      {/* Settings Button (Top Right) */}
      <div className="absolute top-4 right-4 z-40 pointer-events-auto">
        <RippleButton 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
          className="bg-black/60 backdrop-blur-md p-3 rounded-full text-white border border-white/10 hover:bg-cyan-900/50 transition-colors shadow-lg shadow-black/50"
        >
          <Settings size={20} />
        </RippleButton>

        {isSettingsOpen && (
          <div className="absolute right-0 mt-3 w-72 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Language Selector */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">{t.language}</label>
              <div className="grid grid-cols-3 gap-1.5">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`px-1 py-1.5 rounded text-[10px] font-medium transition-colors ${language === lang.code ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-700/50" />

            {/* Visibility Settings */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">{t.visibility}</label>
              <div className="space-y-2">
                <RippleButton 
                  onClick={() => onToggle3DStats(!show3DStats)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {show3DStats ? <Eye size={12} /> : <EyeOff size={12} />}
                    {show3DStats ? t.hideStats : t.showStats}
                  </span>
                  <div className={`w-6 h-3 rounded-full relative transition-colors ${show3DStats ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-transform ${show3DStats ? 'left-[14px]' : 'left-0.5'}`} />
                  </div>
                </RippleButton>

                <RippleButton 
                  onClick={() => onToggleDailyLog(!showDailyLog)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {showDailyLog ? <Calendar size={12} /> : <Calendar size={12} className="opacity-50" />}
                    {showDailyLog ? t.hideDailyLog : t.showDailyLog}
                  </span>
                  <div className={`w-6 h-3 rounded-full relative transition-colors ${showDailyLog ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-transform ${showDailyLog ? 'left-[14px]' : 'left-0.5'}`} />
                  </div>
                </RippleButton>
              </div>
            </div>
            
            <div className="h-px bg-gray-700/50" />
            
            {/* Uploads & Defaults */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">{t.modelSettings}</label>
              
              {/* Character */}
              <div className="flex flex-col gap-2 mb-3">
                <input type="file" ref={charInputRef} className="hidden" accept=".glb,.gltf,.fbx,.obj" onChange={(e) => e.target.files?.[0] && onUploadCharacter(e.target.files[0])} />
                <div className="flex items-center gap-1">
                  <RippleButton onClick={() => charInputRef.current?.click()} className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-200 transition-colors">
                     <Upload size={12} /> {t.importModel}
                  </RippleButton>
                  <button 
                    onClick={() => handleSaveDefault('character')} 
                    title={t.setDefault}
                    className="p-2 bg-gray-800 hover:bg-cyan-900/50 text-gray-400 hover:text-cyan-400 rounded-lg transition-colors"
                  >
                    {saveStatus?.key === 'character' ? <Check size={12} className="text-green-500" /> : <Save size={12} />}
                  </button>
                   <button 
                    onClick={() => handleClearDefault('character')} 
                    title={t.clearDefault}
                    className="p-2 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              
              {/* Background */}
              <div className="flex flex-col gap-2">
                <input type="file" ref={bgInputRef} className="hidden" accept=".glb,.gltf,.fbx,.obj" onChange={(e) => e.target.files?.[0] && onUploadBackground(e.target.files[0])} />
                <div className="flex items-center gap-1">
                  <RippleButton onClick={() => bgInputRef.current?.click()} className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-200 transition-colors">
                     <Upload size={12} /> {t.importScene}
                  </RippleButton>
                  <button 
                    onClick={() => handleSaveDefault('background')} 
                    title={t.setDefault}
                    className="p-2 bg-gray-800 hover:bg-cyan-900/50 text-gray-400 hover:text-cyan-400 rounded-lg transition-colors"
                  >
                    {saveStatus?.key === 'background' ? <Check size={12} className="text-green-500" /> : <Save size={12} />}
                  </button>
                   <button 
                    onClick={() => handleClearDefault('background')} 
                    title={t.clearDefault}
                    className="p-2 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-700/50" />

            {/* Reset */}
            <RippleButton onClick={onReset} className="flex items-center justify-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-xs transition-colors border border-red-900/30 w-full">
              <RefreshCw size={12} /> {t.reset}
            </RippleButton>
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      {levelUpEvent && levelUpEvent.show && (
        <LevelUpModal event={levelUpEvent} onClose={onCloseLevelUp} t={t} language={language} />
      )}

      {/* Detail Modal */}
      {activeStat && (
        <DetailPanel 
          statKey={activeStat}
          value={stats[activeStat]}
          history={history[activeStat]}
          t={t}
          onClose={handleCloseWrapped}
          onUpdate={(val) => {
            if (activeStat) onUpdateStat(activeStat, val);
          }}
          onRecord={(amt, rsn) => {
            if (activeStat) onRecordEvent(activeStat, amt, rsn);
          }}
          isClosing={isClosing}
        />
      )}

    </div>
  );
};

export default Interface;