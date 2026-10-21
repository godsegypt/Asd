const joystickZone = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');
let joystickTouchId = null;
let cameraTouchId = null;
let lastCamX = 0;
let lastCamY = 0;

function handleJoystickMove(clientX, clientY) {
    const rect = joystickZone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.38;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
    }
    joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    gameState.moveX = dx / maxRadius;
    gameState.moveZ = dy / maxRadius;
}

function resetJoystick() {
    joystickTouchId = null;
    joystickKnob.style.transform = `translate(0px, 0px)`;
    gameState.moveX = 0;
    gameState.moveZ = 0;
}

joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;
    handleJoystickMove(touch.clientX, touch.clientY);
}, { passive: false });

joystickZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let t of e.changedTouches) {
        if (t.identifier === joystickTouchId) {
            handleJoystickMove(t.clientX, t.clientY);
        }
    }
}, { passive: false });

joystickZone.addEventListener('touchend', (e) => {
    for (let t of e.changedTouches) {
        if (t.identifier === joystickTouchId) resetJoystick();
    }
});

canvas.addEventListener('touchstart', (e) => {
    const touch = e.changedTouches[0];
    cameraTouchId = touch.identifier;
    lastCamX = touch.clientX;
    lastCamY = touch.clientY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
    for (let t of e.changedTouches) {
        if (t.identifier === cameraTouchId) {
            const dx = t.clientX - lastCamX;
            const dy = t.clientY - lastCamY;
            lastCamX = t.clientX;
            lastCamY = t.clientY;
            gameState.cameraYaw -= dx * 0.007;
            gameState.cameraPitch = Math.max(0.15, Math.min(1.15, gameState.cameraPitch + dy * 0.005));
        }
    }
}, { passive: true });

let isMouseDragging = false;
canvas.addEventListener('mousedown', (e) => {
    isMouseDragging = true;
    lastCamX = e.clientX;
    lastCamY = e.clientY;
});
window.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    const dx = e.clientX - lastCamX;
    const dy = e.clientY - lastCamY;
    lastCamX = e.clientX;
    lastCamY = e.clientY;
    gameState.cameraYaw -= dx * 0.006;
    gameState.cameraPitch = Math.max(0.15, Math.min(1.15, gameState.cameraPitch + dy * 0.005));
});
window.addEventListener('mouseup', () => { isMouseDragging = false; });

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') performPrimaryAction();
    if (e.code === 'ShiftLeft') gameState.dodgeTimer = 0.48;
    if (e.code === 'KeyG') toggleGodTransformation();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

document.getElementById('btn-attack').addEventListener('click', performPrimaryAction);
document.getElementById('btn-dodge').addEventListener('click', () => {
    if (gameState.dodgeTimer <= 0) {
        gameState.dodgeTimer = 0.48;
        showToast('💨 Hırsız Taklası! Tuzaklardan sıyrıldın.');
    }
});
document.getElementById('btn-god-form').addEventListener('click', toggleGodTransformation);
document.getElementById('btn-special').addEventListener('click', performSpecialDivineSkill);
document.getElementById('btn-trigger-night').addEventListener('click', toggleNightApophisEvent);
