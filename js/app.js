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
  const siteTitleEl = document.getElementById('siteTitle');
  const siteDescEl = document.getElementById('siteDesc');
  const socialLinksEl = document.getElementById('socialLinks');

  let products = [];
  let activeCategory = null;
  let activeTag = null;
  let currentLightboxIndex = -1;
  let filteredList = [];

  // 社交链接图标
  const socialIcons = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    wechat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>'
  };

  function renderSocialLinks(links) {
    if (!socialLinksEl || !links || !links.length) return;
    socialLinksEl.innerHTML = links.map(function(link) {
      var icon = socialIcons[link.type] || socialIcons.website;
      return '<a href="' + escapeAttr(link.url) + '" class="social-link" target="_blank" rel="noopener" title="' + escapeAttr(link.label || link.type) + '">' + icon + '</a>';
    }).join('');
  }

  function loadConfig() {
    fetch('data/config.json')
      .then(function(r) { return r.json(); })
      .then(function(config) {
        if (config.site) {
          if (config.site.title && siteTitleEl) {
            siteTitleEl.textContent = config.site.title;
            document.title = config.site.title;
          }
          if (config.site.description && siteDescEl) {
            siteDescEl.textContent = config.site.description;
          }
        }
        if (config.links) {
          renderSocialLinks(config.links);
        }
      })
      .catch(function() {
        // 配置文件不存在，使用默认值
      });
  }

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
  loadConfig();
  
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
