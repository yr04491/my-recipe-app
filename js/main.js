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
const tutorialOverlay = document.getElementById('tutorial-overlay');

// --- スワイプ機能関連の変数 ---
let isDragging = false, startX = 0, startY = 0, deltaX = 0, deltaY = 0;
let currentCard = null, swipeDirection = null;

// --- 関数定義 ---

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
  recipe.ingredients.forEach(ing => { const li = document.createElement('li'); li.textContent = `${ing.name} (${ing.amount})`; modalIngredients.appendChild(li); });

  mainMediaContainer.innerHTML = '';
  thumbnailContainer.innerHTML = '';

  function showMedia(mediaItem) { 
    mainMediaContainer.innerHTML = ''; 
    if (mediaItem.type === 'image') { 
        const img = document.createElement('img'); img.src = mediaItem.url; mainMediaContainer.appendChild(img); 
    } else if (mediaItem.type === 'video') { 
        const video = document.createElement('video'); video.src = mediaItem.url; video.controls = true; mainMediaContainer.appendChild(video); 
    } 
  }

  recipe.media.forEach((mediaItem, index) => {
    const thumb = document.createElement('img');
    thumb.src = mediaItem.type === 'video' ? mediaItem.thumbnailUrl : mediaItem.url;
    thumb.className = 'thumbnail';
    if (index === 0) { 
        thumb.classList.add('active'); 
        showMedia(mediaItem); 
    }
    thumb.addEventListener('click', () => { 
        document.querySelector('.thumbnail.active')?.classList.remove('active'); 
        thumb.classList.add('active'); 
        showMedia(mediaItem); 
    });
    thumbnailContainer.appendChild(thumb);
  });

  modalOverlay.classList.remove('hidden');
}

function createCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  
  const firstMedia = recipe.media[0];
  // ★★★ ここが修正点です！ 'first.url' -> 'firstMedia.url' に修正 ★★★
  const cardImageUrl = firstMedia.type === 'video' ? firstMedia.thumbnailUrl : firstMedia.url;
  
  card.innerHTML = `
    <div class="swipe-badge nope-badge">NOPE</div>
    <div class="swipe-badge like-badge">LIKE</div>
    <img src="${cardImageUrl}" alt="${recipe.name}">
    <div class="recipe-card-info"><h2>${recipe.name}</h2></div>
  `;

  cardContainer.appendChild(card);
  currentCard = card;
  currentCard.addEventListener('mousedown', dragStart);
  currentCard.addEventListener('touchstart', dragStart, { passive: false });
  card.addEventListener('click', (e) => {
    if (Math.abs(deltaX) < 10) { 
      openModal(recipe);
    }
  });
}

function dragging(e) {
  if (!isDragging || !currentCard) return;
  const currentX = e.pageX || e.touches[0].pageX;
  const currentY = e.pageY || e.touches[0].pageY;
  deltaX = currentX - startX;
  deltaY = currentY - startY;

  if (!swipeDirection) {
    swipeDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
  }

  if (swipeDirection === 'horizontal') {
    e.preventDefault();
    const rotate = deltaX / 20;
    currentCard.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;

    const likeBadge = currentCard.querySelector('.like-badge');
    const nopeBadge = currentCard.querySelector('.nope-badge');
    const decisionThreshold = window.innerWidth / 4;
    const opacity = Math.min(Math.abs(deltaX) / decisionThreshold, 1);

    if (deltaX > 0) {
      likeBadge.style.opacity = opacity;
      nopeBadge.style.opacity = 0;
    } else {
      nopeBadge.style.opacity = opacity;
      likeBadge.style.opacity = 0;
    }
  }
}

function dragStart(e) {
  if (!currentCard) return;
  deltaX = 0; deltaY = 0;
  swipeDirection = null;
  isDragging = true;
  startX = e.pageX || e.touches[0].pageX;
  startY = e.pageY || e.touches[0].pageY;
  currentCard.style.transition = 'none';
  currentCard.classList.remove('returning');

  if (tutorialOverlay.style.display !== 'none' && !tutorialOverlay.hiding) {
    tutorialOverlay.hiding = true;
    tutorialOverlay.style.opacity = '0';
    setTimeout(() => {
      tutorialOverlay.style.display = 'none';
    }, 500);
    localStorage.setItem('tutorialCompleted', 'true');
  }

  document.addEventListener('mousemove', dragging);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchmove', dragging, { passive: false });
  document.addEventListener('touchend', dragEnd);
  document.addEventListener('mouseleave', dragEnd);
}

function dragEnd() {
  if (!isDragging || !currentCard) return;
  isDragging = false;
  
  const likeBadge = currentCard.querySelector('.like-badge');
  const nopeBadge = currentCard.querySelector('.nope-badge');
  likeBadge.style.transition = 'opacity 0.3s ease';
  nopeBadge.style.transition = 'opacity 0.3s ease';
  likeBadge.style.opacity = 0;
  nopeBadge.style.opacity = 0;

  const decisionThreshold = window.innerWidth / 4;
  if (swipeDirection === 'horizontal' && Math.abs(deltaX) > decisionThreshold) {
    swipeCard(deltaX > 0);
  } else {
    currentCard.classList.add('returning');
    currentCard.style.transform = 'translateX(0) rotate(0)';
  }

  setTimeout(() => { deltaX = 0; }, 300);

  swipeDirection = null;
  document.removeEventListener('mousemove', dragging);
  document.removeEventListener('mouseup', dragEnd);
  document.removeEventListener('touchmove', dragging);
  document.removeEventListener('touchend', dragEnd);
  document.removeEventListener('mouseleave', dragEnd);
}

async function initializeApp() {
  try {
    const response = await fetch('data/recipes.json');
    allRecipes = await response.json();
    let recipesForDisplay = [];
    for (let i = 0; i < 3; i++) {
      recipesForDisplay = recipesForDisplay.concat(allRecipes);
    }
    shuffleArray(recipesForDisplay);
    displayedRecipes = recipesForDisplay;
    renderCards();
    
    if (!localStorage.getItem('tutorialCompleted')) {
      tutorialOverlay.style.display = 'flex';
      setTimeout(() => { tutorialOverlay.style.opacity = '1'; }, 100);
    }

  } catch (error) {
    console.error('レシピデータの読み込みに失敗しました:', error);
    cardContainer.innerHTML = '<p style="text-align: center;">エラー: レシピを読み込めませんでした。</p>';
  }
}

// --- 変更のない関数群 ---
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }
function closeModal() { const video = document.querySelector('#main-media-container video'); if (video) { video.pause(); } modalOverlay.classList.add('hidden'); }
function swipeCard(isLike) { if (!currentCard) return; const moveX = isLike ? window.innerWidth : -window.innerWidth; currentCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease'; currentCard.style.transform = `translateX(${moveX}px) rotate(${moveX / 20}deg)`; currentCard.classList.add('dismissing'); if (isLike) { const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || []; const targetRecipe = displayedRecipes[currentCardIndex]; if (!likedRecipes.some(r => r.id === targetRecipe.id)) { likedRecipes.push(targetRecipe); localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); } } setTimeout(() => { currentCard.remove(); currentCardIndex++; showNextCard(); }, 500); }
function showNextCard() { if (currentCardIndex < displayedRecipes.length) { createCard(displayedRecipes[currentCardIndex]); } else if (displayedRecipes.length > 0) { cardContainer.innerHTML = '<p style="text-align: center;">今日の候補は以上です！</p>'; } else { cardContainer.innerHTML = '<p style="text-align: center;">表示できるレシピがありません。</p>'; } }
function renderCards() { cardContainer.innerHTML = ''; currentCardIndex = 0; showNextCard(); }
searchBtn.addEventListener('click', () => { headerTitle.classList.toggle('hidden'); searchBar.classList.toggle('hidden'); if (!searchBar.classList.contains('hidden')) { searchBar.focus(); } if (searchBar.classList.contains('hidden')) { displayedRecipes=[...allRecipes]; renderCards(); } });
searchBar.addEventListener('input', (e) => { const searchTerm = e.target.value.toLowerCase(); if (searchTerm === '') { displayedRecipes = [...allRecipes]; } else { displayedRecipes = allRecipes.filter(recipe => recipe.name.toLowerCase().includes(searchTerm)); } renderCards(); });
settingsBtn.addEventListener('click', () => { if (window.confirm('本当に全てのデータを初期化しますか？ (献立・在庫・チュートリアル表示履歴が消えます)')) { localStorage.clear(); location.reload(); } });
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { closeModal(); } });

// --- アプリケーション起動 ---
initializeApp();