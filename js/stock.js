document.addEventListener('DOMContentLoaded', () => {
  const stockNameInput = document.getElementById('stock-name');
  const stockQuantityInput = document.getElementById('stock-quantity');
  const addStockBtn = document.getElementById('add-stock-btn');
  const stockList = document.getElementById('stock-list');

  function addStockItem() {
    const name = stockNameInput.value;
    const quantity = stockQuantityInput.value;

    if (name === '') {
      alert('食材を選択してください。');
      return;
    }
    
    if (quantity === '') {
      alert('数量を選択してください。');
      return;
    }

    const listItem = document.createElement('li');
    listItem.className = 'list-item';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = `${name} (${quantity})`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', () => {
        listItem.remove();
    });

    listItem.appendChild(textSpan);
    listItem.appendChild(deleteBtn);
    stockList.appendChild(listItem);

    stockNameInput.value = '';
    stockQuantityInput.value = '';
  }

  addStockBtn.addEventListener('click', addStockItem);
});