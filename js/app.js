(function () {
  const gridEl = document.getElementById('grid');
  const emptyEl = document.getElementById('empty');
  const searchEl = document.getElementById('search');
  const categoriesEl = document.getElementById('categories');
  const tagsEl = document.getElementById('tags');
  const categoryTitleEl = document.getElementById('categoryTitle');
  const productCountEl = document.getElementById('productCount');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  let products = [];
  let activeCategory = null;
  let activeTag = null;
  let currentLightboxIndex = -1;
  let filteredList = [];

  function escapeHtml(s) {
    if (!s) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderCard(p, index) {
    // 获取第一个价格（最低数量的价格）
    let priceText = '';
    if (p.prices && p.prices.length) {
      priceText = '¥' + p.prices[0].price;
    } else if (p.price1) {
      priceText = '¥' + p.price1;
    }
    return (
      '<article class="card" data-index="' + index + '">' +
      '<div class="card-img-wrap">' +
      '<img class="card-img" src="' + escapeAttr(p.image || '') + '" alt="" loading="lazy" />' +
      '</div>' +
      '<div class="card-body">' +
      (p.category ? '<div class="card-category">' + escapeHtml(p.category) + '</div>' : '') +
      '<h2 class="card-title">' + escapeHtml(p.title) + '</h2>' +
      (p.setNumber ? '<div class="card-set-number">#' + escapeHtml(p.setNumber) + '</div>' : '') +
      (priceText ? '<div class="card-price">' + escapeHtml(priceText) + '</div>' : '') +
      '</div></article>'
    );
  }

  function filterProducts() {
    const q = (searchEl.value || '').trim().toLowerCase();
    return products.filter(function (p) {
      const matchSearch = !q || 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.setNumber && p.setNumber.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(function (t) { return t.toLowerCase().includes(q); }));
      const matchCategory = !activeCategory || p.category === activeCategory;
      const matchTag = !activeTag || (p.tags && p.tags.includes(activeTag));
      return matchSearch && matchCategory && matchTag;
    });
  }

  function updateCategoryTitle() {
    if (activeCategory) {
      categoryTitleEl.textContent = activeCategory;
    } else if (activeTag) {
      categoryTitleEl.textContent = activeTag;
    } else {
      categoryTitleEl.textContent = '全部产品';
    }
  }

  function render() {
    filteredList = filterProducts();
    gridEl.innerHTML = filteredList.map(function (p, i) {
      return renderCard(p, i);
    }).join('');
    emptyEl.hidden = filteredList.length > 0;
    productCountEl.textContent = filteredList.length + ' 件产品';
    updateCategoryTitle();
    bindCardClicks();
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxSetNumber = document.getElementById('lightboxSetNumber');
  const lightboxPrices = document.getElementById('lightboxPrices');
  const lightboxTags = document.getElementById('lightboxTags');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(index) {
    const p = filteredList[index];
    if (!p) return;
    
    currentLightboxIndex = index;
    lightboxImg.src = p.image || '';
    lightboxImg.alt = p.title || '';
    lightboxTitle.textContent = p.title || '';
    lightboxCategory.textContent = p.category || '';
    lightboxSetNumber.textContent = p.setNumber ? '编号: #' + p.setNumber : '';
    
    // 渲染阶梯定价
    let pricesHtml = '';
    if (p.prices && p.prices.length) {
      p.prices.forEach(function(tier) {
        pricesHtml += '<div class="lightbox-price-item"><span class="label">' + 
          escapeHtml(tier.qty + ' 套') + '</span><span class="value">¥' + 
          escapeHtml(tier.price) + '</span></div>';
      });
    } else {
      // 兼容旧数据格式
      if (p.price1) {
        pricesHtml += '<div class="lightbox-price-item"><span class="label">1 套</span><span class="value">¥' + escapeHtml(p.price1) + '</span></div>';
      }
      if (p.price50) {
        pricesHtml += '<div class="lightbox-price-item"><span class="label">50 套</span><span class="value">¥' + escapeHtml(p.price50) + '</span></div>';
      }
    }
    lightboxPrices.innerHTML = pricesHtml;
    lightboxPrices.style.display = pricesHtml ? 'flex' : 'none';
    
    if (p.tags && p.tags.length) {
      lightboxTags.innerHTML = p.tags.map(function (t) {
        return '<span class="lightbox-tag">' + escapeHtml(t) + '</span>';
      }).join('');
    } else {
      lightboxTags.innerHTML = '';
    }
    
    updateNavButtons();
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function updateNavButtons() {
    lightboxPrev.disabled = currentLightboxIndex <= 0;
    lightboxNext.disabled = currentLightboxIndex >= filteredList.length - 1;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentLightboxIndex = -1;
  }

  function navigateLightbox(delta) {
    const newIndex = currentLightboxIndex + delta;
    if (newIndex >= 0 && newIndex < filteredList.length) {
      openLightbox(newIndex);
    }
  }

  function bindCardClicks() {
    gridEl.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('click', function () {
        const index = parseInt(card.getAttribute('data-index'), 10);
        openLightbox(index);
      });
    });
  }

  // Lightbox events
  if (lightbox) {
    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { navigateLightbox(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function () { navigateLightbox(1); });
    
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  // Sidebar toggle for mobile
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      document.body.classList.toggle('sidebar-open');
    });
    
    document.addEventListener('click', function (e) {
      if (document.body.classList.contains('sidebar-open') &&
          !sidebar.contains(e.target) &&
          !sidebarToggle.contains(e.target)) {
        document.body.classList.remove('sidebar-open');
      }
    });
  }

  // Categories
  function collectCategories() {
    const map = {};
    products.forEach(function (p) {
      if (p.category) {
        map[p.category] = (map[p.category] || 0) + 1;
      }
    });
    return Object.entries(map).sort(function (a, b) {
      return b[1] - a[1];
    });
  }

  function renderCategories() {
    const categories = collectCategories();
    const totalCount = products.length;
    
    let html = '<button type="button" class="category-item' + (!activeCategory ? ' active' : '') + '" data-category="">' +
      '<span>全部</span><span class="category-count">' + totalCount + '</span></button>';
    
    categories.forEach(function (item) {
      const name = item[0];
      const count = item[1];
      const isActive = name === activeCategory;
      html += '<button type="button" class="category-item' + (isActive ? ' active' : '') + '" data-category="' + escapeAttr(name) + '">' +
        '<span>' + escapeHtml(name) + '</span><span class="category-count">' + count + '</span></button>';
    });
    
    categoriesEl.innerHTML = html;
    
    categoriesEl.querySelectorAll('.category-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCategory = btn.dataset.category || null;
        activeTag = null;
        renderCategories();
        renderTags();
        render();
        
        if (window.innerWidth < 768) {
          document.body.classList.remove('sidebar-open');
        }
      });
    });
  }

  // Tags
  function collectTags() {
    const set = new Set();
    products.forEach(function (p) {
      (p.tags || []).forEach(function (t) { set.add(t); });
    });
    return Array.from(set).sort();
  }

  function renderTags() {
    const tags = collectTags();
    tagsEl.innerHTML = tags.map(function (tag) {
      const isActive = tag === activeTag;
      return '<button type="button" class="tag' + (isActive ? ' active' : '') + '" data-tag="' + escapeAttr(tag) + '">' + escapeHtml(tag) + '</button>';
    }).join('');

    tagsEl.querySelectorAll('.tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTag = activeTag === btn.dataset.tag ? null : btn.dataset.tag;
        activeCategory = null;
        renderCategories();
        renderTags();
        render();
        
        if (window.innerWidth < 768) {
          document.body.classList.remove('sidebar-open');
        }
      });
    });
  }

  // Search
  searchEl.addEventListener('input', render);
  searchEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') searchEl.blur();
  });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchEl.focus();
    }
  });

  // Load data
  fetch('data/products.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      products = Array.isArray(data) ? data : [];
      renderCategories();
      renderTags();
      render();
    })
    .catch(function () {
      gridEl.innerHTML = '<p class="empty">无法加载产品数据</p>';
    });
})();
