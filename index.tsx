
import React, { useState, useEffect } from 'https://esm.sh/react@19.0.0';
import ReactDOM from 'https://esm.sh/react-dom@19.0.0/client';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getDatabase, ref, get, set, update, push, onValue, remove, child } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAKGrxv_GT3T3krYeYY5C-o7VmvLkG-gw0",
  authDomain: "cashapp-405b7.firebaseapp.com",
  databaseURL: "https://cashapp-405b7-default-rtdb.firebaseio.com",
  projectId: "cashapp-405b7",
  storageBucket: "cashapp-405b7.firebasestorage.app",
  messagingSenderId: "146496743526",
  appId: "1:146496743526:web:edc0318c7f3affa25465a7",
  measurementId: "G-NWMR38V1B9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Components ---

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const snapshot = await get(child(ref(db), `users/${userId}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === password) {
          localStorage.setItem('userId', userId);
          onLogin({ ...userData, id: userId });
        } else setError('كلمة المرور غير صحيحة');
      } else setError('هذا الحساب غير موجود');
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 mt-20 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-black text-gray-800">مرحباً بك</h2>
        <p className="text-gray-400 text-sm mt-2 font-bold italic">سجل دخولك للوصول إلى لوحة التحكم</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div>
          <label className="block text-[11px] font-black text-gray-400 mb-2 mr-1 uppercase tracking-wider">الرقم التعريفي (ID)</label>
          <input type="text" required value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-black text-gray-700" placeholder="مثال: user_123" />
        </div>
        <div>
          <label className="block text-[11px] font-black text-gray-400 mb-2 mr-1 uppercase tracking-wider">كلمة المرور</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-black text-gray-700" placeholder="••••••••" />
        </div>
        {error && <div className="p-4 bg-red-50 text-red-600 text-[11px] font-black rounded-2xl text-center border border-red-100 animate-pulse">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 text-lg">
          {loading ? 'جاري التحقق...' : 'دخول للمنصة'}
        </button>
      </form>
    </div>
  );
};

const SubmissionForm = ({ currentUser }) => {
  const [formData, setFormData] = useState({ name: '', phoneNumber: '', country: '', cashAppId: '', about: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCheck = await get(child(ref(db), `users/${formData.cashAppId}`));
      if (!userCheck.exists()) {
        setError('عذراً، آيدي الكاش آب الذي أدخلته غير مسجل في نظامنا');
        setLoading(false);
        return;
      }
      const applicationData = { ...formData, status: 'pending', isPaid: false, taxAmount: 0, createdAt: new Date().toISOString() };
      await set(ref(db, `applications/${currentUser.id}`), applicationData);
    } catch (err) {
      setError('حدث خطأ فني أثناء الإرسال، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-gray-800 mb-2">تقديم استمارة جديدة</h2>
        <p className="text-gray-400 font-bold text-sm">أدخل بياناتك بدقة لضمان سرعة قبول الطلب</p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" dir="rtl">
        <div className="md:col-span-2 group">
          <label className="block text-[10px] font-black text-gray-400 mb-2 pr-1 uppercase">الاسم الكامل (كما في الهوية)</label>
          <input type="text" required className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 pr-1 uppercase">رقم الهاتف النشط</label>
          <input type="tel" required className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 pr-1 uppercase">البلد / المدينة</label>
          <input type="text" required className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-gray-400 mb-2 pr-1 uppercase">آيدي الكاش آب (ID الخاص بك)</label>
          <input type="text" required className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm" value={formData.cashAppId} onChange={(e) => setFormData({...formData, cashAppId: e.target.value})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-gray-400 mb-2 pr-1 uppercase">لماذا تود الانضمام إلينا؟</label>
          <textarea required rows={4} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm resize-none" value={formData.about} onChange={(e) => setFormData({...formData, about: e.target.value})} />
        </div>
        <div className="md:col-span-2 mt-6">
          {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl mb-6 text-center border border-red-100">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-blue-100 text-lg">
            {loading ? 'جاري إرسال بياناتك...' : 'إرسال الطلب للمراجعة النهائية'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ApplicationStatus = ({ application, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const taxAmount = Number(application.taxAmount || 0);
  const status = (application.status || 'pending').toLowerCase();
  const date = application.createdAt ? new Date(application.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  const handleExecutePayment = async () => {
    if (currentUser.money < taxAmount) { setError('رصيدك في المنصة غير كافٍ لتغطية الضريبة'); return; }
    setLoading(true);
    try {
      const updates = {};
      updates[`users/${currentUser.id}/money`] = currentUser.money - taxAmount;
      updates[`applications/${currentUser.id}/isPaid`] = true;
      await update(ref(db), updates);
    } catch (err) { 
      setError('فشل في عملية الدفع، يرجى المحاولة لاحقاً'); 
      setLoading(false); 
    }
  };

  // --- Accepted View ---
  if (status === 'accepted' || status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto mt-10 animate-fade-in px-4">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-green-100 overflow-hidden relative">
          <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-800 p-10 text-center text-white">
             <div className="flex justify-center mb-6">
               <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 animate-bounce">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
               </div>
             </div>
             <h2 className="text-4xl font-black mb-2">تهانينا! تم القبول</h2>
             <p className="text-green-50 font-bold opacity-90 text-sm">أهلاً بك في عائلة القراطية، لقد تم اعتماد طلبك رسمياً</p>
          </div>
          
          <div className="p-10">
            <div className="flex justify-between items-center mb-10 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <div className="text-right">
                <span className="block text-[10px] text-gray-400 font-black mb-1 uppercase tracking-tighter">الرقم المرجعي</span>
                <span className="text-md font-black text-blue-900">#{currentUser.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-gray-400 font-black mb-1 uppercase tracking-tighter">تاريخ الاعتماد</span>
                <span className="text-md font-black text-gray-700">{date}</span>
              </div>
            </div>

            <div className="space-y-8 mb-10">
              <div className="flex items-center gap-5 text-right" dir="rtl">
                <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 font-black shrink-0 shadow-sm">1</div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-800 text-md">اجتياز المراجعة</h4>
                  <p className="text-xs text-gray-400 font-bold">تم التحقق من خلفية الحساب والبيانات المرفقة بنجاح</p>
                </div>
                <div className="text-green-500 scale-125"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg></div>
              </div>
              
              <div className="flex items-center gap-5 text-right border-r-4 border-blue-500 pr-5 mr-5" dir="rtl">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-blue-200">2</div>
                <div className="flex-1">
                  <h4 className="font-black text-blue-600 text-md">تنشيط الحساب والضريبة</h4>
                  <p className="text-xs text-gray-400 font-bold">بمجرد سداد الرسوم الإدارية، ستفتح لك لوحة المهام مباشرة</p>
                </div>
              </div>
            </div>

            {!application.isPaid ? (
              <div className="bg-gradient-to-b from-blue-50 to-white p-8 rounded-[2.5rem] border-2 border-blue-100 text-center shadow-inner">
                <span className="text-[11px] text-blue-500 font-black uppercase tracking-[0.2em] mb-3 block">رسوم التنشيط الإدارية</span>
                <div className="text-6xl font-black text-blue-900 mb-8 drop-shadow-sm font-mono">${taxAmount.toLocaleString()}</div>
                
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 font-black text-xs rounded-2xl border border-red-100">{error}</div>}
                
                {!showConfirm ? (
                  <button onClick={() => setShowConfirm(true)} disabled={taxAmount <= 0} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl text-xl active:scale-95 shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1">تفعيل العضوية الآن</button>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={handleExecutePayment} disabled={loading} className="flex-[2] bg-green-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-all">تأكيد وسداد</button>
                    <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 text-gray-500 font-black py-5 rounded-2xl hover:bg-gray-200 transition-all">إلغاء</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-8 py-4 rounded-full font-black text-sm border border-green-100 shadow-sm animate-pulse">
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                   تم السداد بنجاح، نعد لك لوحة التحكم...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Rejected View ---
  if (status === 'rejected' || status === 'reject') {
    return (
      <div className="max-w-xl mx-auto mt-20 animate-fade-in px-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-red-50 overflow-hidden text-right" dir="rtl">
          <div className="bg-red-50 p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-[2rem] flex items-center justify-center rotate-3 shadow-inner">
                 <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">عذراً، لم يتم قبول طلبك</h2>
            <p className="text-gray-500 text-md font-bold leading-relaxed px-4">بعد مراجعة طلبك رقم <span className="text-red-600 font-black">#{currentUser.id.slice(-6)}</span> بدقة، نأسف لإبلاغك بأن بياناتك لا تتوافق مع متطلباتنا الحالية.</p>
          </div>
          <div className="p-10 flex flex-col items-center bg-white">
            <div className="bg-gray-50 px-6 py-3 rounded-full text-[11px] text-gray-400 font-black mb-8 border border-gray-100 uppercase">صدر هذا القرار بتاريخ: {date}</div>
            <button onClick={() => window.location.reload()} className="w-full bg-gray-900 text-white px-8 py-5 rounded-[2rem] font-black text-lg active:scale-95 transition-all shadow-xl shadow-gray-200">العودة للرئيسية</button>
            <p className="mt-6 text-[10px] text-gray-300 font-black italic">يمكنك المحاولة مرة أخرى بعد 30 يوماً</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Blocked View ---
  if (status === 'blocked' || status === 'block') {
    return (
      <div className="max-w-xl mx-auto mt-20 animate-fade-in px-4">
        <div className="bg-[#1e293b] rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-4 border-red-900/30 overflow-visible">
          <div className="p-16 text-center">
             <div className="flex justify-center mb-10 relative">
               <div className="absolute inset-0 bg-red-600 blur-[45px] opacity-20 animate-pulse rounded-full"></div>
               {/* إصلاح: التأكد من التوسط المثالي وإلغاء أي قص */}
               <div className="relative w-28 h-28 bg-gradient-to-tr from-red-600 to-red-900 rounded-[2rem] flex items-center justify-center border-2 border-red-500/50 shadow-2xl z-10 overflow-visible">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                  </svg>
               </div>
             </div>
             <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">حساب محظور</h2>
             <p className="text-red-400 text-sm font-black mb-10 leading-relaxed uppercase tracking-widest opacity-80">ACCESS DENIED - POLICY VIOLATION</p>
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-xs font-bold leading-relaxed mb-4">لقد تم رصد نشاط مخالف للقواعد الصارمة لمنصة القراطية، مما أدى لتعطيل وصولك نهائياً.</p>
                <div className="inline-block text-[10px] text-red-500 font-black bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">SECURITY CODE: BLCK_09X</div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Pending View (Default) ---
  return (
    <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-gray-100 mt-10 animate-fade-in relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-40"></div>
      <div className="flex justify-center mb-8 relative">
         <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center relative shadow-inner overflow-visible">
            <span className="absolute inset-0 bg-blue-400 rounded-[2rem] animate-ping opacity-10"></span>
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
         </div>
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4">طلبك تحت المجهر</h2>
      <p className="text-gray-400 mb-10 text-sm font-bold leading-relaxed max-w-xs mx-auto italic">نحن حالياً في مرحلة "التدقيق العميق" لبياناتك. يستغرق الأمر عادةً من 12 إلى 24 ساعة.</p>
      <div className="bg-blue-900 text-white rounded-3xl p-6 shadow-xl shadow-blue-100 flex justify-between items-center text-right" dir="rtl">
         <div className="flex flex-col">
           <span className="text-[9px] text-blue-300 font-black uppercase tracking-widest">المرحلة الحالية</span>
           <span className="text-md font-black">انتظار المراجعة الإدارية</span>
         </div>
         <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         </div>
      </div>
    </div>
  );
};

const OrdersDashboard = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [customerNumber, setCustomerNumber] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoDeleteSeconds, setAutoDeleteSeconds] = useState('0');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editDetails, setEditDetails] = useState('');
  const [confirmPaymentId, setConfirmPaymentId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    const ordersRef = ref(db, `orders/${currentUser.id}`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setOrders(list.sort((a, b) => b.createdAt - a.createdAt));
      } else setOrders([]);
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  useEffect(() => {
    orders.forEach(order => { if (order.expiryAt && now >= order.expiryAt) handleDeleteOrder(order.id); });
  }, [now, orders]);

  const handleCreateOrder = async () => {
    if (!customerNumber || !details || !price) { alert('يرجى ملء كافة الحقول لإتمام الطلب'); return; }
    setLoading(true);
    try {
      const createdAt = Date.now();
      const seconds = parseInt(autoDeleteSeconds);
      const expiryAt = (!isNaN(seconds) && seconds > 0) ? createdAt + (seconds * 1000) : null;
      await push(ref(db, `orders/${currentUser.id}`), { 
        customerNumber: String(customerNumber), 
        details: String(details), 
        price: Number(price), 
        authorName: currentUser.name, 
        createdAt, 
        expiryAt 
      });
      setCustomerNumber(''); setDetails(''); setPrice(''); setAutoDeleteSeconds('0'); setShowCreateForm(false);
    } catch (e) {
      alert('خطأ في الاتصال بالفايربيس');
    } finally { setLoading(false); }
  };

  const handleDeleteOrder = async (orderId) => {
    await remove(ref(db, `orders/${currentUser.id}/${orderId}`));
  };

  const handleExecutePayment = async (order) => {
    if (currentUser.money < order.price) { alert('رصيدك لا يكفي لدفع هذا الطلب'); setConfirmPaymentId(null); return; }
    try {
      const updates = {};
      updates[`users/${currentUser.id}/money`] = currentUser.money - order.price;
      updates[`orders/${currentUser.id}/${order.id}`] = null;
      await update(ref(db), updates);
      setConfirmPaymentId(null);
    } catch (e) {
      alert('فشل الدفع');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-2 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-sm font-black text-gray-800 flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            الطلبات المتاحة
          </h2>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className={`${showCreateForm ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'} font-black px-5 py-2 rounded-2xl text-[11px] transition-all active:scale-95 shadow-lg`}>
            {showCreateForm ? 'إلغاء' : '+ طلب جديد'}
          </button>
        </div>
        
        {showCreateForm && (
          <div className="p-6 bg-gray-50 border-b animate-fade-in">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="text" className="px-4 py-3 border-2 border-transparent focus:border-blue-500 rounded-xl text-[11px] font-black outline-none shadow-sm" placeholder="رقم الزبون" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} />
              <input type="number" className="px-4 py-3 border-2 border-transparent focus:border-blue-500 rounded-xl text-[11px] font-black outline-none shadow-sm" placeholder="السعر $" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <textarea className="w-full px-4 py-3 border-2 border-transparent focus:border-blue-500 rounded-xl text-[11px] font-black mb-3 outline-none shadow-sm resize-none" rows={3} placeholder="اكتب تفاصيل الطلب هنا..." value={details} onChange={(e) => setDetails(e.target.value)} />
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input type="number" className="w-full px-4 py-3 border-2 border-transparent focus:border-blue-500 rounded-xl text-[11px] font-black outline-none shadow-sm" placeholder="ثواني الحذف" value={autoDeleteSeconds} onChange={(e) => setAutoDeleteSeconds(e.target.value)} />
              </div>
              <button onClick={handleCreateOrder} disabled={loading} className="flex-[2] bg-green-600 text-white font-black py-3 rounded-xl text-[11px] hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                {loading ? 'جاري الإضافة...' : 'إضافة للوحة'}
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100 max-h-[65vh] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <p className="text-gray-300 font-black text-[11px] uppercase tracking-widest">لا توجد طلبات نشطة</p>
            </div>
          ) : 
            orders.map(order => {
              const remaining = order.expiryAt ? Math.max(0, Math.floor((order.expiryAt - now) / 1000)) : null;
              return (
                <div key={order.id} className="p-5 hover:bg-blue-50/30 transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0 text-right" dir="rtl">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="font-black text-gray-900 text-sm">{order.customerNumber}</span>
                        <span className="text-[10px] text-green-700 font-black bg-green-100 px-2 py-0.5 rounded-lg border border-green-200 shadow-sm">${order.price}</span>
                        {remaining !== null && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${remaining < 10 ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {remaining}ث
                          </span>
                        )}
                      </div>
                      {editingOrderId === order.id ? (
                        <div className="my-2 flex flex-col gap-2">
                          <textarea className="w-full p-3 border-2 border-blue-500 rounded-xl text-[11px] font-bold outline-none" value={editDetails} onChange={(e) => setEditDetails(e.target.value)} />
                          <div className="flex gap-2">
                            <button onClick={async () => { await update(ref(db, `orders/${currentUser.id}/${order.id}`), { details: editDetails }); setEditingOrderId(null); }} className="text-[9px] bg-blue-600 text-white px-4 py-1.5 rounded-lg font-black shadow-lg shadow-blue-100">حفظ</button>
                            <button onClick={() => setEditingOrderId(null)} className="text-[9px] bg-gray-100 text-gray-400 px-4 py-1.5 rounded-lg font-black">إلغاء</button>
                          </div>
                        </div>
                      ) : <p className="text-gray-500 text-[11px] mb-2 leading-relaxed font-bold break-words">{order.details}</p>}
                      <div className="text-[9px] text-gray-300 font-black flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        الناشر: {order.authorName}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingOrderId(order.id); setEditDetails(order.details); }} className="p-2 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteOrder(order.id)} className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      {confirmPaymentId === order.id ? (
                        <div className="flex gap-2 animate-fade-in">
                          <button onClick={() => handleExecutePayment(order)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-green-100">تأكيد</button>
                          <button onClick={() => setConfirmPaymentId(null)} className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black">X</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmPaymentId(order.id)} className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          دفع الطلب
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      const appRef = ref(db, `applications/${currentUser.id}`);
      const userRef = ref(db, `users/${currentUser.id}`);
      const unsubApp = onValue(appRef, (snap) => setApplication(snap.exists() ? snap.val() : null));
      const unsubUser = onValue(userRef, (snap) => {
        if (snap.exists()) {
          const updatedUser = snap.val();
          setCurrentUser(prev => ({ ...prev, ...updatedUser }));
        }
      });
      return () => { unsubApp(); unsubUser(); };
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const savedId = localStorage.getItem('userId');
    if (savedId) {
      get(child(ref(db), `users/${savedId}`)).then(snap => {
        if (snap.exists()) setCurrentUser({ ...snap.val(), id: savedId });
        setLoading(false);
      });
    } else setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 gap-4 bg-gray-50">
       <div className="relative">
         <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
       </div>
       <span className="font-black text-[10px] uppercase tracking-[0.3em] text-blue-600 animate-pulse">Initializing System</span>
    </div>
  );

  if (!currentUser) return <div className="min-h-screen bg-gray-50 p-4"><Login onLogin={setCurrentUser} /></div>;

  const isApproved = ['accepted', 'approved'].includes((application?.status || '').toLowerCase());
  const hasAccess = isApproved && application?.isPaid;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-tajawal">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-black text-gray-900 tracking-tighter">منصة <span className="text-blue-600">القراطية</span></h1>
        <div className="flex items-center gap-8">
          <div className="text-right border-r pr-6 border-gray-100">
            <div className="text-[9px] text-gray-400 font-black uppercase tracking-wider mb-0.5">رصيد الحساب</div>
            <div className="text-xl font-black text-blue-700 font-mono">${currentUser.money?.toLocaleString()}</div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('userId'); setCurrentUser(null); setApplication(null); }} 
            className="bg-red-50 text-red-500 px-5 py-2.5 rounded-2xl text-[11px] font-black hover:bg-red-100 transition-all active:scale-95 border border-red-100"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-10">
        {!application ? (
          <SubmissionForm currentUser={currentUser} />
        ) : hasAccess ? (
          <OrdersDashboard currentUser={currentUser} />
        ) : (
          <ApplicationStatus application={application} currentUser={currentUser} />
        )}
      </main>
      <footer className="py-12 text-center">
        <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] mb-2">Al-Qiratiya Platform</div>
        <div className="text-[9px] text-gray-200 font-medium">جميع الحقوق محفوظة &copy; 2024 • النسخة التجريبية 3.2.0</div>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
