document.addEventListener('DOMContentLoaded', () => {
  // --- DOM取得 ---
  const showFormBtn = document.getElementById('show-form-btn');
  const stockModal = document.getElementById('stock-add-modal');
  const stockModalCloseBtn = document.getElementById('stock-modal-close-btn');
  
  // フォーム要素はモーダル内から取得
  const stockNameInput = document.getElementById('stock-name');
  const stockQuantityInput = document.getElementById('stock-quantity');
  const stockExpiryInput = document.getElementById('stock-expiry');
  const addStockBtn = document.getElementById('add-stock-btn'); // モーダル内の「追加」ボタン
  const stockListEl = document.getElementById('stock-list');
  
  // 空メッセージの要素を取得
  const stockEmptyMessage = document.getElementById('stock-empty-message');

  let stocks = [];

  function saveStocks() {
    localStorage.setItem('stocks', JSON.stringify(stocks));
  }

  // --- モーダルを開閉する関数 ---
  function openStockModal() {
    stockModal.classList.remove('hidden');
  }

  function closeStockModal() {
    stockModal.classList.add('hidden');
    // フォームをリセット
    stockNameInput.value = '';
    stockQuantityInput.value = '';
    stockExpiryInput.value = '';
  }

  function renderStocks() {
    stockListEl.innerHTML = '';
    
    // ★★★ 在庫が0件の場合の処理 ★★★
    if (stocks.length === 0) {
      stockEmptyMessage.classList.remove('hidden');
    } else {
      stockEmptyMessage.classList.add('hidden');
      
      // 在庫を賞味期限順にソート
      stocks.sort((a, b) => {
        if (!a.expiry) return 1;
        if (!b.expiry) return -1;
        return new Date(a.expiry) - new Date(b.expiry);
      });
      
      stocks.forEach((stock, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        
        const textContainer = document.createElement('div');
        
        const mainText = document.createElement('span');
        mainText.className = 'stock-main-text';
        mainText.textContent = `${stock.name} (${stock.quantity})`;
        
        const expiryText = document.createElement('span');
        expiryText.className = 'stock-expiry-text';
        
        if (stock.expiry) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expiryDate = new Date(stock.expiry);
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let expiryInfo = `賞味期限: ${stock.expiry}`;
          if (diffDays < 0) {
            expiryText.textContent = `${expiryInfo} (期限切れ)`;
            expiryText.style.color = 'red';
          } else if (diffDays === 0) {
            expiryText.textContent = `${expiryInfo} (今日まで)`;
            expiryText.style.color = 'orange';
          } else if (diffDays <= 3) {
            expiryText.textContent = `${expiryInfo} (あと${diffDays}日)`;
            expiryText.style.color = 'orange';
          } else {
            expiryText.textContent = expiryInfo;
          }
        } else {
          expiryText.textContent = '賞味期限: 未設定';
        }

        textContainer.appendChild(mainText);
        textContainer.appendChild(expiryText);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
          stocks.splice(index, 1);
          saveStocks();
          renderStocks();
        });

        listItem.appendChild(textContainer);
        listItem.appendChild(deleteBtn);
        stockListEl.appendChild(listItem);
      });
    }
  }

  function addStockItem() {
    const name = stockNameInput.value;
    const quantity = stockQuantityInput.value;
    const expiry = stockExpiryInput.value;
    
    if (name === '') { alert('食材を選択してください。'); return; }
    if (quantity === '') { alert('数量を選択してください。'); return; }

    stocks.push({ name, quantity, expiry });
    
    saveStocks();
    renderStocks();

    // モーダルを閉じる
    closeStockModal();
  }

  async function init() {
    try {
      const response = await fetch('data/ingredients.json');
      const ingredients = await response.json();

      ingredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient;
        option.textContent = ingredient;
        stockNameInput.appendChild(option);
      });
    } catch (error) {
      console.error('食材データの読み込みに失敗しました:', error);
    }

    const savedStocks = JSON.parse(localStorage.getItem('stocks'));
    if (savedStocks) {
      stocks = savedStocks;
    }
    renderStocks();
  }

  // --- イベントリスナー ---
  addStockBtn.addEventListener('click', addStockItem);
  showFormBtn.addEventListener('click', openStockModal); // フローティングボタン
  stockModalCloseBtn.addEventListener('click', closeStockModal); // モーダルのキャンセルボタン
  
  // モーダルの背景クリックで閉じる
  stockModal.addEventListener('click', (e) => {
    if (e.target === stockModal) {
      closeStockModal();
    }
  });
  
  init();
});