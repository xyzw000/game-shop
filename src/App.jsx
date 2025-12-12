import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  BookOpen, 
  Wifi, 
  Coffee, 
  ChevronLeft, 
  Search, 
  Info, 
  Zap, 
  Users, 
  X,
  ExternalLink,
  ImageOff,
  Sparkles,
  Send,
  Bot,
  Loader2,
  MessageSquare,
  List, // 新增图标
  Tag   // 新增图标
} from 'lucide-react';

// ==========================================
// 1. 配置区域 (已保留你的 Key)
// ==========================================
const apiKey = "sk-84f75b3c03a8458ca3679739aece727a"; // 🔴 已填入你的 DeepSeek Key

// ==========================================
// 2. AI 核心逻辑
// ==========================================
const callDeepSeek = async (history, gameContext = "") => {
  if (!apiKey) {
    return new Promise(resolve => setTimeout(() => {
      resolve("AI 助手：请检查 API Key 是否配置正确。");
    }, 1000));
  }

  const systemMessage = `
    你是一家名为“即刻主机游戏”的电玩店的 AI 游戏助手。
    你的任务是帮助顾客解决游戏卡关问题、推荐游戏、或解决主机操作问题。
    
    店铺拥有上百款游戏，首页展示的只是部分。
    顾客当前正在查看的游戏是：${gameContext || "无"}。
    
    规则：
    1. 语气热情、专业、像一个资深的老玩家网管。
    2. 推荐策略：放开思路，推荐任何主流好游戏。如果店里库存列表里有，优先推荐。
    3. 回答要简洁明了，适合手机阅读，多用 emoji。
  `;

  // 构造完整的消息链：System Prompt + 聊天历史
  const apiMessages = [
    { role: "system", content: systemMessage },
    ...history.map(msg => ({
      role: msg.role, 
      content: msg.content
    }))
  ];

  try {
    const response = await fetch(
      'https://api.deepseek.com/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: apiMessages, // 🟢 发送完整对话历史
          temperature: 1.3,
          stream: false
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "AI 暂时没有回应。";
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return `AI 助手暂时有点忙，请重试。`;
  }
};

// ==========================================
// 3. 数据源 (已合并你的店铺信息和新游戏列表)
// ==========================================

const SHOP_INFO = {
  name: "即刻主机游戏",
  wifiName: "jkgame_5G",
  wifiPass: "403403403",
  notice: "文明游戏，请勿用力摔手柄哦~"
};

const CONSOLES = [
  {
    id: 'ps5',
    name: 'PlayStation 5',
    color: 'from-blue-600 to-blue-800',
    intro: '次世代画质体验，独占大作丰富。',
    image: '/images/ps5.png',
    buttonLayout: [
      { label: "✕", color: "blue", desc: "确认 / 跳跃", usage: "美版/新游戏通用" },
      { label: "〇", color: "red", desc: "取消 / 闪避", usage: "日版通用" },
      { label: "□", color: "pink", desc: "攻击 / 互动", usage: "轻攻击" },
      { label: "△", color: "green", desc: "菜单 / 切换", usage: "重攻击" },
      { label: "PS", color: "black", desc: "主页键", usage: "长按回主菜单" },
    ],
    guide: [
      { title: '手柄开机', content: '按下手柄中间的 PlayStation 徽标键即可唤醒主机。' },
      { title: '换碟', content: '光驱在主机下方，光盘且面朝内插入。' },
      { title: '静音麦克风', content: '手柄中间 PS 键下方的白色小按钮，按下亮黄灯即为静音。' }
    ]
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    color: 'from-red-500 to-red-700',
    intro: '合家欢首选，适合多人聚会。',
    image: '/images/switch.jpg', // 保留了你上传文件里的 .jpg 后缀
    buttonLayout: [
      { label: "A", color: "red", desc: "确认", usage: "右侧" },
      { label: "B", color: "yellow", desc: "返回", usage: "下方" },
      { label: "X", color: "black", desc: "菜单", usage: "上方" },
      { label: "Y", color: "black", desc: "攻击", usage: "左侧" },
      { label: "+", color: "black", desc: "开始", usage: "查看选项" },
      { label: "⌂", color: "black", desc: "Home", usage: "回桌面" },
    ],
    guide: [
      { title: '拆分手柄', content: 'Joy-Con 手柄背部上方有黑色小圆钮，按住它向上滑出即可拆卸。' },
      { title: '手柄顺序', content: '如果在游戏中手柄没反应，请在主页点击“手柄”图标 -> “更改握法/顺序”，同时按 L+R 激活。' }
    ]
  },
  {
    id: 'xbox',
    name: 'Xbox Series X',
    color: 'from-green-600 to-green-800',
    intro: 'XGP 游戏库丰富，性能强劲。',
    image: '/images/xbox.png',
    buttonLayout: [
      { label: "A", color: "green", desc: "确认", usage: "下方" },
      { label: "B", color: "red", desc: "返回", usage: "右侧" },
      { label: "X", color: "blue", desc: "互动", usage: "左侧" },
      { label: "Y", color: "yellow", desc: "菜单", usage: "上方" },
      { label: "≡", color: "black", desc: "菜单", usage: "暂停" },
    ],
    guide: [
      { title: '快速恢复', content: 'Xbox 支持快速恢复游戏，直接点击游戏图标即可继续上次进度。' },
      { title: '回到主页', content: '按下中间发光的 Xbox 键，选择“主页”。' }
    ]
  }
];

const GAMES = [
  // --- 热门精选 (保留你的原配置) ---
  {
    id: 1,
    title: "双人成行 (It Takes Two)",
    platform: ["PS5", "Xbox", "Switch"],
    tags: ["双人", "冒险"],
    players: "2人",
    image: "/images/双人成行.png", // 注意文件名是否一致
    description: "TGA年度最佳游戏，必须要两个人配合才能通关，非常考验默契。",
    link:"https://www.bilibili.com/video/BV14K4y1T7pp?spm_id_from=333.788.videopod.episodes&bvid=BV14K4y1T7pp&vd_source=62b0163ccb64ea35715ecb9b6b37edb6",
    guide: [{ section: "复活", text: "狂按按键即可复活队友。" },
      { section: "视频攻略",text: "见外部攻略。" },
    ]
    
  },

  {
    id: 2,
    title: "胡闹厨房 2 (Overcooked! 2)",
    platform: ["PS5", "Xbox", "Switch"],
    tags: ["聚会", "模拟"],
    players: "1-4人",
    image: "/images/overcooked2.jpg",
    description: "充满混乱的烹饪游戏，需要在规定时间内切菜、煮菜、上菜。",
    guide: [{ section: "投掷", text: "按投掷键可以将生食材扔给队友。" }]
  },
  {
    id: 3,
    title: "马里奥赛车 8",
    platform: ["Switch"],
    tags: ["竞速", "合家欢"],
    players: "1-4人",
    image: "/images/mariokart8.jpg",
    description: "任天堂经典赛车，上手简单，精通难，道具战充满变数。",
    guide: [{ section: "漂移", text: "过弯时按住 R 键并推摇杆，喷出火花后松开 R 键可以加速。" }]
  },
  {
    id: 4,
    title: "艾尔登法环 (Elden Ring)",
    platform: ["PS5", "Xbox"],
    tags: ["硬核", "开放世界"],
    players: "1人",
    image: "/images/eldenring.jpg",
    description: "魂系开放世界神作，难度较高，但探索感无与伦比。",
    guide: [{ section: "地图", text: "优先找路边的石碑开启地图碎片。" }]
  },
  
  // --- 新增：目录展示游戏 (需要你补充图片到 images 文件夹) ---
  { id: 5, title: "NBA 2K24", platform: ["PS5", "Xbox", "Switch"], tags: ["体育", "篮球"], players: "1-4人", image: "/images/nba2k24.jpg", description: "最真实的篮球模拟。", guide: [] },
  { id: 6, title: "FC 24 (FIFA)", platform: ["PS5", "Xbox", "Switch"], tags: ["体育", "足球"], players: "1-4人", image: "/images/fc24.jpg", description: "最新款足球游戏。", guide: [] },
  { id: 7, title: "街头霸王 6", platform: ["PS5", "Xbox"], tags: ["格斗", "对战"], players: "2人", image: "/images/sf6.jpg", description: "拥有现代简易出招模式。", guide: [] },
  { id: 8, title: "铁拳 8", platform: ["PS5"], tags: ["格斗", "硬核"], players: "2人", image: "/images/tekken8.jpg", description: "3D格斗游戏巅峰。", guide: [] },
  { id: 9, title: "超级马里奥：奥德赛", platform: ["Switch"], tags: ["冒险", "单人"], players: "1-2人", image: "/images/mario-odyssey.jpg", description: "箱庭探索神作。", guide: [] },
  { id: 10, title: "塞尔达：王国之泪", platform: ["Switch"], tags: ["冒险", "开放世界"], players: "1人", image: "/images/zelda-totk.jpg", description: "在海拉鲁大陆自由建造。", guide: [] },
  { id: 11, title: "使命召唤 (COD)", platform: ["PS5", "Xbox"], tags: ["射击", "枪战"], players: "1-2人", image: "/images/cod.jpg", description: "好莱坞大片般的射击体验。", guide: [] },
  { id: 12, title: "生化危机 4 重制版", platform: ["PS5"], tags: ["恐怖", "射击"], players: "1人", image: "/images/re4.jpg", description: "最经典的生化危机。", guide: [] },
  { id: 13, title: "霍格沃茨之遗", platform: ["PS5"], tags: ["魔法", "冒险"], players: "1人", image: "/images/hogwarts.jpg", description: "哈利波特粉丝必玩。", guide: [] },
  { id: 14, title: "漫威蜘蛛侠 2", platform: ["PS5"], tags: ["动作", "超级英雄"], players: "1人", image: "/images/spiderman2.jpg", description: "扮演蜘蛛侠在高楼间荡秋千。", guide: [] },
  { id: 15, title: "舞力全开 (Just Dance)", platform: ["Switch"], tags: ["跳舞", "聚会"], players: "1-6人", image: "/images/justdance.jpg", description: "尬舞神器，运动暴汗。", guide: [] },
];

// ==========================================
// 4. UI 组件
// ==========================================

const ReliableImage = ({ src, alt, className, fallbackText }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className={`bg-gray-800 flex flex-col items-center justify-center text-gray-500 border border-gray-700 ${className}`}>
        <ImageOff size={20} className="mb-1 opacity-40" />
        <span className="text-[10px] text-center px-1 truncate w-full">{fallbackText || alt}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

const ControllerButton = ({ label, color }) => {
  const colorMap = { "green": "bg-green-500", "red": "bg-red-500", "blue": "bg-blue-500", "yellow": "bg-yellow-400 text-black", "white": "bg-gray-200 text-gray-900", "black": "bg-gray-800 border-gray-600", "pink": "bg-pink-500" };
  return <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-black/20 shrink-0 text-white ${colorMap[color] || 'bg-gray-700'}`}>{label}</div>;
};

const ChatMessage = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0"><Bot size={16} className="text-white"/></div>}
      <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}>{content}</div>
    </div>
  );
};

const Button = ({ children, onClick, className = "", variant = "primary", disabled = false }) => {
  const baseStyle = "px-4 py-3 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    gemini: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 border border-white/20"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 overflow-hidden ${onClick ? 'cursor-pointer active:bg-gray-800 transition-colors' : ''} ${className}`}>
    {children}
  </div>
);

// ==========================================
// 5. 主程序逻辑
// ==========================================

export default function GameLoungeApp() {
  const [view, setView] = useState('home'); // home, console, game-list, game-catalog, game-detail, ai-chat
  const [selectedConsole, setSelectedConsole] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // AI 状态
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '你好！我是店里的 AI 游戏大神 ✨\n不知道玩什么？或者游戏卡关了？随时问我！' }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  // 🟢 修复：发送消息时携带完整历史记录
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAiLoading) return;
    const userMsg = inputMessage;
    const newUserMessage = { role: 'user', content: userMsg };
    
    setInputMessage("");
    
    // 先更新界面显示
    const newHistory = [...messages, newUserMessage];
    setMessages(newHistory);
    setIsAiLoading(true);
    
    // 🟢 调用 AI 时传入完整历史
    const aiResponse = await callDeepSeek(newHistory);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsAiLoading(false);
  };

  const askAboutGame = (gameTitle, queryType) => {
    setView('ai-chat');
    const prompt = `请给我一份《${gameTitle}》的详细新手攻略和进阶技巧。`;
    const newUserMessage = { role: 'user', content: prompt };
    
    // 更新历史
    const newHistory = [...messages, newUserMessage];
    setMessages(newHistory);
    
    setIsAiLoading(true);
    // 🟢 传入历史和当前游戏上下文
    callDeepSeek(newHistory, gameTitle).then(res => {
      setMessages(prev => [...prev, { role: 'assistant', content: res }]);
      setIsAiLoading(false);
    });
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); alert("已复制: " + text); } catch (err) { console.error('复制失败', err); }
    document.body.removeChild(textArea);
  };

  // 过滤逻辑
  const filteredGames = GAMES.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.tags.some(t => t.includes(searchTerm))
  );

  // --- 视图组件 ---

  const renderHome = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">欢迎来到{SHOP_INFO.name}</h1>
          <p className="text-gray-400 text-sm">挑选你喜欢的主机开始游玩吧</p>
        </div>
        <button onClick={() => setShowWifiModal(true)} className="p-3 bg-gray-800 rounded-full text-indigo-400 hover:bg-gray-700">
          <Wifi size={24} />
        </button>
      </div>

      {/* AI 入口 */}
      <div onClick={() => setView('ai-chat')} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-lg transform transition hover:scale-[1.02]">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-1">
             <Sparkles size={18} className="text-yellow-300 animate-pulse" />
             <h3 className="font-bold text-lg">不知道玩什么？</h3>
          </div>
          <p className="text-white/80 text-xs">问问 AI 大神，推荐全店百款游戏</p>
        </div>
        <Bot size={28} className="text-white opacity-80" />
      </div>

      {/* 新增：游戏目录入口 */}
      <div 
        onClick={() => setView('game-catalog')}
        className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-95 transition hover:border-indigo-500/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <List size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">全部游戏清单</h3>
            <p className="text-gray-400 text-xs">查看店里所有 {GAMES.length}+ 款游戏列表</p>
          </div>
        </div>
        <ChevronLeft size={20} className="text-gray-500 rotate-180" />
      </div>

      {/* 主机入口 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gamepad2 size={20} className="text-purple-400"/> 主机快速上手
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {CONSOLES.map(c => (
            <div key={c.id} onClick={() => {setSelectedConsole(c); setView('console');}} className={`relative h-32 rounded-2xl p-5 cursor-pointer overflow-hidden bg-gradient-to-r ${c.color} shadow-lg transform transition hover:scale-[1.02] border border-white/10`}>
              <div className="relative z-10 flex flex-row items-center justify-between h-full">
                <div className="flex-1 pr-4">
                   <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{c.name}</h3>
                   <p className="text-white/90 text-sm font-medium drop-shadow-sm">{c.intro}</p>
                </div>
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md p-1 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white/30 shadow-inner">
                   <ReliableImage src={c.image} alt={c.name} fallbackText={c.name} className="w-full h-full object-cover mix-blend-overlay opacity-90"/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 热门推荐 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-orange-400"/> 热门精选攻略
          </h2>
          <span onClick={() => setView('game-list')} className="text-sm text-gray-400 cursor-pointer hover:text-white">全部 &gt;</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.slice(0, 4).map(game => (
            <Card key={game.id} onClick={() => {setSelectedGame(game); setView('game-detail');}} className="p-0 h-full flex flex-col hover:border-indigo-500/50 transition-colors">
              <div className="h-28 w-full bg-gray-800 flex items-center justify-center overflow-hidden relative group">
                <ReliableImage src={game.image} alt={game.title} fallbackText={game.title} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="text-white font-medium text-sm line-clamp-1 mb-1">{game.title}</h3>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {game.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  // 新增：游戏目录清单视图
  const renderCatalog = () => (
    <div className="animate-fade-in pb-20 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 p-4 pb-0">
        <button onClick={() => setView('home')} className="p-2 -ml-2 text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-bold text-white">全部游戏清单</h1>
      </div>

      <div className="px-4 mb-4 relative">
        <Search className="absolute left-7 top-2.5 text-gray-500" size={16} />
        <input type="text" placeholder="搜索游戏名、类型..." className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-xl border border-gray-700 focus:border-indigo-500 outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {/* 表头 */}
        <div className="grid grid-cols-12 gap-2 text-gray-500 text-xs font-bold px-2 mb-1">
          <div className="col-span-6">游戏名称</div>
          <div className="col-span-3 text-center">主机</div>
          <div className="col-span-3 text-right">类型/人数</div>
        </div>

        {/* 列表内容 */}
        {filteredGames.map(game => (
          <div key={game.id} onClick={() => {setSelectedGame(game); setView('game-detail');}} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 grid grid-cols-12 gap-2 items-center cursor-pointer active:bg-gray-700 transition hover:border-indigo-500/30">
            <div className="col-span-6 font-medium text-white text-sm truncate flex items-center gap-2">
              <div className="w-1 h-8 bg-indigo-500 rounded-full shrink-0"></div>
              {game.title}
            </div>
            <div className="col-span-3 flex flex-wrap justify-center gap-1">
              {game.platform.slice(0,3).map(p => (
                <span key={p} className="text-[10px] bg-gray-700 text-gray-300 px-1 rounded border border-gray-600 scale-90">{p}</span>
              ))}
            </div>
            <div className="col-span-3 text-right flex flex-col items-end gap-0.5">
              <span className="text-[10px] text-gray-400">{game.tags[0]}</span>
              <span className="text-[10px] text-green-400 font-bold">{game.players}</span>
            </div>
          </div>
        ))}
        {filteredGames.length === 0 && <div className="text-center text-gray-500 mt-10 text-sm">没找到这个游戏</div>}
      </div>
    </div>
  );

  const renderGameDetail = () => (
    <div className="animate-fade-in pb-24">
       <div className="relative h-64 -mx-4 -mt-4 mb-6 group">
         <ReliableImage src={selectedGame.image} alt={selectedGame.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
         <button onClick={() => setView('home')} className="absolute top-4 left-4 bg-black/40 p-2 rounded-full text-white backdrop-blur-md z-10 hover:bg-black/60 transition"><ChevronLeft size={24} /></button>
         <div className="absolute bottom-0 left-0 right-0 p-4">
           <h1 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{selectedGame.title}</h1>
           <div className="flex flex-wrap gap-2">
             {selectedGame.tags.map(tag => (
               <span key={tag} className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/20 text-xs text-white">{tag}</span>
             ))}
           </div>
         </div>
       </div>

       <div className="space-y-6">
         <section>
           <Button variant="gemini" className="w-full flex items-center justify-between" onClick={() => askAboutGame(selectedGame.title)}>
             <span className="flex items-center gap-2"><Sparkles size={18} /> 生成该游戏的 AI 深度攻略</span>
             <ChevronLeft size={18} className="rotate-180" />
           </Button>
         </section>

         <section>
           <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Info size={14}/> 游戏简介</h2>
           <p className="text-gray-300 text-sm leading-relaxed bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">{selectedGame.description}</p>
         </section>

         <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold flex items-center gap-2"><Zap size={18} className="text-yellow-400" /> 快速攻略</h2>
              {selectedGame.link && (
                <a href={selectedGame.link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-400 flex items-center gap-1 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg">
                  外部攻略 <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div className="space-y-3">
              {selectedGame.guide.length > 0 ? selectedGame.guide.map((item, idx) => (
                <div key={idx} className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-sm">
                  <h3 className="text-indigo-300 font-bold text-sm mb-1.5 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>{item.section}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed pl-3.5 border-l border-gray-700">{item.text}</p>
                </div>
              )) : (
                <div className="text-gray-500 text-sm italic p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  暂无内置攻略，请点击上方紫色按钮生成 AI 攻略。
                </div>
              )}
            </div>
         </section>
         <Card className="bg-green-900/10 border-green-500/20 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><Users size={20} /></div>
           <div><p className="text-green-100 text-sm font-bold">支持 {selectedGame.players} 游玩</p><p className="text-green-100/60 text-xs">请确保连接了足够数量的手柄</p></div>
         </Card>
       </div>
    </div>
  );

  const renderConsoleGuide = () => (
    <div className="animate-fade-in pb-20">
      <div className={`relative h-56 bg-gradient-to-br ${selectedConsole.color} -mx-4 -mt-4 overflow-hidden mb-6`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <button onClick={() => setView('home')} className="absolute top-4 left-4 bg-black/40 p-2 rounded-full text-white backdrop-blur-md z-20 hover:bg-black/60 transition"><ChevronLeft size={24} /></button>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent pt-20 z-10">
           <h1 className="text-3xl font-bold text-white shadow-sm">{selectedConsole.name}</h1>
           <p className="text-white/80 text-sm mt-1 font-medium">官方操作指南 & 按键详解</p>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-40 mix-blend-overlay">
           <ReliableImage src={selectedConsole.image} alt={selectedConsole.name} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-white font-bold flex items-center gap-2 mb-3 px-1"><Gamepad2 size={18} className="text-indigo-400" /> 手柄按键详解</h2>
          <div className="bg-gray-800/80 rounded-2xl p-4 border border-gray-700 shadow-inner grid grid-cols-1 gap-3">
             {selectedConsole.buttonLayout.map((btn, idx) => (
               <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                 <ControllerButton label={btn.label} color={btn.color} />
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5"><span className="text-white font-bold text-sm">{btn.desc}</span></div>
                    <span className="text-gray-400 text-xs block">{btn.usage}</span>
                 </div>
               </div>
             ))}
          </div>
        </section>

        <section>
          <h2 className="text-white font-bold flex items-center gap-2 mb-3 px-1"><Zap size={18} className="text-yellow-400" /> 常用操作</h2>
          <div className="space-y-3">
            {selectedConsole.guide.map((step, idx) => (
              <Card key={idx} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 text-indigo-300 flex items-center justify-center font-bold text-xs mt-0.5 border border-gray-600">{idx + 1}</div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.content}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const renderAiChat = () => (
    <div className="flex flex-col h-full animate-fade-in bg-gray-900">
      <div className="bg-gray-800/80 backdrop-blur border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => setView('home')} className="p-1 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
        <div className="flex flex-col items-center">
          <h1 className="text-white font-bold flex items-center gap-2"><Sparkles size={16} className="text-purple-400" /> AI 攻略大神</h1>
          <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 在线</span>
        </div>
        <div className="w-8"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (<ChatMessage key={idx} role={msg.role} content={msg.content} />))}
        {isAiLoading && (
           <div className="flex w-full justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1"><Bot size={16} className="text-white" /></div>
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-2xl rounded-bl-none flex items-center gap-2"><Loader2 size={16} className="animate-spin text-indigo-400" /><span className="text-gray-400 text-sm">正在思考...</span></div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {messages.length < 3 && (
        <div className="px-4 pb-2">
           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
             {["双人成行第二关怎么过？", "推荐个适合情侣的游戏", "Switch 手柄连不上"].map(q => (
               <button key={q} onClick={() => { setInputMessage(q); handleSendMessage(); }} className="whitespace-nowrap bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full hover:bg-gray-700 hover:border-gray-600 transition">{q}</button>
             ))}
           </div>
        </div>
      )}
      <div className="p-3 bg-gray-800/90 border-t border-gray-700 backdrop-blur pb-safe">
        <div className="relative flex items-center gap-2">
          <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="问问 AI 任何游戏问题..." className="flex-1 bg-gray-900 text-white pl-4 pr-10 py-3 rounded-xl border border-gray-700 focus:border-indigo-500 focus:outline-none"/>
          <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isAiLoading} className="p-3 bg-indigo-600 rounded-xl text-white disabled:opacity-50 disabled:bg-gray-700 hover:bg-indigo-700 transition"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-gray-900 flex flex-col border-x border-gray-800">
        <main className="flex-1 overflow-x-hidden flex flex-col h-full">
          {view === 'home' && renderHome()}
          {view === 'console' && renderConsoleGuide()}
          {view === 'game-list' && (
            <div className="animate-fade-in pb-20 h-full flex flex-col p-4">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('home')} className="p-2 -ml-2 text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
                <h1 className="text-xl font-bold text-white">游戏攻略库</h1>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input type="text" placeholder="搜索游戏名称、双人、格斗..." className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-indigo-500 focus:outline-none placeholder-gray-500 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="space-y-3 overflow-y-auto">
                {filteredGames.map(game => (
                  <Card key={game.id} onClick={() => {setSelectedGame(game); setView('game-detail');}} className="flex gap-4 items-center group">
                    <div className="w-20 h-16 bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-700">
                      <ReliableImage src={game.image} alt={game.title} fallbackText={game.title} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate text-sm">{game.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1.5">
                        <Users size={12} className="text-indigo-400"/> <span className="text-gray-300">{game.players}</span>
                        <span className="w-0.5 h-3 bg-gray-700"></span><span className="truncate">{game.platform.join('/')}</span>
                      </div>
                    </div>
                    <ChevronLeft size={20} className="text-gray-600 rotate-180 group-hover:text-indigo-400 transition-colors" />
                  </Card>
                ))}
              </div>
            </div>
          )}
          {view === 'game-catalog' && renderCatalog()}
          {view === 'game-detail' && renderGameDetail()}
          {view === 'ai-chat' && renderAiChat()}
        </main>

        {view !== 'ai-chat' && view !== 'game-catalog' && (
          <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-800 p-2 grid grid-cols-5 gap-1 z-50 pb-safe">
             <button onClick={() => setView('home')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 ${view === 'home' || view === 'console' ? 'text-indigo-400 bg-indigo-500/10 font-bold' : 'text-gray-500'}`}><Gamepad2 size={24} /><span className="text-[10px] mt-1">首页</span></button>
             <button onClick={() => setView('game-list')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 ${view.includes('game') ? 'text-indigo-400 bg-indigo-500/10 font-bold' : 'text-gray-500'}`}><BookOpen size={24} /><span className="text-[10px] mt-1">攻略</span></button>
             <button onClick={() => setView('ai-chat')} className="flex flex-col items-center justify-center -mt-6">
               <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/50 border-4 border-gray-900 transform active:scale-95 transition"><Sparkles size={28} className="text-white" /></div>
               <span className="text-[10px] mt-1 text-purple-400 font-bold">AI大神</span>
             </button>
             <button className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 active:bg-gray-800 active:scale-95 active:text-gray-300" onClick={() => alert("呼叫功能待接入实体铃声系统")}><Coffee size={24} /><span className="text-[10px] mt-1">呼叫</span></button>
             <button className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 active:bg-gray-800 active:scale-95 active:text-gray-300" onClick={() => setShowWifiModal(true)}><Wifi size={24} /><span className="text-[10px] mt-1">WiFi</span></button>
          </div>
        )}

        {showWifiModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-xs border border-gray-700 shadow-2xl transform transition-all scale-100">
              <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">连接 Wi-Fi</h3><button onClick={() => setShowWifiModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700"><X size={24} /></button></div>
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex flex-col items-center text-center">
                  <Wifi size={32} className="text-indigo-500 mb-2" />
                  <p className="text-gray-500 text-xs mb-1">Wi-Fi 名称</p>
                  <p className="text-white font-mono font-bold text-lg select-all">{SHOP_INFO.wifiName}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                  <p className="text-gray-500 text-xs mb-1">密码</p>
                  <div className="flex justify-between items-center"><p className="text-white font-mono font-bold text-lg select-all">{SHOP_INFO.wifiPass}</p><Button variant="primary" className="py-1 px-3 text-xs h-8" onClick={() => copyToClipboard(SHOP_INFO.wifiPass)}>复制</Button></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}