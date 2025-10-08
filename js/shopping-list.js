document.addEventListener('DOMContentLoaded', () => {
  const shoppingListEl = document.getElementById('shopping-list');
  const emptyMessage = document.getElementById('shopping-empty-message');
  const totalCostContainer = document.getElementById('total-cost-container');
  const totalCostEl = document.getElementById('total-cost');

  const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];

  const neededIngredients = new Map();
  likedRecipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      if (!neededIngredients.has(ingredient.name)) {
        neededIngredients.set(ingredient.name, ingredient.amount);
      }
    });
  });

  const stockNames = new Set(stocks.map(stock => stock.name));
  
  let shoppingList = [];
  neededIngredients.forEach((amount, name) => {
    if (!stockNames.has(name)) {
      shoppingList.push({ name, amount, checked: false });
    }
  });

  function renderShoppingList() {
    shoppingListEl.innerHTML = '';
    if (shoppingList.length === 0) {
      emptyMessage.classList.remove('hidden');
      totalCostContainer.classList.add('hidden');
    } else {
      emptyMessage.classList.add('hidden');
      totalCostContainer.classList.remove('hidden');
      
      shoppingList.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        if (item.checked) listItem.classList.add('checked');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.checked;
        checkbox.addEventListener('change', () => {
          item.checked = checkbox.checked;
          renderShoppingList(); // 再描画して状態を反映
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = `${item.name} (${item.amount})`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
          shoppingList.splice(index, 1);
          renderShoppingList(); // 削除後再描画
        });
        
        listItem.appendChild(checkbox);
        listItem.appendChild(textSpan);
        listItem.appendChild(deleteBtn);
        shoppingListEl.appendChild(listItem);
      });
    }
    // 合計金額を計算
    const totalCost = likedRecipes.reduce((sum, recipe) => sum + recipe.cost, 0);
    totalCostEl.textContent = totalCost.toLocaleString(); // 3桁区切りにする
  }

  renderShoppingList();
});