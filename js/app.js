/**
 * CODE QUEST: AVENTURA MEDIEVAL DE FUNDAMENTOS DE JAVA
 * Motor Interactivo de Presentación · Universidad Veracruzana (UV)
 * 100% Código Auténtico, Sprites Reales, Audio MP3 del Juego y Pedagogía Formativa
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. INICIALIZACIÓN DEL MOTOR DE AUDIO OFICIAL (Misma lógica que en Juego_web)
  // ==========================================
  const soundEngine = window.soundEngine || window.audioManager || (typeof SoundEngine !== 'undefined' ? new SoundEngine() : null);
  let isBgmPlaying = false;

  function updateSlideMusic(slideIdx) {
    if (!soundEngine) return;
    if (!isBgmPlaying) {
      soundEngine.stopMusic();
      return;
    }
    if (slideIdx === 5) {
      // Slide 6 (Códice de los 20 Jefes):
      // Si ya hay un tema de jefe reproduciéndose, mantenerlo; si no, tema de exploración
      if (!soundEngine.currentMusic) {
        soundEngine.startMusic('explore');
      }
    } else if (slideIdx === 7) {
      // Slide 8 (Combate Interactivo contra el Duende - Jefe 1):
      // Música auténtica de combate contra jefe (jefe1.mp3)
      soundEngine.startMusic('battle', 1);
    } else {
      // En todos los demás escenarios: tema ambiental de exploración de Bytevalia (mapa.mp3)
      soundEngine.startMusic('explore');
    }
  }

  const btnToggleMusic = document.getElementById('btn-toggle-music');
  if (btnToggleMusic && soundEngine) {
    btnToggleMusic.addEventListener('click', () => {
      if (isBgmPlaying) {
        soundEngine.stopMusic();
        isBgmPlaying = false;
        btnToggleMusic.textContent = '🎵 Música: OFF';
        btnToggleMusic.classList.remove('playing');
      } else {
        isBgmPlaying = true;
        btnToggleMusic.textContent = '🔊 Música: ON';
        btnToggleMusic.classList.add('playing');
        updateSlideMusic(currentSlideIndex);
      }
    });
  }

  const btnQuickSound = document.getElementById('btn-quick-sound');
  if (btnQuickSound && soundEngine) {
    btnQuickSound.addEventListener('click', () => {
      isBgmPlaying = true;
      if (btnToggleMusic) {
        btnToggleMusic.textContent = '🔊 Música: ON';
        btnToggleMusic.classList.add('playing');
      }
      updateSlideMusic(currentSlideIndex);
      soundEngine.playSfx('victory');
    });
  }

  // ==========================================
  // 2. CANVAS DE PARTÍCULAS DE FONDO
  // ==========================================
  (function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const tokens = [
      'Bytevalia', 'int', 'String', 'boolean', 'public static void main',
      'for(int i=0; i<n; i++)', 'if(vida > 0)', 'System.out.println()',
      ';', '{}', 'UV · FCA', 'new Objeto()', 'return true;', 'class Heroe'
    ];

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      text: tokens[Math.floor(Math.random() * tokens.length)],
      size: Math.floor(Math.random() * 5) + 11,
      speedY: -(Math.random() * 0.35 + 0.15),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.25 + 0.08,
      color: Math.random() > 0.5 ? 'rgba(245, 158, 11,' : 'rgba(56, 189, 248,'
    }));

    function loop() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        ctx.font = `${p.size}px 'Fira Code', monospace`;
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fillText(p.text, p.x, p.y);
      });
      requestAnimationFrame(loop);
    }
    loop();
  })();

  // ==========================================
  // 3. CANVAS DE CONFETI PARA CELEBRACIONES
  // ==========================================
  function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: ['#fbbf24', '#f59e0b', '#38bdf8', '#4ade80', '#ec4899'][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    }));

    let frame = 0;
    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravedad
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frame++;
      if (frame < 90) {
        requestAnimationFrame(anim);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    anim();
  }

  // ==========================================
  // 4. MOTOR PRINCIPAL DE DIAPOSITIVAS (12 SLIDES)
  // ==========================================
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentSlideIndex = 0;

  const slideNumCurrent = document.getElementById('slide-num-current');
  const slideNumTotal = document.getElementById('slide-num-total');
  const slideProgressBar = document.getElementById('slide-progress-bar');
  const slideTitleDisplay = document.getElementById('slide-title-display');
  const notesBody = document.getElementById('notes-body');

  if (slideNumTotal) slideNumTotal.textContent = String(totalSlides).padStart(2, '0');

  const speakerNotesData = [
    "Diapositiva 1 (Portada): Saludo inicial. Presentar Code Quest como una herramienta web interactiva para fortalecer Java en la Universidad Veracruzana.",
    "Diapositiva 2 (Visión General): Explicar la combinación de mecánicas RPG (5 corazones, espadas de ataque, pociones y llaves) con desafíos técnicos.",
    "Diapositiva 3 (Origen): Contrastar la frustración de la consola negra tradicional frente al refuerzo positivo del juego.",
    "Diapositiva 4 (Propósito): Destacar los 3 pilares: fundamentos sólidos, aprendizaje sin presión y accesibilidad web 100% ligera.",
    "Diapositiva 5 (Problemas): Explicar cómo los jefes personifican errores reales: punto y coma (Duende), print (Espectro) y bucle for (Dragón).",
    "Diapositiva 6 (Códice de 20 Jefes): Demostrar la ruta curricular de 20 niveles y reproducir las pistas musicales auténticas.",
    "Diapositiva 7 (Desafíos Prácticos): Mostrar preguntas básicas y el Cuadro de Sabiduría que orienta al alumno sin castigarlo.",
    "Diapositiva 8 (Sistema de Combate): Ejecutar el combate en vivo. Demostrar cómo una respuesta correcta resta vida y cómo curarse con pociones.",
    "Diapositiva 9 (Gamificación): Mostrar la vitrina de 20 medallas coleccionables y la gestión de recursos de la mochila.",
    "Diapositiva 10 (Accesibilidad y Comunidad): Destacar el modo móvil con cruceta táctil D-Pad y la sana competitividad en el Salón de la Fama.",
    "Diapositiva 11 (Simulador Espacioso): Demostrar el movimiento libre en el mapa amplio de Bytevalia, apertura del cofre e interacción directa con el Duende.",
    "Diapositiva 12 (Cierre): Mostrar el Salón de la Fama en tiempo real, invitar a escanear el QR con el móvil y agradecer a la UV."
  ];

  function showSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentSlideIndex = index;

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === currentSlideIndex);
    });

    if (slideNumCurrent) {
      slideNumCurrent.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    }
    if (slideProgressBar) {
      const pct = ((currentSlideIndex + 1) / totalSlides) * 100;
      slideProgressBar.style.width = `${pct}%`;
    }

    const activeSlide = slides[currentSlideIndex];
    if (activeSlide && slideTitleDisplay) {
      slideTitleDisplay.textContent = activeSlide.getAttribute('data-title') || 'Code Quest';
    }

    if (notesBody) {
      notesBody.innerHTML = `<p>${speakerNotesData[currentSlideIndex] || 'Sin notas.'}</p>`;
    }

    // CONTROL DE MÚSICA AUTÉNTICO DE BYTEVALIA:
    // Cero sobreposición; adapta la banda sonora dinámicamente al contexto de la diapositiva
    updateSlideMusic(currentSlideIndex);

    // Actualizar miniatura activa en overview modal
    const thumbs = document.querySelectorAll('.overview-card');
    thumbs.forEach((t, i) => t.classList.toggle('active-thumb', i === currentSlideIndex));

    if (soundEngine) soundEngine.playSfx('click');
  }

  function nextSlide() { showSlide(currentSlideIndex + 1); }
  function prevSlide() { showSlide(currentSlideIndex - 1); }

  const btnPrev = document.getElementById('btn-prev-slide');
  const btnNext = document.getElementById('btn-next-slide');
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);

  const btnStartHero = document.getElementById('btn-start-hero');
  if (btnStartHero) btnStartHero.addEventListener('click', () => showSlide(1));

  // Teclado
  document.addEventListener('keydown', (e) => {
    // Si está escribiendo en el input del presentador, no cambiar slide
    if (e.target.tagName === 'INPUT') return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'n' || e.key === 'N') {
      toggleNotes();
    } else if (e.key === 'o' || e.key === 'O') {
      toggleOverview();
    } else if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // ==========================================
  // 5. INTERACCIÓN DEL ESCENARIO EN VIVO (SLIDE 1)
  // ==========================================
  const heroGameStage = document.getElementById('hero-game-stage');
  const heroStageChar = document.getElementById('hero-stage-character');
  const heroStageBoss = document.getElementById('hero-stage-boss');
  const stageCallout = document.getElementById('stage-callout');

  if (heroGameStage) {
    heroGameStage.addEventListener('click', () => {
      if (soundEngine) soundEngine.playSfx('slash');

      // Animación con sprites de ataque
      const heroImg = heroStageChar ? heroStageChar.querySelector('img') : null;
      if (heroImg) {
        heroImg.src = 'assets/images/jugador_ataque_1.png';
        if (heroStageChar) heroStageChar.style.transform = 'translateX(25px) scale(1.1)';
        setTimeout(() => {
          heroImg.src = 'assets/images/jugador_ataque_2.png';
          if (heroStageChar) heroStageChar.style.transform = 'translateX(55px) scale(1.15)';
          if (heroStageBoss) {
            heroStageBoss.style.filter = 'brightness(2) drop-shadow(0 0 12px #ef4444)';
            heroStageBoss.style.transform = 'translateX(8px)';
          }
        }, 110);
        setTimeout(() => {
          heroImg.src = 'assets/images/jugador_ataque_3.png';
          if (heroStageBoss) {
            heroStageBoss.style.filter = 'none';
            heroStageBoss.style.transform = 'none';
          }
        }, 240);
        setTimeout(() => {
          heroImg.src = 'assets/images/jugador_quieto_abajo.png';
          if (heroStageChar) heroStageChar.style.transform = 'none';
        }, 380);
      }

      if (stageCallout) {
        stageCallout.innerHTML = `<span>⚔️ ¡Golpe crítico de Java! -25 HP al Duende</span>`;
        setTimeout(() => {
          stageCallout.innerHTML = `<img src="assets/icons/espadas_cruzadas.png" class="pixel-icon-sm" alt="Acción"><span>¡Haz clic en el escenario para blandir tu espada!</span>`;
        }, 1800);
      }
    });
  }

  // ==========================================
  // 6. ATAQUES INTERACTIVOS EN SLIDE 5 (JEFES REPRESENTATIVOS)
  // ==========================================
  const tierAttackButtons = document.querySelectorAll('.btn-attack-tier');
  tierAttackButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bossIdx = btn.getAttribute('data-boss-idx');
      const hpFill = document.getElementById(`hp-fill-${bossIdx}`);
      const hpVal = document.getElementById(`hp-val-${bossIdx}`);
      const card = document.getElementById(`card-boss-${bossIdx}`);

      if (soundEngine) soundEngine.playSfx('slash');

      if (card) {
        card.style.transform = 'scale(0.97)';
        setTimeout(() => { card.style.transform = 'scale(1)'; }, 150);
      }

      if (hpFill && hpVal) {
        hpFill.style.width = '20%';
        hpVal.textContent = '10 HP (¡Crítico!)';
        btn.textContent = '¡Golpe Asestado! ⚔️';

        setTimeout(() => {
          if (soundEngine) soundEngine.playSfx('victory');
          fireConfetti();
          hpFill.style.width = '0%';
          hpVal.textContent = '0 HP (¡Derrotado!)';
          btn.textContent = '¡Medalla Ganada! 🏅';

          setTimeout(() => {
            hpFill.style.width = '100%';
            hpVal.textContent = bossIdx === '1' ? '50 / 50 HP' : bossIdx === '4' ? '80 / 80 HP' : '120 / 120 HP';
            btn.innerHTML = `<img src="assets/icons/espada.png" class="pixel-icon" alt="Atacar"> Probar Ataque con Código`;
          }, 3500);
        }, 600);
      }
    });
  });

  // ==========================================
  // 7. CÓDICE INTERACTIVO DE LOS 20 JEFES (SLIDE 6)
  // ==========================================
  const codexBossesGrid = document.getElementById('codex-bosses-grid');
  const codexTabs = document.querySelectorAll('.codex-tab');
  const codexPlayingTrack = document.getElementById('codex-playing-track');

  function renderCodexTier(tierNum) {
    if (!codexBossesGrid || typeof BOSSES_DATA === 'undefined') return;
    codexBossesGrid.innerHTML = '';

    const startIdx = (tierNum - 1) * 5;
    const tierBosses = BOSSES_DATA.slice(startIdx, startIdx + 5);

    tierBosses.forEach((boss, i) => {
      const card = document.createElement('div');
      card.className = `codex-boss-card ${i === 0 ? 'active' : ''}`;
      card.innerHTML = `
        <img src="assets/images/enemigo${boss.id}.png" alt="${boss.name}" class="pixel-sprite codex-boss-sprite">
        <h4 class="codex-boss-name">${boss.name}</h4>
        <span style="font-family:var(--font-retro); font-size:10px; color:${boss.color};">Nv. ${boss.level} · ${boss.hp} HP</span>
        <div class="codex-boss-topic">${boss.theme}</div>
        <p class="codex-boss-intro">"${boss.intro}"</p>
        <div class="codex-boss-medal-row" title="Recompensa: ${boss.medal}">
          <img src="assets/images/medalla${boss.id}.png" alt="${boss.medal}" class="codex-boss-medal-img">
          <span class="codex-boss-medal-text">${boss.medal}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.codex-boss-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        if (soundEngine) {
          soundEngine.playMusic(`jefe${boss.id}`);
          isBgmPlaying = true;
          if (btnToggleMusic) {
            btnToggleMusic.textContent = '🔊 Música: ON';
            btnToggleMusic.classList.add('playing');
          }
        }
        if (codexPlayingTrack) {
          codexPlayingTrack.textContent = `🎵 Reproduciendo: jefe${boss.id}.mp3 (${boss.name})`;
        }
      });

      codexBossesGrid.appendChild(card);
    });
  }

  codexTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      codexTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const tier = parseInt(tab.getAttribute('data-tier') || '1', 10);
      renderCodexTier(tier);
      if (soundEngine) soundEngine.playSfx('click');
    });
  });

  renderCodexTier(1);

  // ==========================================
  // 8. DESAFÍOS DE CÓDIGO BÁSICOS Y EDUCATIVOS (SLIDE 7)
  // ==========================================
  const questionsData = [
    {
      badge: "⚔️ Desafío #1: Sintaxis Básica",
      question: "¿Con qué carácter o símbolo debe terminar obligatoriamente cada instrucción ejecutable en Java?",
      options: [
        { text: "A) ; (Punto y coma)", correct: true },
        { text: "B) : (Dos puntos)", correct: false },
        { text: "C) . (Punto simple)", correct: false },
        { text: "D) , (Coma)", correct: false }
      ],
      wisdom: "¡Correcto! En Java, el punto y coma (;) es el delimitador obligatorio al final de cada sentencia. Omitirlo genera un error de compilación inmediato."
    },
    {
      badge: "⚔️ Desafío #2: Tipos de Datos Primitivos",
      question: "¿Qué tipo de dato primitivo se utiliza en Java para almacenar un número entero como 10 o 50?",
      options: [
        { text: "A) boolean", correct: false },
        { text: "B) int", correct: true },
        { text: "C) String", correct: false },
        { text: "D) float", correct: false }
      ],
      wisdom: "¡Exacto! El tipo 'int' almacena enteros de 32 bits. 'boolean' es para valores de verdad (true/false) y 'String' es una clase para cadenas de texto."
    },
    {
      badge: "⚔️ Desafío #3: Salida Estándar por Consola",
      question: "¿Qué instrucción oficial se utiliza en Java para imprimir un mensaje con salto de línea en la consola?",
      options: [
        { text: "A) console.log()", correct: false },
        { text: "B) print()", correct: false },
        { text: "C) System.out.println()", correct: true },
        { text: "D) echo", correct: false }
      ],
      wisdom: "¡Excelente! 'System.out.println()' escribe el texto en el stream de salida estándar e inserta automáticamente un salto de línea."
    },
    {
      badge: "⚔️ Desafío #4: Control de Decisiones",
      question: "¿Qué palabra clave se utiliza en Java para evaluar una expresión lógica y ejecutar un bloque solo si es verdadera?",
      options: [
        { text: "A) while", correct: false },
        { text: "B) if", correct: true },
        { text: "C) class", correct: false },
        { text: "D) void", correct: false }
      ],
      wisdom: "¡Muy bien! La sentencia 'if' evalúa una condición booleana; si resulta 'true', ejecuta el bloque de instrucciones entre llaves {}."
    }
  ];

  let currentQIndex = 0;
  const qBadge = document.getElementById('q-panel-badge');
  const qTitle = document.getElementById('q-panel-title');
  const qOptionsContainer = document.getElementById('q-options-container');
  const qWisdomText = document.getElementById('q-wisdom-text');
  const curriculumCards = document.querySelectorAll('.curriculum-card');

  function renderQuestion(idx) {
    currentQIndex = idx;
    const q = questionsData[idx];
    if (!q || !qOptionsContainer) return;

    if (qBadge) qBadge.textContent = q.badge;
    if (qTitle) qTitle.textContent = q.question;
    if (qWisdomText) {
      qWisdomText.textContent = "Selecciona una opción para atacar al guardián y verificar tu lógica.";
    }

    qOptionsContainer.innerHTML = '';
    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'btn-option';
      btn.textContent = opt.text;

      btn.addEventListener('click', () => {
        const allBtns = qOptionsContainer.querySelectorAll('.btn-option');
        allBtns.forEach((b) => (b.disabled = true));

        if (opt.correct) {
          btn.classList.add('correct');
          if (soundEngine) soundEngine.playSfx('correct');
          fireConfetti();
          if (qWisdomText) qWisdomText.textContent = q.wisdom;
        } else {
          btn.classList.add('wrong');
          if (soundEngine) soundEngine.playSfx('wrong');
          if (qWisdomText) {
            qWisdomText.textContent = "⚠️ ¡El golpe falló! Revisa bien el concepto: el compilador de Java requiere exactitud léxica. Intenta con la otra opción.";
          }
        }
      });

      qOptionsContainer.appendChild(btn);
    });

    curriculumCards.forEach((c, i) => c.classList.toggle('active', i === idx));
  }

  curriculumCards.forEach((c) => {
    c.addEventListener('click', () => {
      const idx = parseInt(c.getAttribute('data-q-index') || '0', 10);
      renderQuestion(idx);
      if (soundEngine) soundEngine.playSfx('click');
    });
  });

  renderQuestion(0);

  // ==========================================
  // 9. ARENA DE COMBATE EN VIVO (SLIDE 8) - SPRITES DE ATAQUE REALES
  // ==========================================
  let liveBossHp = 50;
  let liveHeroHp = 5;
  let livePotions = 2;

  const btnLiveAttack = document.getElementById('btn-live-attack');
  const btnLiveHeal = document.getElementById('btn-live-heal');
  const liveBossHpFill = document.getElementById('live-boss-hp-fill');
  const liveBossHpText = document.getElementById('live-boss-hp-text');
  const liveHeroHpFill = document.getElementById('live-hero-hp-fill');
  const liveHeroHpText = document.getElementById('live-hero-hp-text');
  const liveCombatDialog = document.getElementById('live-combat-dialog');
  const livePotionsLabel = document.getElementById('live-potions-label');
  const liveBossSpriteBox = document.getElementById('live-boss-sprite-box');
  const liveHeroSpriteBox = document.getElementById('live-hero-sprite-box');
  const liveHeroSprite = document.getElementById('live-hero-sprite');
  const liveImpactSprite = document.getElementById('live-impact-sprite');

  if (btnLiveAttack) {
    btnLiveAttack.addEventListener('click', () => {
      if (liveBossHp <= 0) {
        liveBossHp = 50;
        if (liveBossHpFill) liveBossHpFill.style.width = '100%';
        if (liveBossHpText) liveBossHpText.textContent = '50 / 50';
      }

      // Animación secuencial con los sprites oficiales de ataque de Juego_web:
      // Frame 0: jugador_ataque_1.png (elevación de espada y preparación)
      if (liveHeroSprite) liveHeroSprite.src = 'assets/images/jugador_ataque_1.png';
      if (liveHeroSpriteBox) liveHeroSpriteBox.style.transform = 'translate(-15px, -10px) scale(1.08)';

      // Frame 1: jugador_ataque_2.png (estocada frontal e impacto cortante)
      setTimeout(() => {
        if (liveHeroSprite) liveHeroSprite.src = 'assets/images/jugador_ataque_2.png';
        if (liveHeroSpriteBox) liveHeroSpriteBox.style.transform = 'translate(-40px, -24px) scale(1.22)';
        if (soundEngine) soundEngine.playSfx('slash');

        // Mostrar impacto y sacudida en el jefe
        if (liveImpactSprite) liveImpactSprite.classList.remove('hidden');
        if (liveBossSpriteBox) {
          liveBossSpriteBox.style.filter = 'brightness(2.2) drop-shadow(0 0 16px #ef4444)';
          liveBossSpriteBox.style.transform = 'translate(10px, -4px) scale(0.94)';
        }

        // Aplicar daño
        liveBossHp = Math.max(0, liveBossHp - 25);
        if (liveBossHpFill) {
          liveBossHpFill.style.width = `${(liveBossHp / 50) * 100}%`;
        }
        if (liveBossHpText) {
          liveBossHpText.textContent = `${liveBossHp} / 50`;
        }
      }, 120);

      // Frame 2: jugador_ataque_3.png (corte extendido y remate de golpe)
      setTimeout(() => {
        if (liveHeroSprite) liveHeroSprite.src = 'assets/images/jugador_ataque_3.png';
        if (liveHeroSpriteBox) liveHeroSpriteBox.style.transform = 'translate(-20px, -12px) scale(1.1)';
        if (liveImpactSprite) liveImpactSprite.classList.add('hidden');
        if (liveBossSpriteBox) {
          liveBossSpriteBox.style.filter = 'none';
          liveBossSpriteBox.style.transform = 'none';
        }

        if (liveBossHp <= 0) {
          if (soundEngine) soundEngine.playSfx('victory');
          fireConfetti();
          if (liveCombatDialog) {
            liveCombatDialog.innerHTML = `🏆 <strong>¡VICTORIA TRIUNFAL!</strong> Has derrotado al Duende de la Sintaxis. Obtienes la <strong>Medalla del Punto y Coma</strong> (+1000 PTS).`;
          }
        } else {
          if (liveCombatDialog) {
            liveCombatDialog.textContent = `⚔️ ¡Estocada certera! Has infligido 25 de daño al Duende con tu respuesta lógica. Vida restante: ${liveBossHp} HP.`;
          }
        }
      }, 260);

      // Regreso a frame de reposo
      setTimeout(() => {
        if (liveHeroSprite) liveHeroSprite.src = 'assets/images/jugador_quieto_abajo.png';
        if (liveHeroSpriteBox) liveHeroSpriteBox.style.transform = 'none';
      }, 420);
    });
  }

  if (btnLiveHeal) {
    btnLiveHeal.addEventListener('click', () => {
      if (soundEngine) soundEngine.playSfx('potion');
      liveHeroHp = 5;
      if (liveHeroHpFill) liveHeroHpFill.style.width = '100%';
      if (liveHeroHpText) {
        liveHeroHpText.innerHTML = `5 / 5 <img src="assets/icons/corazon_lleno.png" class="pixel-icon-sm" alt="Vida">`;
      }
      if (livePotionsLabel) {
        livePotionsLabel.innerHTML = `<img src="assets/icons/pocion.png" class="pixel-icon-sm" alt="Pociones"> 2`;
      }
      if (liveCombatDialog) {
        liveCombatDialog.textContent = `🧪 ¡Bebiste una Poción Curativa! Tu salud se restablece completamente a 5 corazones.`;
      }
    });
  }

  // ==========================================
  // 10. VITRINA DE LAS 20 MEDALLAS Y MOCHILA (SLIDE 9)
  // ==========================================
  const medals20Grid = document.getElementById('medals-20-grid');
  const detailMedalImg = document.getElementById('detail-medal-img');
  const detailMedalName = document.getElementById('detail-medal-name');
  const detailMedalTopic = document.getElementById('detail-medal-topic');

  if (medals20Grid && typeof BOSSES_DATA !== 'undefined') {
    medals20Grid.innerHTML = '';
    BOSSES_DATA.forEach((boss, i) => {
      const tile = document.createElement('div');
      tile.className = `medal-item-tile ${i === 0 ? 'active' : ''}`;
      tile.innerHTML = `
        <img src="assets/images/medalla${boss.id}.png" alt="${boss.medal}" class="pixel-sprite">
        <span>M-${String(boss.id).padStart(2, '0')}</span>
      `;

      tile.addEventListener('click', () => {
        document.querySelectorAll('.medal-item-tile').forEach((t) => t.classList.remove('active'));
        tile.classList.add('active');

        if (detailMedalImg) detailMedalImg.src = `assets/images/medalla${boss.id}.png`;
        if (detailMedalName) detailMedalName.textContent = boss.medal;
        if (detailMedalTopic) {
          detailMedalTopic.textContent = `Otorgada por vencer a ${boss.name} (Nivel ${boss.level}). Valida: ${boss.theme}.`;
        }
        if (soundEngine) soundEngine.playSfx('chest');
      });

      medals20Grid.appendChild(tile);
    });
  }

  const btnUsePotionDemo = document.getElementById('btn-use-potion-demo');
  const invDemoPotionsCount = document.getElementById('inv-demo-potions-count');
  if (btnUsePotionDemo) {
    btnUsePotionDemo.addEventListener('click', () => {
      if (soundEngine) soundEngine.playSfx('potion');
      if (invDemoPotionsCount) invDemoPotionsCount.textContent = '1';
      btnUsePotionDemo.textContent = '¡Salud al 100%! ❤️';
      setTimeout(() => {
        if (invDemoPotionsCount) invDemoPotionsCount.textContent = '2';
        btnUsePotionDemo.textContent = 'Tomar Poción';
      }, 2500);
    });
  }

  // ==========================================
  // 11. SIMULADOR JUGABLE ESPACIOSO DE BYTEVALIA CON INTERACCIÓN (SLIDE 11)
  // ==========================================
  (function initPlayableSimulator() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Precargar sprites
    const heroImg = new Image();
    heroImg.src = 'assets/images/jugador_quieto_abajo.png';

    const bossImg = new Image();
    bossImg.src = 'assets/images/enemigo1.png';

    const chestImg = new Image();
    chestImg.src = 'assets/images/cofre_cerrado.png';

    const treeImg = new Image();
    treeImg.src = 'assets/images/arbol_grande.png';

    const grassImg = new Image();
    grassImg.src = 'assets/images/pasto_relleno.png';

    const pathImg = new Image();
    pathImg.src = 'assets/images/tierra_relleno.png';

    // Dimensiones y posiciones amplias en resolución 820x260
    const hero = { x: 70, y: 120, w: 32, h: 32, speed: 3.8, hp: 5 };
    const chest = { x: 380, y: 55, w: 30, h: 30, opened: false };
    const boss = { x: 710, y: 115, w: 36, h: 36 };
    let simPotions = 1;
    let simKeys = 1;
    let isEncounterOpen = false;

    const simHeroHp = document.getElementById('sim-hero-hp');
    const simPotionsCount = document.getElementById('sim-potions-count');
    const simKeysCount = document.getElementById('sim-keys-count');
    const simBtnHeal = document.getElementById('sim-btn-heal');
    const simBtnDirectBoss = document.getElementById('sim-btn-direct-boss');
    const gameDialogBanner = document.getElementById('game-dialog-banner');
    const simEncounterModal = document.getElementById('sim-encounter-modal');
    const btnCloseSimEncounter = document.getElementById('btn-close-sim-encounter');
    const simEncounterFeedback = document.getElementById('sim-encounter-feedback');

    function openEncounterModal() {
      if (!simEncounterModal) return;
      isEncounterOpen = true;
      simEncounterModal.classList.remove('hidden');
      if (simEncounterFeedback) {
        simEncounterFeedback.className = 'encounter-feedback hidden';
        simEncounterFeedback.textContent = '';
      }
      if (soundEngine) soundEngine.playSfx('click');
      if (isBgmPlaying && soundEngine) {
        soundEngine.startMusic('battle', 1);
      }
      if (gameDialogBanner) {
        gameDialogBanner.innerHTML = `⚔️ <strong>¡Encuentro de Combate Activado!</strong> Responde la pregunta del Duende.`;
      }
    }

    function closeEncounterModal() {
      if (!simEncounterModal) return;
      isEncounterOpen = false;
      simEncounterModal.classList.add('hidden');
      hero.x = Math.max(70, hero.x - 40); // retroceso para no re-activar de inmediato
      if (soundEngine) soundEngine.playSfx('click');
      if (isBgmPlaying && soundEngine) {
        soundEngine.startMusic('explore');
      }
    }

    if (simBtnDirectBoss) {
      simBtnDirectBoss.addEventListener('click', openEncounterModal);
    }
    if (btnCloseSimEncounter) {
      btnCloseSimEncounter.addEventListener('click', closeEncounterModal);
    }

    // Opciones del reto con el jefe
    const choiceButtons = document.querySelectorAll('.btn-sim-choice');
    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-choice') === 'correct';
        if (isCorrect) {
          if (soundEngine) {
            soundEngine.playSfx('correct');
            setTimeout(() => soundEngine.playSfx('victory'), 180);
          }
          fireConfetti();
          if (simEncounterFeedback) {
            simEncounterFeedback.className = 'encounter-feedback success';
            simEncounterFeedback.innerHTML = `✅ <strong>¡Golpe de Código Certero!</strong> El punto y coma (;) es el delimitador oficial. Has derrotado al Duende y liberado el sendero. (+500 PTS)`;
          }
          setTimeout(() => {
            closeEncounterModal();
            boss.x = 9999; // Despeja el camino
            if (isBgmPlaying && soundEngine) {
              soundEngine.startMusic('explore');
            }
            if (gameDialogBanner) {
              gameDialogBanner.innerHTML = `🏆 <strong>¡Sendero de Bytevalia liberado!</strong> Puedes avanzar con tu héroe hacia el Valle de las Variables.`;
            }
          }, 2400);
        } else {
          if (soundEngine) soundEngine.playSfx('wrong');
          if (simEncounterFeedback) {
            simEncounterFeedback.className = 'encounter-feedback error';
            simEncounterFeedback.innerHTML = `❌ <strong>¡Ataque fallido!</strong> En Java no se usan dos puntos (:) al final de una sentencia. ¡Prueba con el punto y coma (;)!`;
          }
        }
      });
    });

    const keysDown = {};

    window.addEventListener('keydown', (e) => {
      if (currentSlideIndex === 10 && !isEncounterOpen) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
          e.preventDefault();
          keysDown[e.key.toLowerCase()] = true;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      keysDown[e.key.toLowerCase()] = false;
    });

    // Controles D-Pad virtuales
    const dpadUp = document.getElementById('dpad-up');
    const dpadDown = document.getElementById('dpad-down');
    const dpadLeft = document.getElementById('dpad-left');
    const dpadRight = document.getElementById('dpad-right');

    const bindDpad = (btn, key) => {
      if (!btn) return;
      btn.addEventListener('mousedown', () => { if (!isEncounterOpen) keysDown[key] = true; });
      btn.addEventListener('mouseup', () => (keysDown[key] = false));
      btn.addEventListener('mouseleave', () => (keysDown[key] = false));
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); if (!isEncounterOpen) keysDown[key] = true; });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); keysDown[key] = false; });
    };

    bindDpad(dpadUp, 'arrowup');
    bindDpad(dpadDown, 'arrowdown');
    bindDpad(dpadLeft, 'arrowleft');
    bindDpad(dpadRight, 'arrowright');

    if (simBtnHeal) {
      simBtnHeal.addEventListener('click', () => {
        if (simPotions > 0) {
          simPotions--;
          hero.hp = 5;
          if (simHeroHp) simHeroHp.textContent = '5';
          if (simPotionsCount) simPotionsCount.textContent = String(simPotions);
          if (soundEngine) soundEngine.playSfx('potion');
          if (gameDialogBanner) gameDialogBanner.textContent = '🧪 ¡Bebiste una poción! Salud restaurada a 5/5.';
        }
      });
    }

    function checkCollision(r1, r2) {
      return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
      );
    }

    function updateSim() {
      if (isEncounterOpen) return;

      if (keysDown['arrowup'] || keysDown['w']) hero.y -= hero.speed;
      if (keysDown['arrowdown'] || keysDown['s']) hero.y += hero.speed;
      if (keysDown['arrowleft'] || keysDown['a']) hero.x -= hero.speed;
      if (keysDown['arrowright'] || keysDown['d']) hero.x += hero.speed;

      // Limitar a los bordes del canvas
      hero.x = Math.max(10, Math.min(canvas.width - hero.w - 10, hero.x));
      hero.y = Math.max(10, Math.min(canvas.height - hero.h - 10, hero.y));

      // Colisión con cofre
      if (!chest.opened && checkCollision(hero, chest)) {
        chest.opened = true;
        chestImg.src = 'assets/images/cofre_abierto.png';
        simPotions++;
        if (simPotionsCount) simPotionsCount.textContent = String(simPotions);
        if (soundEngine) soundEngine.playSfx('chest');
        if (gameDialogBanner) {
          gameDialogBanner.innerHTML = `🎁 <strong>¡Cofre abierto!</strong> Obtuviste 1 Poción Curativa y una Llave Sagrada.`;
        }
      }

      // Proximidad o colisión con el jefe (Duende)
      const distToBoss = Math.hypot(hero.x - boss.x, hero.y - boss.y);
      if (distToBoss < 50 && !isEncounterOpen && boss.x < 800) {
        openEncounterModal();
      }
    }

    function drawSim() {
      // 1. Fondo de pasto
      if (grassImg.complete && grassImg.naturalWidth > 0) {
        const ptrn = ctx.createPattern(grassImg, 'repeat');
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#1c4d28';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Sendero de tierra amplio
      ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
      ctx.fillRect(40, 125, canvas.width - 80, 32);

      // 3. Árboles decorativos
      if (treeImg.complete) {
        ctx.drawImage(treeImg, 30, 20, 54, 62);
        ctx.drawImage(treeImg, 320, 175, 48, 56);
        ctx.drawImage(treeImg, 620, 15, 54, 62);
      }

      // 4. Cofre del tesoro
      if (chestImg.complete) {
        ctx.drawImage(chestImg, chest.x, chest.y, chest.w, chest.h);
      }

      // 5. Jefe 1 (Duende de la Sintaxis)
      if (bossImg.complete && boss.x < 800) {
        ctx.drawImage(bossImg, boss.x, boss.y, boss.w, boss.h);
      }

      // 6. Héroe de Java
      if (heroImg.complete) {
        ctx.drawImage(heroImg, hero.x, hero.y, hero.w, hero.h);
      }
    }

    function loopSim() {
      if (currentSlideIndex === 10) {
        updateSim();
        drawSim();
      }
      requestAnimationFrame(loopSim);
    }
    loopSim();
  })();

  // ==========================================
  // 12. GENERADOR DE CÓDIGO QR Y ENLACE AL JUEGO (SLIDE 12)
  // ==========================================
  const qrCanvasBox = document.getElementById('qr-canvas-box');
  const btnEnterGame = document.getElementById('btn-enter-game');
  const officialGameUrl = 'https://code-quest-theta.vercel.app/';

  if (btnEnterGame) {
    btnEnterGame.href = officialGameUrl;
  }

  if (qrCanvasBox && typeof QRCode !== 'undefined') {
    qrCanvasBox.innerHTML = '';
    new QRCode(qrCanvasBox, {
      text: officialGameUrl,
      width: 110,
      height: 110,
      colorDark: '#080c16',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  // ==========================================
  // 13. HERRAMIENTAS: NOTAS, CRONÓMETRO, OVERVIEW Y PANTALLA COMPLETA
  // ==========================================
  const notesDrawer = document.getElementById('speaker-notes-drawer');
  const btnNotes = document.getElementById('btn-notes');
  const btnCloseNotes = document.getElementById('btn-close-notes');

  function toggleNotes() {
    if (notesDrawer) notesDrawer.classList.toggle('open');
  }
  if (btnNotes) btnNotes.addEventListener('click', toggleNotes);
  if (btnCloseNotes) btnCloseNotes.addEventListener('click', toggleNotes);

  // Overview Modal
  const overviewModal = document.getElementById('overview-modal-overlay');
  const btnOverview = document.getElementById('btn-overview');
  const btnCloseOverview = document.getElementById('btn-close-overview');
  const overviewGrid = document.getElementById('overview-grid');

  function buildOverviewGrid() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = '';
    slides.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = `overview-card ${idx === currentSlideIndex ? 'active-thumb' : ''}`;
      const title = s.getAttribute('data-title') || `Diapositiva ${idx + 1}`;
      card.innerHTML = `
        <span style="font-family:var(--font-retro); font-size:10px; color:var(--gold-light);">#${String(idx + 1).padStart(2, '0')}</span>
        <strong style="font-size:12px; color:#fff; font-family:var(--font-title);">${title}</strong>
        <span style="font-size:10px; color:#94a3b8;">Click para ver</span>
      `;
      card.addEventListener('click', () => {
        showSlide(idx);
        toggleOverview();
      });
      overviewGrid.appendChild(card);
    });
  }

  function toggleOverview() {
    if (overviewModal) {
      const isOpen = overviewModal.classList.toggle('open');
      if (isOpen) buildOverviewGrid();
    }
  }
  if (btnOverview) btnOverview.addEventListener('click', toggleOverview);
  if (btnCloseOverview) btnCloseOverview.addEventListener('click', toggleOverview);

  function closeAllModals() {
    if (notesDrawer) notesDrawer.classList.remove('open');
    if (overviewModal) overviewModal.classList.remove('open');
  }

  // Fullscreen
  const btnFullscreen = document.getElementById('btn-fullscreen');
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (btnFullscreen) btnFullscreen.textContent = '✕';
    } else {
      document.exitFullscreen().catch(() => {});
      if (btnFullscreen) btnFullscreen.textContent = '⛶';
    }
  }
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // Cronómetro del Presentador
  let timerSeconds = 0;
  let timerInterval = null;
  const timerVal = document.getElementById('timer-val');
  const btnTimerToggle = document.getElementById('btn-timer-toggle');
  const btnTimerReset = document.getElementById('btn-timer-reset');

  function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (btnTimerToggle) {
    btnTimerToggle.addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btnTimerToggle.textContent = '▶';
      } else {
        timerInterval = setInterval(() => {
          timerSeconds++;
          if (timerVal) timerVal.textContent = formatTime(timerSeconds);
        }, 1000);
        btnTimerToggle.textContent = '⏸';
      }
    });
  }

  if (btnTimerReset) {
    btnTimerReset.addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        if (btnTimerToggle) btnTimerToggle.textContent = '▶';
      }
      timerSeconds = 0;
      if (timerVal) timerVal.textContent = '00:00';
    });
  }

  // Mostrar diapositiva inicial
  showSlide(0);

});
