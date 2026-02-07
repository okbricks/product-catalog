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
  const setupGitHubBtn = document.getElementById('setupGitHub');

  // 配置相关元素
  const configForm = document.getElementById('configForm');
  const siteTitleInput = document.getElementById('siteTitle');
  const siteDescInput = document.getElementById('siteDesc');
  const socialLinkList = document.getElementById('socialLinkList');
  const addSocialLinkBtn = document.getElementById('addSocialLink');
  const exportConfigBtn = document.getElementById('exportConfig');

  let products = [];
  let siteConfig = { site: { title: '', description: '' }, links: [] };
  var imageFiles = {}; // id -> File (本地上传的图片)

  // 支持的社交链接类型
  const linkTypes = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'wechat', label: '微信' },
    { value: 'email', label: '邮箱' },
    { value: 'website', label: '网站' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'X/Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' }
  ];

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
      loadConfig();
      return;
    }
    var pwd = adminPasswordInput.value.trim();
    if (pwd === ADMIN_PASSWORD) {
      loginError.hidden = true;
      showPanel(true);
      loadProducts();
      loadConfig();
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
    // 先尝试从localStorage加载备份
    try {
      var backup = localStorage.getItem('products_backup');
      if (backup) {
        try {
          products = JSON.parse(backup);
          renderTable();
          fillCategoryDatalist();
        } catch (e) {
          console.warn('localStorage备份数据损坏，从服务器加载');
        }
      }
    } catch (e) {
      console.warn('无法访问localStorage:', e);
    }
    
    fetch('data/products.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var serverProducts = Array.isArray(data) ? data : [];
        // 迁移旧数据格式
        serverProducts = serverProducts.map(migrateProduct);
        
        // 如果服务器数据更新，使用服务器数据
        if (serverProducts.length > 0 || products.length === 0) {
          products = serverProducts;
        }
        
        renderTable();
        fillCategoryDatalist();
        
        // 更新localStorage备份
        try {
          localStorage.setItem('products_backup', JSON.stringify(products));
        } catch (e) {
          console.warn('无法保存到localStorage:', e);
        }
      })
      .catch(function () {
        // 如果服务器加载失败，使用localStorage备份（如果存在）
        if (products.length === 0) {
          products = [];
        }
        renderTable();
      });
  }

  // 配置相关功能
  function loadConfig() {
    fetch('data/config.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        siteConfig = data || { site: {}, links: [] };
        renderConfigForm();
      })
      .catch(function () {
        siteConfig = { site: { title: '', description: '' }, links: [] };
        renderConfigForm();
      });
  }

  function renderConfigForm() {
    if (siteTitleInput) siteTitleInput.value = (siteConfig.site && siteConfig.site.title) || '';
    if (siteDescInput) siteDescInput.value = (siteConfig.site && siteConfig.site.description) || '';
    renderSocialLinks();
  }

  function renderSocialLinks() {
    if (!socialLinkList) return;
    var links = siteConfig.links || [];
    if (!links.length) {
      links = [{ type: 'whatsapp', url: '', label: '' }];
    }
    socialLinkList.innerHTML = links.map(function(link, index) {
      var typeOptions = linkTypes.map(function(t) {
        return '<option value="' + t.value + '"' + (t.value === link.type ? ' selected' : '') + '>' + t.label + '</option>';
      }).join('');
      return (
        '<div class="social-link-item" data-index="' + index + '">' +
        '<select class="link-type">' + typeOptions + '</select>' +
        '<input type="url" class="link-url" value="' + escapeAttr(link.url || '') + '" placeholder="链接地址" />' +
        '<input type="text" class="link-label" value="' + escapeAttr(link.label || '') + '" placeholder="显示名称(可选)" />' +
        '<button type="button" class="btn-remove-link" title="删除">×</button>' +
        '</div>'
      );
    }).join('');
    bindSocialLinkEvents();
  }

  function bindSocialLinkEvents() {
    if (!socialLinkList) return;
    socialLinkList.querySelectorAll('.btn-remove-link').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.closest('.social-link-item');
        if (socialLinkList.querySelectorAll('.social-link-item').length > 1) {
          item.remove();
        }
      });
    });
  }

  function getSocialLinks() {
    if (!socialLinkList) return [];
    var links = [];
    socialLinkList.querySelectorAll('.social-link-item').forEach(function(el) {
      var type = el.querySelector('.link-type').value;
      var url = el.querySelector('.link-url').value.trim();
      var label = el.querySelector('.link-label').value.trim();
      if (url) {
        links.push({ type: type, url: url, label: label || linkTypes.find(function(t) { return t.value === type; }).label });
      }
    });
    return links;
  }

  if (addSocialLinkBtn) {
    addSocialLinkBtn.addEventListener('click', function() {
      var typeOptions = linkTypes.map(function(t) {
        return '<option value="' + t.value + '">' + t.label + '</option>';
      }).join('');
      var newItem = document.createElement('div');
      newItem.className = 'social-link-item';
      newItem.innerHTML = (
        '<select class="link-type">' + typeOptions + '</select>' +
        '<input type="url" class="link-url" value="" placeholder="链接地址" />' +
        '<input type="text" class="link-label" value="" placeholder="显示名称(可选)" />' +
        '<button type="button" class="btn-remove-link" title="删除">×</button>'
      );
      socialLinkList.appendChild(newItem);
      bindSocialLinkEvents();
      newItem.querySelector('.link-url').focus();
    });
  }

  if (configForm) {
    configForm.addEventListener('submit', function(e) {
      e.preventDefault();
      siteConfig.site = {
        title: siteTitleInput.value.trim(),
        description: siteDescInput.value.trim()
      };
      siteConfig.links = getSocialLinks();
      alert('设置已保存！请点击「导出 config.json」下载配置文件并替换服务器上的文件。');
    });
  }

  if (exportConfigBtn) {
    exportConfigBtn.addEventListener('click', function() {
      siteConfig.site = {
        title: siteTitleInput.value.trim(),
        description: siteDescInput.value.trim()
      };
      siteConfig.links = getSocialLinks();
      var blob = new Blob([JSON.stringify(siteConfig, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'config.json';
      a.click();
      URL.revokeObjectURL(a.href);
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
    // 如果选择了本地图片文件，需要转换为base64
    if (productImageFile.files.length) {
      var file = productImageFile.files[0];
      imageFiles[id] = file;
      // 返回一个Promise，在提交时处理
      return {
        id: id,
        title: productTitle.value.trim(),
        setNumber: productSetNumber.value.trim() || undefined,
        category: productCategory.value.trim(),
        tags: tagsFromString(productTags.value),
        image: null, // 将在处理文件后设置
        imageFile: file, // 临时存储文件
        prices: getPriceTiers()
      };
    } else if (imageUrl) {
      delete imageFiles[id];
      return {
        id: id,
        title: productTitle.value.trim(),
        setNumber: productSetNumber.value.trim() || undefined,
        category: productCategory.value.trim(),
        tags: tagsFromString(productTags.value),
        image: imageUrl,
        prices: getPriceTiers()
      };
    } else {
      // 保持原有图片
      var existingProduct = products.find(function (p) { return p.id === id; });
      return {
        id: id,
        title: productTitle.value.trim(),
        setNumber: productSetNumber.value.trim() || undefined,
        category: productCategory.value.trim(),
        tags: tagsFromString(productTags.value),
        image: existingProduct ? existingProduct.image : undefined,
        prices: getPriceTiers()
      };
    }
  }

  // 将文件转换为base64 data URL
  function fileToDataURL(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function clearForm() {
    var currentId = productId.value.trim();
    var hadFile = productImageFile.files.length > 0;
    
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
    
    // 只有在取消编辑且确实选择了新文件时才清除临时文件引用
    // 如果文件已经保存（转换为base64），则保留在imageFiles中用于导出ZIP
    if (currentId && hadFile && imageFiles[currentId]) {
      // 检查产品是否已保存（图片是否为base64）
      var savedProduct = products.find(function(p) { return p.id === currentId; });
      if (!savedProduct || !savedProduct.image || savedProduct.image.indexOf('data:') !== 0) {
        // 如果产品未保存或图片不是base64，说明是临时文件，可以清除
        delete imageFiles[currentId];
      }
    }
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
    if (p.image) {
      imagePreview.innerHTML = '<img src="' + escapeAttr(p.image) + '" alt="" />';
      imagePreview.hidden = false;
    }
    cancelEditBtn.hidden = false;
    renderPriceTiers(p.prices || []);
  }

  productForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = productFromForm();
    if (!p.title || !p.category) {
      alert('请填写产品名称和分类！');
      return;
    }
    
    // 如果有图片文件，先转换为base64
    if (p.imageFile) {
      fileToDataURL(p.imageFile).then(function(dataUrl) {
        p.image = dataUrl;
        delete p.imageFile; // 删除临时文件引用
        saveProduct(p);
      }).catch(function(error) {
        console.error('图片转换失败:', error);
        alert('图片处理失败，请重试！');
      });
    } else {
      saveProduct(p);
    }
  });

  function saveProduct(p) {
    var idx = products.findIndex(function (x) { return x.id === p.id; });
    if (idx >= 0) {
      products[idx] = p;
    } else {
      products.push(p);
    }
    renderTable();
    fillCategoryDatalist();
    clearForm();
    
    // 自动保存到localStorage作为备份
    try {
      localStorage.setItem('products_backup', JSON.stringify(products));
    } catch (e) {
      console.warn('无法保存到localStorage:', e);
    }
    
    // 尝试自动保存到GitHub（如果配置了API）
    autoSaveToGitHub();
  }

  // 自动保存到GitHub（通过Vercel API）
  function autoSaveToGitHub() {
    // 检查是否配置了GitHub Token
    var githubToken = localStorage.getItem('github_token');
    if (!githubToken) {
      // 如果没有token，提示用户手动导出
      var message = '产品已保存到本地！';
      message += ' 如需自动保存到GitHub，请配置GitHub Token。';
      message += ' 或点击「导出 products.json」手动保存。';
      showNotification(message);
      return;
    }

    // 显示保存中提示
    showNotification('正在保存到GitHub...', 'info');

    fetch('/api/save-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: products,
        token: githubToken
      })
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || '保存失败');
        });
      }
      return response.json();
    })
    .then(function(data) {
      showNotification('✅ 产品已自动保存到GitHub！', 'success');
    })
    .catch(function(error) {
      console.error('保存到GitHub失败:', error);
      showNotification('⚠️ 自动保存失败: ' + error.message + '。请手动导出JSON。', 'error');
    });
  }

  function showNotification(message, type) {
    type = type || 'info';
    // 创建通知元素
    var notification = document.createElement('div');
    var bgColor = 'var(--bg-card)';
    var borderColor = 'var(--border)';
    
    if (type === 'success') {
      borderColor = '#22c55e';
      bgColor = 'rgba(34, 197, 94, 0.1)';
    } else if (type === 'error') {
      borderColor = '#ef4444';
      bgColor = 'rgba(239, 68, 68, 0.1)';
    } else if (type === 'info') {
      borderColor = 'var(--accent)';
      bgColor = 'rgba(59, 130, 246, 0.1)';
    }
    
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: ' + bgColor + '; border: 1px solid ' + borderColor + '; border-radius: 8px; padding: 1rem 1.5rem; color: var(--text); z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 400px; font-size: 0.875rem;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    var duration = type === 'info' ? 2000 : 4000;
    setTimeout(function() {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(function() {
        notification.remove();
      }, 300);
    }, duration);
  }

  cancelEditBtn.addEventListener('click', clearForm);

  productImageFile.addEventListener('change', function () {
    if (this.files.length) {
      var file = this.files[0];
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片文件过大，请选择小于5MB的图片！');
        this.value = '';
        return;
      }
      // 检查文件类型
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
        alert('请选择有效的图片文件（JPG、PNG、GIF或WebP）！');
        this.value = '';
        return;
      }
      var url = URL.createObjectURL(file);
      imagePreview.innerHTML = '<img src="' + url + '" alt="" />';
      imagePreview.hidden = false;
      productImageUrl.value = '';
      
      // 显示文件信息
      var fileInfo = document.createElement('div');
      fileInfo.style.cssText = 'font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;';
      fileInfo.textContent = '文件: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
      imagePreview.appendChild(fileInfo);
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
      var thumb = p.image
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
    if (products.length === 0) {
      alert('当前没有产品数据可导出！');
      return;
    }
    
    var list = products.map(function (p) {
      return {
        id: p.id,
        title: p.title,
        setNumber: p.setNumber,
        image: p.image, // 包含base64 data URL或外部URL
        category: p.category,
        tags: p.tags || [],
        prices: p.prices || []
      };
    });
    
    var jsonString = JSON.stringify(list, null, 2);
    var blob = new Blob([jsonString], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.json';
    a.click();
    URL.revokeObjectURL(a.href);
    
    showNotification('products.json 已导出！包含 ' + products.length + ' 个产品。');
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
      alert('当前没有通过「上传图片」添加的本地图片文件。\n\n注意：如果图片已转换为base64保存在products.json中，则无需单独导出图片包。');
      return;
    }
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'images.zip';
      a.click();
      URL.revokeObjectURL(a.href);
      showNotification('图片包已导出！');
    });
  }

  exportZipBtn.addEventListener('click', exportZip);

  // 初始化价格层级
  renderPriceTiers([]);

  // GitHub自动保存配置
  if (setupGitHubBtn) {
    setupGitHubBtn.addEventListener('click', function() {
      var currentToken = localStorage.getItem('github_token');
      var token = prompt('请输入GitHub Personal Access Token:\n\n创建方法：\n1. 访问 https://github.com/settings/tokens\n2. 点击 "Generate new token (classic)"\n3. 勾选 "repo" 权限\n4. 复制生成的token', currentToken || '');
      
      if (token && token.trim()) {
        localStorage.setItem('github_token', token.trim());
        showNotification('✅ GitHub Token已保存！产品将自动保存到仓库。', 'success');
        setupGitHubBtn.textContent = '已配置GitHub';
        setupGitHubBtn.style.background = 'rgba(34, 197, 94, 0.1)';
        setupGitHubBtn.style.borderColor = '#22c55e';
      } else if (token === null) {
        // 用户取消
      } else {
        localStorage.removeItem('github_token');
        showNotification('已清除GitHub Token配置。', 'info');
        setupGitHubBtn.textContent = '配置GitHub自动保存';
        setupGitHubBtn.style.background = '';
        setupGitHubBtn.style.borderColor = '';
      }
    });

    // 检查是否已配置token
    if (localStorage.getItem('github_token')) {
      setupGitHubBtn.textContent = '已配置GitHub';
      setupGitHubBtn.style.background = 'rgba(34, 197, 94, 0.1)';
      setupGitHubBtn.style.borderColor = '#22c55e';
    }
  }

  // 初始化：如果没有密码或面板可见，加载数据
  if (!ADMIN_PASSWORD) {
    loadProducts();
    loadConfig();
  }
  
  // 页面加载时检查是否有localStorage备份
  window.addEventListener('load', function() {
    try {
      var backup = localStorage.getItem('products_backup');
      if (backup && adminPanel && !adminPanel.hidden) {
        var backupData = JSON.parse(backup);
        if (backupData.length > 0) {
          var serverCount = products.length;
          if (backupData.length !== serverCount) {
            showNotification('检测到本地备份数据（' + backupData.length + ' 个产品）。当前显示服务器数据（' + serverCount + ' 个产品）。');
          }
        }
      }
    } catch (e) {
      // 忽略错误
    }
  });
  
  // 页面卸载前保存数据到localStorage
  window.addEventListener('beforeunload', function() {
    try {
      localStorage.setItem('products_backup', JSON.stringify(products));
    } catch (e) {
      console.warn('无法保存到localStorage:', e);
    }
  });
})();
