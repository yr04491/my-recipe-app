document.addEventListener('DOMContentLoaded', () => {
  const shoppingListEl = document.getElementById('shopping-list');
  const emptyMessage = document.getElementById('shopping-empty-message');
  const totalCostContainer = document.getElementById('total-cost-container');
  const totalCostEl = document.getElementById('total-cost');

  const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const stockNames = new Set(stocks.map(stock => stock.name));
  
  // localStorageから読み込むキー
  const SHOPPING_LIST_KEY = 'shoppingList';
  let shoppingList = [];

  // ★ 買い物リストをlocalStorageに保存する関数
  function saveShoppingList() {
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));
  }

  // ★ チェックされていない項目に基づいて合計金額を計算する関数
  function calculateTotalCost() {
    // 1. チェックされていない材料のSetを作成
    const uncheckedIngredients = new Set(
      shoppingList
        .filter(item => !item.checked)
        .map(item => item.name)
    );

    let totalCost = 0;
    // 2. お気に入りレシピをループ
    likedRecipes.forEach(recipe => {
      // 3. そのレシピの材料に、未チェックの買い物リスト材料が含まれるか確認
      const needsBuying = recipe.ingredients.some(ingredient => 
        uncheckedIngredients.has(ingredient.name)
      );
      
      if (needsBuying) {
        totalCost += recipe.cost;
      }
    });
    
    totalCostEl.textContent = totalCost.toLocaleString();
  }


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
          // ★ チェック状態を更新
          item.checked = checkbox.checked;
          saveShoppingList();
          renderShoppingList(); // 再描画
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = `${item.name} (${item.amount})`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
          // ★ リストから削除
          shoppingList.splice(index, 1);
          saveShoppingList();
          renderShoppingList(); // 再描画
        });
        
        listItem.appendChild(checkbox);
        listItem.appendChild(textSpan);
        listItem.appendChild(deleteBtn);
        shoppingListEl.appendChild(listItem);
      });
    }
    
    // ★ 合計金額を（再）計算
    calculateTotalCost();
  }

  // --- 初期化ロジック ---
  function init() {
    const savedShoppingList = JSON.parse(localStorage.getItem(SHOPPING_LIST_KEY));
    
    // ★ 献立が更新されたかを簡易的にチェック
    //（献立のレシピ数と、リスト内のレシピ起因の材料が合わない場合、リストを再生成）
    const itemsFromRecipes = JSON.parse(localStorage.getItem('shoppingListRecipeCount')) || 0;
    
    if (savedShoppingList && itemsFromRecipes === likedRecipes.length) {
      // 保存されたリストがあり、献立も変わっていなさそうならそれを使う
      shoppingList = savedShoppingList;
    } else {
      // 保存されたリストがない、または献立が変わっていそうなら、リストを再生成
      shoppingList = [];
      const neededIngredients = new Map();
      likedRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          // 在庫にないものだけをピックアップ
          if (!stockNames.has(ingredient.name)) {
            if (!neededIngredients.has(ingredient.name)) {
              neededIngredients.set(ingredient.name, ingredient.amount);
            }
          }
        });
      });

      neededIngredients.forEach((amount, name) => {
        shoppingList.push({ name, amount, checked: false });
      });
      
      // 新しいリストを保存
      saveShoppingList();
      // 献立のレシピ数を保存
      localStorage.setItem('shoppingListRecipeCount', JSON.stringify(likedRecipes.length));
    }

    renderShoppingList();
  }

  init();
});