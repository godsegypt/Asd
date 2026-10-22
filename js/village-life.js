(function () {
    GameModules.register('village-life', {
        setup({ scene, world, factories }) {
            const palettes = {
                farmer: { cloth: 0x657347, wrap: 0xc29a59, skin: 0x9b6040, accent: 0xb67940 },
                fisher: { cloth: 0x315b69, wrap: 0x8c5e43, skin: 0xb87b56, accent: 0x547e7e },
                porter: { cloth: 0x9a7046, wrap: 0x744838, skin: 0x91573b, accent: 0xb18a51 },
                potter: { cloth: 0xa54b37, wrap: 0xd1b577, skin: 0xa96e4b, accent: 0x8c6b50 },
                scribe: { cloth: 0x36596d, wrap: 0xddd0b0, skin: 0x9b6145, accent: 0xb98e50 },
                merchant: { cloth: 0x874c67, wrap: 0xdda75a, skin: 0xb77b54, accent: 0xb58c51 }
            };
            const shared = {
                box: new THREE.BoxGeometry(1, 1, 1),
                limb: new THREE.CylinderGeometry(0.085, 0.065, 0.36, 6),
                pot: new THREE.LatheGeometry([
                    new THREE.Vector2(0.08, 0), new THREE.Vector2(0.22, 0.1),
                    new THREE.Vector2(0.29, 0.34), new THREE.Vector2(0.2, 0.57),
                    new THREE.Vector2(0.12, 0.68), new THREE.Vector2(0.19, 0.72)
                ], 8)
            };

            const crowd = [];

            function makeMaterial(color, roughness) {
                return new THREE.MeshStandardMaterial({ color, roughness: roughness || 0.78 });
            }

            function addMesh(parent, geometry, material, position, scale, rotation) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position[0], position[1], position[2]);
                if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
                if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
                parent.add(mesh);
                return mesh;
            }

            function dressRigVillager(villager, profession, index) {
                const rig = villager.userData.rig;
                const palette = palettes[profession] || palettes.porter;
                const wrapMaterial = makeMaterial(palette.wrap, 0.9);
                const accentMaterial = makeMaterial(palette.accent, 0.6);
                const darkMaterial = makeMaterial(0x26201c, 0.92);

                addMesh(rig.headGroup, new THREE.SphereGeometry(0.205, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.48), wrapMaterial, [0, 0.08, -0.01], [1.08, 0.78, 1.04]);
                addMesh(rig.headGroup, shared.box, wrapMaterial, [0, 0.015, -0.17], [0.31, 0.28, 0.18], [0.1, 0, 0]);
                addMesh(rig.headGroup, shared.box, accentMaterial, [0, 0.035, 0.171], [0.34, 0.045, 0.035], [0, 0, 0.06]);

                const sash = addMesh(rig.chestGroup, shared.box, wrapMaterial, [0, 0.18, 0.19], [0.13, 0.61, 0.035], [0, 0, profession === 'fisher' ? -0.62 : 0.62]);
                sash.material = wrapMaterial;
                addMesh(rig.chestGroup, shared.box, accentMaterial, [0, -0.05, 0.18], [0.42, 0.09, 0.035]);
                addMesh(rig.hipGroup, shared.box, wrapMaterial, [0, -0.12, 0.24], [0.33, 0.32, 0.04], [0.08, 0, 0]);

                if (profession === 'porter') {
                    const pack = new THREE.Group();
                    pack.position.set(0, 0.22, -0.25);
                    rig.chestGroup.add(pack);
                    addMesh(pack, shared.box, makeMaterial(0x80603f), [0, 0.05, 0], [0.4, 0.52, 0.25]);
                    for (let side = -1; side <= 1; side += 2) {
                        addMesh(pack, shared.limb, makeMaterial(0x57412d), [side * 0.15, 0.34, -0.02], [0.55, 0.7, 0.55], [0, 0, side * 0.16]);
                    }
                    villager.userData.professionProp = pack;
                } else if (profession === 'farmer') {
                    const hoe = new THREE.Group();
                    addMesh(hoe, shared.limb, makeMaterial(0x583d27), [0, 0.26, 0], [0.55, 1.55, 0.55]);
                    addMesh(hoe, shared.box, accentMaterial, [0, 0.66, 0], [0.72, 0.11, 0.13]);
                    hoe.position.set(0, -0.15, 0.1);
                    rig.rightArm.handGroup.add(hoe);
                    villager.userData.professionProp = hoe;
                } else if (profession === 'fisher') {
                    const net = new THREE.Group();
                    net.position.set(0, 0.18, -0.28);
                    rig.chestGroup.add(net);
                    for (let line = -2; line <= 2; line++) {
                        const strand = addMesh(net, shared.box, makeMaterial(0xb5a177), [line * 0.09, 0, 0], [0.018, 0.78, 0.018], [0, 0, line * 0.12]);
                        strand.material.transparent = true;
                        strand.material.opacity = 0.8;
                    }
                    for (let line = -2; line <= 2; line++) {
                        addMesh(net, shared.box, makeMaterial(0xb5a177), [0, line * 0.12, 0.015], [0.42, 0.016, 0.018], [0, 0, line * 0.08]);
                    }
                    const oar = addMesh(rig.leftArm.handGroup, shared.limb, makeMaterial(0x674a2d), [0, 0.1, 0.1], [0.75, 1.2, 0.75], [0, 0, 0.18]);
                    addMesh(rig.leftArm.handGroup, shared.box, accentMaterial, [0, -0.4, 0.12], [0.42, 0.08, 0.17], [0, 0, 0.18]);
                    villager.userData.professionProp = oar;
                } else if (profession === 'potter') {
                    const displayTray = new THREE.Group();
                    displayTray.position.set(-0.5, 0.16, -0.1);
                    rig.leftArm.shoulderPivot.add(displayTray);
                    addMesh(displayTray, shared.box, makeMaterial(0x67462d), [0, -0.24, 0.08], [0.48, 0.07, 0.32]);
                    for (let jar = 0; jar < 3; jar++) {
                        const pot = new THREE.Mesh(shared.pot, makeMaterial(jar % 2 ? 0xb5683e : 0x8d4933, 0.58));
                        pot.position.set(-0.13 + jar * 0.13, -0.17, 0.08);
                        pot.scale.setScalar(0.27 + (jar % 2) * 0.06);
                        displayTray.add(pot);
                    }
                    villager.userData.professionProp = displayTray;
                }

                const beard = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), darkMaterial);
                beard.position.set(0, -0.14, 0.13);
                if (profession === 'porter' || profession === 'scribe') rig.headGroup.add(beard);
                villager.userData.profession = profession;
                villager.userData.lifePhase = index * 1.37;
                villager.scale.setScalar(0.92 + (index % 4) * 0.045);
            }

            (world.villagers || []).forEach((villager, index) => {
                dressRigVillager(villager, villager.userData.profession, index);
            });

            function makeCitizen(spec, index) {
                const palette = palettes[spec.profession];
                const root = factories.createArticulatedEgyptianHuman({
                    role: 'villager',
                    skinMat: makeMaterial(palette.skin, 0.7),
                    clothMat: makeMaterial(palette.cloth, 0.86),
                    accentMat: makeMaterial(palette.accent, 0.58)
                });
                root.position.set(spec.from[0], spec.from[1], spec.from[2]);
                root.userData.profession = spec.profession;
                root.userData.lifePhase = index * 1.19;
                dressRigVillager(root, spec.profession, index + 10);
                const rig = root.userData.rig;

                if (spec.profession === 'porter') {
                    const pack = new THREE.Group();
                    pack.position.set(0, 0.18, -0.24);
                    rig.chestGroup.add(pack);
                    addMesh(pack, shared.box, makeMaterial(0x7c5839), [0, 0.02, 0], [0.42, 0.48, 0.25]);
                    for (let bundle = 0; bundle < 3; bundle++) {
                        addMesh(pack, shared.limb, makeMaterial(0x755638), [-0.12 + bundle * 0.12, 0.34, -0.02], [0.56, 0.8, 0.56], [0, 0, (bundle - 1) * 0.13]);
                    }
                } else if (spec.profession === 'farmer') {
                    const tool = new THREE.Group();
                    addMesh(tool, shared.limb, makeMaterial(0x553c27), [0, 0.1, 0], [0.62, 1.5, 0.62]);
                    addMesh(tool, shared.box, makeMaterial(palette.accent), [0, 0.48, 0], [0.7, 0.1, 0.12]);
                    tool.position.set(0, -0.15, 0.1);
                    rig.rightArm.handGroup.add(tool);
                    spec.tool = tool;
                } else if (spec.profession === 'fisher') {
                    const net = new THREE.Group();
                    net.position.set(0, 0.16, -0.28);
                    rig.chestGroup.add(net);
                    for (let line = -2; line <= 2; line++) {
                        addMesh(net, shared.box, makeMaterial(0xb5a177), [line * 0.08, 0, 0], [0.014, 0.62, 0.014], [0, 0, line * 0.12]);
                        addMesh(net, shared.box, makeMaterial(0xb5a177), [0, line * 0.1, 0.01], [0.35, 0.014, 0.014], [0, 0, line * 0.08]);
                    }
                    addMesh(rig.leftArm.handGroup, shared.limb, makeMaterial(0x674a2d), [0, 0.1, 0.1], [0.75, 1.2, 0.75], [0, 0, 0.18]);
                    addMesh(rig.leftArm.handGroup, shared.box, makeMaterial(palette.accent), [0, -0.4, 0.12], [0.42, 0.08, 0.17], [0, 0, 0.18]);
                } else if (spec.profession === 'potter') {
                    const tray = new THREE.Group();
                    tray.position.set(-0.5, 0.16, -0.1);
                    rig.leftArm.shoulderPivot.add(tray);
                    addMesh(tray, shared.box, makeMaterial(0x67462d), [0, -0.24, 0.08], [0.48, 0.07, 0.32]);
                    for (let jar = 0; jar < 2; jar++) {
                        const pot = new THREE.Mesh(shared.pot, makeMaterial(jar ? 0xc17b4d : 0x93513a));
                        pot.position.set(jar * 0.22 - 0.12, -0.13, 0.08);
                        pot.scale.setScalar(0.34);
                        tray.add(pot);
                    }
                } else if (spec.profession === 'scribe') {
                    const tablet = addMesh(rig.leftArm.handGroup, shared.box, makeMaterial(0xd8c7a1), [0, -0.04, 0.1], [0.26, 0.36, 0.055], [0.18, 0, 0]);
                    addMesh(tablet, shared.box, makeMaterial(0x67462d), [0, 0, 0.55], [0.06, 0.72, 0.1]);
                } else {
                    const basket = new THREE.Group();
                    basket.position.set(0.4, -0.11, 0.08);
                    rig.leftArm.handGroup.add(basket);
                    addMesh(basket, shared.pot, makeMaterial(0xb46a42), [0, 0, 0], [0.72, 0.72, 0.72]);
                    for (let fruit = 0; fruit < 3; fruit++) {
                        addMesh(basket, shared.sphere, makeMaterial(fruit === 1 ? 0x6d8141 : 0xd79a41), [-0.12 + fruit * 0.12, 0.3, 0.05], [0.1, 0.1, 0.1]);
                    }
                }

                world.root.add(root);
                crowd.push({ root, spec, phase: index * 1.19 });
            }

            const citizenRoutes = [
                { profession: 'farmer', from: [-14, 0, 30], to: [-9, 0, 34], speed: 0.22 },
                { profession: 'fisher', from: [-37, 0, -11], to: [-43, 0, -16], speed: 0.18 },
                { profession: 'potter', from: [-3, 0, -4], to: [3, 0, -5], speed: 0.16 },
                { profession: 'porter', from: [9, 0, 4], to: [16, 0, 5], speed: 0.2 },
                { profession: 'scribe', from: [-8, 0, -23], to: [-4, 0, -19], speed: 0.13 },
                { profession: 'merchant', from: [0, 0, -11], to: [5, 0, -11], speed: 0.17 }
            ];
            citizenRoutes.forEach(makeCitizen);

            this.update = function (_context, deltaTime, elapsedTime) {
                crowd.forEach(({ root, spec, phase }) => {
                    const cycle = elapsedTime * spec.speed + phase;
                    const progress = (Math.sin(cycle) + 1) * 0.5;
                    const moving = Math.abs(Math.cos(cycle)) > 0.32;
                    root.position.set(
                        spec.from[0] + (spec.to[0] - spec.from[0]) * progress,
                        spec.from[1],
                        spec.from[2] + (spec.to[2] - spec.from[2]) * progress
                    );
                    root.rotation.y = Math.atan2(spec.to[0] - spec.from[0], spec.to[2] - spec.from[2]);
                    factories.animateHumanoidRig(root, deltaTime, elapsedTime, {
                        speed: moving ? 2.7 : 0,
                        isCarrying: spec.profession === 'porter',
                        workAction: spec.profession,
                        isWorking: !moving
                    });
                    const rig = root.userData.rig;
                    const task = Math.sin(elapsedTime * 2.6 + phase) * 0.32;
                    if (!moving && spec.profession === 'farmer') {
                        rig.spineGroup.rotation.x = 0.08 + Math.max(0, task) * 0.2;
                        rig.rightArm.shoulderPivot.rotation.x = -0.45 - Math.max(0, task) * 0.62;
                    } else if (!moving && spec.profession === 'fisher') {
                        rig.leftArm.shoulderPivot.rotation.x = -0.25 + task * 0.32;
                        rig.rightArm.shoulderPivot.rotation.x = -0.18 - task * 0.18;
                    } else if (!moving && spec.profession === 'potter') {
                        rig.leftArm.shoulderPivot.rotation.x = -0.72 + Math.sin(elapsedTime * 2 + phase) * 0.08;
                    } else if (!moving && spec.profession === 'scribe') {
                        rig.headGroup.rotation.x = 0.12 + Math.max(0, task) * 0.3;
                    }
                    if (spec.tool) spec.tool.rotation.z = Math.sin(elapsedTime * 2.6 + phase) * 0.22;
                });

                (world.villagers || []).forEach((villager, index) => {
                    const rig = villager.userData.rig;
                    const action = Math.sin(elapsedTime * 3.3 + villager.userData.lifePhase);
                    if (villager.userData.profession === 'farmer') {
                        rig.spineGroup.rotation.x = 0.08 + Math.max(0, action) * 0.2;
                        rig.rightArm.shoulderPivot.rotation.x = -0.45 - Math.max(0, action) * 0.62;
                    } else if (villager.userData.profession === 'fisher') {
                        rig.leftArm.shoulderPivot.rotation.x = -0.25 + action * 0.32;
                        rig.rightArm.shoulderPivot.rotation.x = -0.18 - action * 0.18;
                    } else if (villager.userData.profession === 'potter') {
                        rig.leftArm.shoulderPivot.rotation.x = -0.72 + Math.sin(elapsedTime * 2 + index) * 0.08;
                        rig.spineGroup.rotation.y = Math.sin(elapsedTime * 1.3 + index) * 0.04;
                    }
                });
            };
        },

        dispose() {}
    });
})();