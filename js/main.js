// --- グローバル変数 ---
let allRecipes = []; 
let displayedRecipes = [];
let currentCardIndex = 0;

// --- HTML要素の取得 ---
const cardContainer = document.querySelector('.card-container');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const headerTitle = document.getElementById('header-title');
const searchBar = document.getElementById('search-bar');
const searchBtn = document.getElementById('search-btn');
const settingsBtn = document.getElementById('settings-btn');

// --- スワイプ機能関連の変数 ---
let isDragging = false, startX = 0, startY = 0, deltaX = 0, deltaY = 0;
let currentCard = null, swipeDirection = null;

// --- 関数定義 ---

function shuffleArray(array) { /* ...変更なし... */ }

function openModal(recipe) {
  const modalRecipeName = document.getElementById('modal-recipe-name');
  const modalIngredients = document.getElementById('modal-ingredients');
  const modalTime = document.getElementById('modal-time');
  const modalCost = document.getElementById('modal-cost');
  const modalCalories = document.getElementById('modal-calories');
  const modalTools = document.getElementById('modal-tools');
  const mainMediaContainer = document.getElementById('main-media-container');
  const thumbnailContainer = document.getElementById('thumbnail-container');

  modalRecipeName.textContent = recipe.name;
  modalTime.textContent = `約${recipe.time}分`;
  modalCost.textContent = `約${recipe.cost}円`;
  modalCalories.textContent = `約${recipe.calories}kcal`;
  modalTools.textContent = recipe.tools.join('、');
  
  modalIngredients.innerHTML = '';
  recipe.ingredients.forEach(ing => { /* ...変更なし... */ });

  mainMediaContainer.innerHTML = '';
  thumbnailContainer.innerHTML = '';

  function showMedia(mediaItem) { /* ...変更なし... */ }

  recipe.media.forEach((mediaItem, index) => {
    const thumb = document.createElement('img');
    // ★★★ 修正点 ★★★
    thumb.src = mediaItem.type === 'video' ? mediaItem.thumbnailUrl : mediaItem.url;
    thumb.className = 'thumbnail';
    if (index === 0) { /* ...変更なし... */ }
    thumb.addEventListener('click', () => { /* ...変更なし... */ });
    thumbnailContainer.appendChild(thumb);
  });

  modalOverlay.classList.remove('hidden');
}

function closeModal() { /* ...変更なし... */ }
function swipeCard(isLike) { /* ...変更なし... */ }
function showNextCard() { /* ...変更なし... */ }

function createCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  
  // ★★★ 修正点 ★★★
  const firstMedia = recipe.media[0];
  const cardImageUrl = firstMedia.type === 'video' ? firstMedia.thumbnailUrl : firstMedia.url;
  
  card.innerHTML = `<img src="${cardImageUrl}" alt="${recipe.name}"><div class="recipe-card-info"><h2>${recipe.name}</h2></div>`;
  cardContainer.appendChild(card);
  currentCard = card;
  currentCard.addEventListener('mousedown', dragStart);
  currentCard.addEventListener('touchstart', dragStart, { passive: false });
  card.addEventListener('click', () => {
    if (Math.abs(deltaX) < 10) { openModal(recipe); }
  });
}

function renderCards() { /* ...変更なし... */ }
function dragStart(e) { /* ...変更なし... */ }
function dragging(e) { /* ...変更なし... */ }

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

  // ★★★ 重要な修正 ★★★
  // スワイプアニメーションの有無にかかわらず、操作終了後にdeltaXをリセット
  setTimeout(() => { deltaX = 0; }, 300); // アニメーション時間より少し長めに待つ

  swipeDirection = null;
  document.removeEventListener('mousemove', dragging);
  document.removeEventListener('mouseup', dragEnd);
  document.removeEventListener('touchmove', dragging);
  document.removeEventListener('touchend', dragEnd);
  document.removeEventListener('mouseleave', dragEnd);
}

// --- イベントリスナー設定 ---
searchBtn.addEventListener('click', () => { /* ...変更なし... */ });
searchBar.addEventListener('input', (e) => { /* ...変更なし... */ });
settingsBtn.addEventListener('click', () => { /* ...変更なし... */ });
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { closeModal(); } });

// --- アプリケーションの初期化処理 ---
async function initializeApp() { /* ...変更なし... */ }

// --- アプリケーション起動 ---
initializeApp();


// (変更のない関数のコードを以下に記載します。ファイル全体をこれで置き換えてください)
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }
function closeModal() { const video = document.querySelector('#main-media-container video'); if (video) { video.pause(); } modalOverlay.classList.add('hidden'); }
function swipeCard(isLike) { if (!currentCard) return; const moveX = isLike ? window.innerWidth : -window.innerWidth; currentCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease'; currentCard.style.transform = `translateX(${moveX}px) rotate(${moveX / 20}deg)`; currentCard.classList.add('dismissing'); if (isLike) { const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || []; const targetRecipe = displayedRecipes[currentCardIndex]; if (!likedRecipes.some(r => r.id === targetRecipe.id)) { likedRecipes.push(targetRecipe); localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); } } setTimeout(() => { currentCard.remove(); currentCardIndex++; showNextCard(); }, 500); }
function showNextCard() { if (currentCardIndex < displayedRecipes.length) { createCard(displayedRecipes[currentCardIndex]); } else if (displayedRecipes.length > 0) { cardContainer.innerHTML = '<p style="text-align: center;">今日の候補は以上です！</p>'; } else { cardContainer.innerHTML = '<p style="text-align: center;">表示できるレシピがありません。</p>'; } }
function renderCards() { cardContainer.innerHTML = ''; currentCardIndex = 0; showNextCard(); }
function dragStart(e) { if (!currentCard) return; deltaX = 0; deltaY = 0; swipeDirection = null; isDragging = true; startX = e.pageX || e.touches[0].pageX; startY = e.pageY || e.touches[0].pageY; currentCard.style.transition = 'none'; currentCard.classList.remove('returning'); document.addEventListener('mousemove', dragging); document.addEventListener('mouseup', dragEnd); document.addEventListener('touchmove', dragging, { passive: false }); document.addEventListener('touchend', dragEnd); document.addEventListener('mouseleave', dragEnd); }
function dragging(e) { if (!isDragging || !currentCard) return; const currentX = e.pageX || e.touches[0].pageX; const currentY = e.pageY || e.touches[0].pageY; deltaX = currentX - startX; deltaY = currentY - startY; if (!swipeDirection) { if (Math.abs(deltaX) > Math.abs(deltaY)) { swipeDirection = 'horizontal'; } else { swipeDirection = 'vertical'; } } if (swipeDirection === 'horizontal') { e.preventDefault(); const rotate = deltaX / 20; currentCard.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`; } }
searchBtn.addEventListener('click', () => { headerTitle.classList.toggle('hidden'); searchBar.classList.toggle('hidden'); if (!searchBar.classList.contains('hidden')) { searchBar.focus(); } if (searchBar.classList.contains('hidden')) { initializeApp(); } });
searchBar.addEventListener('input', (e) => { const searchTerm = e.target.value.toLowerCase(); if (searchTerm === '') { displayedRecipes = [...allRecipes]; } else { displayedRecipes = allRecipes.filter(recipe => recipe.name.toLowerCase().includes(searchTerm)); } renderCards(); });
settingsBtn.addEventListener('click', () => { if (window.confirm('本当に全てのデータを初期化しますか？ (献立・在庫リストが消えます)')) { localStorage.clear(); location.reload(); } });
async function initializeApp() { try { const response = await fetch('data/recipes.json'); allRecipes = await response.json(); let recipesForDisplay = []; for (let i = 0; i < 3; i++) { recipesForDisplay = recipesForDisplay.concat(allRecipes); } shuffleArray(recipesForDisplay); displayedRecipes = recipesForDisplay; renderCards(); } catch (error) { console.error('レシピデータの読み込みに失敗しました:', error); cardContainer.innerHTML = '<p style="text-align: center;">エラー: レシピを読み込めませんでした。</p>'; } }
function openModal(recipe){const modalRecipeName=document.getElementById("modal-recipe-name"),modalIngredients=document.getElementById("modal-ingredients"),modalTime=document.getElementById("modal-time"),modalCost=document.getElementById("modal-cost"),modalCalories=document.getElementById("modal-calories"),modalTools=document.getElementById("modal-tools"),mainMediaContainer=document.getElementById("main-media-container"),thumbnailContainer=document.getElementById("thumbnail-container");modalRecipeName.textContent=recipe.name,modalTime.textContent=`約${recipe.time}分`,modalCost.textContent=`約${recipe.cost}円`,modalCalories.textContent=`約${recipe.calories}kcal`,modalTools.textContent=recipe.tools.join("、"),modalIngredients.innerHTML="",recipe.ingredients.forEach(e=>{const t=document.createElement("li");t.textContent=`${e.name} (${e.amount})`,modalIngredients.appendChild(t)}),mainMediaContainer.innerHTML="",thumbnailContainer.innerHTML="";function showMedia(e){mainMediaContainer.innerHTML="";if("image"===e.type){const t=document.createElement("img");t.src=e.url,mainMediaContainer.appendChild(t)}else if("video"===e.type){const t=document.createElement("video");t.src=e.url,t.controls=!0,t.autoplay=!0,t.muted=!0,mainMediaContainer.appendChild(t)}}recipe.media.forEach((e,t)=>{const n=document.createElement("img");n.src="video"===e.type?e.thumbnailUrl:e.url,n.className="thumbnail",0===t&&(n.classList.add("active"),showMedia(e)),n.addEventListener("click",()=>{document.querySelector(".thumbnail.active")?.classList.remove("active"),n.classList.add("active"),showMedia(e)}),thumbnailContainer.appendChild(n)}),modalOverlay.classList.remove("hidden")}