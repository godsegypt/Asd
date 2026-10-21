(function () {
    const modules = new Map();
    let context = null;

    function initializeModule(name, module) {
        if (typeof module.setup === 'function') {
            module.setup(context);
        }
        modules.set(name, module);
    }

    function register(name, module) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new TypeError('Game module name must be a non-empty string.');
        }
        if (!module || typeof module !== 'object') {
            throw new TypeError(`Game module "${name}" must be an object.`);
        }
        if (modules.has(name)) {
            throw new Error(`Game module "${name}" is already registered.`);
        }

        if (context) {
            initializeModule(name, module);
        } else {
            modules.set(name, module);
        }
    }

    function start(gameContext) {
        if (context) return;
        context = gameContext;
        modules.forEach((module, name) => initializeModule(name, module));
    }

    function update(deltaTime, elapsedTime) {
        if (!context) return;
        modules.forEach((module) => {
            if (typeof module.update === 'function') {
                module.update(context, deltaTime, elapsedTime);
            }
        });
    }

    function dispose() {
        modules.forEach((module) => {
            if (typeof module.dispose === 'function') {
                module.dispose(context);
            }
        });
        modules.clear();
        context = null;
    }

    window.GameModules = Object.freeze({ register, start, update, dispose });
})();
