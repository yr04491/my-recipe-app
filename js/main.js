// --- ダミーデータ (材料と使用器具を追加) ---
const dummyRecipes = [
  { id: 1, name: '絶品！親子丼', image: 'https://placehold.jp/300x200.png?text=親子丼', time: 15, cost: 300, ingredients: ['鶏もも肉', 'たまご', '玉ねぎ', 'ごはん', 'めんつゆ'], tools: ['フライパン', '包丁', 'まな板'] },
  { id: 2, name: '簡単ヘルシー！サラダチキン', image: 'https://placehold.jp/300x200.png?text=サラダチキン', time: 10, cost: 250, ingredients: ['鶏むね肉', '砂糖', '塩'], tools: ['鍋', 'ジップロック'] },
  { id: 3, name: '濃厚カルボナーラ', image: 'https://placehold.jp/300x200.png?text=カルボナーラ', time: 20, cost: 400, ingredients: ['パスタ', 'ベーコン', '卵黄', '粉チーズ', '黒胡椒'], tools: ['鍋', 'フライパン', 'ボウル'] },
  { id: 4, name: '豚の生姜焼き', image: 'https://placehold.jp/300x200.png?text=生姜焼き', time: 15, cost: 350, ingredients: ['豚ロース肉', '玉ねぎ', '生姜', '醤油', 'みりん'], tools: ['フライパン', '包丁', 'まな板'] },
  { id: 5, name: '具沢山カレーライス', image: 'https://placehold.jp/300x200.png?text=カレー', time: 30, cost: 500, ingredients: ['カレールー', '豚肉', 'じゃがいも', 'にんじん', '玉ねぎ'], tools: ['鍋', '包丁', 'まな板'] },
];

let currentCardIndex = 0;

// --- HTML要素の取得 ---
const cardContainer = document.querySelector('.card-container');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalRecipeName = document.getElementById('modal-recipe-name');
const modalIngredients = document.getElementById('modal-ingredients');
const modalTime = document.getElementById('modal-time');
const modalCost = document.getElementById('modal-cost');
const modalTools = document.getElementById('modal-tools');


// --- スワイプ機能関連の変数 ---
let isDragging = false;
let startX = 0, startY = 0;
let deltaX = 0, deltaY = 0;
let currentCard = null;
let swipeDirection = null;

// --- 関数 ---

// モーダルを開く関数
function openModal(recipe) {
  modalRecipeName.textContent = recipe.name;
  modalTime.textContent = `約${recipe.time}分`;
  modalCost.textContent = `約${recipe.cost}円`;
  modalTools.textContent = recipe.tools.join('、');
  
  modalIngredients.innerHTML = '';
  recipe.ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    modalIngredients.appendChild(li);
  });
  
  modalOverlay.classList.remove('hidden');
}

// モーダルを閉じる関数
function closeModal() {
  modalOverlay.classList.add('hidden');
}

function swipeCard(isLike) {
  if (!currentCard) return;
  const moveX = isLike ? window.innerWidth : -window.innerWidth;
  currentCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
  currentCard.style.transform = `translateX(${moveX}px) rotate(${moveX / 20}deg)`;
  currentCard.classList.add('dismissing');

  if (isLike) {
    const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];
    likedRecipes.push(dummyRecipes[currentCardIndex]);
    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
  }

  setTimeout(() => {
    currentCard.remove();
    currentCardIndex++;
    showNextCard();
  }, 500);
}

function showNextCard() {
  if (currentCardIndex < dummyRecipes.length) {
    createCard(dummyRecipes[currentCardIndex]);
  } else {
    cardContainer.innerHTML = '<p style="text-align: center;">今日の候補は以上です！</p>';
  }
}

function createCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.name}">
    <div class="recipe-card-info">
      <h2>${recipe.name}</h2>
    </div>
  `;
  cardContainer.appendChild(card);
  currentCard = card;
  
  currentCard.addEventListener('mousedown', dragStart);
  currentCard.addEventListener('touchstart', dragStart, { passive: false });

  // カードにクリックイベントを追加してモーダルを開く
  card.addEventListener('click', (e) => {
    // スワイプの誤タップを防ぐ（少しでも動いたらモーダルは開かない）
    if (Math.abs(deltaX) < 5) {
      openModal(recipe);
    }
  });
}

function dragStart(e) {
  if (!currentCard) return;
  deltaX = 0;
  deltaY = 0;
  swipeDirection = null;

  isDragging = true;
  startX = e.pageX || e.touches[0].pageX;
  startY = e.pageY || e.touches[0].pageY;
  currentCard.style.transition = 'none';
  currentCard.classList.remove('returning');

  document.addEventListener('mousemove', dragging);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchmove', dragging, { passive: false });
  document.addEventListener('touchend', dragEnd);
  document.addEventListener('mouseleave', dragEnd);
}

function dragging(e) {
  if (!isDragging || !currentCard) return;
  const currentX = e.pageX || e.touches[0].pageX;
  const currentY = e.pageY || e.touches[0].pageY;
  deltaX = currentX - startX;
  deltaY = currentY - startY;
  if (!swipeDirection) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) { swipeDirection = 'horizontal'; } 
    else { swipeDirection = 'vertical'; }
  }
  if (swipeDirection === 'horizontal') {
    e.preventDefault(); 
    const rotate = deltaX / 20;
    currentCard.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
  }
}

function dragEnd() {
  if (!isDragging || !currentCard) return;
  isDragging = false;
  const decisionThreshold = window.innerWidth / 4;
  if (swipeDirection === 'horizontal' && Math.abs(deltaX) > decisionThreshold) {
    swipeCard(deltaX > 0);
  } else {
    currentCard.classList.add('returning');
    currentCard.style.transform = 'translateX(0) rotate(0)';
  }
  swipeDirection = null;
  document.removeEventListener('mousemove', dragging);
  document.removeEventListener('mouseup', dragEnd);
  document.removeEventListener('touchmove', dragging);
  document.removeEventListener('touchend', dragEnd);
  document.removeEventListener('mouseleave', dragEnd);
}

// --- 初期化 ---
showNextCard();
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});