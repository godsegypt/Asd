let toastTimeout = null;

function showToast(msg) {
    const banner = document.getElementById('toast-banner');
    const text = document.getElementById('toast-text');
    if (!banner || !text) return;
    text.textContent = msg;
    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0)';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-8px)';
    }, 3200);
}

function spawnFloatingText(worldPos, text, colorHex = '#ffd700') {
    const container = document.getElementById('floating-text-layer');
    if (!container || !camera) return;
    const proj = worldPos.clone();
    proj.y += 2.2;
    proj.project(camera);
    if (proj.z > 1) return;

    const x = (proj.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(proj.y * 0.5) + 0.5) * window.innerHeight;

    const el = document.createElement('div');
    el.className = 'floating-dmg text-sm sm:text-base';
    el.style.left = `${x - 20}px`;
    el.style.top = `${y - 10}px`;
    el.style.color = colorHex;
    el.textContent = text;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1150);
}

function updateStoryQuestTracker() {
    const qTitle = document.getElementById('quest-title');
    const qDesc = document.getElementById('quest-desc');
    if (!qTitle || !qDesc) return;

    if (!gameState.sphinxSolved) {
        qTitle.textContent = '1. Dev Sfenks\'in Bilmecesini Çöz';
        qDesc.textContent = 'Tuzaklı Tapınak girişindeki Sfenks\'e (Z: 28) yaklaş ve bilmeceyi yanıtla.';
    } else if (!gameState.setEyeStolen) {
        qTitle.textContent = '2. Tuzaklı Tapınaktan Horus\'un Gözünü Çal';
        qDesc.textContent = 'Sallanan giyotinlerden takla (💨) ile geçip Gözü çal ve %45 vergiyi yık!';
    } else if (gameState.weaponTier < 2) {
        qTitle.textContent = '3. Altın Kan Topla & Efsanevi Silah Döv';
        qDesc.textContent = 'Set\'i yaralayarak dökülen Altın Kanları topla ve Ptah Ocağında silah üret.';
    } else {
        qTitle.textContent = '4. Set\'i Mağlup Et & Ra\'nın Gemisini Koru!';
        qDesc.textContent = '2.5x Tanrı formuna (🦅) dönüşerek Set\'i devir ve gece Apophis\'i yok et!';
    }
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function updateHUD() {
    document.getElementById('res-wheat').textContent = gameState.wheat;
    document.getElementById('res-stone').textContent = gameState.stone;
    document.getElementById('res-gold').textContent = gameState.gold;
    document.getElementById('res-golden-blood').textContent = gameState.goldenBlood;
    document.getElementById('res-eyes').textContent = `${gameState.horusEyes}/2`;

    const hpPct = Math.max(0, Math.min(100, (gameState.hp / gameState.maxHp) * 100));
    document.getElementById('hp-bar').style.width = `${hpPct}%`;
    document.getElementById('hp-text').textContent = `CAN: ${Math.ceil(gameState.hp)}/${gameState.maxHp}`;

    const divPct = Math.max(0, Math.min(100, gameState.divinity));
    document.getElementById('divinity-bar').style.width = `${divPct}%`;
    document.getElementById('divinity-text').textContent = `İLAHİ GÜÇ: ${Math.floor(gameState.divinity)}/100`;

    const badge = document.getElementById('avatar-badge');
    const title = document.getElementById('player-title');
    if (gameState.isGodMode) {
        const deityNames = {
            horus: 'HORUS ŞAHİN FORMU (2.5x)',
            set: 'SET ÇAKAL FORMU (2.5x)',
            apis: 'APİS BOĞA FORMU (2.5x)'
        };
        badge.textContent = gameState.godDeity.toUpperCase().slice(0, 3);
        title.textContent = deityNames[gameState.godDeity];
        title.className = 'font-cinzel font-bold text-xs sm:text-sm text-cyan-300 tracking-wide';
    } else {
        badge.textContent = 'BEK';
        title.textContent = gameState.weaponTier > 1 ? 'EFSANEVİ HIRSIZ BEK (1.0x)' : 'ÖLÜMLÜ HIRSIZ BEK (1.0x)';
        title.className = 'font-cinzel font-bold text-xs sm:text-sm text-amber-300 tracking-wide';
    }

    const taxBadge = document.getElementById('tax-badge');
    if (gameState.setEyeStolen) {
        taxBadge.textContent = 'Set Vergisi: %0 (Özgür!)';
        taxBadge.className = 'px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 font-semibold text-[10px]';
    } else {
        taxBadge.textContent = `Set Vergisi: %${Math.round(gameState.setTaxRate * 100)}`;
    }

    document.getElementById('obelisk-progress-text').textContent = `Dikilitaş: %${Math.min(100, gameState.obeliskProgress)} İnşa`;
    document.getElementById('ra-power-bar').style.width = `${Math.max(0, Math.min(100, gameState.raPower))}%`;
    updateStoryQuestTracker();
}
