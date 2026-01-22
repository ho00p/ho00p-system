import * as React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Home, ArrowLeft, ChevronRight, ChevronLeft, X, LogOut, Plus, 
  MinusCircle, PlusCircle, Trash, Trash2, Edit, Save, Copy, Check, 
  RefreshCw, AlertCircle, Settings, Database, FileText, Users, 
  Lock, ShoppingBag, Truck, ShieldCheck, Wand2, Image as ImageIcon, 
  Sparkles, Layers, Tag, Info, Shirt, UtensilsCrossed, Bone, 
  Leaf, Heart, Palette, Instagram as InstagramIcon, Cake as CakeIcon,
  Store, ClipboardList, WifiOff, AlertTriangle
} from 'lucide-react';

const { useState, useEffect, useRef, useMemo, Component } = React;

// [修復] 防止 ReferenceError: tailwind is not defined
// 如果環境在 CDN 載入前就嘗試存取 tailwind，這行能防止崩潰
if (typeof window !== 'undefined' && !window.tailwind) {
  window.tailwind = { config: {} };
}

// [除錯] 確認檔案已載入
console.log("App.jsx is loaded and running...");

// =========================================================================
// [ 0. 錯誤邊界 (Error Boundary) ]
// =========================================================================

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fff0f0', color: '#cc0000', height: '100vh', overflow: 'auto' }}>
          <h1>⚠️ 程式發生錯誤 (Client-Side Error)</h1>
          <p>如果您能看到這個畫面，代表 502 錯誤已解決，目前是程式碼執行錯誤。</p>
          <hr />
          <h3>錯誤訊息:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#ffe6e6', padding: '10px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}>
            重新整理
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// =========================================================================
// [ 1. 設定與初始化 ]
// =========================================================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyGu929YCozmjTiVBOxcPVRV6shfoYlWL3-3UkjxfY06BwHx7_HcNMXgGiaYXgVpm-UEw/exec"; 

const ADMIN_PASSWORD_BASE64 = "bGluMDUwMw=="; 

const firebaseConfig = {
  apiKey: "AIzaSyCM4nM9N4b95QJCWw4YrOn_hSW5kf-R_ts", 
  authDomain: "ho00p-8c1b2.firebaseapp.com",
  projectId: "ho00p-8c1b2",
  storageBucket: "ho00p-8c1b2.firebasestorage.app",
};

// Initialize Firebase safely
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const appId = 'ho00p-official-store';

// =========================================================================
// [ 2. 樣式 ]
// =========================================================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap');
    
  body, html { margin: 0; padding: 0; font-family: 'Fredoka', 'Noto Sans TC', sans-serif; background-color: #fdfbf7; color: #5d4037; overflow-x: hidden; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .font-cute { font-family: 'Fredoka', 'Noto Sans TC', sans-serif; }
    
  @keyframes floatLogo { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes modalPop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes float { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
  @keyframes pulse-soft { 0% { box-shadow: 0 0 0 0 rgba(139, 94, 60, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(139, 94, 60, 0); } 100% { box-shadow: 0 0 0 0 rgba(139, 94, 60, 0); } }
    
  .splash-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000; background-color: #fdfbf7; transition: opacity 1s ease-in-out; }
  .splash-container.fade-out { opacity: 0; pointer-events: none; }
  .loading-char { display: inline-block; animation: bounce 1.4s infinite ease-in-out both; color: #5d4037; }
  .animate-element { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .modal-content { animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .blob-animation { animation: float 7s infinite; }
  .cart-pulse { animation: pulse-soft 2s infinite; }
  .glass-diagonal { position: absolute; top: 0; right: 0; bottom: 0; width: 45%; background: linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.4) 100%); backdrop-filter: blur(2px); transform: skewX(-20deg) translateX(20%); pointer-events: none; border-left: 1px solid rgba(255,255,255,0.3); }
    
  .input-base { width: 100%; padding: 10px 12px; border: 1px solid #e6ccb2; border-radius: 12px; font-size: 14px; outline: none; transition: border-color 0.2s; background-color: #fffbf7; color: #5d4037; }
  .input-base:focus { border-color: #8b5e3c; background-color: white; }
  .admin-border { border: 2px dashed rgba(220, 38, 38, 0.4); }
  .admin-border:hover { border-color: rgba(220, 38, 38, 0.8); }
  .size-btn-selected { background-color: #8b5e3c; color: white; border-color: #8b5e3c; transform: scale(1.05); }
  .size-btn-default { background-color: white; color: #8b5e3c; border-color: #e6ccb2; }
`;

const GlobalStyles = () => (
  <style>{styles}</style>
);

// =========================================================================
// [ 3. 資料 ]
// =========================================================================

const CONFIG = {
  logoUrl: "https://i.meee.com.tw/6eQOWBf.png", 
  aboutImageUrl: "https://i.meee.com.tw/sO2UJiF.png",
  loadingDuration: 1500, 
  mainTitle: "Ho00p",
  subTitle: "Official",
  copyright: "© 2025 Ho00p Studio. All Rights Reserved",
  menuItems: [
    { id: 'apparel', title: '精選服飾', subTitle: 'CURATED COLLECTION', icon: Shirt, bgImage: "https://i.meee.com.tw/4gfBrBK.png" },
    { id: 'food', title: '蛋糕輕食', subTitle: 'FRESH KITCHEN', icon: UtensilsCrossed, bgImage: "https://i.meee.com.tw/B6aFB2u.png" },
    { id: 'about', title: '關於我們', subTitle: 'ABOUT US', icon: Users, bgImage: "https://i.meee.com.tw/oSGhVA1.png" }
  ]
};

const INITIAL_PRODUCTS = [
  { id: 'demo_1', name: "法式復古格紋背心", price: 590, tags: ['小型犬', '長型犬'], images: ["https://placehold.co/600x600/faedcd/8b5e3c?text=Vest+Front", "https://placehold.co/600x600/e6ccb2/8b5e3c?text=Vest+Back"], note: "採用親膚純棉材質，經典格紋設計，適合春夏穿著。", sizeGroups: [{ id: 1, label: "小型犬 (吉娃娃/貴賓)", sizes: ["XS", "S"] }, { id: 2, label: "中型犬 (法鬥/柴犬)", sizes: ["M", "L"] }] },
  { id: 'demo_2', name: "機能防水雨衣 - 黃色", price: 890, tags: ['中型犬', '大型犬'], images: ["https://placehold.co/600x600/fff3b0/8b5e3c?text=Raincoat"], note: "高係數防水材質，反光條設計，夜間散步更安全。", sizeGroups: [{ id: 3, label: "中型犬適用", sizes: ["M", "L"] }, { id: 4, label: "大型犬適用 (黃金/拉拉)", sizes: ["XL", "2XL", "3XL"] }] }
];

const CATEGORIES_DATA_FOOD = {
    shape: { title: "輕食選擇", icon: <UtensilsCrossed size={16} />, items: [{ id: 'donut', name: '甜甜圈 (2個/份)', price: 240, desc: '可愛圓潤造型，一份包含 2 個甜甜圈。' }, { id: 'paw', name: '爪狀肉餅 (3個/份)', price: 300, desc: '萌萌肉球造型，一份包含 3 個肉餅。' }] },
    meat: { title: "肉類主食", icon: <Bone size={16} />, items: [{ id: 'A', name: '牛肉', price: 300, desc: '高鐵、高鋅、B群豐富，增強免疫力與肌肉發展。' }, { id: 'B', name: '雞肉', price: 200, desc: '高蛋白、低脂。' }, { id: 'C', name: '鯛魚', price: 250, desc: '高蛋白、低脂肪，適合減肥與腎病管理。' }, { id: 'D', name: '鮭魚', price: 300, desc: '含Omega-3脂肪酸、EPA、DHA，保護心血管與皮膚。' }, { id: 'E', name: '蝦子', price: 250, desc: '優質蛋白質、Omega-3、牛磺酸。皮膚健康、毛髮亮麗。' }, { id: 'F', name: '雞胗', price: 200, desc: '鐵與鋅含量高，幫助消化與補氣血，適口性佳。' }] },
    veg: { title: "蔬菜配料", icon: <Leaf size={16} />, items: [{ id: 'a', name: '菠菜', price: 100, desc: '鐵質與葉酸豐富。' }, { id: 'b', name: '花椰菜', price: 100, desc: '幫助抗氧化、清肝排毒、促進免疫系統。' }, { id: 'c', name: '貓薄荷', price: 50, desc: '幫助情緒放鬆解壓，安撫(狗狗也可以吃喔!)。' }, { id: 'd', name: '南瓜', price: 100, desc: '高纖維，有助腸胃蠕動與軟便。' }, { id: 'e', name: '地瓜', price: 100, desc: '幫助腸胃蠕動，含抗氧化物，增加飽足感。' }, { id: 'f', name: '紫薯', price: 100, desc: '幫助腸胃蠕動，促進排便改善毛球、便秘。' }, { id: 'g', name: '紅蘿蔔', price: 100, desc: 'β-胡蘿蔔素，幫助增強免疫、保護眼睛、促進皮膚健康。' }, { id: 'h', name: '白蘿蔔', price: 100, desc: '幫助消化、去脹氣。' }, { id: 'i', name: '小黃瓜', price: 100, desc: '含水量高，有助解暑與補水。' }, { id: 'j', name: '山藥', price: 150, desc: '幫助腸胃、抗發炎，膳食纖維豐富。' }] },
    fruit: { title: "水果點綴", icon: <Heart size={16} />, items: [{ id: '1', name: '蘋果', price: 100, desc: '維生素C、膳食纖維，有助消化、整腸、降低口臭。' }, { id: '2', name: '香蕉', price: 100, desc: '鉀豐富，幫助心臟與神經功能，便秘可食用。' }, { id: '3', name: '藍莓', price: 200, desc: '幫助抗氧化、保護視力、減緩老化。' }, { id: '4', name: '木瓜', price: 150, desc: '木瓜酵素可幫助消化，富含維生素C、A。' }, { id: '5', name: '小番茄', price: 100, desc: '富含維生素C、A、纖維，有助消化與抗氧化。' }] },
    color: { title: "淋面顏色", icon: <Palette size={16} />, items: [{ id: '@', name: '藍色', price: 100, desc: '蝶豆花粉，螺旋藻粉', colorCode: '#A0C4FF' }, { id: '#', name: '綠色', price: 100, desc: '菠菜粉', colorCode: '#22B822' }, { id: 'w', name: '白色', price: 100, desc: '馬鈴薯泥', colorCode: '#FFFFFF' }, { id: '+', name: '紅色', price: 100, desc: '紅甜菜根粉，火龍果', colorCode: '#FFADAD' }, { id: '-', name: '黃色', price: 100, desc: '薑黃粉，地瓜', colorCode: '#FDFFB6' }, { id: '%', name: '紫色', price: 100, desc: '紫薯泥、藍莓泥', colorCode: '#E7C6FF' }] }
  };

// =========================================================================
// [ 4. 通用元件 ]
// =========================================================================

const TikTokIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const LineIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const Toast = ({ message, type = 'success' }) => (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-2xl z-[60] w-max max-w-[90%] border border-white/20 animate-element font-cute">
    {type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> : <Check className="w-5 h-5 text-green-400 flex-shrink-0" />}
    <span className="font-medium text-sm sm:text-base">{message}</span>
  </div>
);

const Footer = ({ className = "" }) => (
  <div className={`text-[#a67c52] text-xs font-medium opacity-60 tracking-wider font-cute text-center py-6 ${className}`}>
    {CONFIG.copyright}
  </div>
);

const SplashScreen = ({ isFadingOut }) => (
  <div className={`splash-container ${isFadingOut ? 'fade-out' : ''}`}>
    <div className="w-[150px] h-[150px] mb-5 relative animation-[floatLogo_3s_ease-in-out_infinite]">
        {CONFIG.logoUrl ? <img src={CONFIG.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-[20px]" /> : <ImageIcon size={60} />}
    </div>
    <h1 className="text-[3.5rem] font-[900] tracking-[2px] mb-10 text-[#5d4037] drop-shadow-[2px_2px_0px_#e6ccb2]">{CONFIG.mainTitle}</h1>
    <div className="loading-text text-[1.5rem] font-[700] flex gap-[5px]">
        {"LOADING...".split("").map((c, i) => <span key={i} className="loading-char" style={{ animationDelay: `${i * 0.1}s` }}>{c}</span>)}
    </div>
  </div>
);

const MenuCard = ({ title, subTitle, icon: Icon, bgImage, animationDelay, onClick }) => (
  <div onClick={onClick} style={{ animationDelay }} className="menu-card animate-element w-full h-32 md:h-40 mb-5 rounded-[2rem] shadow-lg bg-white border border-[#e6ccb2] cursor-pointer flex items-center justify-between px-6 md:px-8 group hover:shadow-xl hover:border-[#d4a373] relative overflow-hidden transition-transform active:scale-95">
    {bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: `url(${bgImage})` }} />}
    <div className="absolute inset-0 bg-gradient-to-r from-[#fffbf7]/90 via-[#fffbf7]/70 to-transparent" />
    <div className="relative z-10 flex flex-col justify-center h-full items-start pl-2">
      <span className="text-xs font-bold text-[#d4a373] tracking-widest uppercase mb-1 font-cute">{subTitle}</span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#5d4037] tracking-tight font-cute">{title}</h2>
    </div>
    <div className="relative z-10 pr-2 group-hover:scale-110 transition-transform duration-300">
      <div className="bg-[#8b5e3c] text-white p-3 rounded-full shadow-md"><Icon size={28} /></div>
    </div>
    <div className="glass-diagonal" />
  </div>
);

const PasswordModal = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputPwd = password.trim();
     
    // 僅使用最安全的 Base64 驗證，移除複雜的 sha256 以免在非安全環境崩潰
    if (btoa(inputPwd) === ADMIN_PASSWORD_BASE64) {
        onSuccess(); 
        onClose();
    } else { 
        setError(true); 
        setTimeout(() => setError(false), 1000); 
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
       <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-element text-center font-cute">
          <div className={`mx-auto w-12 h-12 rounded-full bg-[#fdfbf7] flex items-center justify-center mb-4 ${error ? 'border-2 border-red-400 animate-[bounce_0.5s]' : ''}`}>
             <Lock size={24} className={error ? "text-red-400" : "text-[#8b5e3c]"}/>
          </div>
          <h3 className="text-lg font-bold text-[#5d4037] mb-2">店主驗證</h3>
          <p className="text-xs text-[#8b5e3c] mb-4 opacity-80">請輸入管理密碼</p>
          <form onSubmit={handleSubmit}>
            <input type="password" autoFocus className="w-full text-center text-lg p-2 border-b-2 border-[#e6ccb2] focus:border-[#8b5e3c] outline-none text-[#5d4037] mb-6 bg-transparent" placeholder="****" value={password} onChange={e => setPassword(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl text-[#8b5e3c] hover:bg-[#f0e6dd] font-bold text-sm">取消</button>
              <button type="submit" className="flex-1 py-2 rounded-xl bg-[#8b5e3c] text-white hover:bg-[#7a5235] font-bold text-sm shadow-md">確認</button>
            </div>
          </form>
       </div>
    </div>
  );
};

const ImageCarousel = ({ images, heightClass = "h-64" }) => {
  const safeImages = (Array.isArray(images) && images.length > 0) ? images.filter(i => i) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  if (safeImages.length === 0) return <div className={`w-full ${heightClass} bg-gray-200 flex items-center justify-center text-gray-400 rounded-2xl`}><ImageIcon size={40}/></div>;
  const next = (e) => { e.stopPropagation(); setCurrentIndex((p) => (p + 1) % safeImages.length); };
  const prev = (e) => { e.stopPropagation(); setCurrentIndex((p) => (p - 1 + safeImages.length) % safeImages.length); };
  return (
    <div className={`relative w-full ${heightClass} bg-gray-100 overflow-hidden group`}>
      <img src={safeImages[currentIndex]} alt="Product" className="w-full h-full object-cover transition-transform duration-500" />
      {safeImages.length > 1 && <>
        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 p-1 rounded-full text-[#8b5e3c] opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={24} /></button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 p-1 rounded-full text-[#8b5e3c] opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={24} /></button>
        <div className="absolute bottom-2 w-full flex justify-center space-x-1">{safeImages.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-[#8b5e3c] w-4' : 'bg-white/70'}`} />)}</div>
      </>}
    </div>
  );
};

const FloatingCartButton = ({ count, onClick }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef(null);

  useEffect(() => {
    setIsClient(true);
    setPos({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
    const handleResize = () => setPos(p => ({ x: Math.min(p.x, window.innerWidth - 80), y: Math.min(p.y, window.innerHeight - 80) }));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStart = (clientX, clientY) => {
    isDragging.current = false;
    offset.current = { x: clientX - pos.x, y: clientY - pos.y };
    longPressTimer.current = setTimeout(() => { isDragging.current = true; setIsDraggingActive(true); }, 200);
  };

  const handleMove = (clientX, clientY) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; isDragging.current = true; setIsDraggingActive(true); }
    if (!isDragging.current) return;
    let newX = clientX - offset.current.x;
    let newY = clientY - offset.current.y;
    newX = Math.max(10, Math.min(window.innerWidth - 70, newX));
    newY = Math.max(10, Math.min(window.innerHeight - 70, newY));
    setPos({ x: newX, y: newY });
  };

  const handleEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isDragging.current) {
        const screenWidth = window.innerWidth;
        const centerX = pos.x + 28;
        let targetX = centerX < screenWidth / 2 ? 10 : screenWidth - 80;
        setIsDraggingActive(false);
        setPos(prev => ({ ...prev, x: targetX }));
    }
    setTimeout(() => { isDragging.current = false; }, 0);
  };

  const handleClick = (e) => { if (isDragging.current) { e.preventDefault(); e.stopPropagation(); return; } onClick(); };
  if (!isClient) return null;

  return (
    <div className={`fixed z-[5000] cursor-pointer select-none touch-none ${!isDraggingActive ? 'transition-all duration-500 ease-out cart-pulse' : ''}`} style={{ left: pos.x, top: pos.y }} onMouseDown={(e) => handleStart(e.clientX, e.clientY)} onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)} onMouseMove={(e) => isDragging.current && handleMove(e.clientX, e.clientY)} onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)} onMouseUp={handleEnd} onTouchEnd={handleEnd} onClick={handleClick}>
      <div className="bg-[#8b5e3c] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-2 border-[#e6ccb2] relative">
        <ShoppingBag size={24} />
        {count > 0 && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{count}</div>}
      </div>
    </div>
  );
};

const NotificationModal = ({ message, onConfirm, buttonText = "OK", icon }) => (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border-4 border-[#faedcd] animate-modal flex flex-col items-center text-center font-cute">
            <div className="bg-[#faedcd] p-3 rounded-full mb-4">{icon || <Truck className="w-8 h-8 text-[#8b5e3c]" />}</div>
            <p className="text-lg font-bold text-[#5d4037] mb-6 leading-relaxed">{message}</p>
            <button onClick={onConfirm} className="w-full bg-[#8b5e3c] text-white py-3 rounded-xl font-bold text-lg shadow-md active:scale-95 hover:bg-[#7a5235] transition-all">{buttonText}</button>
        </div>
    </div>
);

const CategoryTab = ({ id, label, icon, isActive, onClick }) => (
    <button onClick={() => onClick(id)} className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap text-base font-bold transition-all border font-cute ${isActive ? 'bg-[#8b5e3c] text-white border-[#8b5e3c] shadow-md scale-105' : 'bg-white text-[#8b5e3c] border-[#e6ccb2] hover:bg-[#faedcd]'}`}>
      {icon}<span>{label}</span>
    </button>
);

const IngredientCard = ({ item, category, isSelected, onToggle, formatPrice }) => (
  <div onClick={() => onToggle(category, item)} className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 border-2 flex flex-col h-full min-h-[140px] md:min-h-[160px] bg-white group ${isSelected ? 'border-[#8b5e3c] bg-[#fffbf7] shadow-lg scale-[1.02] ring-2 ring-[#faedcd] ring-opacity-50' : 'border-transparent hover:border-[#e6ccb2] shadow-sm hover:shadow-md'}`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-lg font-bold text-[#5d4037] font-cute leading-tight">{item.name}</h3>
      {item.price > 0 && (<span className="bg-[#d4a373] text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-cute h-fit shadow-sm">{formatPrice(item.price)}</span>)}
    </div>
    <p className="text-sm text-[#8b5e3c] opacity-80 leading-relaxed mb-8 flex-grow font-cute line-clamp-3">{item.desc}</p>
    {category === 'color' && (<div className="absolute top-4 right-14 w-6 h-6 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: item.colorCode || '#ddd' }} />)}
    <div className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-[#8b5e3c] shadow-md scale-110' : 'bg-[#f0e6dd] opacity-50 group-hover:opacity-100'}`}>
      {isSelected ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-[#8b5e3c]" />}
    </div>
  </div>
);

// =========================================================================
// [ 5. 頁面 ]
// =========================================================================

// 關於我們頁面元件
const AboutPage = ({ onBack, onSecretClick, onLogout, isAdmin }) => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#fdfbf7] animate-element font-cute">
      <div className={`sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center justify-between w-full max-w-7xl mx-auto`}>
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[#faedcd] text-[#8b5e3c]"><Home size={24} /></button>
        <div className="select-none cursor-pointer text-center" onClick={onSecretClick}>
          <h2 className="text-xl font-black text-[#5d4037] tracking-widest uppercase">ABOUT US</h2>
        </div>
        <div className="w-10 flex justify-end">
            {isAdmin && <button onClick={onLogout} className="bg-red-500 text-white p-2 rounded-full shadow-lg" title="退出管理"><LogOut size={20} /></button>}
        </div>
      </div>
        
      <div className="flex-1 px-6 py-8 w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
         <div className="w-40 h-40 bg-white rounded-full p-2 shadow-xl border-4 border-[#e6ccb2] rotate-3 hover:rotate-0 transition-transform duration-500">
            <img src={CONFIG.aboutImageUrl || CONFIG.logoUrl} alt="Ho00p" className="w-full h-full object-cover rounded-full" />
         </div>
         
         <div className="space-y-4">
            <h1 className="text-4xl font-black text-[#5d4037] tracking-tight">Ho00p</h1>
            <div className="h-1 w-16 bg-[#d4a373] rounded-full mx-auto"></div>
            <p className="text-[#8b5e3c] font-medium leading-loose text-sm md:text-base">
               <span className="font-bold italic text-lg">"May every little one be treated with kindness."</span><br/>
               <br/>
               這不僅僅是一句標語，而是 ho00p 創立至今，深深刻在心底的初衷。<br/>
               <br/>
               在這個毛孩逐漸被視為家人的年代，我們看見社會對動物福利的關注日益升溫，這令人欣慰。但在每一個深夜，當我們看著身邊熟睡的孩子，心中總會響起一個聲音：「我們能做的，是不是還能再多一點？」<br/>
               <br/>
                這份焦慮，來自於對生命的敬重。 我們深知，這份愛不應止步於家門之內。我們期許 ho00p 不只是一個提供美好蛋糕與服飾的品牌，更是一股溫暖的推力。<br/>
               <br/>
                我們的目光始終投向那些在街角流浪、無家可歸的眼神。我們渴望在能力所及的範圍內，將這份幸福感延伸出去——既要讓家裡的寶貝享受更完善的福祉，也要為窗外的他們撐起一把傘。<br/>
               <br/>
               <span className="text-xs opacity-60 mt-2 block">(這是一條漫長的路，但只要能讓多一個小生命被溫柔以待，這一切就有了意義。)</span>
            </p>
         </div>

         <div className="w-full grid grid-cols-3 gap-3 mt-8">
             <a href="https://www.tiktok.com/@ho00p_?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-2xl shadow-sm border border-[#f0e6dd] flex flex-col items-center justify-center hover:scale-105 transition-transform group">
                 <div className="bg-black/5 w-10 h-10 rounded-full flex items-center justify-center mb-2 text-black group-hover:bg-black group-hover:text-white transition-colors">
                    <TikTokIcon size={20} />
                 </div>
                 <p className="text-xs text-[#a67c52] font-bold">TikTok</p>
             </a>
             <a href="https://www.instagram.com/ho00p_official/" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-2xl shadow-sm border border-[#f0e6dd] flex flex-col items-center justify-center hover:scale-105 transition-transform group">
                 <div className="bg-pink-50 w-10 h-10 rounded-full flex items-center justify-center mb-2 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <InstagramIcon size={20} />
                 </div>
                 <p className="text-xs text-[#a67c52] font-bold">Instagram</p>
             </a>
             <a href="https://lin.ee/50PgRPj" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-2xl shadow-sm border border-[#f0e6dd] flex flex-col items-center justify-center hover:scale-105 transition-transform group">
                 <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center mb-2 text-[#06C755] group-hover:bg-[#06C755] group-hover:text-white transition-colors">
                    <LineIcon size={20} />
                 </div>
                 <p className="text-xs text-[#a67c52] font-bold">LINE</p>
             </a>
         </div>
      </div>
      <Footer />
    </div>
  );
};

const AdminAccountingPage = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [amount, setAmount] = useState(''); 
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [last5, setLast5] = useState('');
    const [note, setNote] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

    const parseOrderText = () => {
        if (!input) return;
        try {
            const text = input;
            let name = "未抓取到";
            const titleMatch = text.match(/【\s*(.*?)\s*的/);
            const petNameMatch = text.match(/寵物名[：:]\s*(.*)/);
            const nameMatch = text.match(/姓名[：:]\s*(.*)/);
            if (titleMatch) name = titleMatch[1].trim();
            else if (petNameMatch) name = petNameMatch[1].trim();
            else if (nameMatch) name = nameMatch[1].trim();

            const priceMatches = [...text.matchAll(/(?:訂單總金額|總金額|總計|金額)[：:]\s*\$?([\d,]+)/g)];
            let price = "0";
            if (priceMatches.length > 0) price = priceMatches[priceMatches.length - 1][1].replace(/,/g, '');
            else {
                const totalLineMatch = text.match(/------------------\s*商品總額[：:]\s*\$?[\d,]+\s*(?:.*\n)*💰\s*訂單總金額[：:]\s*\$?([\d,]+)/);
                if (totalLineMatch) price = totalLineMatch[1].replace(/,/g, '');
            }
            setAmount(price);

            const phoneMatch = text.match(/(?:家長電話|電話|手機)[：:]\s*([0-9-\s]+)/);
            if (phoneMatch) setPhone(phoneMatch[1].trim());
            const last5Match = text.match(/(?:帳號後五碼|後五碼)[：:]\s*(\d+)/);
            if (last5Match) setLast5(last5Match[1].trim());
            const addressMatch = text.match(/(?:收件地址|地址)[：:]\s*(.*)/);
            if (addressMatch) setAddress(addressMatch[1].trim());
            const dateMatch = text.match(/(?:預計取貨日期|取貨日期|日期)[：:]\s*(.*)/);
            if (dateMatch) setPickupDate(dateMatch[1].trim());
            const noteMatch = text.match(/(?:用途)[：:]\s*(.*)/);
            if (noteMatch) setNote(noteMatch[1].trim());

            let content = "詳細內容請見原始文字";
            const startContent = text.indexOf("】");
            const endMatch = text.match(/-{3,}|商品總額/);
            const endContent = endMatch ? endMatch.index : -1;
            let cakeContent = "";
            let apparelContent = "";

            if (startContent > 0 && endContent > startContent) {
                content = text.substring(startContent + 1, endContent).trim();
                const lines = content.split('\n');
                lines.forEach(line => {
                    if (line.includes('蛋糕') || line.includes('輕食') || line.includes('肉類') || line.includes('淋面') || line.includes('品項')) {
                        cakeContent += line + '\n';
                    }
                    else if (line.includes('服飾') || line.includes('尺寸')) {
                        apparelContent += line + '\n';
                    }
                });
            }

            if (name === "未抓取到" && price === "0") showToast("⚠️ 格式似乎不符", "error");
            else { setParsedData({ petName: name, content, cakeContent, apparelContent }); showToast("✅ 智慧解析完成！"); }
        } catch (error) { showToast("❌ 解析發生錯誤", "error"); }
    };

    const handleSubmitToGoogle = async () => {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_SCRIPT_ID")) return showToast("⚠️ 請先設定 Google Apps Script 網址！", "error");
        if (!parsedData) return;
        try {
            const formData = new URLSearchParams();
            formData.append('timestamp', new Date().toLocaleString('zh-TW'));
              
            formData.append('cakecontent', parsedData.cakeContent || ""); 
            formData.append('apparelcontent', parsedData.apparelContent || "");
              
            formData.append('petName', parsedData.petName || "");
            formData.append('phone', phone || "");
            formData.append('address', address || "");
            formData.append('price', amount || "0");
            formData.append('note', note || "");
            formData.append('pickupDate', pickupDate || "");
            formData.append('last5', last5 || "");

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                body: formData.toString()
            });
              
            showToast("✅ 記帳成功！ (資料已送出)", "success");
            setInput(''); setParsedData(null); setAmount(''); setPhone(''); setAddress(''); setLast5(''); setNote(''); setPickupDate('');
        } catch (e) { showToast("❌ 連線失敗", "error"); }
    };

    return (
        <div className="w-full h-full bg-[#fdfbf7] flex flex-col font-cute">
            <div className="flex items-center justify-between p-4 bg-white shadow-sm w-full max-w-7xl mx-auto">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 text-[#8b5e3c]"><ArrowLeft/></button>
                <h2 className="text-xl font-bold text-[#5d4037] flex items-center"><Database className="mr-2"/> 店主記帳後台</h2>
                <div className="w-8"></div>
            </div>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 text-xs text-center border-b border-blue-200">
                目前資料庫：<strong>{appId}</strong>
            </div>
            <div className="p-6 flex-1 overflow-y-auto w-full max-w-7xl mx-auto no-scrollbar">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-[#8b5e3c] mb-2">請將 LINE 對話內容貼上：</label>
                    <textarea className="w-full h-64 p-3 border-2 border-[#e6ccb2] rounded-xl focus:border-[#8b5e3c] text-sm" placeholder="貼上對話內容..." value={input} onChange={(e) => setInput(e.target.value)} />
                    <button onClick={parseOrderText} className="mt-2 w-full bg-[#8b5e3c] text-white py-2 rounded-lg font-bold shadow-sm active:scale-95 flex items-center justify-center"><Wand2 className="w-4 h-4 mr-2"/> 解析資料</button>
                </div>
                {parsedData && (
                    <div className="bg-[#fffbf7] p-5 rounded-2xl border-2 border-[#d4a373] space-y-4 animate-element shadow-sm">
                        <div className="flex justify-between items-center border-b border-[#e6ccb2] pb-3">
                            <span>寵物名：<span className="text-[#5d4037] font-bold text-lg">{parsedData.petName}</span></span>
                            <div className="flex items-center bg-white border border-[#d4a373] rounded-lg px-2 py-1">
                                <span className="text-sm font-bold text-[#8b5e3c] mr-1">金額 $</span>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-20 font-black text-[#5d4037] focus:outline-none text-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                <span className="text-xs font-bold text-[#d4a373] block mb-1">🍰 蛋糕/輕食內容</span>
                                <pre className="text-xs text-[#5d4037] whitespace-pre-wrap">{parsedData.cakeContent || "(無)"}</pre>
                             </div>
                             <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                                <span className="text-xs font-bold text-blue-600 block mb-1">👕 服飾內容</span>
                                <pre className="text-xs text-[#5d4037] whitespace-pre-wrap">{parsedData.apparelContent || "(無)"}</pre>
                             </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-[#8b5e3c] mb-1">飼主電話</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border border-[#e6ccb2] rounded-lg focus:border-[#8b5e3c] outline-none"/></div>
                            <div><label className="block text-xs font-bold text-[#8b5e3c] mb-1">匯款後五碼</label><input type="text" value={last5} onChange={e => setLast5(e.target.value)} className="w-full p-2 border border-[#e6ccb2] rounded-lg focus:border-[#8b5e3c] outline-none"/></div>
                            <div className="sm:col-span-2"><label className="block text-xs font-bold text-[#8b5e3c] mb-1">地址 (若有)</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border border-[#e6ccb2] rounded-lg focus:border-[#8b5e3c] outline-none"/></div>
                            <div><label className="block text-xs font-bold text-[#8b5e3c] mb-1">預計取貨日期</label><input type="text" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full p-2 border border-[#e6ccb2] rounded-lg focus:border-[#8b5e3c] outline-none" placeholder="如: 5/15"/></div>
                            <div><label className="block text-xs font-bold text-[#8b5e3c] mb-1">備註 (年齡/用途)</label><input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full p-2 border border-[#e6ccb2] rounded-lg focus:border-[#8b5e3c] outline-none"/></div>
                        </div>
                        <button onClick={handleSubmitToGoogle} className="w-full bg-[#06C755] text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 flex items-center justify-center text-lg hover:bg-[#05b34c] transition-all mt-4"><FileText className="w-5 h-5 mr-2"/> 送出並記帳</button>
                    </div>
                )}
            </div>
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
};

const AdminProductModal = ({ product, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState(() => ({
    id: product?.id, name: product?.name || '', price: product?.price || '',
    tags: Array.isArray(product?.tags) ? product.tags : [],
    images: (Array.isArray(product?.images) && product.images.length > 0) ? product.images : [''],
    note: product?.note || '',
    sizeGroups: Array.isArray(product?.sizeGroups) ? product.sizeGroups : [{ id: Date.now(), label: "通用尺寸", sizes: ["S", "M", "L"] }]
  }));
  const [newSizeInputs, setNewSizeInputs] = useState({});
  const [newTagInput, setNewTagInput] = useState("");
  const handleChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const handleSave = () => { const cleanData = { ...formData, price: parseInt(formData.price) || 0, images: formData.images.filter(url => url.trim() !== '') }; onSave(cleanData); };
  const addTag = () => { if (newTagInput.trim() && !formData.tags.includes(newTagInput.trim())) { setFormData(p => ({ ...p, tags: [...p.tags, newTagInput.trim()] })); setNewTagInput(""); } };
  const removeTag = (t) => setFormData(p => ({ ...p, tags: p.tags.filter(tag => tag !== t) }));
  const handleImageChange = (i, v) => { const n = [...formData.images]; n[i] = v; setFormData(p => ({ ...p, images: n })); };
  const addImageField = () => setFormData(p => ({ ...p, images: [...p.images, ''] }));
  const removeImageField = (i) => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
  const addSizeGroup = () => setFormData(p => ({ ...p, sizeGroups: [...p.sizeGroups, { id: Date.now(), label: "新尺寸分類", sizes: [] }] }));
  const removeSizeGroup = (i) => setFormData(p => ({ ...p, sizeGroups: p.sizeGroups.filter((_, idx) => idx !== i) }));
  const updateGroupLabel = (i, l) => setFormData(p => ({ ...p, sizeGroups: p.sizeGroups.map((g, idx) => idx === i ? { ...g, label: l } : g) }));
  const addSizeToGroup = (i) => { const s = newSizeInputs[i]?.trim(); if(s) { setFormData(p => ({ ...p, sizeGroups: p.sizeGroups.map((g, idx) => idx === i ? { ...g, sizes: [...(g.sizes||[]), s] } : g) })); setNewSizeInputs(p => ({...p, [i]: ''})); } };
  const removeSizeFromGroup = (gi, si) => setFormData(p => ({ ...p, sizeGroups: p.sizeGroups.map((g, idx) => idx === gi ? { ...g, sizes: g.sizes.filter((_, sidx) => sidx !== si) } : g) }));

  return (
    <div className="fixed inset-0 z-[3001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-cute" onClick={onClose}>
      <div className="bg-[#fdfbf7] w-full max-w-2xl rounded-[1.5rem] shadow-2xl relative modal-content flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[#e6ccb2] flex justify-between items-center bg-white">
          <h3 className="text-lg font-black text-[#5d4037] flex items-center"><Settings className="w-5 h-5 mr-2 text-[#d4a373]"/> {product ? '編輯商品' : '新增商品'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto hide-scrollbar flex-1 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#e6ccb2] shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-[#d4a373]">基本資訊</h4>
            <div className="grid grid-cols-3 gap-4">
               <div className="col-span-2"><label className="text-xs font-bold text-[#8b5e3c] block mb-1">名稱</label><input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="input-base"/></div>
               <div><label className="text-xs font-bold text-[#8b5e3c] block mb-1">價格</label><input type="number" value={formData.price} onChange={e => handleChange('price', parseInt(e.target.value) || 0)} className="input-base"/></div>
            </div>
            <div><label className="text-xs font-bold text-[#8b5e3c] block mb-1">備註</label><textarea value={formData.note} onChange={e => handleChange('note', e.target.value)} className="input-base" rows={2}/></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e6ccb2] shadow-sm space-y-3">
             <h4 className="text-sm font-bold text-[#d4a373]"><Tag size={14} className="inline mr-1"/> 分類標籤</h4>
             <div className="flex flex-wrap gap-2">{formData.tags.map(t => <div key={t} className="px-3 py-1 bg-[#8b5e3c] text-white text-xs rounded-full flex items-center">{t}<button onClick={()=>removeTag(t)} className="ml-2 hover:text-red-200"><X size={12}/></button></div>)}</div>
             <div className="flex gap-2"><input type="text" value={newTagInput} onChange={e => setNewTagInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addTag()}} className="input-base py-1.5 flex-1" placeholder="輸入分類..." /><button onClick={addTag} className="bg-[#faedcd] text-[#8b5e3c] px-3 py-1 text-xs font-bold rounded-lg">加入</button></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e6ccb2] shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-[#d4a373]"><ImageIcon size={14} className="inline mr-1"/> 圖片連結</h4>
            {formData.images.map((img, i) => <div key={i} className="flex gap-2 items-center"><span className="text-xs text-[#d4a373] font-bold w-4">{i+1}.</span><input type="text" value={img} onChange={e => handleImageChange(i, e.target.value)} className="input-base py-1.5"/><button onClick={()=>removeImageField(i)} className="text-red-400"><Trash size={16}/></button></div>)}
            <button onClick={addImageField} className="text-xs bg-[#faedcd] text-[#8b5e3c] px-3 py-1.5 rounded-lg font-bold">+ 新增圖片</button>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e6ccb2] shadow-sm space-y-3">
            <div className="flex justify-between items-center"><h4 className="text-sm font-bold text-[#d4a373]"><Layers size={14} className="inline mr-1"/> 尺寸規格</h4><button onClick={addSizeGroup} className="text-xs bg-[#8b5e3c] text-white px-2 py-1 rounded">+ 分類</button></div>
            {formData.sizeGroups.map((g, i) => (
              <div key={i} className="bg-[#fdfbf7] border border-[#e6ccb2] rounded-lg p-3 relative space-y-2">
                 <button onClick={()=>removeSizeGroup(i)} className="absolute top-2 right-2 text-red-300 hover:text-red-500"><X size={14}/></button>
                 <input type="text" value={g.label} onChange={e => updateGroupLabel(i, e.target.value)} className="w-full bg-white border border-[#e6ccb2] rounded px-2 py-1 text-sm text-[#5d4037] font-bold" placeholder="分類名稱"/>
                 <div className="flex flex-wrap gap-2">{g.sizes?.map((s, si) => <div key={si} className="bg-[#8b5e3c] text-white px-2 py-0.5 rounded text-xs flex items-center">{s}<button onClick={()=>removeSizeFromGroup(i, si)} className="ml-1 text-white/70 hover:text-white"><X size={10}/></button></div>)}</div>
                 <div className="flex items-center gap-2"><input type="text" value={newSizeInputs[i] || ''} onChange={e => setNewSizeInputs(p => ({...p, [i]: e.target.value}))} onKeyDown={e=>{if(e.key==='Enter')addSizeToGroup(i)}} className="flex-1 bg-white border border-[#e6ccb2] rounded px-2 py-1 text-xs" placeholder="輸入尺寸按Enter"/><button onClick={()=>addSizeToGroup(i)} className="text-[#8b5e3c]"><Plus size={16}/></button></div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-[#e6ccb2] bg-white flex gap-3">
          {product && <button onClick={() => onDelete(product.id)} className="px-4 border border-red-200 text-red-400 py-2 rounded-xl font-bold hover:bg-red-50">刪除</button>}
          <button onClick={handleSave} className="flex-1 bg-[#8b5e3c] text-white py-2 rounded-xl font-bold shadow-md">儲存</button>
        </div>
      </div>
    </div>
  );
};

const ApparelPage = ({ onBack, onAddToCart, isAdmin, onSecretClick, onLogout }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS); 
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotice1, setShowNotice1] = useState(true);
  const [showNotice2, setShowNotice2] = useState(false);
  const handleConfirmNotice1 = () => { setShowNotice1(false); setShowNotice2(true); };
  const handleConfirmNotice2 = () => { setShowNotice2(false); };

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, setUser); return () => unsubscribe(); }, []);
  useEffect(() => {
    try { const s = localStorage.getItem('ho00p_products'); if (s) setProducts(JSON.parse(s)); } catch (e) {}
    if (db && user) {
       const q = collection(db, 'artifacts', appId, 'public', 'data', 'products');
       const unsubscribe = onSnapshot(q, (snapshot) => {
           const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
           if (list.length > 0) { setProducts(list); localStorage.setItem('ho00p_products', JSON.stringify(list)); }
       });
       return () => unsubscribe();
    }
  }, [user]);

  const handleSave = async (data) => {
    const { id, ...cleanData } = data; 
    cleanData.images = cleanData.images.filter(x => x && x.trim()); 
    if (db && user) {
        try {
            const col = collection(db, 'artifacts', appId, 'public', 'data', 'products');
            if (id) await setDoc(doc(col, id), cleanData, { merge: true });
            else await addDoc(col, cleanData);
            setShowAdminModal(false); setEditingProduct(null); 
            alert("已儲存至雲端"); return;
        } catch(e) { alert(`雲端儲存失敗: ${e.message}`); }
    }
    const newItem = { ...data, id: data.id || Date.now().toString() }; 
    setProducts(prev => {
        const exists = prev.find(x => x.id === newItem.id);
        const newP = exists ? prev.map(x => x.id === newItem.id ? newItem : x) : [newItem, ...prev];
        localStorage.setItem('ho00p_products', JSON.stringify(newP));
        return newP;
    });
    setShowAdminModal(false); setEditingProduct(null); alert("已儲存 (本機模式)"); 
  };

  const handleDelete = async (id) => {
    if (!confirm("確定刪除？")) return;
    if (db && user) { try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id)); setShowAdminModal(false); alert("已從雲端刪除"); return; } catch(e) {} }
    setProducts(prev => { const newP = prev.filter(x => x.id !== id); localStorage.setItem('ho00p_products', JSON.stringify(newP)); return newP; });
    setShowAdminModal(false);
  };

  const allTags = ['all', ...new Set(products.flatMap(p => Array.isArray(p.tags) ? p.tags.filter(t => typeof t === 'string') : []))];
  const displayProducts = activeFilter === 'all' ? products : products.filter(p => Array.isArray(p.tags) && p.tags.includes(activeFilter));

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#fdfbf7] animate-element font-cute">
      {selectedProduct === null && !showAdminModal && showNotice1 && <NotificationModal message="運送只限台灣本島，離島無法寄送請見諒 🚚" onConfirm={handleConfirmNotice1} />}
      {selectedProduct === null && !showAdminModal && showNotice2 && <NotificationModal message="服飾單筆滿 $600 免運，未達酌收 $80 運費 👕" onConfirm={handleConfirmNotice2} icon={<ShoppingBag className="w-8 h-8 text-[#8b5e3c]" />} />}
      <div className={`sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center justify-between ${isAdmin ? 'border-b-4 border-red-300' : ''} w-full max-w-7xl mx-auto`}>
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[#faedcd] text-[#8b5e3c]"><Home size={24} /></button>
        <div className="select-none cursor-pointer text-center" onClick={onSecretClick}><h2 className="text-xl font-black text-[#5d4037] tracking-widest uppercase">CURATED COLLECTION</h2></div>
        <div className="w-10 flex justify-end">
            {isAdmin && <button onClick={onLogout} className="bg-red-500 text-white p-2 rounded-full shadow-lg"><LogOut size={20} /></button>}
        </div>
      </div>
      {isAdmin && <div className="px-4 py-2 text-xs font-bold flex justify-between items-center w-full max-w-7xl mx-auto bg-green-100 text-green-700">
          <div className="flex items-center gap-2"><span>🔧 管理模式 {db && user ? "🟢 雲端已連線" : "🔴 離線"}</span><button onClick={() => { setEditingProduct(null); setShowAdminModal(true); }} className="bg-[#8b5e3c] text-white px-2 py-0.5 rounded shadow-sm text-[10px]">+新增</button></div>
      </div>}
      <div className="px-4 py-4 overflow-x-auto hide-scrollbar w-full max-w-7xl mx-auto"><div className="flex space-x-2">{allTags.map(tag => (<button key={tag} onClick={() => setActiveFilter(tag)} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeFilter === tag ? 'bg-[#8b5e3c] text-white shadow-md scale-105' : 'bg-white text-[#8b5e3c] border border-[#e6ccb2]'}`}>{tag === 'all' ? '全部' : tag}</button>))}</div></div>
      <div className="flex-1 px-4 pb-20 overflow-y-auto w-full max-w-7xl mx-auto no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{displayProducts.map(p => (
              <div key={p.id} className={`bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-[#f0e6dd] transition-all group relative ${isAdmin ? 'admin-border' : ''}`}>
                {isAdmin && <div className="absolute top-2 right-2 z-20 flex space-x-2"><button onClick={(e)=>{e.stopPropagation();setEditingProduct(p);setShowAdminModal(true)}} className="bg-white/90 p-2 rounded-full text-blue-600 shadow-md"><Edit size={18}/></button><button onClick={(e)=>{e.stopPropagation();handleDelete(p.id)}} className="bg-white/90 p-2 rounded-full text-red-500 shadow-md"><Trash size={18}/></button></div>}
                <div className="relative cursor-pointer aspect-square" onClick={() => setSelectedProduct(p)}><img src={(Array.isArray(p.images) && p.images[0]) ? p.images[0] : "https://placehold.co/600x600/e6ccb2/8b5e3c?text=No+Image"} alt={p.name} className="w-full h-full object-cover" /></div>
                <div className="p-4 cursor-pointer" onClick={() => setSelectedProduct(p)}><div className="flex justify-between items-start mb-2"><h3 className="text-sm md:text-lg font-bold text-[#5d4037] line-clamp-1">{p.name}</h3><span className="text-[#d4a373] font-bold text-sm md:text-base">${p.price}</span></div><div className="flex gap-1 flex-wrap">{(Array.isArray(p.tags) ? p.tags.filter(t=>typeof t==='string') : []).slice(0, 2).map(t => <span key={t} className="text-[10px] bg-[#fdfbf7] text-[#a67c52] px-2 py-1 rounded-md border border-[#e6ccb2]">{t}</span>)}</div></div>
              </div>))}</div>
      </div>
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={onAddToCart} />}
      {showAdminModal && <AdminProductModal product={editingProduct} onSave={handleSave} onDelete={handleDelete} onClose={() => setShowAdminModal(false)} />}
      <Footer className="mt-8"/>
    </div>
  );
};

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;
  const sizeGroups = Array.isArray(product.sizeGroups) ? product.sizeGroups : [];
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [''];

  const handleAddToCart = () => {
    const hasSizes = sizeGroups.some(g => Array.isArray(g.sizes) && g.sizes.length > 0);
    if (hasSizes && !selectedSize) return alert("請選擇尺寸喔！");
    onAddToCart({ id: product.id + Date.now(), type: 'apparel', product: product, size: selectedSize, quantity: quantity, total: product.price * quantity });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-cute" onClick={onClose}>
      <div className="bg-[#fdfbf7] w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl relative modal-content flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full text-[#5d4037] hover:bg-white shadow-sm"><X size={24} /></button>
        <div className="flex-shrink-0"><ImageCarousel images={images} heightClass="h-72 md:h-80" /></div>
        <div className="p-6 overflow-y-auto hide-scrollbar space-y-4">
          <div><h2 className="text-2xl font-black text-[#5d4037] mb-1">{product.name}</h2><p className="text-3xl font-bold text-[#d4a373]">${product.price}</p></div>
          <div className="bg-white p-4 rounded-xl border border-[#e6ccb2]"><h3 className="text-sm font-bold text-[#8b5e3c] mb-1 flex items-center"><Info size={14} className="mr-1"/> 說明</h3><p className="text-[#5d4037] text-sm">{product.note || "無說明"}</p></div>
          {sizeGroups.length > 0 && <div className="space-y-3">{sizeGroups.map((g, i) => (<div key={i}><p className="text-xs text-[#a67c52] font-bold mb-1">{g.label}</p><div className="flex flex-wrap gap-2">{Array.isArray(g.sizes) && g.sizes.map(s => <button key={s} onClick={() => setSelectedSize(s)} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${selectedSize === s ? 'size-btn-selected' : 'size-btn-default'}`}>{s}</button>)}</div></div>))}</div>}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#e6ccb2]"><span className="text-sm font-bold text-[#8b5e3c]">數量</span><div className="flex items-center gap-3"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full bg-[#f0e6dd] flex items-center justify-center"><MinusCircle size={18}/></button><span className="text-lg font-bold text-[#5d4037] w-4 text-center">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full bg-[#f0e6dd] flex items-center justify-center"><PlusCircle size={18}/></button></div></div>
        </div>
        <div className="p-4 bg-white border-t border-[#e6ccb2]"><button onClick={handleAddToCart} className="w-full bg-[#8b5e3c] text-white py-3 rounded-xl font-bold text-lg shadow-md active:scale-95 flex items-center justify-center gap-2"><ShoppingBag size={20}/> 加入購物車</button></div>
      </div>
    </div>
  );
};

const FoodOrderingSystem = ({ onBack, onAddToCart, onSecretClick, onLogout, isAdmin }) => {
  const CATEGORIES_DATA = CATEGORIES_DATA_FOOD;
  const [page, setPage] = useState('home'); const [orderType, setOrderType] = useState(null); const [selections, setSelections] = useState({ shape: [], meat: [], veg: [], fruit: [], color: [] }); const [activeTab, setActiveTab] = useState('meat'); const [isCartBarVisible, setIsCartBarVisible] = useState(true); const [toast, setToast] = useState(null); const [showNotice1, setShowNotice1] = useState(true); const [showNotice2, setShowNotice2] = useState(false); const [showNotice3, setShowNotice3] = useState(false);
  const formatPrice = (price) => `$${price}`;
  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 5000); };
  const handleConfirmNotice1 = () => { setShowNotice1(false); setShowNotice2(true); };
  const handleConfirmNotice2 = () => { setShowNotice2(false); setShowNotice3(true); };
  const handleConfirmNotice3 = () => { setShowNotice3(false); };
  const startOrder = (type) => { setOrderType(type); setPage('builder'); setSelections({ shape: [], meat: [], veg: [], fruit: [], color: [] }); setIsCartBarVisible(true); if (type === 'meal') setActiveTab('shape'); else setActiveTab('meat'); };
  const toggleSelection = (category, item) => { const list = selections[category] || []; const exists = list.find(i => i.id === item.id); const limits = { meat: 3, veg: 3, fruit: 1, color: 1, shape: 99 }; if (exists) setSelections(prev => ({ ...prev, [category]: prev[category].filter(i => i.id !== item.id) })); else if (limits[category] === 1) setSelections(prev => ({ ...prev, [category]: [item] })); else if (list.length >= limits[category]) showToast(`此類別最多 ${limits[category]} 種`, 'error'); else setSelections(prev => ({ ...prev, [category]: [...prev[category], item] })); };
  const calculateCurrentItemTotal = () => { let t = 0; Object.values(selections).forEach(arr => arr.forEach(i => t += i.price)); return t; };
  const handleAddToCartLocal = () => { 
      const t = calculateCurrentItemTotal(); 
      if (t === 0) return showToast('請先選擇餐點', 'error'); 
      if (orderType === 'cake' && (selections.meat.length === 0 || selections.color.length === 0)) return showToast('請選擇肉類與淋面', 'error');
      onAddToCart({ id: Date.now(), type: orderType, selections: { ...selections }, total: t }); setPage('home'); showToast('已加入購物車！'); 
  };

  if (page === 'home') return (
      <div className="w-full h-full bg-[#fdfbf7] flex flex-col relative overflow-hidden font-cute">
        {showNotice1 && <NotificationModal message="新鮮食材，無額外添加物 ❤️" onConfirm={handleConfirmNotice1} icon={<ShieldCheck className="w-8 h-8 text-[#8b5e3c]" />} />}
        {showNotice2 && <NotificationModal message="運送只限台灣本島 🚚" onConfirm={handleConfirmNotice2} />}
        {showNotice3 && <NotificationModal message="低溫宅急便滿千免運 ($180) 💰" onConfirm={handleConfirmNotice3} icon={<ShoppingBag className="w-8 h-8 text-[#8b5e3c]" />} />}
        <div className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center justify-between w-full max-w-7xl mx-auto">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[#faedcd] text-[#8b5e3c]"><Home size={24}/></button>
            <div className="select-none cursor-pointer text-center" onClick={onSecretClick}><h1 className="text-xl font-black text-[#5d4037] tracking-widest uppercase">FRESH KITCHEN</h1></div>
            <div className="w-10 flex justify-end">{isAdmin && <button onClick={onLogout} className="bg-red-500 text-white p-2 rounded-full shadow-lg"><LogOut size={20} /></button>}</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto no-scrollbar w-full min-h-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#faedcd] rounded-full mix-blend-multiply filter blur-3xl opacity-70 blob-animation"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl z-10 px-4 mb-8">
            <button onClick={() => startOrder('cake')} className="group bg-white p-6 rounded-[2rem] shadow-xl border-2 border-[#f0e6dd] text-left flex flex-col justify-between min-h-[280px] relative overflow-hidden">
               <div className="absolute right-[-20px] bottom-[-20px] opacity-10"><CakeIcon size={150} color="#8b5e3c"/></div>
               <div className="flex items-center space-x-4 mb-4"><div className="bg-[#faedcd] p-3 rounded-full"><CakeIcon className="text-[#8b5e3c] w-8 h-8" /></div><h2 className="text-2xl font-bold text-[#5d4037]">客製化蛋糕</h2></div>
               <p className="text-[#8b5e3c] opacity-70 text-sm md:text-base">專屬慶生、節日慶祝。<br/>包含淋面設計與豐富配料。</p>
               <div className="mt-4 flex items-center text-[#d4a373] font-bold group-hover:translate-x-2 transition-transform">開始訂製 <ChevronRight className="w-5 h-5"/></div>
            </button>
            <button onClick={() => startOrder('meal')} className="group bg-white p-6 rounded-[2rem] shadow-xl border-2 border-[#f0e6dd] text-left flex flex-col justify-between min-h-[280px] relative overflow-hidden">
               <div className="absolute right-[-20px] bottom-[-20px] opacity-10"><UtensilsCrossed size={150} color="#8b5e3c"/></div>
               <div className="flex items-center space-x-4 mb-4"><div className="bg-[#faedcd] p-3 rounded-full"><UtensilsCrossed className="text-[#8b5e3c] w-8 h-8" /></div><h2 className="text-2xl font-bold text-[#5d4037]">輕食</h2></div>
               <p className="text-[#8b5e3c] opacity-70 text-sm md:text-base">甜甜圈與爪狀肉餅。<br/>營養均衡的可愛小點心。</p>
               <div className="mt-4 flex items-center text-[#d4a373] font-bold group-hover:translate-x-2 transition-transform">開始訂製 <ChevronRight className="w-5 h-5"/></div>
            </button>
          </div>
          <Footer className="pb-6"/>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
  );

  if (page === 'builder') return (
      <div className="w-full h-full bg-[#fdfbf7] flex flex-col font-cute">
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-sm flex items-center justify-between w-full max-w-7xl mx-auto"><button onClick={() => setPage('home')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-[#8b5e3c]"><ArrowLeft className="w-6 h-6" /></button><h1 className="text-lg font-bold text-[#5d4037]">FRESH KITCHEN</h1><div className="w-8"></div></header>
        <div className="sticky top-[56px] z-30 bg-[#fdfbf7]/95 shadow-sm flex-shrink-0 w-full overflow-x-auto no-scrollbar"><div className="flex space-x-4 p-4 max-w-5xl mx-auto">{orderType === 'meal' ? (<CategoryTab id="shape" label="輕食選擇" icon={CATEGORIES_DATA.shape.icon} isActive={activeTab === 'shape'} onClick={setActiveTab} />) : (<><CategoryTab id="meat" label="主食肉類" icon={CATEGORIES_DATA.meat.icon} isActive={activeTab === 'meat'} onClick={setActiveTab} /><CategoryTab id="veg" label="蔬菜配料" icon={CATEGORIES_DATA.veg.icon} isActive={activeTab === 'veg'} onClick={setActiveTab} /><CategoryTab id="fruit" label="水果點綴" icon={CATEGORIES_DATA.fruit.icon} isActive={activeTab === 'fruit'} onClick={setActiveTab} /><CategoryTab id="color" label="淋面顏色" icon={CATEGORIES_DATA.color.icon} isActive={activeTab === 'color'} onClick={setActiveTab} /></>)}</div></div>
        <div className="flex-1 p-6 pb-40 overflow-y-auto no-scrollbar w-full max-w-5xl mx-auto">
            <div className="mb-8 bg-[#fffbf7] p-4 rounded-2xl border-2 border-[#faedcd] flex items-start shadow-sm"><Info className="w-5 h-5 text-[#d4a373] mr-3 mt-0.5" /><p className="text-base text-[#8b5e3c]">{activeTab === 'shape' ? '輕食 (可多選)' : activeTab === 'meat' ? '新鮮主食 (必選, 最多3)' : activeTab === 'veg' ? '健康蔬菜 (最多3)' : activeTab === 'fruit' ? '風味水果 (限1)' : '蛋糕顏色 (必選, 限1)'}</p></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">{CATEGORIES_DATA[activeTab]?.items?.map(item => (<IngredientCard key={item.id} item={item} category={activeTab} isSelected={selections[activeTab]?.some(i => i.id === item.id)} onToggle={toggleSelection} formatPrice={formatPrice} />))}</div>
        </div>
        <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center transition-transform duration-300 ${isCartBarVisible ? 'translate-y-0' : 'translate-y-[120%]'}`}><div className="w-full max-w-[1024px] bg-white shadow-[0_-5px_30px_rgba(0,0,0,0.15)] rounded-t-[2rem] p-6 pb-8 border-t border-[#f0e6dd]"><div className="flex justify-between items-end mb-4 px-2"><div><p className="text-xs text-[#a67c52] font-bold mb-1 uppercase">金額</p><p className="text-4xl font-black text-[#5d4037]">{formatPrice(calculateCurrentItemTotal())}</p></div><div className="text-right"><p className="text-xs text-[#a67c52] font-bold uppercase">內容</p><p className="text-base font-bold text-[#8b5e3c]">{Object.values(selections).flat().length} 項</p></div></div><button onClick={handleAddToCartLocal} className="w-full bg-[#8b5e3c] text-white py-4 rounded-xl font-bold text-xl shadow-lg active:scale-95 flex items-center justify-center space-x-2"><Plus className="w-6 h-6" /><span>加入購物車</span></button></div></div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
  );
  return null;
};

const CartSummaryPage = ({ cart, onBack, removeFromCart, petName, setPetName, occasion, setOccasion, storeName, setStoreName }) => {
  const subtotalApparel = cart.filter(i => i.type === 'apparel').reduce((acc, i) => acc + i.total, 0);
  const subtotalFood = cart.filter(i => i.type !== 'apparel').reduce((acc, i) => acc + i.total, 0);
    
  const shipA = subtotalApparel > 0 ? (subtotalApparel >= 600 ? 0 : 80) : 0;
  const shipF = subtotalFood > 0 ? (subtotalFood >= 1000 ? 0 : 180) : 0;
    
  const totalShipping = shipA + shipF;
  const subtotal = subtotalApparel + subtotalFood;
  const finalTotal = subtotal + totalShipping;

  const [toast, setToast] = useState(null);
  const hasApparel = cart.some(i => i.type === 'apparel');
  const hasFood = cart.some(i => i.type !== 'apparel');
  const formatPrice = (p) => `$${p}`;
  const showToast = (m, t = 'success') => { setToast({ message: m, type: t }); setTimeout(() => setToast(null), 5000); };

  const generateOrderText = () => {
    let text = `【 ${petName || "未命名"} 的訂購單 】\n`; 
    if (hasApparel && storeName) text += `超商店名：${storeName}\n`;
    if (hasFood && occasion) text += `用途：${occasion}\n`; 
    text += '\n'; 
    cart.forEach((item, index) => {
        if (item.type === 'apparel') text += `👕 服飾 #${index+1}: ${item.product.name}\n   尺寸: ${item.size} / 數量: ${item.quantity}\n   金額: ${formatPrice(item.total)}\n\n`;
        else {
            text += `${item.type==='cake'?'🎂':'🥯'} ${item.type==='cake'?'客製蛋糕':'輕食'} #${index+1}\n`;
            if (item.selections.shape?.length) text += `   品項: ${item.selections.shape.map(i=>i.name).join(',')}\n`;
            if (item.selections.meat?.length) text += `   肉類: ${item.selections.meat.map(i=>i.name).join(',')}\n`;
            if (item.selections.veg?.length) text += `   蔬菜: ${item.selections.veg.map(i=>i.name).join(',')}\n`;
            if (item.selections.fruit?.length) text += `   水果: ${item.selections.fruit.map(i=>i.name).join(',')}\n`;
            if (item.selections.color?.length) text += `   淋面: ${item.selections.color.map(i=>i.name).join(',')}\n`;
            text += `   金額: ${formatPrice(item.total)}\n\n`;
        }
    });
    text += '------------------\n';
    text += `商品總額：${formatPrice(subtotal)}\n`;
    if (subtotalApparel > 0) text += `常溫運費: ${shipA===0?'免運':'$80'}\n`;
    if (subtotalFood > 0) text += `低溫運費: ${shipF===0?'免運':'$180'}\n`;
    text += `💰 訂單總金額：${formatPrice(finalTotal)}\n\n`;
    return text;
  };

  const handleCopy = () => {
    const text = generateOrderText();
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('訂單已複製！即將跳轉 LINE...'); setTimeout(() => window.location.href = 'https://line.me/R/ti/p/@910bufim', 1500); } catch (e) {}
    document.body.removeChild(ta);
  };

  return (
    <div className="w-full h-full bg-[#fdfbf7] flex flex-col font-cute no-scrollbar">
       <div className="flex items-center justify-between p-4 sticky top-0 bg-[#fdfbf7] z-40 w-full max-w-7xl mx-auto"><button onClick={onBack} className="p-2 rounded-full hover:bg-[#eae0d5] text-[#8b5e3c]"><ArrowLeft className="w-8 h-8" /></button><h2 className="text-xl font-black text-[#5d4037] tracking-widest uppercase">SHOPPING CART</h2><div className="w-8"></div></div>
       <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-40 w-full max-w-7xl mx-auto">
           {cart.length === 0 ? <div className="text-center py-20 opacity-60 flex flex-col items-center"><ShoppingBag size={48} className="mb-4"/><p>購物車是空的</p></div> : <>
               <div className="space-y-4 mb-8">
                 {cart.map(i => (
                    <div key={i.id} className="bg-white p-5 rounded-2xl border border-[#f0e6dd] relative shadow-sm">
                        <button onClick={()=>removeFromCart(i.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-400"><Trash2 size={20}/></button>
                        <div className="flex items-start">
                            <div className="bg-[#faedcd] p-3 rounded-full mr-4 text-[#8b5e3c]">{i.type==='apparel'?<Shirt size={20}/>:i.type==='cake'?<CakeIcon size={20}/>:<UtensilsCrossed size={20}/>}</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#5d4037] mb-1">{i.type==='apparel'?i.product.name:i.type==='cake'?'客製化蛋糕':'輕食餐點'}</h3>
                                <div className="text-xs text-[#8b5e3c]">
                                    {i.type === 'apparel' 
                                      ? `尺寸: ${i.size} / 數量: ${i.quantity}` 
                                      : (i.type === 'meal' 
                                          ? `品項: ${i.selections.shape?.map(s => s.name).join(', ') || ''}`
                                          : [
                                                i.selections.meat?.length ? `肉類:${i.selections.meat.map(m => m.name).join(',')}` : null,
                                                i.selections.veg?.length ? `蔬菜:${i.selections.veg.map(v => v.name).join(',')}` : null,
                                                i.selections.fruit?.length ? `水果:${i.selections.fruit.map(f => f.name).join(',')}` : null,
                                                i.selections.color?.length ? `淋面:${i.selections.color.map(c => c.name).join(',')}` : null
                                            ].filter(Boolean).join(' / ')
                                      )
                                    }
                                </div>
                                <div className="text-right font-bold text-[#d4a373] mt-2">{formatPrice(i.total)}</div>
                            </div>
                        </div>
                    </div>
                 ))}
               </div>
               
               <div className="bg-[#fffbf7] border-2 border-[#faedcd] rounded-2xl p-6 mb-6 shadow-sm"><h3 className="font-bold text-[#8b5e3c] flex items-center mb-4 text-lg"><Wand2 className="w-5 h-5 mr-2" /> 訂購人資料</h3>
                   <div className="space-y-3"><input type="text" placeholder="寶貝名字 (如: 豆豆)" value={petName} onChange={(e) => setPetName(e.target.value)} className="w-full border border-[#e6ccb2] rounded-xl px-4 py-3 text-sm outline-none" />{hasApparel && <div className="relative"><Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" /><input type="text" placeholder="超商店名 (如: 7-11 萬得門市)" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full border border-[#e6ccb2] rounded-xl pl-10 pr-4 py-3 text-sm outline-none" /></div>}{hasFood && <input type="text" placeholder="用途 (如: 3歲生日)" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full border border-[#e6ccb2] rounded-xl px-4 py-3 text-sm outline-none" />}</div>
               </div>
               
               <div className="mt-4 pt-4 border-t-2 border-[#f0e6dd] space-y-2">
                   <div className="flex justify-between items-center text-[#a67c52]"><span>商品小計</span><span>{formatPrice(subtotal)}</span></div>
                   {subtotalApparel > 0 && <div className="flex justify-between items-center text-[#a67c52]"><span>常溫運費 {shipA === 0 ? '(已達免運)' : '($80)'}</span><span>{formatPrice(shipA)}</span></div>}
                   {subtotalFood > 0 && <div className="flex justify-between items-center text-[#a67c52]"><span>低溫運費 {shipF === 0 ? '(已達免運)' : '($180)'}</span><span>{formatPrice(shipF)}</span></div>}
                   <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#f0e6dd]"><span className="text-xl font-bold text-[#5d4037]">訂單總金額</span><span className="text-4xl font-black text-[#8b5e3c]">{formatPrice(finalTotal)}</span></div>
               </div>
               </>
           }
       </div>
       {cart.length > 0 && <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t flex flex-col gap-3 z-50 shadow-lg"><button onClick={onBack} className="w-full border-2 border-[#8b5e3c] text-[#8b5e3c] py-3 rounded-xl font-bold"><Plus size={18} className="inline mr-1"/>繼續選購</button><button onClick={handleCopy} className="w-full bg-[#06C755] text-white py-4 rounded-xl font-bold text-xl"><Copy size={20} className="inline mr-1"/>複製訂單前往 LINE</button></div>}
       {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [page, setPage] = useState('entry'); 
  const [cart, setCart] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [petName, setPetName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // 檢查 script 標籤是否存在，避免 ReferenceError: tailwind is not defined
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) { 
        const s = document.createElement('script'); 
        s.src = "https://cdn.tailwindcss.com"; 
        s.id = "tailwind-script";
        s.async = true;
        document.head.appendChild(s); 
    }
     
    // 監聽網路狀態 (樹梅派常用功能)
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    try { 
        const c = localStorage.getItem('ho00p_cart'); 
        if (c) setCart(JSON.parse(c)); 
        setPetName(localStorage.getItem('ho00p_petName')||''); 
        setOccasion(localStorage.getItem('ho00p_occasion')||''); 
        setStoreName(localStorage.getItem('ho00p_storeName')||''); 
    } catch (e) {}
     
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try { 
      localStorage.setItem('ho00p_cart', JSON.stringify(cart)); 
      localStorage.setItem('ho00p_petName', petName); 
      localStorage.setItem('ho00p_occasion', occasion); 
      localStorage.setItem('ho00p_storeName', storeName); 
    } catch (e) {}
  }, [cart, petName, occasion, storeName]);

  useEffect(() => { const initAuth = async () => { if (!auth || auth.currentUser) return; try { await signInAnonymously(auth); } catch (e) {} }; initAuth(); }, []);
  useEffect(() => { setTimeout(() => { setFadingOut(true); setTimeout(() => setLoading(false), 1000); }, CONFIG.loadingDuration); }, []);

  const handleSecretTrigger = () => { setClickCount(p => { const n = p + 1; if (n === 5) { setShowPassword(true); return 0; } return n; }); };

  const renderPage = () => {
    switch (page) {
      case 'entry':
        return (
          <div className="w-full max-w-md px-6 py-10 flex flex-col h-full min-h-screen font-cute">
            <div className="text-center mb-12 mt-6 animate-element" onClick={handleSecretTrigger}>
              <h1 className="text-6xl font-black text-[#8b5e3c] tracking-tight mb-2 drop-shadow-sm cursor-pointer">Ho00p</h1>
              <p className="text-xl font-medium text-[#d4a373] tracking-[0.2em] uppercase">{CONFIG.subTitle}</p>
              <div className="w-16 h-1.5 bg-[#d4a373] rounded-full mx-auto mt-5 opacity-60"></div>
            </div>
            {isAdmin && (
              <div className="mb-6 flex gap-2">
                <div onClick={() => setPage('admin_accounting')} className="flex-1 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-red-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 text-white p-2 rounded-full"><ClipboardList size={20} /></div>
                    <div><h3 className="font-bold text-[#5d4037]">店主後台</h3><p className="text-xs text-[#a67c52]">訂單解析與記帳</p></div>
                  </div>
                  <ChevronRight size={20}/>
                </div>
                <button onClick={() => {setIsAdmin(false);}} className="bg-gray-200 p-4 rounded-2xl"><LogOut size={24} /></button>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-center">
              {CONFIG.menuItems.map((item, index) => (
                <MenuCard key={item.id} title={item.title} subTitle={item.subTitle} icon={item.icon} bgImage={item.bgImage} animationDelay={`${0.9 + (index * 0.3)}s`} onClick={() => setPage(item.id)} />
              ))}
            </div>
            <Footer className="mt-8" />
          </div>
        );
      case 'apparel':
        return <ApparelPage onBack={() => setPage('entry')} onAddToCart={i=>setCart(p=>[...p,i])} isAdmin={isAdmin} onSecretClick={handleSecretTrigger} onLogout={()=>setIsAdmin(false)} />;
      case 'food':
        return <FoodOrderingSystem onBack={() => setPage('entry')} onAddToCart={i=>setCart(p=>[...p,i])} onSecretClick={handleSecretTrigger} isAdmin={isAdmin} onLogout={()=>setIsAdmin(false)} />;
      case 'about':
        return <AboutPage onBack={() => setPage('entry')} onSecretClick={handleSecretTrigger} isAdmin={isAdmin} onLogout={()=>setIsAdmin(false)} />;
      case 'summary':
        return <CartSummaryPage cart={cart} onBack={() => setPage('entry')} removeFromCart={id=>setCart(p=>p.filter(i=>i.id!==id))} petName={petName} setPetName={setPetName} occasion={occasion} setOccasion={setOccasion} storeName={storeName} setStoreName={setStoreName} />;
      case 'admin_accounting':
        return <AdminAccountingPage onBack={() => setPage('entry')} />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
        <div className="relative w-full min-h-screen bg-[#fdfbf7] flex flex-col items-center">
        <GlobalStyles />
        {/* 網路斷線警告 */}
        {!isOnline && (
            <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-1 z-[9999] text-xs font-bold flex items-center justify-center">
                <WifiOff size={14} className="mr-1"/> 網路已斷線，部分圖片或樣式可能無法顯示
            </div>
        )}
        {loading && <SplashScreen isFadingOut={fadingOut} />}
        {!loading && renderPage()}
        {!loading && page !== 'summary' && page !== 'admin_accounting' && cart.length > 0 && <FloatingCartButton count={cart.length} onClick={() => setPage('summary')} />}
        {showPassword && <PasswordModal onClose={() => setShowPassword(false)} onSuccess={() => setIsAdmin(true)} />}
        </div>
    </ErrorBoundary>
  );
};

export default App;
