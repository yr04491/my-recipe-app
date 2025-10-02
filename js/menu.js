document.addEventListener('DOMContentLoaded', () => {
  const menuList = document.getElementById('menu-list');
  const emptyMessage = document.getElementById('empty-message');
  
  const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];

  if (likedRecipes.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    likedRecipes.forEach(recipe => {
      const listItem = document.createElement('li');
      listItem.className = 'list-item';
      listItem.textContent = recipe.name;
      menuList.appendChild(listItem);
    });
  }
});