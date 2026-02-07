(function () {
  const ADMIN_PASSWORD = window.ADMIN_PASSWORD || '';
  const loginScreen = document.getElementById('loginScreen');
  const adminPanel = document.getElementById('adminPanel');
  const adminPasswordInput = document.getElementById('adminPassword');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const loginError = document.getElementById('loginError');
  const productForm = document.getElementById('productForm');
  const productId = document.getElementById('productId');
  const productTitle = document.getElementById('productTitle');
  const productSetNumber = document.getElementById('productSetNumber');
  const productCategory = document.getElementById('productCategory');
  const productTags = document.getElementById('productTags');
  const productImageUrl = document.getElementById('productImageUrl');
  const productImageFile = document.getElementById('productImageFile');
  const imagePreview = document.getElementById('imagePreview');
  const cancelEditBtn = document.getElementById('cancelEdit');
  const productTableBody = document.getElementById('productTableBody');
  const exportJsonBtn = document.getElementById('exportJson');
  const exportZipBtn = document.getElementById('exportZip');
  const categoryList = document.getElementById('categoryList');
  const priceTiersEl = document.getElementById('priceTiers');
  const addPriceTierBtn = document.getElementById('addPriceTier');

  let products = [];
  var imageFiles = {}; // id -> File (本地上传的图片)

  function showPanel(showAdmin) {
    if (ADMIN_PASSWORD && !showAdmin) {
      loginScreen.hidden = false;
      adminPanel.hidden = true;
    } else {
      loginScreen.hidden = true;
      adminPanel.hidden = false;
    }
  }

  function checkLogin() {
    if (!ADMIN_PASSWORD) {
      showPanel(true);
      loadProducts();
      return;
    }
    var pwd = adminPasswordInput.value.trim();
    if (pwd === ADMIN_PASSWORD) {
      loginError.hidden = true;
      showPanel(true);
      loadProducts();
    } else {
      loginError.textContent = '密码错误';
      loginError.hidden = false;
    }
  }

  adminLoginBtn.addEventListener('click', checkLogin);
  adminPasswordInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkLogin();
  });

  if (ADMIN_PASSWORD) {
    showPanel(false);
  } else {
    showPanel(true);
  }

  function loadProducts() {
    fetch('data/products.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        products = Array.isArray(data) ? data : [];
        // 迁移旧数据格式
        products = products.map(migrateProduct);
        renderTable();
        fillCategoryDatalist();
      })
      .catch(function () {
        products = [];
        renderTable();
      });
  }

  // 将旧格式(price1, price50)转换为新格式(prices数组)
  function migrateProduct(p) {
    if (p.prices && p.prices.length) return p;
    var prices = [];
    if (p.price1) prices.push({ qty: 1, price: p.price1 });
    if (p.price50) prices.push({ qty: 50, price: p.price50 });
    return Object.assign({}, p, { prices: prices });
  }

  function nextId() {
    var max = 0;
    products.forEach(function (p) {
      var n = parseInt(p.id, 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return String(max + 1);
  }

  function tagsFromString(s) {
    if (!s || !s.trim()) return [];
    return s.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
  }

  // 价格层级管理
  function renderPriceTiers(prices) {
    prices = prices || [];
    if (!prices.length) {
      prices = [{ qty: 1, price: '' }, { qty: 50, price: '' }];
    }
    priceTiersEl.innerHTML = prices.map(function (tier, index) {
      return (
        '<div class="price-tier" data-index="' + index + '">' +
        '<div class="price-tier-inputs">' +
        '<input type="number" class="tier-qty" value="' + (tier.qty || '') + '" min="1" max="999" placeholder="数量" />' +
        '<span class="price-tier-label">套</span>' +
        '<input type="text" class="tier-price" value="' + (tier.price || '') + '" placeholder="价格 (元)" />' +
        '</div>' +
        '<button type="button" class="btn-remove-tier" title="删除">×</button>' +
        '</div>'
      );
    }).join('');
    bindTierEvents();
  }

  function bindTierEvents() {
    priceTiersEl.querySelectorAll('.btn-remove-tier').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tier = btn.closest('.price-tier');
        if (priceTiersEl.querySelectorAll('.price-tier').length > 1) {
          tier.remove();
        }
      });
    });
  }

  function getPriceTiers() {
    var tiers = [];
    priceTiersEl.querySelectorAll('.price-tier').forEach(function (el) {
      var qty = parseInt(el.querySelector('.tier-qty').value, 10);
      var price = el.querySelector('.tier-price').value.trim();
      if (qty && price) {
        tiers.push({ qty: qty, price: price });
      }
    });
    // 按数量排序
    tiers.sort(function (a, b) { return a.qty - b.qty; });
    return tiers;
  }

  addPriceTierBtn.addEventListener('click', function () {
    var newTier = document.createElement('div');
    newTier.className = 'price-tier';
    newTier.innerHTML = (
      '<div class="price-tier-inputs">' +
      '<input type="number" class="tier-qty" value="" min="1" max="999" placeholder="数量" />' +
      '<span class="price-tier-label">套</span>' +
      '<input type="text" class="tier-price" value="" placeholder="价格 (元)" />' +
      '</div>' +
      '<button type="button" class="btn-remove-tier" title="删除">×</button>'
    );
    priceTiersEl.appendChild(newTier);
    bindTierEvents();
    newTier.querySelector('.tier-qty').focus();
  });

  function productFromForm() {
    var id = productId.value.trim() || nextId();
    var imageUrl = productImageUrl.value.trim();
    if (productImageFile.files.length) {
      imageFiles[id] = productImageFile.files[0];
      imageUrl = 'images/' + id + (productImageFile.files[0].name.match(/\.(jpe?g|png|gif|webp)$/i) ? productImageFile.files[0].name.replace(/.*\./, '.') : '.jpg');
    } else if (imageUrl) {
      delete imageFiles[id];
    }
    return {
      id: id,
      title: productTitle.value.trim(),
      setNumber: productSetNumber.value.trim() || undefined,
      category: productCategory.value.trim(),
      tags: tagsFromString(productTags.value),
      image: imageUrl || (products.find(function (p) { return p.id === id; }) || {}).image,
      prices: getPriceTiers()
    };
  }

  function clearForm() {
    productId.value = '';
    productTitle.value = '';
    productSetNumber.value = '';
    productCategory.value = '';
    productTags.value = '';
    productImageUrl.value = '';
    productImageFile.value = '';
    imagePreview.hidden = true;
    imagePreview.innerHTML = '';
    cancelEditBtn.hidden = true;
    renderPriceTiers([]);
  }

  function setForm(p) {
    productId.value = p.id || '';
    productTitle.value = p.title || '';
    productSetNumber.value = p.setNumber || '';
    productCategory.value = p.category || '';
    productTags.value = (p.tags || []).join(', ');
    productImageUrl.value = (p.image && p.image.indexOf('data:') !== 0 && !p.image.startsWith('images/')) ? p.image : '';
    productImageFile.value = '';
    imagePreview.hidden = true;
    imagePreview.innerHTML = '';
    if (p.image && p.image.indexOf('http') === 0) {
      imagePreview.innerHTML = '<img src="' + escapeAttr(p.image) + '" alt="" />';
      imagePreview.hidden = false;
    }
    cancelEditBtn.hidden = false;
    renderPriceTiers(p.prices || []);
  }

  productForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = productFromForm();
    if (!p.title || !p.category) return;
    var idx = products.findIndex(function (x) { return x.id === p.id; });
    if (idx >= 0) {
      products[idx] = p;
    } else {
      products.push(p);
    }
    renderTable();
    fillCategoryDatalist();
    clearForm();
  });

  cancelEditBtn.addEventListener('click', clearForm);

  productImageFile.addEventListener('change', function () {
    if (this.files.length) {
      var url = URL.createObjectURL(this.files[0]);
      imagePreview.innerHTML = '<img src="' + url + '" alt="" />';
      imagePreview.hidden = false;
      productImageUrl.value = '';
    } else {
      imagePreview.hidden = true;
      imagePreview.innerHTML = '';
    }
  });

  productImageUrl.addEventListener('input', function () {
    if (this.value.trim()) productImageFile.value = '';
  });

  function deleteProduct(id) {
    if (!confirm('确定删除该产品？')) return;
    products = products.filter(function (p) { return p.id !== id; });
    delete imageFiles[id];
    renderTable();
    fillCategoryDatalist();
    if (productId.value === id) clearForm();
  }

  function editProduct(id) {
    var p = products.find(function (x) { return x.id === id; });
    if (p) setForm(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatPrices(prices) {
    if (!prices || !prices.length) return '—';
    return prices.map(function (t) {
      return t.qty + '套: ¥' + t.price;
    }).join('<br>');
  }

  function renderTable() {
    productTableBody.innerHTML = products.map(function (p) {
      var thumb = p.image && (p.image.indexOf('http') === 0 || p.image.startsWith('data:'))
        ? '<img class="thumb" src="' + escapeAttr(p.image) + '" alt="" />'
        : '<span class="thumb-none">—</span>';
      return (
        '<tr>' +
        '<td>' + thumb + '</td>' +
        '<td>' + escapeHtml(p.title) + '</td>' +
        '<td>' + escapeHtml(p.category || '') + '</td>' +
        '<td class="price-cell">' + formatPrices(p.prices) + '</td>' +
        '<td>' +
        '<button type="button" class="btn-edit" data-id="' + escapeAttr(p.id) + '">编辑</button>' +
        '<button type="button" class="btn-danger btn-delete" data-id="' + escapeAttr(p.id) + '">删除</button>' +
        '</td></tr>'
      );
    }).join('');

    productTableBody.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () { editProduct(btn.dataset.id); });
    });
    productTableBody.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteProduct(btn.dataset.id); });
    });
  }

  function fillCategoryDatalist() {
    var set = new Set();
    products.forEach(function (p) {
      if (p.category) set.add(p.category);
    });
    categoryList.innerHTML = Array.from(set).sort().map(function (c) {
      return '<option value="' + escapeAttr(c) + '">';
    }).join('');
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
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

  function exportProductsJson() {
    var list = products.map(function (p) {
      return {
        id: p.id,
        title: p.title,
        setNumber: p.setNumber,
        image: p.image,
        category: p.category,
        tags: p.tags || [],
        prices: p.prices || []
      };
    });
    var blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  exportJsonBtn.addEventListener('click', exportProductsJson);

  function exportZip() {
    var zip = new JSZip();
    var hasAny = false;
    Object.keys(imageFiles).forEach(function (id) {
      var file = imageFiles[id];
      if (!file) return;
      var ext = (file.name.match(/\.(jpe?g|png|gif|webp)$/i) || [])[1] || 'jpg';
      if (ext === 'jpeg') ext = 'jpg';
      zip.file('images/' + id + '.' + ext, file);
      hasAny = true;
    });
    if (!hasAny) {
      alert('当前没有通过「上传图片」添加的本地图片。请先在编辑产品时选择图片文件，再导出。');
      return;
    }
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'images.zip';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  exportZipBtn.addEventListener('click', exportZip);

  // 初始化价格层级
  renderPriceTiers([]);

  if (!adminPanel.hidden) loadProducts();
})();
