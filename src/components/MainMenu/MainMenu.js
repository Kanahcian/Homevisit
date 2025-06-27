import React, { useState, useEffect } from 'react';
import './MainMenu.css';

const MainMenu = ({ onSectionSelect, onBackToMap, activeSection, isFullScreen, isAdmin, onAdminLogin, onAdminLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [expandedItems, setExpandedItems] = useState(['faq']); // 預設展開家訪大哉問
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // 登入相關狀態
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // 監聽窗口尺寸變化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 主選單項目 - 根據管理員狀態顯示不同項目
  const getMenuItems = () => {
    const basicItems = [
      { id: 'dedication', label: '獻給' },
      { id: 'origin', label: '緣起' },
      { id: 'intro', label: '序言' },
      { id: 'contacts', label: '通訊錄' },
      { id: 'students', label: '學生名單' },
      { id: 'faq', label: '家訪大哉問', hasChildren: true }
    ];
    
    if (isAdmin) {
      // 管理員專用項目（目前先保持與一般用戶相同）
      return [
        ...basicItems,
        // { id: 'admin-panel', label: '🔧 管理員面板', isAdminOnly: true }
      ];
    }
    
    return basicItems;
  };
  
  // 家訪大哉問子項目
  const faqSubItems = [
    { id: 'faq-0', label: '起源' },
    { id: 'faq-1', label: '我們為什麼要家訪？' },
    { id: 'faq-2', label: '家訪可以聊些什麼？' },
    { id: 'faq-3', label: '怎麼面對尬聊的感覺？' },
    { id: 'faq-4', label: '怕問到重複的問題？' },
    { id: 'faq-5', label: '遇到健談的村民怎麼辦？' },
    { id: 'faq-6', label: '家幅員比較遼闊怎麼辦？' }
  ];
  
  // 監聽點擊事件以關閉選單 (僅在移動設備上)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMenuOpen && !event.target.closest('.side-menu') && !event.target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isMobile]);
  
  // 切換選單開關
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // 選擇選單項目
  const selectMenuItem = (itemId, hasChildren) => {
    if (hasChildren) {
      // 如果項目有子項目，則切換展開/收起狀態 (但現在家訪大哉問預設始終展開)
      // 為了兼容性，保留這個函數但不實際改變狀態
    } else {
      // 如果是普通項目，設置活動部分
      onSectionSelect(itemId);
      
      // 只在移動設備上關閉選單
      if (isMobile) {
        setIsMenuOpen(false);
      }
    }
  };
  
  // 選擇子選單項目
  const selectSubMenuItem = (itemId, e) => {
    if (e) e.stopPropagation();
    onSectionSelect(itemId);
    
    // 只在移動設備上關閉選單
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // 處理登入
  const handleLogin = () => {
    if (loginPassword === 'Kana') {
      onAdminLogin(true);
      setShowLoginModal(false);
      setLoginPassword('');
      setLoginError('');
      // 關閉選單 (在移動設備上)
      if (isMobile) {
        setIsMenuOpen(false);
      }
    } else {
      setLoginError('密碼錯誤');
    }
  };

  // 處理登出
  const handleLogout = () => {
    onAdminLogout();
    // 關閉選單 (在移動設備上)
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // 關閉登入模態框
  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginPassword('');
    setLoginError('');
  };

  // 處理鍵盤事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  
  // 根據全屏模式渲染不同內容
  if (isFullScreen) {
    return (
      <div className="content-section visible">
        <div className="content-header">
          <button className="back-button" onClick={onBackToMap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回地圖
          </button>
        </div>
        
        <h1 className="content-title">
          {activeSection === 'dedication' ? '獻給' :
           activeSection === 'origin' ? '緣起' :
           activeSection === 'intro' ? '序言' :
           activeSection === 'contacts' ? '通訊錄' :
           activeSection === 'students' ? '學生名單' :
           activeSection === 'faq' ? '家訪大哉問' :
          //  activeSection === 'admin-panel' ? '管理員面板' :
           activeSection.startsWith('faq-') ? `家訪大哉問 - ${faqSubItems.find(item => item.id === activeSection)?.label}` :
           ''}
        </h1>
        
        <div className="content-body">
          

          {activeSection === 'dedication' && (
            <div>
                <p style={{textAlign: 'center', fontSize: '18px', marginBottom: '20px'}}>
                每一位曾經在加拿留下足跡的人們
                </p>
                <div style={{display: 'flex', justifyContent: 'center', margin: '30px 0'}}>
                {/* <div style={{width: '60px', height: '20px', borderTop: '2px solid #ddd', borderBottom: '2px solid #ddd', borderRadius: '10px'}}></div> */}
                </div>
                <div style={{display: 'flex', justifyContent: 'center', margin: '30px 0'}}>
                <img 
                    src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} 
                    alt="獻給" 
                    style={{width: '30%', maxWidth: '300px', display: 'block'}} 
                />
                </div>
            </div>
          )}
          
          {activeSection === 'origin' && (
            <div>
              <p>會想要做人物誌，一開始是和諺倫聊到有關家訪資料的使用與轉型，便蹦出了「如果我們能將和村民互動的故事寫下來呢?」的點子。</p>
              <br/>
              <p>即使對現在的我而言，當我聽到像諺倫在說他跟天佑爸爸聊天的内容，子崴在講他跟王媽媽互動的趣事，都會覺得好有趣或是好想認識他們，那更何況是對沒上山過幾次的新舊生而言？或許，或許，當他們在閱讀這些故事的時候，就不會對家訪這件事感到排斥，甚至對此產生了一些興趣和響往。</p>
              <br/>
              <p>這麽說可能比較成果導向，但當我最近重新思考了這件事的目的時，突然就覺得，其實「這些故事」本身就是很有意義的事情。擔憂、感動、溫暖、哈哈大笑，那些與村民相處時彼此交會互放的光芒，都好珍貴，很值得被記錄下來。</p>
              <br/>
              <p>這些就是所謂「羈絆」的具象輪廓吧！或許已經離開，或許總有一天會離開，但也因為這些文字，動人的過去就得以延續，好像永遠都不曾流逝了。</p>
            </div>
          )}

          {activeSection === 'intro' && (
            <div>
              <p>我們家是最晚復家的一村,五十年前的服務時長也不比其他三家,村民對我們的臉孔是陌生的,「家訪」對我們家而言絕非理所當然。然而什麼事情都有起頭,一如同一開始的老骨頭,走到部落裡頭拜訪,隨著時間的演進,村民逐漸知道我們是誰,習慣了每年寒暑假,總有一群身穿橘色衣服的大學生會回家。</p>
              <br/>
              <p>家訪的過程伴隨著家訪資料的紀錄,而家訪紀錄終將彙整。我們家的家訪資料,源於諺倫自17夏開始所做的整理,諺倫參考了利稻、霧鹿的家訪資料,幾乎是獨自用了一個Excel檔整理了各家庭各期、學校、村落行事層、重要村民等資料,甚至畫了三社區以及全村的地圖(给有興趣的人:https://reurl.cc/V0gYKY) 後來 22冬的老骨頭會議有感於家訪資料的傳承問題與利用性,文軒、姵廷和謹榕將家訪資料做了重新的改版,也就是現在這本資料庫的雛形。</p>
              <br/>
              <p>家訪資料除了了解話題禁忌、辨認家庭位置、快速知曉家庭背景、村晚借器材詢問對象的基本功能以外,對我而言,家訪資料彷彿是一個又一個碎片化、帶有歷程性的故事。在閱讀的過程中,你能夠間接看到所謂「五十年羈絆」的具體輪廓、早先一步踏進加拿的人們和部落互動的種種,哪一個阿嬷和我們慢慢變熟,哪一個孩子長大了,歷史的痕跡穿插在文字的夾縫中,細細品味,會有許多意想不到的喜悅和感動。</p>
              <br/>
              <p>感謝諺倫，感謝文軒、姵廷、謹榕和允齊,感謝各期的家訪長、往後協助編輯的偉大人們,以及在支離破碎的家訪紀錄中曾經幫忙回憶、拼湊記憶的骨頭,因為有你們才能完成這本屬於我們家的資料庫,也願閱讀至此的人們,能夠在家訪資料中得到滿滿的收獲。</p>
            </div>
          )}
          
          {activeSection === 'contacts' && (
            <div>
              {/* <h3 style={{marginBottom: '15px'}}>重要村民通訊錄</h3> */}
              <div style={{overflowX: 'auto'}}>

                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                <thead>
                    <tr style={{backgroundColor: '#f7f7f7'}}>
                    <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center'}}>地區</th>
                    <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>人物</th>
                    <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>聯絡資訊</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 加平區域 */}
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold'}} rowSpan="6">加平</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>黃國雄前村長</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0928-441-418</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>億凱、憫情、憫萱爸爸</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0900-796-802</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>飛倞、悅慈、芷萍爸爸</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0932-239-370<br/>LINE「飛倞爸爸」</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>江子榮長老</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0937-391-334</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>馬樂可頭目</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0928-788-361</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>田興國長老</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0919-759-013</td>
                    </tr>
                    
                    {/* 加和區域 */}
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold'}} rowSpan="5">加和</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>王秋月長老/王媽媽/江聰明太太</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0919-611-510</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>江聰明</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0928-703-984</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>文健站 邱珠妹/邱大姊</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0977-060-617</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>邱晨欣/晨妤/晨蓁家</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 089-810708</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>王國慶村長</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0928-026-575</td>
                    </tr>
                    
                    {/* 加樂區域 */}
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold'}} rowSpan="3">加樂</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>江新武長老</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0937-579-080<br/>LINE - 江老師</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>哲遜、哲慶舅舅/鄰長</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>臉書 - 余信安</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>余利亞理事長</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0975-857-901</td>
                    </tr>

                    {/* 菜販 */}
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold'}} rowSpan="1">菜販</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}> </td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>LINE - 林玉蓉財源豐</td>
                    </tr>

                    {/* 計程車 */}
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold'}} rowSpan="3">計程車</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>黃彥彰/兒子</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0910-980-118</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>黃金塗/爸爸</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0933-371-619</td>
                    </tr>
                    <tr>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>小鳳姐</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>電話 0984-099-726</td>
                    </tr>
                </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeSection === 'students' && (
            <div>
              <h2 style={{textAlign: 'center', marginBottom: '20px'}}>學生名單</h2>
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px', margin: '0 auto', tableLayout: 'fixed'}}>
                  <colgroup>
                    <col style={{width: '16.66%'}} />
                    <col style={{width: '16.66%'}} />
                    <col style={{width: '16.66%'}} />
                    <col style={{width: '16.66%'}} />
                    <col style={{width: '16.66%'}} />
                    <col style={{width: '16.66%'}} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>大一</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱宗平</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王威翔</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王芯卉</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱嘉柔</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江晏均</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>高三</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡雨潔</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡奕萱</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡家源</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡紘維</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱慈軒</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', rowSpan: 2}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>黃皓均</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江采融</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>黃金昀</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>高二</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>張俊凱</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>余哲遜</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱欣宜</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱恩賜</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江添敏</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', rowSpan: 2}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡軍</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡惟伶</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>韓唯希</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>高一</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>余哲慶</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡翰翔</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王義群</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>余佳銘</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>蘿莎・阿道</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>國三</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王榮恩</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>余斯帖</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡以辰</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王冠宇</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>國二</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>包振佑</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>黃珮瑄</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱瀚傑</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡冠宏</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱晨欣</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', rowSpan: 2}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>黃詩恩</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>奧思汀・阿道</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江愉柔</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡育秀</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>國一</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>黃語恩</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡薰</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>包振毅</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱志輝</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱飛倞</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', rowSpan: 2}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱億凱</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>余宗德</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王廷睿</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>小六</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱晨好</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江天佑</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江炫峯</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>張昕冉</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱瀚祥</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', rowSpan: 2}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>韓唯甯</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>小五</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱志宏</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>林芯蕾</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱悅慈</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江語婕</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>小四</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王涵</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱晨蓁</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>王品云</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>甲苡潔</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡家成</td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', rowSpan: 2}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>林浩宇</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>露德・阿道</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>古喬恩</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>小三</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱憫情</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱芷苹</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>陳于婕</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>小二</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱浩軒</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡王文</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江其峯</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold'}}>小一</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>江曉瑛</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>邱憫瑄</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>胡志偉</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>林嘉程</td>
                      <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>田諾祥</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeSection === 'faq' && (
            <div>
              <h3 style={{marginBottom: '15px'}}>家訪常見問題</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                {faqSubItems.map(item => (
                  <li 
                    key={item.id}
                    style={{
                      marginBottom: '12px', 
                      padding: '12px', 
                      backgroundColor: '#f7f7f7', 
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => selectSubMenuItem(item.id)}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeSection === 'faq-0' && (
            <div>
              <ul style={{paddingLeft: '20px'}}>
                <p>這份檔案源自於21冬教案組,是針對新舊生提出有關家訪的疑惑后,向老骨頭蒐集來的完整版回饋。這裡面的問題有些是實用性的,會很清楚的說明什么該做、什么是禁忌,有些則是上山前懵懵懂懂,一直要到上了山,甚至是很多期之後,才會知道「原來那是什么意思」的疑問。家訪的過程中,心中可能會產生很多的為什么,在獨自探尋之時,不妨可以先看看前人怎么說,或許會有意想不到的體會!</p>

                <br/>
                <p>特此感謝給予建議的老骨頭:加拿最吝嗇、許巧臻、陳盈臻、宋家熙、侯庭凱、林律綺、周亞蓁、陳忠峻、張瑞舫、王子維。(按家别排序)</p>
              </ul>
            </div>
          )}
          {activeSection === 'faq-1' && (
            <div>
              <h3 style={{marginBottom: '15px'}}>我們為什麼要家訪？家訪的目的是甚麼？</h3>
              <ul style={{paddingLeft: '20px'}}>
                <li style={{marginBottom: '10px'}}>走進村子裡，聽聽部落的聲音，我們帶來的真的是他們需要的嗎？認識一些當地的文化，名字、禁忌、故事，了解更多之後，你會更喜歡這個地方</li>
                <li style={{marginBottom: '10px'}}>可以以說家訪是山服的基礎,如果不透過家訪,我們要怎么跟孩子們的家長之間建立信任的關係?要怎麼說服孩子們的家長把他們交給我們一兩個禮拜?大家可以想想看,今天有一群陌生人就這樣走進你的社區裡面說要幫你帶小孩,你會不會有點怪怪的感覺?所以為什么家訪很重要,相信你們都猜得到了</li>
                <li style={{marginBottom: '10px'}}>只為小孩和營隊活動的服務隊是無法長久的，孩子們會長大會離開，甚至可能只記得童年有一群台大的哥哥姐姐來過，有時候連結就這麼斷了</li>
                <li style={{marginBottom: '10px'}}>為了要讓村民認同我們,要不然我們去的時候就只有小朋友知道我們,不利於長期服務</li>
                <li style={{marginBottom: '10px'}}>1.了解布農的日常文化,生活哲理自己受益益良多。2.了解小朋友的成長背景。對帶領小朋友很有幫助。3.他們真的很單純可愛呀</li>
                <li style={{marginBottom: '10px'}}>我覺得家訪是一件很自然的事情,就像來到別人的家,就要跟每個家庭成員打招呼,培養情感帳戶,往後有事情也可以互相照應</li>
                <li style={{marginBottom: '10px'}}>就是建立和村民的感情,加深和部落的連結</li>
              </ul>
            </div>
          )}
          {activeSection === 'faq-2' && (
            <div>
              <h3 style={{marginBottom: '15px'}}>家訪可以聊些什麼?怎麼樣延續話題?聊到尷尬怎麼辦?</h3>
              <ul style={{paddingLeft: '20px'}}>
                <li style={{marginBottom: '10px'}}>天氣啊小孩子的話題啊，你跟朋友怎麼聊天就怎麼跟村民聊，講講自己在學校發生的蠢事也不錯吧。 關於延續話題同上，請放鬆，請自然，請不要自己覺得尷尬，也請大家有好的默契去互相cover一下多少都會有沒話題的時候吧。（不要覺得自己是新生或是什麼一期就是就在旁邊觀察很乖閉嘴巴，老舊生家長老骨頭就是這樣被累死的，觀察是要你們看什麼時候可以幫忙接個話題，附和一下也好拜託，替家訪的頭頭們拜託你們了）</li>
                <li style={{marginBottom: '10px'}}>農作物，或是有些村民家會有木雕或是打獵的器具等，也可以問最近村內有什麼重要活動等，也可以聊小朋友等。內容的延續可以從村民的話題中找可以聊的點，例如如果是聊到農作物的東西也可以講說地在哪裡，耕種期，拿去哪賣之類的</li>
                <li style={{marginBottom: '10px'}}>聊他今天做了什麼、農作物收成、銷售管道、來偷吃的可惡動物、天氣雨水、天涼了會怎麼應對</li>
                <li style={{marginBottom: '10px'}}>可以聊他家小孩、長大了/有時候還是很調皮、跟兄弟姊妹/同學的相處、在家會做什麼事</li>
                <li style={{marginBottom: '10px'}}>可以聊部落變化（例如以前霧鹿有巫醫）、以前的不方便生活（道路阻且長）</li>
                <li style={{marginBottom: '10px'}}>可以聊布農相關的，打獵禁忌和趣聞、布農語學習</li>
                <li style={{marginBottom: '10px'}}>前面把話題稍為分類了，就可以在同一個話題上小轉換，不至於完全斷掉</li>
                <li style={{marginBottom: '10px'}}>尷尬時先擠出燦笑，然後對同組老屁股投以求救眼神，說不定真的可以換個話題了阿</li>
                <li style={{marginBottom: '10px'}}>聊農作物、收成怎麼樣、好不好賣等等聊工作、對他們說聲辛苦了有些家訪的對象不是小朋友的親人，也可以稍微聊一下家裡有哪些人（但千萬不要打破砂鍋問到底最後問出傷心往事）聊到尷尬的時候趕快環視四周觀察有沒有什麼特別的東西可以當作話題（例如獎盃、家族照等等）</li>
                <li style={{marginBottom: '10px'}}>比較好上手的是小孩家長，聊小孩在學校的情形，也可以和家長聊他平時上課的狀況，會有一些共鳴或可以討論的地方。 如果是家裡沒有小孩的村民，可以從這個村民的家中擺設（可能有獸骨、紡織品）、或他自身的事（例如他是農夫，或是居家照護員，也有可能是背工，或以前曾是運動員...）來做切入聊天 以上是順利的狀況，真的遇到尷尬、尬聊的時候，適當結束就好，不然是在浪費彼此時間，但記得最後要講重要的事（例如對小孩家長可以說明營隊事項、對一般村民可以宣傳活動和晚會）然後，要自我介紹！（介紹布農名的話很棒）至少想辦法讓他對你有點印象</li>
                <li style={{marginBottom: '10px'}}>如果是去有小孩來我們營隊的家，可以和他們聊聊孩子，多講孩子們的好話，家長們可能也會和你們分享他們平常在家裡的狀況或一些有趣的事情。</li>
                <li style={{marginBottom: '10px'}}>問問他們最近在忙什麼 ? 有沒有去打獵 ? 或是在種菜 ? 或是針對他們的工作去關心。</li>
                <li style={{marginBottom: '10px'}}>觀察一下去家訪那家家裡的環境，可能會看到一些木材、動物骨頭、正在處理菜葉等等，都可以從這些他們生活上常見的東西問起，而這可能也是你所好奇的。（搞不好還能蹭到飯）</li>
                <li style={{marginBottom: '10px'}}>有小孩的話可以從小孩的狀況聊起，也可以問問工作及一些生活日常，有時家中的擺飾，如：獎盃、動物骨頭都可以作為話題的延伸，說實在很難有一定的公式能夠套用，畢竟與村民聊天還要套公式感覺就公事公辦，很難拉近距離。</li>
              </ul>
            </div>
          )}
          {activeSection === 'faq-3' && (
            <div>
              <h3 style={{marginBottom: '15px'}}>怎麼心理上調適或實質面對「尬聊、硬要找話題的感覺」</h3>
              <ul style={{paddingLeft: '20px'}}>
                <li style={{marginBottom: '10px'}}>實質面對：我試過一個方法給大家參考，真的很尬的時候：「大哥/大姐，拍謝啦，感覺我們這樣一直在打擾你，但我們知道自己跟這個部落還沒那麼熟，所以每天晚上才會出來走走，找大家聊聊，希望能更認識一點。」直接把你的心理話（覺得很尬、怕打擾）/家訪的目的（熟悉部落、建立連結）講出來，通常可以得到一些善意的回饋。</li>
                <li style={{marginBottom: '10px'}}>我覺得不要將家訪當作是一個任務在完成，我知道前幾期很容易有這樣的想法，覺得玩小孩是件快樂的事情，但到後期你會發現小朋友會喜新厭舊，會對新老師比較感興趣，但村民不會，村民會一直記得你是誰，在家訪的過程中就像是去拜訪或是認識新朋友，當你抱持著想要去深入了解一個人或是很想交一個朋友的時候，就不會覺得像是尬聊。而且當你的家人在家訪回來後告訴你說哪個村民記得你的時候，你會覺得很溫暖而且感覺到被關心，這是在山下或是在台北很難做到的</li>
                <li style={{marginBottom: '10px'}}>會這樣的話可能是本身對布農日常與文化還沒有太大興趣，所以會不知道說什麼。有兩個想法可以走，一是以村民為出發點，思考他們會想跟我們分享什麼 （布農傳說、個人過去工作、生活哲理） ? 二是從自己出發，問自己真心好奇什麼 ?（比如一直聽到他們叫吉娜XX，就可以問這是什麼意思 ?） 一開始通常都會有心裡尷尬問題，很正常，可是要設法解決，去嘗試。當真的開始記起一些村民，被一些村民記起，就會變成問候朋友近況的自然心態了。</li>
                <li style={{marginBottom: '10px'}}>事實上就是你最好趕快適應不然你不適合家訪。（比較利益嘛在家內還有很多事情可以做又不只家訪）如果真的要我說的話這就像上班一樣（原諒老人在上班只好這樣舉例抱歉ㄛ），多多少少會覺得累，但會選擇這一行你起碼是對他有點興趣（噢或是錢），在山服也是啊，你就是喜歡這個地方不然你幹嘛留下來，（可以退團啊），當然多少都會有你願意留下來的理由吧，想著那些理由再去聊天（不要稱之為尬聊你越這樣想就會覺得自己越尷尬拜託），你也許會覺得比較好一些。另外就是不要覺得自己的問題很蠢很呆很笨然後就不敢問，麻煩大家家訪的時候放下自己來自第一學府的高自尊可嗎拜託，啊不懂就要問不熟就多講話就可以變熟，你什麼都不做最後家訪時間很快就過了，到最後才在後悔自己又沒好好家訪，厚臉皮是家訪的第一準則到底要我講幾遍。（老骨頭很兇抱歉ㄛ但我甚至不是老骨頭ㄟ，講幾次家訪就要講幾次要厚臉皮，骨灰心也是會累，嘴巴累手也累）</li>
                <li style={{marginBottom: '10px'}}>其實想不到話題也沒關係，片刻的安靜是很常見的，只要能夠展現出好奇心，村民都不會對你感到排斥的，很多時候村民也會自己想話題～ 也不要怕自己問了什麼笨問題而感到沒自信，你會想問的其他人也會想問，有時候多問了一句就會意外開啟村民的開關XD 當然，聊天到最後一定會彈性疲乏，當你覺得差不多的時候，千萬不要硬聊，趕快貼心地問村民是否要回去吃飯或洗澡了XD</li>
                <li style={{marginBottom: '10px'}}>其實尬聊還蠻常發生的XD 有時候就真的很尬ㄚ 但你就是以一個認識新朋友的角度去看待吧，你去一個環境認識要認識新朋友不也是很尬開始的嗎，看看你跟坐在你旁邊的人剛開始多硬要找話題現在還不是那麼好，跟山上的村民也是一樣的呀</li>
                <li style={{marginBottom: '10px'}}>無解😂 硬聊真的就真的可以結束了，繼續下去感受不會更好。當然前提是自己要能量滿滿，村民在忙可以寒暄幾句，說明天再來拜訪。</li>
                <li style={{marginBottom: '10px'}}>跟喜歡的女生聊天都會尷尬了更何況村民，但更村民尬聊久了雖然還是尷尬但能感覺出彼此間有漸漸親切的感覺，跟喜歡的女生還不一定..</li>
                <li style={{marginBottom: '10px'}}>尬聊是必定會碰到的狀況，新生在前幾次家訪時可以多聽聽家訪大致是怎麼進行，如何提問等等，到了舊生我認為要有點責任感，在家訪時尷尬時要扛起問問題的責任，絞盡腦汁想好ㄇ，既然村民願意坐下來聊天，只要問題不要過於奇怪，村民都是樂於回答的，不能總是仰賴老骨頭</li>
              </ul>
            </div>
          )}
          {activeSection === 'faq-4' && (
            <div>
              <h3 style={{marginBottom: '15px'}}>每次家訪都怕問到前幾天就問過的問題，該怎麼辦呢 ？</h3>
              <ul style={{paddingLeft: '20px'}}>
                <li style={{marginBottom: '10px'}}>不要怕，不是你問的沒問題，如果說真的被村民發現也可以說有聽家裡面誰誰誰說過，很想要仔細了解一下這些問題。 （PS到底有什麼好怕的人生的蠢事多這一件沒差好嗎）</li>
                <li style={{marginBottom: '10px'}}>所以晚上的家訪時間要仔細聽其他人的分享！！！然後家長排家訪人力的時候盡量要有一些重疊的（連兩天走同一區），出發前也可以先問前幾天走了哪幾家，大概聊了什麼</li>
                <li style={{marginBottom: '10px'}}>如果是跟別批家訪的人問到一樣的問題我是覺得沒關係啦，村民可能會笑笑說欸這個前幾天好像有問，但還是會很樂意跟你聊，那你們可能就聊完趕緊再開個新話題就好，也不用壓力那麼大XD</li>
                <li style={{marginBottom: '10px'}}>加拿一條路會通常有一個帶頭的，就帶頭的注意不要問太多重複的，真的沒話聊可以聊完小朋友狀況（可天天更新），就前往其他沒找過的村民家家訪</li>
              </ul>
            </div>
          )}
          {activeSection === 'faq-5' && (
            <div>
              <h3 style={{marginBottom: '15px'}}>遇到很健談的村民，超過預定時間該怎麼辦呢？</h3>
              <ul style={{paddingLeft: '20px'}}>
                <li style={{marginBottom: '10px'}}>首先，確認這個過程值不值得你超過預定時間（每個人的判斷標準不太一樣） 如果是，可以請旁邊的人回報說會晚回去，並告知場控理由（也要得到場控同意），且可以讓等等/隔天有要事的人先回去 如果不是，就說等等還有明天的課程要準備，要早點回去了（不要說什麼我們的家訪時間到6:30之類的尷尬話</li>
                <li style={{marginBottom: '10px'}}>遇到很健談的村民，恭喜你啊那是好事呢！超過預定的時間就先跟家長報備一下，然後到一個段落的時候暗示那個村民說我們要回去吃晚餐和開會。如果還是聊很嗨可以請老骨頭留下來繼續聊，這樣不耽誤自己後面的行程也不掃村民的興</li>
                <li style={{marginBottom: '10px'}}>實話實說說差不多要回去開會了，不然會被罵 不然就是假裝接到電話，給村民一個台階下 如果家內人力允許，個人覺得只留幾個老骨頭下來陪村民聊天也是不錯的方法</li>
              </ul>
            </div>
          )}
          {activeSection === 'faq-6' && (
            <div>
              <h3 style={{marginBottom: '15px'}}>我們家幅員比較遼闊，有太多的村民，這幾期的家訪很像蜻蜓點水，沒辦法很特定村民熟怎麼辦？</h3>
              <ul style={{paddingLeft: '20px'}}>
                <li style={{marginBottom: '10px'}}>加拿家就說加拿家ㄚXDDDD 我個人的建議：家訪時間專注在一個部落就會，甚至一兩個家就可以，不要覺得需要走很多家。 與其走馬看花，不如讓村民多認識我們在幹嘛。</li>
                <li style={{marginBottom: '10px'}}>其實家訪本來就是要靠時間去累積的，如果家太大有這種困擾，可能就是要訂個目標，每個人或幾個人可以想說這期要開發新的一到三個家庭深入，這樣如果有幸你們待了好幾期下來也熟了不少不是嗎 ? 可以選有小孩的家、爺爺奶奶看起來和善的家、外觀看起來富麗堂皇就是想進去看看的家等等。總之，只要有心想和那家熟，你們一定會變熟的，而我想村民也都很願意敞開心胸</li>
                <li style={{marginBottom: '10px'}}>是加拿家嗎XD！我先從我目前看到的問題開始說起，我覺得這幾期不像是蜻蜓點水，反而像是一直在安逸的舒適圈裏面，一直在特定幾家做家訪，像是億凱爸爸，長老家之類的，每次到一個地點舊生都會在送完小朋友後去一定的村民家，我覺得舊生可以勇敢地去找新村民，第一次被句點是很正常的，多去幾次村民家這個情況就會改善的，就像是當在路邊有TUTOR ABC要跟你做問卷，你不可能一開始就很熱情回應吧? 連你都做不到了你怎麼能反過來要求村民一開始便熱情回應你呢? 其實加拿家有很多好聊但是沒有小孩的村民。當你不知道要從哪個村民下手的時候，抓小朋友來問說哪個村民好聊，請小朋友帶路過去就行了！先多找幾個村民聊，過程中一定有幾個聊的很投機，就從那幾個開始深交吧</li>
                <li style={{marginBottom: '10px'}}>我覺得家內可以先訂好幾個要先攻略的重點人物，利用家訪以外的額外時間多多拜訪（上課時間可以讓閒暇的老骨頭出去套套交情），另外非上山時間的聯絡也是很重要的，建議趁上山期間可以要到村民的line，平時在山下逢年過節都可以聯絡感情</li>
                <li style={{marginBottom: '10px'}}>你們一定是加拿家...之前去的時候深深有感。有想過一個作法是盡量讓一部分團員多熟悉某個部落（加樂70%、加平20%、加和10%之類的）這做法有好有壞，看你們未來規劃啦～ 建議不用一次野心太大，可以設定每一次上山，能讓一兩位村民記得你就蠻不錯了</li>
                <li style={{marginBottom: '10px'}}>1. 主動跟家長表示想跟哪家熟，希望可以有較多機會去特定家。2. 專心記得其他組別的分享，下一次去的時候，就可以問更深入的問題。 3. 很重要！每次去一家都要自我介紹綽號和布農名，多講幾次就會被記住了</li>
                <li style={{marginBottom: '10px'}}>只有我們家這樣吧... 從第二期開始建議就專精一條路就好，等到都熟了或變老骨頭再去其他路看看。 另外，不用每次家訪都拜訪所有人，前幾天拜訪過的可以少說一點。 晚會期間也是很好跟村民交流的時候，要好好把握</li>
                <li style={{marginBottom: '10px'}}>其實我認為幅員遼闊是否會影響家訪的深入程度這點有待商榷，如果真的想要好好坐下來聊，一定可以做得到深入的對談，只是有的時候家訪常常伴隨著要宣傳活動才會導致必須在短時間內與多個家接觸，而無法好好聊天，想要和特定村民熟，努力把握拜訪的機會，想辦法在聊天時多多拋出話題，聊天過程順利停留的時間就會跟著延長，相信這樣應該可以改善家訪沾醬油的現象</li>
                <li style={{marginBottom: '10px'}}>小團體兩三個人固定去一家，這樣效果會更好，野心太大真的很難一期就訪完全部</li>
              </ul>
            </div>
          )}
          {/* 其他 FAQ 項目可以類似方式添加 */}
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* 菜單按鈕 */}
      <button 
        className="control-button menu-toggle"
        onClick={toggleMenu}
        aria-label="選單"
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {/* 覆蓋層 (僅在移動設備上顯示) */}
      {isMobile && (
        <div 
          className={`overlay ${isMenuOpen ? 'visible' : ''}`}
          onClick={toggleMenu}
        ></div>
      )}
      
      {/* 側邊選單 */}
      <aside className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2 className="menu-title">
            加拿家家訪地圖
            {isAdmin && <span className="admin-badge">管理員</span>}
          </h2>
          <button 
            className="close-button"
            onClick={toggleMenu}
            aria-label="關閉"
          >
            ×
          </button>
        </div>
        
        <nav className="menu-items">
          {getMenuItems().map(item => (
            <div className="menu-item" key={item.id}>
              {/* 家訪大哉問特殊處理 */}
              {item.hasChildren ? (
                <>
                  <button 
                    className={`menu-item-btn ${activeSection === item.id || activeSection.startsWith(`${item.id}-`) ? 'active' : ''}`}
                  >
                    {item.label}
                  </button>
                  
                  <div className="submenu expanded">
                    {faqSubItems.map(subItem => (
                      <button
                        key={subItem.id}
                        className={`submenu-item ${activeSection === subItem.id ? 'active' : ''}`}
                        onClick={(e) => selectSubMenuItem(subItem.id, e)}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button 
                  className={`menu-item-btn ${activeSection === item.id ? 'active' : ''} ${item.isAdminOnly ? 'admin-only' : ''}`}
                  onClick={() => selectMenuItem(item.id, false)}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
          
          {/* 管理員登入/登出按鈕 */}
          <div className="menu-item admin-section">
            {!isAdmin ? (
              <button 
                className="menu-item-btn admin-login-btn"
                onClick={() => setShowLoginModal(true)}
              >
                🔐 管理員登入
              </button>
            ) : (
              <button 
                className="menu-item-btn admin-logout-btn"
                onClick={handleLogout}
              >
                🚪 登出
              </button>
            )}
          </div>
        </nav>
      </aside>

      {/* 登入模態框 */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <h3>管理員登入</h3>
              <button 
                className="login-modal-close"
                onClick={closeLoginModal}
              >
                ×
              </button>
            </div>
            <div className="login-modal-body">
              <input
                type="password"
                placeholder="請輸入密碼"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="login-input"
                autoFocus
              />
              {loginError && (
                <div className="login-error">{loginError}</div>
              )}
            </div>
            <div className="login-modal-footer">
              <button 
                className="login-cancel-btn"
                onClick={closeLoginModal}
              >
                取消
              </button>
              <button 
                className="login-submit-btn"
                onClick={handleLogin}
              >
                登入
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainMenu;