(function () {
    function createInitialState() {
        return {
            hp: 100,
            maxHp: 100,
            divinity: 45,
            isGodMode: false,
            godDeity: 'horus',
            scaleCurrent: 1.0,
            scaleTarget: 1.0,
            weaponTier: 1,
            weaponDamage: 22,

            wheat: 12,
            wood: 4,
            stone: 8,
            gold: 65,
            goldenBlood: 2,
            horusEyes: 0,

            setTaxRate: 0.45,
            setEyeStolen: false,
            obeliskProgress: 42,
            raPower: 80,
            isNightEvent: false,
            darkAgePenalty: false,
            inUnderworld: false,
            underworldStonesLeft: 0,
            sphinxSolved: false,
            isMountedScarab: false,
            workerSpeedBoost: 1.0,
            soundEnabled: true,
            questStep: 1,
            thiefSkillLevel: 1,
            divineNovaUnlocked: true,
            companionActive: false,
            cobraDefeatedCount: 0,
            fpsCount: 60,

            moveX: 0,
            moveZ: 0,
            cameraYaw: 0,
            cameraPitch: 0.34,
            cameraDist: 11.5,
            attackAnimTimer: 0,
            comboStage: 0,
            dodgeTimer: 0,
            divineTransformTimer: 0,
            specialAnimTimer: 0,
            walkCycle: 0
        };
    }

    window.GameConfig = Object.freeze({ createInitialState });
})();
