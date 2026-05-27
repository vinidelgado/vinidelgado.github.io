/* ==========================================================================
   Infinity Prompt Verse — Client Side Interactivity & Rendering Engine
   ========================================================================== */

// Global App State
let promptsData = [];
let isNewestSorted = true;
let activeTag = null;
let searchQuery = '';

// DOM Cache
const body = document.body;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const sortNewestBtn = document.getElementById('sortNewestBtn');
const galleryGrid = document.getElementById('galleryGrid');
const emptyState = document.getElementById('emptyState');
const resetAllFiltersBtn = document.getElementById('resetAllFiltersBtn');
const activeFilterFeedback = document.getElementById('activeFilterFeedback');
const activeTagName = document.getElementById('activeTagName');
const resetTagFilterBtn = document.getElementById('resetTagFilterBtn');

// Modal DOM Cache
const detailModal = document.getElementById('detailModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalImage = document.getElementById('modalImage');
const modalImageDownload = document.getElementById('modalImageDownload');
const modalCategory = document.getElementById('modalCategory');
const modalShareBtn = document.getElementById('modalShareBtn');
const modalTitle = document.getElementById('modalTitle');
const modalPromptText = document.getElementById('modalPromptText');
const modalNegativePromptSection = document.getElementById('modalNegativePromptSection');
const modalNegativePromptText = document.getElementById('modalNegativePromptText');
const settingModel = document.getElementById('settingModel');
const modalTagsContainer = document.getElementById('modalTagsContainer');
const toastContainer = document.getElementById('toastContainer');

/* ==========================================================================
   Theme Management
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.className = savedTheme;
  } else {
    // Default to dark theme
    body.className = 'dark-theme';
    localStorage.setItem('theme', 'dark-theme');
  }
}

themeToggleBtn.addEventListener('click', () => {
  if (body.classList.contains('dark-theme')) {
    body.classList.replace('dark-theme', 'light-theme');
    localStorage.setItem('theme', 'light-theme');
    showToast('Switched to Light Mode', 'info');
  } else {
    body.classList.replace('light-theme', 'dark-theme');
    localStorage.setItem('theme', 'dark-theme');
    showToast('Switched to Dark Mode', 'info');
  }
});

/* ==========================================================================
   Data Fetching & Bootstrapping
   ========================================================================== */

async function bootstrapApp() {
  initTheme();
  
  try {
    // 1. Try to load dynamically from prompts.json (works on static web servers)
    const response = await fetch('prompts.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    promptsData = await response.json();
    console.log('Successfully fetched prompts.json dynamically.');
  } catch (error) {
    // 2. Fall back to window.promptsData from prompts.js (works by double-clicking index.html)
    console.warn('Could not fetch prompts.json (expected when running via file:// protocol). Falling back to prompts.js loader...');
    if (window.promptsData && Array.isArray(window.promptsData)) {
      promptsData = window.promptsData;
    } else {
      console.error('Bootstrapping failed: Both prompts.json fetch and prompts.js fallback failed.', error);
      galleryGrid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title" style="color: #ef4444;">Data Load Error</h3>
          <p class="empty-state-text">Could not load prompt database. Make sure you have not deleted prompts.js or prompts.json.</p>
        </div>
      `;
      return;
    }
  }
  
  // Initial Render of Gallery
  renderGallery();
  
  // Handle URL parameters (Deep Linking)
  handleUrlParameters();
  
  // Newest Sort Toggle
  if (sortNewestBtn) {
    sortNewestBtn.addEventListener('click', () => {
      isNewestSorted = !isNewestSorted;
      sortNewestBtn.classList.toggle('active', isNewestSorted);
      renderGallery();
    });
  }

  // Footer Newest link
  const footerNewest = document.getElementById('footerNewest');
  if (footerNewest) {
    footerNewest.addEventListener('click', (e) => {
      e.preventDefault();
      isNewestSorted = true;
      if (sortNewestBtn) sortNewestBtn.classList.add('active');
      resetAllSearchFilters();
      galleryGrid.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   Date Parsing Utility
   ========================================================================== */

function parseDate(dateStr) {
  if (!dateStr) return new Date(0);
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/* ==========================================================================
   Gallery Rendering & Client Filtering
   ========================================================================== */

function renderGallery() {
  // Clear previous grid contents
  galleryGrid.innerHTML = '';
  
  // Apply filtering cascade
  let filtered = promptsData.filter(item => {
    // 1. Tag Filter
    if (activeTag && !item.tags.some(t => t.toLowerCase() === activeTag.toLowerCase())) {
      return false;
    }
    
    // 2. Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchPrompt = item.prompt.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q) || false;
      const matchTags = item.tags.some(tag => tag.toLowerCase().includes(q));
      const matchModel = item.settings?.model?.toLowerCase().includes(q);
      
      if (!matchTitle && !matchPrompt && !matchCategory && !matchTags && !matchModel) {
        return false;
      }
    }
    
    return true;
  });

  // Apply Sorting
  if (isNewestSorted) {
    filtered.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }
  
  // Empty State Check
  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';
  

  // Build Grid Items
  filtered.forEach(item => {
    const card = document.createElement('article');
    card.className = 'grid-item';
    card.setAttribute('data-id', item.id);
    
    // Image Box with Skeleton Shimmer
    const imgBox = document.createElement('div');
    imgBox.className = 'card-image-box shimmer';
    
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title;
    img.className = 'card-img';
    img.loading = 'lazy';
    
    // Remove Shimmer class when image finishes downloading
    img.addEventListener('load', () => {
      imgBox.classList.remove('shimmer');
    });
    img.addEventListener('error', () => {
      imgBox.classList.remove('shimmer');
      imgBox.style.padding = '2rem';
      imgBox.style.textAlign = 'center';
      imgBox.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted);">Failed to load image</span>';
    });
    
    imgBox.appendChild(img);
    card.appendChild(imgBox);
    
    // Hover Overlay
    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    
    // Top bar: Quick copy button
    const topBar = document.createElement('div');
    topBar.className = 'card-overlay-top';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'card-copy-btn';
    copyBtn.setAttribute('title', 'Copy Prompt');
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
      </svg>
    `;
    
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger modal pop-up on copy button tap
      navigator.clipboard.writeText(item.prompt).then(() => {
        showToast('Prompt copied to clipboard!', 'success');
        
        // Brief visual animation on card icon button
        copyBtn.style.backgroundColor = 'var(--color-success)';
        copyBtn.style.color = '#ffffff';
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        
        setTimeout(() => {
          copyBtn.style.backgroundColor = '';
          copyBtn.style.color = '';
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
            </svg>
          `;
        }, 1500);
      });
    });
    
    topBar.appendChild(copyBtn);
    overlay.appendChild(topBar);
    
    // Bottom details
    const bottomBar = document.createElement('div');
    bottomBar.className = 'card-overlay-bottom';
    
    const cat = document.createElement('span');
    cat.className = 'card-category';
    cat.textContent = item.category;
    
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = item.title;
    
    bottomBar.appendChild(cat);
    bottomBar.appendChild(title);
    overlay.appendChild(bottomBar);
    
    card.appendChild(overlay);
    
    // Clicking Card opens Modal View
    card.addEventListener('click', () => {
      openModal(item);
    });
    
    galleryGrid.appendChild(card);
  });
}

/* ==========================================================================
   Search Functionality
   ========================================================================== */

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  
  if (searchQuery.trim() !== '') {
    clearSearchBtn.style.display = 'flex';
  } else {
    clearSearchBtn.style.display = 'none';
  }
  
  renderGallery();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  renderGallery();
  searchInput.focus();
});

// Keyboard shortcut: Pressing slash '/' focuses search bar
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

/* ==========================================================================
   Details Modal Logic
   ========================================================================== */

function openModal(item) {
  // Update DOM elements in Modal
  modalImage.src = item.image;
  modalImage.alt = item.title;
  modalImageDownload.href = item.image;
  modalCategory.textContent = item.category;
  modalTitle.textContent = item.title;
  modalPromptText.textContent = item.prompt;
  
  // Set parameters (Focused only on Model as requested)
  if (settingModel) settingModel.textContent = item.settings?.model || '-';
  
  // Handling negative prompt visibility
  if (item.negative_prompt) {
    modalNegativePromptSection.style.display = 'flex';
    modalNegativePromptText.textContent = item.negative_prompt;
  } else {
    modalNegativePromptSection.style.display = 'none';
  }
  
  // Render Modal Tag pills
  modalTagsContainer.innerHTML = '';
  item.tags.forEach(tag => {
    const badge = document.createElement('button');
    badge.className = 'tag-badge';
    badge.textContent = tag;
    badge.addEventListener('click', () => {
      closeModal();
      setTagFilter(tag);
    });
    modalTagsContainer.appendChild(badge);
  });
  
  // Update modal clipboard copy triggers
  setupCopyAction('modalCopyPromptBtn', item.prompt);
  if (item.negative_prompt) {
    setupCopyAction('modalCopyNegativeBtn', item.negative_prompt);
  }
  
  // Set up Modal Share link generator
  modalShareBtn.onclick = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?prompt=${item.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Share link copied to clipboard!', 'success');
    });
  };
  
  // Lock scroll and show modal
  detailModal.classList.add('active');
  detailModal.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open');
  
  // Update window address bar state (Clean Deep-Link integration)
  const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?prompt=${item.id}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

function closeModal() {
  detailModal.classList.remove('active');
  detailModal.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open');
  
  // Remove image source to prevent visual flash on next open
  setTimeout(() => {
    modalImage.src = '';
  }, 200);
  
  // Restore url to base
  const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  window.history.pushState({ path: cleanUrl }, '', cleanUrl);
}

// Modal closing event hooks
closeModalBtn.addEventListener('click', closeModal);

detailModal.addEventListener('click', (e) => {
  // If clicked outer background, close modal
  if (e.target === detailModal || e.target.classList.contains('modal-container')) {
    closeModal();
  }
});

// ESC closes modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detailModal.classList.contains('active')) {
    closeModal();
  }
});

/* ==========================================================================
   Clipboard & Share Copy Helper
   ========================================================================== */

function setupCopyAction(btnId, textToCopy) {
  const btnElement = document.getElementById(btnId);
  if (!btnElement) return;

  // Remove existing listeners by cloning the button (simple JS trick to clear event listeners)
  const newBtn = btnElement.cloneNode(true);
  btnElement.parentNode.replaceChild(newBtn, btnElement);
  
  const copyIcon = newBtn.querySelector('.copy-icon');
  const checkIcon = newBtn.querySelector('.check-icon');
  const btnText = newBtn.querySelector('.btn-text');
  
  // Detect if it's a primary or secondary button for accurate theme restoration
  const isPrimary = newBtn.classList.contains('btn-primary');
  const originalClass = isPrimary ? 'btn-primary' : 'btn-secondary';
  
  newBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Copied to clipboard!', 'success');
      
      // Toggle icons and classes
      if (copyIcon) copyIcon.style.display = 'none';
      if (checkIcon) checkIcon.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'Copied!';
      
      newBtn.classList.replace(originalClass, 'btn-success');
      
      setTimeout(() => {
        if (copyIcon) copyIcon.style.display = 'inline-block';
        if (checkIcon) checkIcon.style.display = 'none';
        
        if (btnText) {
          // Restore original text based on button ID
          btnText.textContent = btnId === 'modalCopyNegativeBtn' ? 'Copy' : 'Copy Prompt';
        }
        
        newBtn.classList.replace('btn-success', originalClass);
      }, 2000);
    });
  });
}

/* ==========================================================================
   Tag Filter Engine
   ========================================================================== */

function setTagFilter(tag) {
  activeTag = tag;
  activeTagName.textContent = tag;
  activeFilterFeedback.style.display = 'flex';
  
  renderGallery();
  
  // Smooth scroll down to grid view if viewport is on mobile hero
  galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

resetTagFilterBtn.addEventListener('click', () => {
  activeTag = null;
  activeFilterFeedback.style.display = 'none';
  renderGallery();
});

/* ==========================================================================
   Deep Linking Loader
   ========================================================================== */

function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const promptId = urlParams.get('prompt');
  
  if (promptId) {
    const matchingItem = promptsData.find(item => item.id === promptId);
    if (matchingItem) {
      openModal(matchingItem);
    }
  }
}

// Reset button event listeners for empty searches
resetAllFiltersBtn.addEventListener('click', resetAllSearchFilters);

function resetAllSearchFilters() {
  searchInput.value = '';
  searchQuery = '';
  activeTag = null;
  clearSearchBtn.style.display = 'none';
  activeFilterFeedback.style.display = 'none';
  
  renderGallery();
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconHtml = '';
  if (type === 'success') {
    iconHtml = `
      <div class="toast-icon success">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;
  } else if (type === 'info') {
    iconHtml = `
      <div class="toast-icon info">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4M12 8h.01"></path>
        </svg>
      </div>
    `;
  }
  
  toast.innerHTML = `
    ${iconHtml}
    <span class="toast-message">${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger slide fade out after 2.5 seconds
  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    // Remove from DOM after transition completes
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 2500);
}

// Start application
bootstrapApp();
