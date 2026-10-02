/**
 * JavaVerse 3D Master Application Coordinator
 * Handles view switching, curriculum rendering, user progression (XP/ranks),
 * playground editor integration, search modals, and 3D scene coordination.
 */

class Application {
  constructor() {
    this.currentView = '3d-world';
    this.activeChapterId = 'ch1-jvm';
    this.scene3D = null;
    this.memoryViz = null;

    // Gamification & Quiz state
    this.xp = parseInt(localStorage.getItem('javaverse_xp') || '0', 10);
    this.completedChapters = JSON.parse(localStorage.getItem('javaverse_completed') || '[]');
    this.chapterQuizIndex = {};
    this.chapterQuizAnswers = JSON.parse(localStorage.getItem('javaverse_quiz_answers') || '{}');

    // Student profile & Certification state
    this.studentName = localStorage.getItem('javaverse_student_name') || 'Student Developer';
    this.examAnswers = JSON.parse(localStorage.getItem('javaverse_exam_answers') || '{}');
    this.examScore = parseInt(localStorage.getItem('javaverse_exam_score') || '0', 10);
    this.isExamPassed = localStorage.getItem('javaverse_exam_passed') === 'true';
    this.examDate = localStorage.getItem('javaverse_exam_date') || '';
    this.certId = localStorage.getItem('javaverse_cert_id') || '';
    this.examFastTrackUnlocked = localStorage.getItem('javaverse_exam_unlocked_manual') === 'true';

    // Instructor / Admin Authentication state
    this.isAdminAuthenticated = sessionStorage.getItem('javaverse_admin_auth') === 'true' || localStorage.getItem('javaverse_admin_remember') === 'true';
    this.adminPendingAction = null;
    this.brandClicks = 0;
    this.brandClickTimer = null;

    this.init();
  }

  init() {
    // 1. Initialize 3D Canvas
    try {
      this.scene3D = new JavaVerse3DScene('canvas-container');
    } catch (e) {
      console.error("Three.js initialization failed:", e);
    }

    // 2. Render modules in 3D world view & lesson sidebar
    this.renderModuleCards();
    this.renderSidebarChapters();

    if (this.scene3D && this.scene3D.updateCrystalsLockStatus) {
      this.scene3D.updateCrystalsLockStatus();
    }

    // 3. Bind UI Navigation and actions
    this.bindNavigation();
    this.bindPlayground();
    this.bindSearchModal();
    this.bindShortcuts();

    // 4. Update XP display
    this.updateUserStats();

    // 5. Load default chapter
    this.selectChapter(this.activeChapterId);

    // Initial sound engine status
    this.updateSoundBtn();

    // 6. Initialize Instructor / Admin Security System
    this.initAdminSystem();
  }

  // --- View Switching ---
  switchView(viewName) {
    if (this.currentView === viewName) return;

    window.soundEngine.playClick();
    this.currentView = viewName;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Canvas visibility & camera behavior based on active view
    const canvasContainer = document.getElementById('canvas-container');
    if (viewName === '3d-world') {
      canvasContainer.style.opacity = '1';
      canvasContainer.style.pointerEvents = 'auto';
      if (this.scene3D) this.scene3D.resetCamera();
    } else if (viewName === 'memory-visualizer') {
      canvasContainer.style.opacity = '0.15';
      canvasContainer.style.pointerEvents = 'none';
      if (!this.memoryViz) {
        this.memoryViz = new MemoryVisualizer('memory-canvas');
      }
    } else {
      // In lessons or playground, keep visible cosmic background glow
      canvasContainer.style.opacity = '0.38';
      canvasContainer.style.pointerEvents = 'none';
    }

    if (viewName === 'certificate') {
      this.renderCertificateView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Progression & Sequential Unlock Gating ---
  isChapterUnlocked(chapterId) {
    if (!window.JAVA_CURRICULUM) return true;
    const idx = window.JAVA_CURRICULUM.findIndex(c => c.id === chapterId);
    if (idx <= 0) return true; // Chapter 1 is always unlocked for beginners
    const prevChapter = window.JAVA_CURRICULUM[idx - 1];
    return this.completedChapters.includes(prevChapter.id);
  }

  showLockedNotice(chapterId, targetEl) {
    if (!window.JAVA_CURRICULUM) return;
    const idx = window.JAVA_CURRICULUM.findIndex(c => c.id === chapterId);
    const prevCh = idx > 0 ? window.JAVA_CURRICULUM[idx - 1] : null;
    const currentCh = window.JAVA_CURRICULUM[idx];

    const msg = prevCh
      ? `🔒 Module ${currentCh.num} is Locked! You must complete Module ${prevCh.num}: "${prevCh.title}" first.`
      : `🔒 Chapter Locked! Complete the preceding module first.`;

    this.showToast(msg, 'warning');
    window.soundEngine.playError();

    if (targetEl) {
      targetEl.classList.remove('shake-locked');
      void targetEl.offsetWidth; // trigger reflow
      targetEl.classList.add('shake-locked');
      setTimeout(() => targetEl.classList.remove('shake-locked'), 500);
    }
  }

  // --- Lock Override & Testing Utilities (Protected) ---
  requestUnlockAll() {
    if (this.isAdminAuthenticated) {
      this.executeUnlockAll();
    } else {
      this.openAdminModal('unlock-all');
    }
  }

  executeUnlockAll() {
    if (!window.JAVA_CURRICULUM) return;
    this.completedChapters = window.JAVA_CURRICULUM.map(c => c.id);
    localStorage.setItem('javaverse_completed', JSON.stringify(this.completedChapters));
    this.examFastTrackUnlocked = true;
    localStorage.setItem('javaverse_exam_unlocked_manual', 'true');
    this.addXP(350, 'Instructor Mode Unlock');

    this.renderModuleCards();
    this.renderSidebarChapters();
    if (this.populatePlaygroundSelect) this.populatePlaygroundSelect();
    if (this.scene3D && this.scene3D.updateCrystalsLockStatus) {
      this.scene3D.updateCrystalsLockStatus();
    }
    if (this.currentView === 'certificate') {
      this.renderCertificateView();
    } else if (this.currentView === 'lessons') {
      this.selectChapter(this.activeChapterId, true);
    }
    window.soundEngine.playSuccess();
    this.showToast('👑 Instructor Verified: All 7 Modules & Capstone Exam Unlocked!', 'success');
  }

  unlockAll() {
    // Intercept unauthorized calls from DevTools console or scripts
    if (!this.isAdminAuthenticated) {
      console.warn('🔒 Instructor Master Password required to unlock all modules.');
      this.openAdminModal('unlock-all');
      return;
    }
    this.executeUnlockAll();
  }

  resetProgress() {
    this.completedChapters = [];
    localStorage.removeItem('javaverse_completed');
    localStorage.removeItem('javaverse_quiz_answers');
    localStorage.removeItem('javaverse_exam_answers');
    localStorage.removeItem('javaverse_exam_passed');
    localStorage.removeItem('javaverse_exam_score');
    localStorage.removeItem('javaverse_exam_date');
    localStorage.removeItem('javaverse_cert_id');
    localStorage.removeItem('javaverse_exam_unlocked_manual');
    this.chapterQuizAnswers = {};
    this.examAnswers = {};
    this.isExamPassed = false;
    this.examFastTrackUnlocked = false;
    this.xp = 0;
    localStorage.setItem('javaverse_xp', '0');
    this.updateUserStats();

    this.renderModuleCards();
    this.renderSidebarChapters();
    if (this.populatePlaygroundSelect) this.populatePlaygroundSelect();
    if (this.scene3D && this.scene3D.updateCrystalsLockStatus) {
      this.scene3D.updateCrystalsLockStatus();
    }
    this.selectChapter('ch1-jvm', true);
    if (this.currentView === 'certificate') {
      this.renderCertificateView();
    }
    window.soundEngine.playClick();
    this.showToast('↺ Progress Reset: Sequential locks restored', 'warning');
  }

  showToast(message, type = 'warning') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastMsg) return;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    toastMsg.textContent = message;
    toastIcon.textContent = type === 'success' ? '🎉' : '🔒';
    toast.className = `toast-notification active toast-${type}`;

    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 4200);

    toast.onclick = () => {
      toast.classList.remove('active');
    };
  }

  // --- Rendering Curriculum & Modules ---
  renderModuleCards() {
    const container = document.getElementById('modules-grid-container');
    if (!container || !window.JAVA_CURRICULUM) return;

    container.innerHTML = window.JAVA_CURRICULUM.map((ch, idx) => {
      const isUnlocked = this.isChapterUnlocked(ch.id);
      const isDone = this.completedChapters.includes(ch.id);
      const prevCh = idx > 0 ? window.JAVA_CURRICULUM[idx - 1] : null;

      let statusHtml = '';
      let clickAction = '';
      let cardClass = 'module-card';

      if (!isUnlocked) {
        cardClass += ' locked';
        clickAction = `window.App.showLockedNotice('${ch.id}', this)`;
        statusHtml = `<span class="module-progress-pill locked">🔒 Locked (Complete Mod ${prevCh.num})</span>`;
      } else if (isDone) {
        clickAction = `window.App.selectChapter('${ch.id}'); window.App.switchView('lessons');`;
        statusHtml = `<span class="module-progress-pill">✓ Completed</span>`;
      } else {
        clickAction = `window.App.selectChapter('${ch.id}'); window.App.switchView('lessons');`;
        statusHtml = `<span class="module-progress-pill" style="color:var(--neon-cyan);">○ Unlocked · Current</span>`;
      }

      return `
        <div class="${cardClass}" style="--card-accent: ${ch.accent};" onclick="${clickAction}">
          <div class="module-card-header">
            <span class="module-number">${isUnlocked ? `Module ${ch.num}` : '🔒 Locked'}</span>
            <div class="module-icon-box">${isUnlocked ? ch.icon : '🔒'}</div>
          </div>
          <h3 class="module-title">${ch.title}</h3>
          <p class="module-desc">${isUnlocked ? ch.summary : `Complete Module ${prevCh.num}: "${prevCh.title}" to unlock this module and its exercises.`}</p>
          <div class="module-meta">
            <span>${ch.tag}</span>
            ${statusHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  renderSidebarChapters() {
    const list = document.getElementById('sidebar-chapter-list');
    if (!list || !window.JAVA_CURRICULUM) return;

    const total = window.JAVA_CURRICULUM.length;
    const completedCount = this.completedChapters.length;
    const percent = Math.round((completedCount / total) * 100);

    const progressHtml = `
      <div class="curriculum-progress-box">
        <div class="curriculum-progress-header">
          <span>Roadmap: ${completedCount} / ${total} Complete</span>
          <span style="color:var(--neon-emerald); font-weight:800;">${percent}%</span>
        </div>
        <div class="curriculum-progress-bar-bg">
          <div class="curriculum-progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;

    const chaptersHtml = window.JAVA_CURRICULUM.map(ch => {
      const isUnlocked = this.isChapterUnlocked(ch.id);
      const isDone = this.completedChapters.includes(ch.id);
      const isActive = ch.id === this.activeChapterId;

      let itemClass = `chapter-nav-item ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
      let clickAction = isUnlocked 
        ? `window.App.selectChapter('${ch.id}')`
        : `window.App.showLockedNotice('${ch.id}', this)`;

      let tagText = isUnlocked 
        ? `${ch.num} · ${ch.tag}` 
        : `🔒 Locked`;

      let titleIcon = !isUnlocked ? '🔒' : (isDone ? '✓' : ch.icon);

      return `
        <li class="${itemClass}" id="sidebar-item-${ch.id}" onclick="${clickAction}">
          <span class="chapter-nav-tag">${tagText}</span>
          <span class="chapter-nav-title">${titleIcon} ${ch.title}</span>
        </li>
      `;
    }).join('');

    const resetHtml = `
      <div style="margin-top:1.5rem; text-align:center;">
        <button style="background:transparent; border:none; color:var(--text-dim); font-size:0.78rem; cursor:pointer; text-decoration:underline;" onclick="window.App.resetProgress();">
          ↺ Reset Progress to Chapter 1
        </button>
      </div>
    `;

    list.innerHTML = progressHtml + chaptersHtml + resetHtml;
  }

  selectChapter(chapterId, force = false) {
    if (!force && !this.isChapterUnlocked(chapterId)) {
      this.showLockedNotice(chapterId);
      return false;
    }

    this.activeChapterId = chapterId;
    const idx = window.JAVA_CURRICULUM.findIndex(c => c.id === chapterId);
    const chapter = window.JAVA_CURRICULUM[idx];
    if (!chapter) return;

    const nextCh = (idx < window.JAVA_CURRICULUM.length - 1) ? window.JAVA_CURRICULUM[idx + 1] : null;

    // Update active highlight in sidebar
    document.querySelectorAll('.chapter-nav-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`sidebar-item-${chapterId}`);
    if (activeEl) activeEl.classList.add('active');

    // Notify 3D scene to highlight this chapter's node if in 3D mode
    if (this.scene3D) {
      this.scene3D.focusOnChapter(chapterId);
      if (this.scene3D.updateCrystalsLockStatus) {
        this.scene3D.updateCrystalsLockStatus();
      }
    }

    // Render Lesson Content Card
    const container = document.getElementById('lesson-content-container');
    if (!container) return;

    const isDone = this.completedChapters.includes(chapter.id);

    container.innerHTML = `
      <div class="lesson-card">
        <div class="lesson-header">
          <span class="lesson-badge">Chapter ${chapter.num} · ${chapter.tag}</span>
          <h1 class="lesson-main-title">${chapter.icon} ${chapter.title}</h1>
          <p class="lesson-summary">${chapter.summary}</p>
        </div>

        <div class="lesson-body">
          ${chapter.htmlContent}

          ${chapter.explanation ? `
            <h2>Line-by-Line Code Anatomy</h2>
            <div style="display:flex; flex-direction:column; gap:0.65rem; margin: 1.2rem 0;">
              ${chapter.explanation.map(item => `
                <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-cyan); padding:0.6rem 1rem; border-radius:0 8px 8px 0;">
                  <strong style="color:var(--neon-cyan); font-family:var(--font-code); font-size:0.9rem;">${item.line}</strong>
                  <div style="color:var(--text-muted); font-size:0.88rem; margin-top:3px;">${item.meaning}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Interactive 5-Question Mastery Quiz Station -->
          <div class="lesson-quiz-box" id="quiz-station-${chapter.id}">
            <!-- Populated dynamically by this.renderChapterQuiz('${chapter.id}') -->
          </div>

          <!-- Lesson Navigation & Gated Unlock Actions -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; gap:1.25rem;">
            <button class="btn-secondary" onclick="window.App.loadChapterIntoPlayground('${chapter.id}')">
              ⚡ Open Code in Playground
            </button>

            ${isDone ? `
              ${nextCh ? `
                <button class="btn-primary" style="background:linear-gradient(135deg, #00ffa3, #0088ff); box-shadow:0 0 25px rgba(0,255,163,0.4);" onclick="window.App.selectChapter('${nextCh.id}');">
                  Proceed to Module ${nextCh.num}: ${nextCh.title} ▶
                </button>
              ` : `
                <span style="color:var(--neon-emerald); font-weight:700; font-size:1.05rem;">🏆 All Chapters Completed! You are a Java Grandmaster! 👑</span>
              `}
            ` : `
              <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
                <button class="btn-primary" onclick="window.App.markChapterComplete('${chapter.id}')">
                  ✓ Mark Completed & Unlock Next Module (+50 XP)
                </button>
                ${nextCh ? `<span style="font-size:0.78rem; color:var(--text-dim);">🔒 Pass 3/5 quiz questions or click above to unlock Module ${nextCh.num}</span>` : ''}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    // Initialize & render the 5-question interactive quiz station
    this.renderChapterQuiz(chapter.id);
  }

  // --- 5-Question Mastery Quiz Station Engine ---
  renderChapterQuiz(chapterId) {
    const container = document.getElementById(`quiz-station-${chapterId}`);
    if (!container) return;

    const chapter = window.JAVA_CURRICULUM.find(c => c.id === chapterId);
    if (!chapter) return;

    const questions = chapter.quizzes || (chapter.quiz ? [chapter.quiz] : []);
    const total = questions.length;
    const currentIdx = this.chapterQuizIndex[chapterId] !== undefined ? this.chapterQuizIndex[chapterId] : 0;
    const answers = this.chapterQuizAnswers[chapterId] || {};
    const answeredCount = Object.keys(answers).length;

    // Check if user finished all questions -> Show Results Summary Card
    if (currentIdx >= total || (answeredCount === total && this.chapterQuizIndex[chapterId] === total)) {
      const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
      const isPassed = correctCount >= 3; // 60% threshold for 5 questions
      const percent = Math.round((correctCount / total) * 100);

      container.innerHTML = `
        <div class="quiz-results-card">
          <div style="font-size:2.4rem; margin-bottom:0.4rem;">${isPassed ? '🏆' : '📖'}</div>
          <h3 style="font-size:1.45rem; font-weight:800; color:#fff;">
            ${isPassed ? 'Chapter Mastery Quiz Passed!' : 'Quiz Needs Practice (Need 3/5)'}
          </h3>
          <div class="quiz-results-score ${isPassed ? 'passed' : 'failed'}">
            ${correctCount} / ${total} Correct (${percent}%)
          </div>
          <p style="color:var(--text-muted); font-size:0.95rem; max-width:540px; margin:0 auto 1.5rem;">
            ${isPassed 
              ? 'Awesome job! You answered at least 3 questions correctly and demonstrated comprehension of this Java module.' 
              : 'You need at least 3 out of 5 correct answers (60%) to pass. Review the code breakdown above and try again!'}
          </p>
          <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
            <button class="btn-secondary" onclick="window.App.retakeQuiz('${chapterId}')">
              ↺ Retake Quiz
            </button>
            ${isPassed ? `
              <button class="btn-primary" style="background:linear-gradient(135deg, #00ffa3, #00b4d8); box-shadow:0 0 20px rgba(0,255,163,0.4);" onclick="window.App.markChapterComplete('${chapterId}')">
                ✓ Confirm & Unlock Next Chapter ▶
              </button>
            ` : ''}
          </div>
        </div>
      `;
      return;
    }

    // Active Question View
    const q = questions[currentIdx];
    const isAnswered = answers[currentIdx] !== undefined;
    const recorded = answers[currentIdx];

    // Build question progress dots
    const dotsHtml = questions.map((_, i) => {
      let cls = 'quiz-dot';
      if (i === currentIdx) cls += ' active';
      if (answers[i]) {
        cls += answers[i].isCorrect ? ' correct' : ' wrong';
      }
      return `<div class="${cls}">${i + 1}</div>`;
    }).join('');

    container.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-badge">Question ${currentIdx + 1} of ${total}</span>
        <span style="color:var(--neon-amber); font-size:0.85rem; font-weight:700;">+15 XP</span>
        <div class="quiz-progress-dots">
          ${dotsHtml}
        </div>
      </div>

      <div class="quiz-question">${q.question}</div>

      <div class="quiz-options" id="quiz-options-group">
        ${q.options.map((opt, optIdx) => {
          let optCls = 'quiz-opt-btn';
          if (isAnswered) {
            if (optIdx === q.correctIndex) optCls += ' correct';
            else if (optIdx === recorded.selectedIndex) optCls += ' wrong';
          }
          return `
            <button class="${optCls}" ${isAnswered ? 'disabled' : ''} onclick="window.App.handleMultiQuizAnswer('${chapterId}', ${currentIdx}, ${optIdx}, this)">
              <span style="opacity:0.6; font-weight:700;">${String.fromCharCode(65 + optIdx)}.</span> ${opt}
            </button>
          `;
        }).join('')}
      </div>

      <div class="quiz-feedback ${isAnswered ? (recorded.isCorrect ? 'show-correct' : 'show-wrong') : ''}" style="${isAnswered ? 'display:block;' : 'display:none;'}">
        ${isAnswered ? ((recorded.isCorrect ? '✓ Correct! ' : '✗ Incorrect. ') + q.explanation) : ''}
      </div>

      ${isAnswered ? `
        <div class="quiz-nav-row">
          <span style="font-size:0.85rem; color:var(--text-muted);">
            ${currentIdx + 1 < total ? `Next up: Question ${currentIdx + 2} of ${total}` : 'All 5 questions answered!'}
          </span>
          <button class="btn-primary" style="padding: 7px 18px; font-size:0.9rem;" onclick="window.App.advanceQuizQuestion('${chapterId}')">
            ${currentIdx + 1 < total ? 'Next Question ▶' : 'Finish & View Score 🏆'}
          </button>
        </div>
      ` : ''}
    `;
  }

  handleMultiQuizAnswer(chapterId, questionIdx, selectedIdx, btnElement) {
    const chapter = window.JAVA_CURRICULUM.find(c => c.id === chapterId);
    if (!chapter) return;
    const questions = chapter.quizzes || (chapter.quiz ? [chapter.quiz] : []);
    const q = questions[questionIdx];
    if (!q) return;

    const isCorrect = selectedIdx === q.correctIndex;

    if (!this.chapterQuizAnswers[chapterId]) {
      this.chapterQuizAnswers[chapterId] = {};
    }
    this.chapterQuizAnswers[chapterId][questionIdx] = { selectedIndex: selectedIdx, isCorrect };
    localStorage.setItem('javaverse_quiz_answers', JSON.stringify(this.chapterQuizAnswers));

    if (isCorrect) {
      window.soundEngine.playSuccess();
      this.addXP(15, "Quiz Question Correct");
    } else {
      window.soundEngine.playError();
    }

    // Check if this was the 5th question and score is passing (>= 3/5)
    const answeredCount = Object.keys(this.chapterQuizAnswers[chapterId]).length;
    if (answeredCount === questions.length) {
      const correctCount = Object.values(this.chapterQuizAnswers[chapterId]).filter(a => a.isCorrect).length;
      if (correctCount >= 3) {
        this.markChapterComplete(chapterId);
      }
    }

    this.renderChapterQuiz(chapterId);
  }

  advanceQuizQuestion(chapterId) {
    const chapter = window.JAVA_CURRICULUM.find(c => c.id === chapterId);
    if (!chapter) return;
    const questions = chapter.quizzes || (chapter.quiz ? [chapter.quiz] : []);
    const cur = this.chapterQuizIndex[chapterId] !== undefined ? this.chapterQuizIndex[chapterId] : 0;

    if (cur < questions.length - 1) {
      this.chapterQuizIndex[chapterId] = cur + 1;
    } else {
      this.chapterQuizIndex[chapterId] = questions.length; // triggers score summary card
    }
    window.soundEngine.playClick();
    this.renderChapterQuiz(chapterId);
  }

  retakeQuiz(chapterId) {
    this.chapterQuizIndex[chapterId] = 0;
    if (this.chapterQuizAnswers[chapterId]) {
      delete this.chapterQuizAnswers[chapterId];
      localStorage.setItem('javaverse_quiz_answers', JSON.stringify(this.chapterQuizAnswers));
    }
    window.soundEngine.playClick();
    this.renderChapterQuiz(chapterId);
  }

  markChapterComplete(chapterId) {
    if (!this.completedChapters.includes(chapterId)) {
      this.completedChapters.push(chapterId);
      localStorage.setItem('javaverse_completed', JSON.stringify(this.completedChapters));
      this.addXP(50, "Chapter Completed");
      window.soundEngine.playSuccess();

      // Show celebratory unlock toast
      const idx = window.JAVA_CURRICULUM.findIndex(c => c.id === chapterId);
      if (idx < window.JAVA_CURRICULUM.length - 1) {
        const nextCh = window.JAVA_CURRICULUM[idx + 1];
        this.showToast(`🎉 Module Complete! Module ${nextCh.num}: "${nextCh.title}" is now UNLOCKED! 🔓`, 'success');
      } else {
        this.showToast(`🏆 Congratulations! You completed all 7 modules! You are a Java Grandmaster! 👑`, 'success');
      }

      this.renderSidebarChapters();
      this.renderModuleCards();
      if (this.scene3D && this.scene3D.updateCrystalsLockStatus) {
        this.scene3D.updateCrystalsLockStatus();
      }
      this.selectChapter(chapterId, true); // Refresh lesson view so next module button appears
    }
  }

  resetProgress() {
    if (confirm("Reset all course progress and start fresh from Module 01?")) {
      this.completedChapters = [];
      this.chapterQuizIndex = {};
      this.chapterQuizAnswers = {};
      this.xp = 0;
      localStorage.removeItem('javaverse_completed');
      localStorage.removeItem('javaverse_quiz_answers');
      localStorage.removeItem('javaverse_quizzes');
      localStorage.removeItem('javaverse_xp');
      this.updateUserStats();
      this.renderSidebarChapters();
      this.renderModuleCards();
      if (this.scene3D && this.scene3D.updateCrystalsLockStatus) {
        this.scene3D.updateCrystalsLockStatus();
      }
      this.selectChapter(window.JAVA_CURRICULUM[0].id, true);
      this.showToast("↺ Progress reset. Module 01 is unlocked!", "success");
      window.soundEngine.playClick();
    }
  }

  // --- XP & Progression ---
  addXP(amount, reason) {
    this.xp += amount;
    localStorage.setItem('javaverse_xp', this.xp.toString());
    this.updateUserStats();
  }

  updateUserStats() {
    const xpEl = document.getElementById('user-xp-display');
    const rankEl = document.getElementById('user-rank-display');

    if (xpEl) xpEl.textContent = `${this.xp} XP`;

    let rank = "Byte Novice";
    if (this.xp >= 800) rank = "JVM Grandmaster 👑";
    else if (this.xp >= 500) rank = "OOP Architect 🏛️";
    else if (this.xp >= 250) rank = "Class Crafter ⚙️";
    else if (this.xp >= 100) rank = "Syntax Voyager 🚀";

    if (rankEl) rankEl.textContent = rank;
  }

  // --- Playground Integration ---
  bindPlayground() {
    const runBtn = document.getElementById('btn-run-code');
    const resetBtn = document.getElementById('btn-reset-code');
    const clearBtn = document.getElementById('btn-clear-console');
    const editor = document.getElementById('playground-editor');
    const lineNums = document.getElementById('line-numbers');
    const chapterSelector = document.getElementById('playground-chapter-select');

    // Populate chapter select dropdown in playground with lock states
    const populatePlaygroundSelect = () => {
      if (chapterSelector && window.JAVA_CURRICULUM) {
        chapterSelector.innerHTML = window.JAVA_CURRICULUM.map(c => {
          const isUnlocked = this.isChapterUnlocked(c.id);
          return `<option value="${c.id}" ${!isUnlocked ? 'disabled' : ''}>${isUnlocked ? '' : '🔒 '}${c.num}. ${c.title}</option>`;
        }).join('');
      }
    };
    this.populatePlaygroundSelect = populatePlaygroundSelect;
    populatePlaygroundSelect();

    chapterSelector?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (!this.isChapterUnlocked(selectedId)) {
        this.showLockedNotice(selectedId);
        chapterSelector.value = this.activeChapterId;
        return;
      }
      this.loadChapterIntoPlayground(selectedId, false);
    });

    // Sync line numbers on typing
    const updateLineNumbers = () => {
      if (!editor || !lineNums) return;
      const count = editor.value.split('\n').length;
      let numsStr = '';
      for (let i = 1; i <= Math.max(count, 18); i++) {
        numsStr += `${i}\n`;
      }
      lineNums.textContent = numsStr;
    };

    if (editor) {
      // Auto-save code on typing with visual status pill (Immediate save to prevent data loss)
      let saveTimer = null;
      editor.addEventListener('input', () => {
        updateLineNumbers();
        const selectedId = chapterSelector ? chapterSelector.value : this.activeChapterId;
        if (selectedId) {
          localStorage.setItem(`javaverse_code_${selectedId}`, editor.value);
        }

        const pill = document.getElementById('code-save-indicator');
        const pillText = document.getElementById('code-save-text');
        if (pill) pill.classList.add('saving');
        if (pillText) pillText.textContent = 'Saving...';

        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          if (pill) pill.classList.remove('saving');
          if (pillText) pillText.textContent = 'Auto-Saved';
        }, 400);
      });

      editor.addEventListener('scroll', () => {
        if (lineNums) lineNums.scrollTop = editor.scrollTop;
      });

      // Handle Tab key in code editor
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
          editor.selectionStart = editor.selectionEnd = start + 4;
          updateLineNumbers();
        }
      });

      // Set initial code (restores saved code if user previously typed here)
      const firstChId = window.JAVA_CURRICULUM[0].id;
      const initialSaved = localStorage.getItem(`javaverse_code_${firstChId}`);
      editor.value = (initialSaved !== null) ? initialSaved : window.JAVA_CURRICULUM[0].codeSample;
      updateLineNumbers();
    }

    // Run Code Action
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        this.executePlaygroundCode();
      });
    }

    // Reset Code
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const selectedId = chapterSelector ? chapterSelector.value : this.activeChapterId;
        const ch = window.JAVA_CURRICULUM.find(c => c.id === selectedId);
        if (ch && editor) {
          localStorage.removeItem(`javaverse_code_${selectedId}`);
          editor.value = ch.codeSample;
          updateLineNumbers();
          window.soundEngine.playClick();
          this.showToast('↺ Code restored to chapter starter template', '↺');
        }
      });
    }

    // Clear Console
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const consoleEl = document.getElementById('console-output');
        if (consoleEl) {
          consoleEl.innerHTML = '<span class="console-entry info">// Terminal cleared. Click "Run Code ▶" to execute.</span>';
        }
      });
    }
  }

  loadChapterIntoPlayground(chapterId, switchToView = true) {
    if (!this.isChapterUnlocked(chapterId)) {
      this.showLockedNotice(chapterId);
      return;
    }

    const ch = window.JAVA_CURRICULUM.find(c => c.id === chapterId);
    if (!ch) return;

    const editor = document.getElementById('playground-editor');
    const select = document.getElementById('playground-chapter-select');

    if (editor) {
      const saved = localStorage.getItem(`javaverse_code_${chapterId}`);
      editor.value = (saved !== null) ? saved : ch.codeSample;
      editor.dispatchEvent(new Event('input'));
    }
    if (select) {
      select.value = chapterId;
    }

    if (switchToView) {
      this.switchView('playground');
    }
  }

  executePlaygroundCode() {
    const editor = document.getElementById('playground-editor');
    const consoleEl = document.getElementById('console-output');
    const timeBadge = document.getElementById('exec-time-badge');
    if (!editor || !consoleEl) return;

    window.soundEngine.playCompile();

    // Show compiling pulse
    consoleEl.innerHTML = `<span class="console-entry info">⚙️ Compiling with javac Main.java...</span>`;

    setTimeout(() => {
      const code = editor.value;
      const res = window.javaSimulator.run(code);

      if (timeBadge) {
        timeBadge.textContent = `${res.timeMs}ms`;
      }

      if (res.success) {
        window.soundEngine.playSuccess();
        this.addXP(10, "Code Executed");

        let traceHtml = '';
        if (res.trace && res.trace.length > 0) {
          traceHtml = `
            <div style="margin: 10px 0; color:#38bdf8;">--- JVM Trace & Memory Allocations ---</div>
            ${res.trace.map(t => `<div class="console-entry step-trace">⚡ ${t}</div>`).join('')}
            <div style="margin: 10px 0; color:#00ffa3;">--- Standard Output ---</div>
          `;
        }

        consoleEl.innerHTML = `
          <div class="console-entry success">✓ Build Successful. Running JVM...</div>
          ${traceHtml}
          <div class="console-entry" style="color:#ffffff; font-weight:600;">${this.escapeHtml(res.output)}</div>
          <div class="console-entry info" style="margin-top:12px;">Process finished with exit code 0 (${res.timeMs}ms)</div>
        `;
      } else {
        window.soundEngine.playError();
        consoleEl.innerHTML = `
          <div class="console-entry error">❌ Compilation / Runtime Failure:</div>
          <div class="console-entry error" style="margin-top:6px;">${this.escapeHtml(res.output)}</div>
          <div class="console-entry info" style="margin-top:12px;">Process finished with exit code 1</div>
        `;
      }
    }, 280);
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Search & Cheatsheet Modals ---
  bindSearchModal() {
    const searchModal = document.getElementById('search-modal');
    const cheatsheetModal = document.getElementById('cheatsheet-modal');
    const mobileModal = document.getElementById('mobile-modal');
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('search-results-list');

    // Open Search
    document.getElementById('btn-open-search')?.addEventListener('click', () => {
      searchModal.classList.add('active');
      searchInput.focus();
      window.soundEngine.playClick();
    });

    // Open Cheatsheet
    document.getElementById('btn-open-cheatsheet')?.addEventListener('click', () => {
      this.populateCheatsheetModal();
      cheatsheetModal.classList.add('active');
      window.soundEngine.playClick();
    });

    // Mobile / Remote Device Connect Modal
    const mobileShareUrl = document.getElementById('mobile-share-url');
    const mobileShareStatus = document.getElementById('mobile-share-status');
    const copyMobileLinkButton = document.getElementById('btn-copy-mobile-link');
    const copyBtnLabel = document.getElementById('copy-btn-label');
    const mobileQrImage = document.getElementById('mobile-qr-image');
    const tunnelStatusText = document.getElementById('tunnel-status-text');

    let cachedTunnelUrl = 'https://06c3d6ecef996c.lhr.life';

    const getActiveShareUrl = () => {
      const hostname = window.location.hostname.toLowerCase();
      const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(hostname);
      if (!isLocalHost && window.location.origin) {
        return window.location.href;
      }
      return cachedTunnelUrl;
    };

    const updateMobileShareUI = (targetUrl) => {
      if (mobileShareUrl) {
        mobileShareUrl.textContent = targetUrl;
      }
      if (mobileQrImage) {
        mobileQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}&color=00f0ff&bgcolor=0a0e24`;
      }
      if (copyMobileLinkButton) {
        copyMobileLinkButton.disabled = false;
      }
      if (tunnelStatusText) {
        tunnelStatusText.textContent = 'Live Cloud Tunnel Active';
      }
    };

    const fetchTunnelInfo = async () => {
      try {
        const res = await fetch('tunnel-info.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.publicUrl) {
            cachedTunnelUrl = data.publicUrl;
          }
        }
      } catch (e) {
        // Fallback to cached default
      }
      updateMobileShareUI(getActiveShareUrl());
    };

    // Pre-fetch on startup
    fetchTunnelInfo();

    document.getElementById('btn-open-mobile')?.addEventListener('click', () => {
      fetchTunnelInfo();
      mobileModal.classList.add('active');
      if (mobileShareStatus) mobileShareStatus.textContent = '';
      if (copyBtnLabel) copyBtnLabel.textContent = 'Copy Link';
      window.soundEngine.playClick();
    });

    const doCopy = async () => {
      const textToCopy = getActiveShareUrl();
      let copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
          copied = true;
        } else {
          throw new Error('Clipboard API unavailable');
        }
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
          copied = document.execCommand('copy');
        } catch (e) {
          copied = false;
        }
        document.body.removeChild(ta);
      }

      if (copied) {
        window.soundEngine.playSuccess();
        if (copyBtnLabel) copyBtnLabel.textContent = 'Copied! ✓';
        if (mobileShareStatus) mobileShareStatus.textContent = '✓ Link copied to clipboard!';
        setTimeout(() => {
          if (copyBtnLabel) copyBtnLabel.textContent = 'Copy Link';
        }, 3000);
      } else {
        if (mobileShareStatus) mobileShareStatus.textContent = 'Tap & hold the address box to copy manually.';
      }
    };

    copyMobileLinkButton?.addEventListener('click', doCopy);
    mobileShareUrl?.addEventListener('click', doCopy);

    // Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        searchModal.classList.remove('active');
        cheatsheetModal.classList.remove('active');
        mobileModal.classList.remove('active');
      });
    });

    // Click backdrop to close
    window.addEventListener('click', (e) => {
      if (e.target === searchModal) searchModal.classList.remove('active');
      if (e.target === cheatsheetModal) cheatsheetModal.classList.remove('active');
      if (e.target === mobileModal) mobileModal.classList.remove('active');
    });

    // Search query filter
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) {
          searchResults.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:1.5rem;">Type to search Java keywords, chapters, and concepts...</div>';
          return;
        }

        const matches = window.JAVA_CURRICULUM.filter(ch => 
          ch.title.toLowerCase().includes(q) ||
          ch.tag.toLowerCase().includes(q) ||
          ch.summary.toLowerCase().includes(q) ||
          ch.codeSample.toLowerCase().includes(q)
        );

        if (matches.length === 0) {
          searchResults.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:1.5rem;">No matching Java concepts found.</div>';
          return;
        }

        searchResults.innerHTML = matches.map(m => {
          const isUnlocked = this.isChapterUnlocked(m.id);
          const clickAction = isUnlocked
            ? `window.App.selectChapter('${m.id}'); window.App.switchView('lessons'); document.getElementById('search-modal').classList.remove('active');`
            : `window.App.showLockedNotice('${m.id}');`;
          return `
            <div class="search-result-item" style="${!isUnlocked ? 'opacity:0.55; cursor:not-allowed;' : ''}" onclick="${clickAction}">
              <div style="font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">
                <span>${isUnlocked ? m.icon : '🔒'}</span> ${m.title}
                <span style="font-size:0.75rem; color:${isUnlocked ? 'var(--neon-cyan)' : 'var(--neon-rose)'}; background:${isUnlocked ? 'rgba(0,240,255,0.1)' : 'rgba(255,51,102,0.15)'}; padding:2px 6px; border-radius:4px;">
                  ${isUnlocked ? `Module ${m.num}` : '🔒 Locked'}
                </span>
              </div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">${isUnlocked ? m.summary : 'Complete preceding chapters to unlock.'}</div>
            </div>
          `;
        }).join('');
      });
    }
  }

  populateCheatsheetModal() {
    const container = document.getElementById('cheatsheet-content');
    if (!container || !window.JAVA_CHEATSHEET) return;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${window.JAVA_CHEATSHEET.map(group => `
          <div>
            <h3 style="color:var(--neon-cyan); font-size:1.1rem; margin-bottom:0.6rem;">${group.topic}</h3>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${group.items.map(item => `
                <span style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:5px 12px; border-radius:6px; font-family:var(--font-code); font-size:0.85rem; color:#e2e8f0;">${item}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- Sound Toggle ---
  bindNavigation() {
    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) this.switchView(view);
      });
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        window.soundEngine.toggle();
        this.updateSoundBtn();
      });
    }
  }

  updateSoundBtn() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (!soundBtn) return;
    const isEnabled = window.soundEngine.enabled;
    soundBtn.innerHTML = isEnabled ? '🔊' : '🔇';
    soundBtn.title = isEnabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)';
  }

  bindShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('btn-open-search')?.click();
      }
      // Instructor Mode Shortcuts: Ctrl+Shift+U or Ctrl+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'u' || e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        this.openAdminModal('unlock-all');
      }
    });
  }

  // ===================================================
  // CERTIFICATION EXAM & COMPLETION CERTIFICATE ENGINE
  // ===================================================
  renderCertificateView() {
    const container = document.getElementById('certificate-view-container');
    if (!container) return;

    const totalChapters = window.JAVA_CURRICULUM ? window.JAVA_CURRICULUM.length : 7;
    const completedCount = this.completedChapters.length;
    const allChaptersDone = completedCount >= totalChapters;
    const canTakeExam = allChaptersDone || this.examFastTrackUnlocked;

    // CASE 1: Exam has already been passed! Show Verified Completion Certificate!
    if (this.isExamPassed) {
      container.innerHTML = this.buildCertificateHTML();
      this.bindCertificateEvents();
      return;
    }

    // CASE 2: Ready to take Exam (all 7 chapters completed OR fast-tracked)
    if (canTakeExam) {
      container.innerHTML = this.buildExamHTML();
      this.bindExamEvents();
      return;
    }

    // CASE 3: Incomplete Curriculum (< 7 chapters)
    container.innerHTML = this.buildPrerequisitesHTML(completedCount, totalChapters);
  }

  buildCertificateHTML() {
    const studentName = this.studentName || 'Student Developer';
    const score = this.examScore || 90;
    const dateStr = this.examDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = this.certId || 'JV-2026-849201';

    return `
      <!-- Student Name Customizer Bar -->
      <div class="student-name-editor-box">
        <div class="student-name-input-group">
          <label for="cert-student-name-input" style="font-size:0.9rem; font-weight:700; color:var(--neon-cyan); white-space:nowrap;">
            ✏️ Certificate Recipient Name:
          </label>
          <input type="text" id="cert-student-name-input" class="student-name-field" value="${this.escapeHtml(studentName)}" placeholder="Enter your full legal name (e.g. Alex Chen)">
          <button class="btn-primary" id="btn-save-cert-name" style="padding:6px 14px; font-size:0.85rem; white-space:nowrap;">
            💾 Save Name
          </button>
        </div>
        <div style="font-size:0.82rem; color:var(--text-muted);">
          Saved to browser profile. Appears immediately on certificate.
        </div>
      </div>

      <!-- Printable Certificate Frame -->
      <div class="certificate-print-container">
        <div class="javaverse-certificate" id="javaverse-certificate">
          <!-- Decorative Corner Brackets -->
          <div class="cert-corner top-left"></div>
          <div class="cert-corner top-right"></div>
          <div class="cert-corner bottom-left"></div>
          <div class="cert-corner bottom-right"></div>

          <!-- Academic Crest -->
          <div class="cert-crest">☕</div>
          <div class="cert-institution-name">JavaVerse Virtual JVM Academy & Directorate of Computing</div>
          <h2 class="cert-academic-heading">Certificate of Mastery & Completion</h2>

          <div class="cert-confer-text">This official credential is formally conferred upon</div>

          <!-- Student Name (Large Gold Display) -->
          <div class="cert-student-name" id="cert-display-name">${this.escapeHtml(studentName)}</div>
          <div class="cert-divider-line"></div>

          <!-- Citation of Achievement -->
          <p class="cert-citation-text">
            For outstanding scholarly achievement and successful completion of rigorous examination in full-stack Java engineering, including JVM internal memory architecture, object-oriented design patterns, polymorphic inheritance, collections frameworks, and fault-tolerant exception handling.
          </p>

          <div class="cert-course-title">Full-Stack Java Architecture & Fundamentals</div>

          <div class="cert-honors-pill">
            ★ PASSED WITH DISTINCTION · EXAM SCORE: ${score}% ★
          </div>

          <!-- Footer Metadata Grid -->
          <div class="cert-footer-grid">
            <div class="cert-meta-col">
              <div><strong>Issue Date:</strong> ${dateStr}</div>
              <div><strong>Credential ID:</strong> <code style="color:#d4af37;">${certId}</code></div>
              <div><strong>Verification:</strong> 🟢 Cryptographically Verified</div>
            </div>

            <!-- Gold Embossed Seal -->
            <div class="cert-seal-wrap">
              <div class="cert-gold-seal">🏆</div>
              <div class="cert-seal-caption">OFFICIAL SEAL</div>
            </div>

            <!-- Signatures -->
            <div class="cert-sig-col">
              <div class="cert-sig-line">James Gosling</div>
              <div class="cert-sig-name">Dr. James Gosling</div>
              <div class="cert-sig-title">Honorary Fellow & JVM Creator</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Certificate Action Buttons -->
      <div class="cert-action-bar">
        <button class="btn-primary" id="btn-print-cert" style="background:linear-gradient(135deg, #ffd700, #ffae19); color:#000; font-weight:800; padding:10px 22px;">
          🖨️ Print / Save as PDF Certificate
        </button>
        <button class="btn-secondary" id="btn-retake-exam" style="padding:10px 18px;">
          🔄 Retake Exam for Higher Score
        </button>
        <button class="btn-secondary" onclick="window.App.switchView('3d-world');" style="padding:10px 18px;">
          🌌 Return to 3D Cosmos
        </button>
      </div>
    `;
  }

  buildExamHTML() {
    const questions = window.JAVA_CERTIFICATION_EXAM || [];
    const total = questions.length;
    const currentIdx = Math.min(Math.max(this.examCurrentIdx, 0), total - 1);
    const q = questions[currentIdx];
    const studentName = this.studentName || '';

    const answers = this.examAnswers || {};
    const selectedOption = answers[q.id];
    const answeredCount = Object.keys(answers).length;

    return `
      <div class="exam-card">
        <!-- Pre-exam Name Prompt -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:0.9rem 1.25rem; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.8rem;">
          <div style="display:flex; align-items:center; gap:0.6rem; flex:1; min-width:260px;">
            <label for="exam-student-name" style="font-size:0.85rem; font-weight:700; color:var(--neon-cyan); white-space:nowrap;">
              Student Name:
            </label>
            <input type="text" id="exam-student-name" class="student-name-field" style="padding:4px 10px; font-size:0.88rem;" value="${this.escapeHtml(studentName)}" placeholder="Your full name for certificate">
          </div>
          <span style="font-size:0.8rem; color:var(--text-muted);">
            70% (7/10) required to pass and claim certificate.
          </span>
        </div>

        <div class="exam-header">
          <div>
            <div class="exam-stepper-label">Question ${currentIdx + 1} of ${total}</div>
            <div style="font-size:0.82rem; color:var(--text-muted); margin-top:2px;">
              ${answeredCount} of ${total} answered
            </div>
          </div>
          <span class="exam-category-tag">${q.module}</span>
        </div>

        <!-- Question Matrix (Dots) -->
        <div class="exam-dots-grid">
          ${questions.map((item, idx) => {
            const isAns = answers[item.id] !== undefined;
            const isAct = idx === currentIdx;
            return `
              <button class="exam-dot ${isAct ? 'active' : ''} ${isAns ? 'answered' : ''}" 
                      onclick="window.App.goToExamQuestion(${idx})" 
                      title="Jump to question ${idx + 1}">
                ${idx + 1}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Question Text -->
        <div class="exam-question-body">${this.escapeHtml(q.question)}</div>

        <!-- 4 Options -->
        <div class="exam-options-container">
          ${q.options.map((opt, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const letter = ['A', 'B', 'C', 'D'][optIdx];
            return `
              <button class="exam-option-card ${isSelected ? 'selected' : ''}" 
                      onclick="window.App.selectExamOption('${q.id}', ${optIdx})">
                <span class="option-letter">${letter}</span>
                <span style="flex:1;">${this.escapeHtml(opt)}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Exam Stepper Actions -->
        <div class="exam-nav-bar">
          <button class="btn-secondary" 
                  onclick="window.App.goToExamQuestion(${currentIdx - 1})" 
                  ${currentIdx === 0 ? 'disabled' : ''}>
            ◀ Previous
          </button>

          <div style="display:flex; gap:0.75rem;">
            ${currentIdx < total - 1 ? `
              <button class="btn-primary" onclick="window.App.goToExamQuestion(${currentIdx + 1})">
                Next Question ▶
              </button>
            ` : ''}

            <button class="btn-primary" 
                    id="btn-submit-exam" 
                    style="background:linear-gradient(135deg, #00ffa3, #00b8ff); box-shadow:0 0 20px rgba(0,255,163,0.35);" 
                    onclick="window.App.submitExam()">
              🏁 Submit Exam & Grade
            </button>
          </div>
        </div>
      </div>
    `;
  }

  buildPrerequisitesHTML(completedCount, totalChapters) {
    const percent = Math.round((completedCount / totalChapters) * 100);

    return `
      <div class="cert-progress-card">
        <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
          <span>🔒</span> Capstone Exam Locked: Complete All 7 Modules
        </h2>
        <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:1.5rem;">
          To preserve credential rigor, the JavaVerse Capstone Certification Exam unlocks automatically once all 7 curriculum modules have been completed.
        </p>

        <!-- Progress Meter -->
        <div class="progress-meter-wrap">
          <div class="progress-meter-header">
            <span>Course Progress</span>
            <span style="color:var(--neon-cyan);">${completedCount} of ${totalChapters} Modules Completed (${percent}%)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>

        <!-- 7 Modules Checklist -->
        <div class="cert-modules-checklist">
          ${window.JAVA_CURRICULUM.map(m => {
            const isDone = this.completedChapters.includes(m.id);
            return `
              <div class="cert-module-item ${isDone ? 'completed' : 'locked'}" onclick="window.App.selectChapter('${m.id}'); window.App.switchView('lessons');" style="cursor:pointer;" title="Click to view module">
                <div>
                  <div style="font-size:0.78rem; color:var(--text-muted);">Chapter ${m.num}</div>
                  <div style="font-weight:700; font-size:0.9rem; color:#fff;">${m.icon} ${m.title}</div>
                </div>
                <span class="item-status">${isDone ? '✓ Completed' : '🔒 Locked'}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding-top:1.2rem; border-top:1px solid rgba(255,255,255,0.08);">
          <button class="btn-primary" onclick="window.App.switchView('lessons');">
            🚀 Continue Next Lesson
          </button>
          
          <button class="btn-secondary admin-only" onclick="window.App.requestFastTrackExam()" style="border-color:rgba(255,174,25,0.5); color:#ffae19;" title="Directly take the certification exam for evaluation">
            ⚡ Fast-Track: Unlock Exam (Instructor Mode)
          </button>
        </div>
      </div>
    `;
  }

  saveStudentName(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      this.showToast('Please enter a valid name', '⚠️');
      return;
    }
    this.studentName = trimmed;
    localStorage.setItem('javaverse_student_name', trimmed);
    const displayName = document.getElementById('cert-display-name');
    if (displayName) displayName.textContent = trimmed;
    this.showToast('✓ Name saved to Certificate & Profile', '💾');
  }

  requestFastTrackExam() {
    if (this.isAdminAuthenticated) {
      this.fastTrackExam();
    } else {
      this.openAdminModal('fasttrack-exam');
    }
  }

  fastTrackExam() {
    if (!this.isAdminAuthenticated) {
      this.openAdminModal('fasttrack-exam');
      return;
    }
    this.examFastTrackUnlocked = true;
    localStorage.setItem('javaverse_exam_unlocked_manual', 'true');
    this.showToast('⚡ Capstone Certification Exam Unlocked!', '🎓');
    this.renderCertificateView();
  }

  selectExamOption(questionId, optionIdx) {
    this.examAnswers[questionId] = optionIdx;
    localStorage.setItem('javaverse_exam_answers', JSON.stringify(this.examAnswers));
    window.soundEngine.playClick();
    this.renderCertificateView();
  }

  goToExamQuestion(idx) {
    const total = window.JAVA_CERTIFICATION_EXAM ? window.JAVA_CERTIFICATION_EXAM.length : 10;
    if (idx < 0 || idx >= total) return;
    this.examCurrentIdx = idx;
    this.renderCertificateView();
  }

  submitExam() {
    const questions = window.JAVA_CERTIFICATION_EXAM || [];
    const total = questions.length;
    const answers = this.examAnswers || {};
    const answeredCount = Object.keys(answers).length;

    // Check student name input if present
    const nameInput = document.getElementById('exam-student-name');
    if (nameInput && nameInput.value.trim()) {
      this.studentName = nameInput.value.trim();
      localStorage.setItem('javaverse_student_name', this.studentName);
    }

    if (answeredCount < total) {
      if (!confirm(`You have answered ${answeredCount} of ${total} questions. Are you sure you want to submit? Unanswered questions will count as incorrect.`)) {
        return;
      }
    }

    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / total) * 100);
    this.examScore = scorePercent;
    localStorage.setItem('javaverse_exam_score', scorePercent.toString());

    if (scorePercent >= 70) {
      this.isExamPassed = true;
      localStorage.setItem('javaverse_exam_passed', 'true');
      this.examDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      localStorage.setItem('javaverse_exam_date', this.examDate);
      this.certId = `JV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('javaverse_cert_id', this.certId);

      this.addXP(200, 'Certification Exam Passed');
      window.soundEngine.playSuccess();
      this.showToast(`🎉 Congratulations! You scored ${scorePercent}% and earned your Certificate!`, '🎓');
      this.renderCertificateView();
    } else {
      window.soundEngine.playError();
      alert(`Exam Finished!\n\nYour Score: ${scorePercent}% (${correctCount}/${total} correct).\n\nYou need at least 70% to earn your completion certificate.\nReview your answers and click "Retake Exam" when ready!`);
      this.renderCertificateView();
    }
  }

  retakeExam() {
    if (confirm('Retake the certification exam? Your previous answers will be cleared.')) {
      this.examAnswers = {};
      this.examCurrentIdx = 0;
      this.isExamPassed = false;
      localStorage.removeItem('javaverse_exam_answers');
      localStorage.removeItem('javaverse_exam_passed');
      this.renderCertificateView();
    }
  }

  bindCertificateEvents() {
    const saveBtn = document.getElementById('btn-save-cert-name');
    const nameInput = document.getElementById('cert-student-name-input');
    const printBtn = document.getElementById('btn-print-cert');
    const retakeBtn = document.getElementById('btn-retake-exam');

    saveBtn?.addEventListener('click', () => {
      if (nameInput) this.saveStudentName(nameInput.value);
    });

    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.saveStudentName(nameInput.value);
      }
    });

    nameInput?.addEventListener('input', () => {
      const displayName = document.getElementById('cert-display-name');
      if (displayName) {
        displayName.textContent = nameInput.value.trim() || 'Student Developer';
      }
      localStorage.setItem('javaverse_student_name', nameInput.value.trim());
    });

    printBtn?.addEventListener('click', () => {
      window.print();
    });

    retakeBtn?.addEventListener('click', () => {
      this.retakeExam();
    });
  }

  bindExamEvents() {
    const nameInput = document.getElementById('exam-student-name');
    nameInput?.addEventListener('input', () => {
      this.studentName = nameInput.value.trim();
      localStorage.setItem('javaverse_student_name', this.studentName);
    });
  }

  // ===================================================
  // INSTRUCTOR / ADMIN SECURITY & MASTER PASSWORD ENGINE
  // ===================================================
  initAdminSystem() {
    if (this.isAdminAuthenticated) {
      document.body.classList.add('admin-authenticated');
    }

    // Modal background click to close
    const adminModal = document.getElementById('admin-modal');
    window.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        this.closeAdminModal();
      }
    });

    // Check URL parameters for ?admin or ?unlock
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('admin') || params.has('unlock')) {
        setTimeout(() => this.openAdminModal('unlock-all'), 400);
      }
    } catch (e) {}
  }

  hasMasterPin() {
    return !!localStorage.getItem('javaverse_admin_pin_hash');
  }

  async hashPin(pin) {
    let salt = localStorage.getItem('javaverse_admin_salt');
    if (!salt) {
      salt = 'jv_salt_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('javaverse_admin_salt', salt);
    }
    const raw = `${salt}::javaverse_secure_v1::${pin}`;

    // 1. Try Native Web Crypto API
    if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
      try {
        const data = new TextEncoder().encode(raw);
        const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuf))
          .map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (err) {
        console.warn('Crypto subtle fallback:', err);
      }
    }

    // 2. Pure JavaScript Fallback for non-HTTPS environments
    return this.fallbackSha256(raw);
  }

  fallbackSha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    let result = '';
    const words = [];
    const asciiBitLength = ascii.length * 8;
    let hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    let i, j;
    for (i = 0; i < ascii.length; i++) {
      const code = ascii.charCodeAt(i);
      words[i >> 2] |= (code & 0xff) << (24 - (i % 4) * 8);
    }
    words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;
    for (i = 0; i < words.length; i += 16) {
      const w = words.slice(i, i + 16);
      const oldHash = hash.slice(0);
      for (j = 0; j < 64; j++) {
        let w15 = w[j - 15], w2 = w[j - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        if (j >= 16) {
          w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
        }
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const s0Maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        const s1Ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        const temp1 = (hash[7] + s1Ch + ch + k[j] + w[j]) | 0;
        const temp2 = (s0Maj + maj) | 0;
        hash[7] = hash[6];
        hash[6] = hash[5];
        hash[5] = hash[4];
        hash[4] = (hash[3] + temp1) | 0;
        hash[3] = hash[2];
        hash[2] = hash[1];
        hash[1] = hash[0];
        hash[0] = (temp1 + temp2) | 0;
      }
      for (j = 0; j < 8; j++) {
        hash[j] = (hash[j] + oldHash[j]) | 0;
      }
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  handleBrandClick() {
    this.brandClicks = (this.brandClicks || 0) + 1;
    if (this.brandClickTimer) clearTimeout(this.brandClickTimer);

    if (this.brandClicks >= 3) {
      this.brandClicks = 0;
      window.soundEngine.playClick();
      this.openAdminModal('unlock-all');
      return;
    }

    this.brandClickTimer = setTimeout(() => {
      this.brandClicks = 0;
    }, 1200);

    this.switchView('3d-world');
  }

  openAdminModal(mode = 'manage') {
    this.adminPendingAction = mode;
    const modal = document.getElementById('admin-modal');
    if (!modal) return;

    // If requesting unlock and already authenticated, execute immediately:
    if (mode === 'unlock-all' && this.isAdminAuthenticated) {
      this.executeUnlockAll();
      return;
    }
    if (mode === 'fasttrack-exam' && this.isAdminAuthenticated) {
      this.fastTrackExam();
      return;
    }

    const viewSetup = document.getElementById('admin-view-setup');
    const viewVerify = document.getElementById('admin-view-verify');
    const viewDashboard = document.getElementById('admin-view-dashboard');
    const viewChangePin = document.getElementById('admin-view-change-pin');
    const headerText = document.getElementById('admin-modal-header-text');

    // Hide all views first
    [viewSetup, viewVerify, viewDashboard, viewChangePin].forEach(v => {
      if (v) v.style.display = 'none';
    });

    this.clearAdminErrors();

    if (!this.hasMasterPin()) {
      // First-time setup: prompt user to create their private Master Password
      if (viewSetup) viewSetup.style.display = 'block';
      if (headerText) headerText.textContent = 'Create Master Password';
      setTimeout(() => document.getElementById('admin-new-pin')?.focus(), 150);
    } else if (this.isAdminAuthenticated && (mode === 'dashboard' || mode === 'manage')) {
      // Already authenticated admin dashboard
      if (viewDashboard) viewDashboard.style.display = 'block';
      if (headerText) headerText.textContent = 'Instructor Dashboard';
    } else {
      // Verification required
      if (viewVerify) viewVerify.style.display = 'block';
      if (headerText) headerText.textContent = 'Instructor Authorization';
      const verifyInput = document.getElementById('admin-verify-pin');
      if (verifyInput) {
        verifyInput.value = '';
        setTimeout(() => verifyInput.focus(), 150);
      }
    }

    modal.classList.add('active');
  }

  closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
    this.clearAdminErrors();
    this.adminPendingAction = null;
  }

  clearAdminErrors() {
    ['admin-setup-error', 'admin-verify-error', 'admin-change-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '';
        el.classList.remove('visible');
      }
    });
  }

  showAdminError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.classList.remove('visible');
    void el.offsetWidth; // trigger reflow
    el.classList.add('visible');
    window.soundEngine.playError();
  }

  async handleCreatePin() {
    const newPin = (document.getElementById('admin-new-pin')?.value || '').trim();
    const confirmPin = (document.getElementById('admin-confirm-pin')?.value || '').trim();
    const remember = document.getElementById('admin-setup-remember')?.checked;

    if (!newPin || newPin.length < 6) {
      this.showAdminError('admin-setup-error', '⚠️ Master Password must be at least 6 characters long.');
      return;
    }
    if (newPin !== confirmPin) {
      this.showAdminError('admin-setup-error', '❌ Passwords do not match. Please re-enter.');
      return;
    }

    const hash = await this.hashPin(newPin);
    localStorage.setItem('javaverse_admin_pin_hash', hash);

    this.isAdminAuthenticated = true;
    sessionStorage.setItem('javaverse_admin_auth', 'true');
    if (remember) {
      localStorage.setItem('javaverse_admin_remember', 'true');
    }

    document.body.classList.add('admin-authenticated');
    this.closeAdminModal();

    window.soundEngine.playSuccess();
    this.showToast('👑 Master Password Configured! You now have sole access to unlock modules.', 'success');

    // Execute requested unlock
    if (this.adminPendingAction === 'fasttrack-exam') {
      this.fastTrackExam();
    } else {
      this.executeUnlockAll();
    }
  }

  async handleVerifyPin() {
    const pin = (document.getElementById('admin-verify-pin')?.value || '').trim();
    const remember = document.getElementById('admin-verify-remember')?.checked;

    if (!pin) {
      this.showAdminError('admin-verify-error', '⚠️ Please enter your Master Password.');
      return;
    }

    const enteredHash = await this.hashPin(pin);
    const storedHash = localStorage.getItem('javaverse_admin_pin_hash');

    if (enteredHash === storedHash) {
      this.isAdminAuthenticated = true;
      sessionStorage.setItem('javaverse_admin_auth', 'true');
      if (remember) {
        localStorage.setItem('javaverse_admin_remember', 'true');
      } else {
        localStorage.removeItem('javaverse_admin_remember');
      }

      document.body.classList.add('admin-authenticated');
      const action = this.adminPendingAction;
      this.closeAdminModal();

      if (action === 'fasttrack-exam') {
        this.fastTrackExam();
      } else {
        this.executeUnlockAll();
      }
    } else {
      this.showAdminError('admin-verify-error', '❌ Incorrect Master Password. Access denied.');
      const pinField = document.getElementById('admin-verify-pin');
      if (pinField) {
        pinField.value = '';
        pinField.focus();
      }
    }
  }

  handleForgotPin() {
    const confirmReset = confirm(
      "Reset Instructor Master Password?\n\n" +
      "This will clear your saved Master Password so you can configure a new one (supporting letters, numbers & symbols).\n" +
      "To preserve course integrity, current module progress will also be reset to Chapter 1.\n\n" +
      "Do you want to proceed?"
    );

    if (confirmReset) {
      localStorage.removeItem('javaverse_admin_pin_hash');
      localStorage.removeItem('javaverse_admin_salt');
      localStorage.removeItem('javaverse_admin_remember');
      sessionStorage.removeItem('javaverse_admin_auth');
      this.isAdminAuthenticated = false;
      document.body.classList.remove('admin-authenticated');

      this.resetProgress();
      this.openAdminModal('setup');
      this.showToast('↺ Master Password cleared. Set your new private password.', 'warning');
    }
  }

  showChangePinView() {
    const viewDashboard = document.getElementById('admin-view-dashboard');
    const viewChangePin = document.getElementById('admin-view-change-pin');
    const headerText = document.getElementById('admin-modal-header-text');

    if (viewDashboard) viewDashboard.style.display = 'none';
    if (viewChangePin) viewChangePin.style.display = 'block';
    if (headerText) headerText.textContent = 'Change Master Password';

    this.clearAdminErrors();
    const curr = document.getElementById('admin-current-pin');
    if (curr) {
      curr.value = '';
      setTimeout(() => curr.focus(), 150);
    }
  }

  async handleChangePin() {
    const currentPin = (document.getElementById('admin-current-pin')?.value || '').trim();
    const newPin = (document.getElementById('admin-change-new-pin')?.value || '').trim();
    const confirmPin = (document.getElementById('admin-change-confirm-pin')?.value || '').trim();

    const storedHash = localStorage.getItem('javaverse_admin_pin_hash');
    const currentHash = await this.hashPin(currentPin);

    if (currentHash !== storedHash) {
      this.showAdminError('admin-change-error', '❌ Current password is incorrect.');
      return;
    }
    if (!newPin || newPin.length < 6) {
      this.showAdminError('admin-change-error', '⚠️ New password must be at least 6 characters long.');
      return;
    }
    if (newPin !== confirmPin) {
      this.showAdminError('admin-change-error', '❌ New passwords do not match.');
      return;
    }

    const newHash = await this.hashPin(newPin);
    localStorage.setItem('javaverse_admin_pin_hash', newHash);

    window.soundEngine.playSuccess();
    this.showToast('✓ Master Password successfully updated!', 'success');
    this.openAdminModal('dashboard');
  }

  logoutAdmin() {
    this.isAdminAuthenticated = false;
    sessionStorage.removeItem('javaverse_admin_auth');
    localStorage.removeItem('javaverse_admin_remember');
    document.body.classList.remove('admin-authenticated');
    this.closeAdminModal();
    window.soundEngine.playClick();
    this.showToast('🔒 Instructor Mode Locked. Master Password will be required.', 'warning');
  }

  appendPinDigit(digit) {
    const input = document.getElementById('admin-verify-pin');
    if (!input || input.value.length >= 8) return;
    input.value += digit;
    window.soundEngine.playClick();
  }

  backspacePinDigit() {
    const input = document.getElementById('admin-verify-pin');
    if (!input || !input.value.length) return;
    input.value = input.value.slice(0, -1);
    window.soundEngine.playClick();
  }

  clearPinInput() {
    const input = document.getElementById('admin-verify-pin');
    if (input) input.value = '';
    window.soundEngine.playClick();
  }

  togglePinVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.textContent = '🙈';
    } else {
      input.type = 'password';
      if (btn) btn.textContent = '👁️';
    }
  }
}

// Instantiate App when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.App = new Application();
  window.unlockAll = () => window.App.unlockAll();
  window.resetProgress = () => window.App.resetProgress();
});
