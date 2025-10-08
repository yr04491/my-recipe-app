document.addEventListener('DOMContentLoaded', () => {
  const menuListEl = document.getElementById('menu-list');
  const emptyMessage = document.getElementById('empty-message');
  let likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];

  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openModal(recipe) {
    document.getElementById('modal-recipe-name').textContent = recipe.name;
    document.getElementById('modal-time').textContent = `約${recipe.time}分`;
    document.getElementById('modal-cost').textContent = `約${recipe.cost}円`;
    document.getElementById('modal-calories').textContent = `約${recipe.calories}kcal`;
    document.getElementById('modal-tools').textContent = recipe.tools.join('、');
    const ingredientsEl = document.getElementById('modal-ingredients');
    ingredientsEl.innerHTML = '';
    recipe.ingredients.forEach(ing => { const li = document.createElement('li'); li.textContent = `${ing.name} (${ing.amount})`; ingredientsEl.appendChild(li); });
    
    const mainMediaContainer = document.getElementById('main-media-container');
    const thumbnailContainer = document.getElementById('thumbnail-container');
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
      // ★★★ 修正点 ★★★
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
  
  function closeModal() {
    const video = document.querySelector('#main-media-container video');
    if (video) { video.pause(); }
    modalOverlay.classList.add('hidden');
  }

  function renderMenuList() {
    menuListEl.innerHTML = '';
    if (likedRecipes.length === 0) {
      emptyMessage.classList.remove('hidden');
    } else {
      emptyMessage.classList.add('hidden');
      likedRecipes.forEach((recipe, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';

        const content = document.createElement('div');
        content.className = 'menu-item-content';
        content.textContent = recipe.name;
        content.addEventListener('click', () => openModal(recipe));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', () => {
          if (window.confirm(`「${recipe.name}」を献立から削除しますか？`)) {
            likedRecipes.splice(index, 1);
            localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
            renderMenuList();
          }
        });
        
        listItem.appendChild(content);
        listItem.appendChild(deleteBtn);
        menuListEl.appendChild(listItem);
      });
    }
  }
  
  renderMenuList();
  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) { closeModal(); }
  });
});