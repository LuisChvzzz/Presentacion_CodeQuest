// Motor de Audio de Code Quest: Soporta archivos MP3 en assets/audio y sintetizador procedural de respaldo
class SoundEngine {
  constructor() {
    this.audioElements = {};
    this.currentMusic = null;
    this.currentMusicKey = null;
    this.isMuted = false;
    this.volume = 0.55;

    // Precargar referencias de audio
    this.initAudioFiles();
  }

  initAudioFiles() {
    // 1. Música de Exploración del Mapa
    this.audioElements['mapa'] = new Audio('assets/audio/mapa.mp3');
    this.audioElements['mapa'].loop = true;

    this.audioElements['mapa2'] = new Audio('assets/audio/mapa2.mp3');
    this.audioElements['mapa2'].loop = true;

    // 2. Efecto de Sonido de Pausa
    this.audioElements['pause'] = new Audio('assets/audio/pause.mp3');

    // 3. Audio de Game Over
    this.audioElements['gameover'] = new Audio('assets/audio/gameover.mp3');

    // 4. Música de los 20 Jefes (assets/audio/jefe1.mp3 a jefe20.mp3)
    for (let i = 1; i <= 20; i++) {
      const bossTrack = new Audio(`assets/audio/jefe${i}.mp3`);
      bossTrack.loop = true;
      this.audioElements[`jefe${i}`] = bossTrack;
    }
  }

  // Detener toda la música activa de inmediato sin errores ni superposición
  stopMusic() {
    // 1. Detener explícitamente la música actual activa
    if (this.currentMusic) {
      try {
        this.currentMusic.pause();
      } catch (e) {}
      try {
        if (this.currentMusic.readyState > 0 && isFinite(this.currentMusic.currentTime)) {
          this.currentMusic.currentTime = 0;
        }
      } catch (e) {}
    }

    // 2. Por seguridad estricta, recorrer todos los elementos de audio registrados
    if (this.audioElements) {
      Object.keys(this.audioElements).forEach((key) => {
        const audio = this.audioElements[key];
        if (audio && typeof audio.pause === 'function') {
          try {
            audio.pause();
          } catch (e) {}
          try {
            // Solo resetear currentTime si el medio está listo para evitar InvalidStateError en Safari
            if (audio.readyState > 0 && !isNaN(audio.duration) && isFinite(audio.currentTime)) {
              audio.currentTime = 0;
            }
          } catch (e) {}
        }
      });
    }

    // 3. Pausar cualquier etiqueta <audio> residual en el DOM si existiera
    try {
      document.querySelectorAll('audio').forEach((el) => {
        try {
          el.pause();
          if (el.readyState > 0) el.currentTime = 0;
        } catch (e) {}
      });
    } catch (e) {}

    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  // Pausar la pista actual sin olvidar la pista seleccionada
  pauseMusic() {
    if (this.currentMusic) {
      try {
        this.currentMusic.pause();
        return true;
      } catch (e) {}
    }
    return false;
  }

  // Reanudar la pista actual si estaba pausada
  resumeMusic() {
    if (this.currentMusic && this.currentMusic.paused && !this.isMuted) {
      const p = this.currentMusic.play();
      if (p !== undefined) {
        p.catch((err) => console.log("Audio espera interacción:", err.message));
      }
      return true;
    }
    return false;
  }

  // Reproducir música del mapa o de la sala de cada jefe
  playMusic(key) {
    // Si ya se está reproduciendo este mismo tema y no está en pausa, no reiniciar
    if (this.currentMusicKey === key && this.currentMusic && !this.currentMusic.paused) {
      return this.currentMusic;
    }

    // Detener de inmediato y con total certeza cualquier música previa para evitar superposición
    this.stopMusic();

    const track = this.audioElements[key];
    if (track) {
      track.muted = this.isMuted;
      track.volume = this.isMuted ? 0 : this.volume;
      this.currentMusic = track;
      this.currentMusicKey = key;
      if (!this.isMuted) {
        try {
          if (track.readyState > 0) {
            track.currentTime = 0;
          }
        } catch (e) {}
        const playPromise = track.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log("Audio espera interacción del usuario o fue interrumpido:", err.message);
          });
        }
      }
      return track;
    }
    return null;
  }

  // Iniciar tema según contexto (Misma lógica estricta que Juego_web)
  startMusic(context, bossId = null) {
    if (context === 'menu' || context === 'explore') {
      this.playMusic('mapa');
    } else if (context === 'battle' && bossId) {
      // Reproducir el tema específico del jefe (jefe1 a jefe20)
      this.playMusic(`jefe${bossId}`);
    } else if (context === 'battle') {
      this.playMusic('jefe1');
    }
  }

  // Reproducir efecto de sonido
  playSfx(type) {
    if (this.isMuted) return;

    if (type === 'pause') {
      const sfx = this.audioElements['pause'];
      if (sfx) {
        sfx.volume = this.volume;
        sfx.currentTime = 0;
        sfx.play().catch(() => {});
        return;
      }
    } else if (type === 'gameover') {
      const sfx = this.audioElements['gameover'];
      if (sfx) {
        sfx.volume = this.volume;
        sfx.currentTime = 0;
        sfx.play().catch(() => {});
        return;
      }
    }

    // Efectos de sonido procedurales Web Audio para respuesta instantánea (sin latencia de red)
    this.playProceduralSfx(type);
  }

  // Detener un efecto de sonido inmediatamente (ej. detener el sonido de pause al reanudar)
  stopSfx(type) {
    const sfx = this.audioElements[type];
    if (sfx) {
      sfx.pause();
      sfx.currentTime = 0;
    }
  }

  playProceduralSfx(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.webCtx) {
        this.webCtx = new AudioCtx();
      }
      if (this.webCtx.state === 'suspended') {
        this.webCtx.resume();
      }

      const t = this.webCtx.currentTime;
      const osc = this.webCtx.createOscillator();
      const gain = this.webCtx.createGain();

      gain.connect(this.webCtx.destination);
      gain.gain.setValueAtTime(0.25 * this.volume, t);

      switch (type) {
        case 'slash':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(500, t);
          osc.frequency.exponentialRampToValueAtTime(70, t + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          osc.connect(gain);
          osc.start(t);
          osc.stop(t + 0.15);
          break;

        case 'hurt':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(35, t + 0.22);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
          osc.connect(gain);
          osc.start(t);
          osc.stop(t + 0.22);
          break;

        case 'potion':
          [350, 440, 550, 680].forEach((freq, idx) => {
            const o = this.webCtx.createOscillator();
            const g = this.webCtx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, t + idx * 0.07);
            g.gain.setValueAtTime(0.2, t + idx * 0.07);
            g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.1);
            o.connect(g);
            g.connect(this.webCtx.destination);
            o.start(t + idx * 0.07);
            o.stop(t + idx * 0.07 + 0.1);
          });
          break;

        case 'retreat':
        case 'flee':
          // Efecto de pasos rápidos y huida de combate
          [300, 360, 440, 520].forEach((freq, idx) => {
            const o = this.webCtx.createOscillator();
            const g = this.webCtx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, t + idx * 0.08);
            o.frequency.exponentialRampToValueAtTime(freq * 0.7, t + idx * 0.08 + 0.12);
            g.gain.setValueAtTime(0.25 * this.volume, t + idx * 0.08);
            g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.12);
            o.connect(g);
            g.connect(this.webCtx.destination);
            o.start(t + idx * 0.08);
            o.stop(t + idx * 0.08 + 0.12);
          });
          break;

        case 'chest':
        case 'sword':
        case 'key':
          [280, 370, 470, 620, 800].forEach((freq, idx) => {
            const o = this.webCtx.createOscillator();
            const g = this.webCtx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, t + idx * 0.06);
            g.gain.setValueAtTime(0.22, t + idx * 0.06);
            g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.06 + 0.12);
            o.connect(g);
            g.connect(this.webCtx.destination);
            o.start(t + idx * 0.06);
            o.stop(t + idx * 0.06 + 0.12);
          });
          break;

        case 'correct':
          [523, 659, 783, 1046].forEach((freq, idx) => {
            const o = this.webCtx.createOscillator();
            const g = this.webCtx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(freq, t + idx * 0.08);
            g.gain.setValueAtTime(0.2, t + idx * 0.08);
            g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.15);
            o.connect(g);
            g.connect(this.webCtx.destination);
            o.start(t + idx * 0.08);
            o.stop(t + idx * 0.08 + 0.15);
          });
          break;

        case 'wrong':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(130, t);
          osc.frequency.linearRampToValueAtTime(80, t + 0.28);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
          osc.connect(gain);
          osc.start(t);
          osc.stop(t + 0.28);
          break;

        case 'victory':
          [261, 329, 392, 523, 659, 783, 1046].forEach((freq, idx) => {
            const o = this.webCtx.createOscillator();
            const g = this.webCtx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(freq, t + idx * 0.1);
            g.gain.setValueAtTime(0.22, t + idx * 0.1);
            g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.2);
            o.connect(g);
            g.connect(this.webCtx.destination);
            o.start(t + idx * 0.1);
            o.stop(t + idx * 0.1 + 0.2);
          });
          break;

        default:
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
          osc.connect(gain);
          osc.start(t);
          osc.stop(t + 0.06);
          break;
      }
    } catch (e) {
      console.log("Error en SFX:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;

    // Pausar o reanudar y silenciar música actual (imprescindible para iOS Safari)
    if (this.currentMusic) {
      this.currentMusic.muted = this.isMuted;
      this.currentMusic.volume = this.isMuted ? 0 : this.volume;
      if (this.isMuted) {
        this.currentMusic.pause();
      } else {
        this.currentMusic.play().catch(() => {});
      }
    }

    // Silenciar todos los elementos HTML5 Audio precargados
    Object.values(this.audioElements).forEach(audio => {
      if (audio) {
        audio.muted = this.isMuted;
        audio.volume = this.isMuted ? 0 : this.volume;
      }
    });

    // Suspender o reanudar el AudioContext sintético
    if (this.webCtx && this.webCtx.state !== 'closed') {
      if (this.isMuted) {
        this.webCtx.suspend().catch(() => {});
      } else if (this.webCtx.state === 'suspended') {
        this.webCtx.resume().catch(() => {});
      }
    }

    return this.isMuted;
  }
}

// Instancia global compartida / Singleton (Misma arquitectura que en Juego_web)
if (!window.audioManager) {
  window.audioManager = new SoundEngine();
}
window.soundEngine = window.audioManager;
const audioManager = window.audioManager;
