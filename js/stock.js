document.addEventListener('DOMContentLoaded', () => {
  const stockNameInput = document.getElementById('stock-name');
  const stockQuantityInput = document.getElementById('stock-quantity');
  const stockExpiryInput = document.getElementById('stock-expiry');
  const addStockBtn = document.getElementById('add-stock-btn');
  const stockListEl = document.getElementById('stock-list');

  let stocks = [];

  function saveStocks() {
    localStorage.setItem('stocks', JSON.stringify(stocks));
  }

  function renderStocks() {
    stockListEl.innerHTML = '';
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

  function addStockItem() {
    const name = stockNameInput.value;
    const quantity = stockQuantityInput.value;
    const expiry = stockExpiryInput.value;
    
    if (name === '') { alert('食材を選択してください。'); return; }
    if (quantity === '') { alert('数量を選択してください。'); return; }

    stocks.push({ name, quantity, expiry });
    
    saveStocks();
    renderStocks();

    stockNameInput.value = '';
    stockQuantityInput.value = '';
    stockExpiryInput.value = '';
  }

  async function init() {
    const response = await fetch('data/ingredients.json');
    const ingredients = await response.json();

    ingredients.forEach(ingredient => {
      const option = document.createElement('option');
      option.value = ingredient;
      option.textContent = ingredient;
      stockNameInput.appendChild(option);
    });

    const savedStocks = JSON.parse(localStorage.getItem('stocks'));
    if (savedStocks) {
      stocks = savedStocks;
    }
    renderStocks();
  }

  addStockBtn.addEventListener('click', addStockItem);
  
  init();
});