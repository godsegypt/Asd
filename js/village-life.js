(function () {
    GameModules.register('village-life', {
        setup({ scene, world }) {
            const palettes = {
                farmer: { cloth: 0x657347, wrap: 0xc29a59, skin: 0x9b6040, accent: 0xb67940 },
                fisher: { cloth: 0x315b69, wrap: 0x8c5e43, skin: 0xb87b56, accent: 0x547e7e },
                porter: { cloth: 0x9a7046, wrap: 0x744838, skin: 0x91573b, accent: 0xb18a51 },
                potter: { cloth: 0xa54b37, wrap: 0xd1b577, skin: 0xa96e4b, accent: 0x8c6b50 },
                scribe: { cloth: 0x36596d, wrap: 0xddd0b0, skin: 0x9b6145, accent: 0xb98e50 },
                merchant: { cloth: 0x874c67, wrap: 0xdda75a, skin: 0xb77b54, accent: 0xb58c51 }
            };
            const shared = {
                sphere: new THREE.SphereGeometry(1, 9, 7),
                box: new THREE.BoxGeometry(1, 1, 1),
                limb: new THREE.CylinderGeometry(0.085, 0.065, 0.36, 6),
                foot: new THREE.BoxGeometry(0.14, 0.07, 0.24),
                skirt: new THREE.CylinderGeometry(0.2, 0.31, 0.55, 8),
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
            }

            (world.villagers || []).forEach((villager, index) => {
                dressRigVillager(villager, villager.userData.profession, index);
            });

            function makeCitizen(spec, index) {
                const palette = palettes[spec.profession];
                const root = new THREE.Group();
                const skin = makeMaterial(palette.skin);
                const cloth = makeMaterial(palette.cloth, 0.86);
                const wrap = makeMaterial(palette.wrap, 0.9);
                const dark = makeMaterial(0x241d1a, 0.92);
                const accent = makeMaterial(palette.accent, 0.58);

                const hip = new THREE.Group();
                hip.position.y = 0.87;
                root.add(hip);
                addMesh(hip, shared.skirt, cloth, [0, -0.13, 0], [1, 1, 0.82]);
                addMesh(hip, shared.box, accent, [0, 0.15, 0.2], [0.5, 0.08, 0.08]);

                const torso = addMesh(root, shared.sphere, skin, [0, 1.34, 0], [0.34, 0.46, 0.24]);
                torso.castShadow = true;
                addMesh(root, shared.sphere, cloth, [0, 1.16, 0.005], [0.38, 0.43, 0.255]);
                addMesh(root, shared.box, accent, [0, 1.56, 0.22], [0.54, 0.1, 0.06]);

                const head = new THREE.Group();
                head.position.set(0, 1.9, 0);
                root.add(head);
                addMesh(head, shared.sphere, skin, [0, 0, 0], [0.18, 0.22, 0.17]);
                addMesh(head, new THREE.SphereGeometry(0.195, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.52), dark, [0, 0.045, -0.015], [1, 0.85, 1]);
                addMesh(head, shared.box, wrap, [0, 0.125, -0.025], [0.34, 0.1, 0.35]);
                addMesh(head, shared.box, accent, [0, 0.083, 0.157], [0.3, 0.027, 0.025]);
                for (const side of [-1, 1]) {
                    addMesh(head, shared.sphere, dark, [side * 0.065, 0.012, 0.155], [0.025, 0.018, 0.015]);
                    addMesh(head, shared.sphere, accent, [side * 0.19, -0.015, 0], [0.045, 0.055, 0.04]);
                }

                const arms = [];
                const legs = [];
                for (const side of [-1, 1]) {
                    const arm = new THREE.Group();
                    arm.position.set(side * 0.34, 1.55, 0);
                    root.add(arm);
                    addMesh(arm, shared.limb, skin, [0, -0.16, 0], [1, 1.15, 1]);
                    const forearm = new THREE.Group();
                    forearm.position.y = -0.34;
                    arm.add(forearm);
                    addMesh(forearm, shared.limb, skin, [0, -0.14, 0], [0.82, 0.95, 0.82]);
                    addMesh(forearm, shared.sphere, skin, [0, -0.33, 0.02], [0.075, 0.08, 0.07]);
                    addMesh(arm, new THREE.TorusGeometry(0.083, 0.014, 5, 10), accent, [0, -0.33, 0], [1, 1, 0.8], [Math.PI / 2, 0, 0]);
                    arms.push({ upper: arm, forearm });

                    const leg = new THREE.Group();
                    leg.position.set(side * 0.13, 0.72, 0);
                    root.add(leg);
                    addMesh(leg, shared.limb, skin, [0, -0.2, 0], [1.25, 1.4, 1.25]);
                    addMesh(leg, shared.foot, skin, [0, -0.43, 0.07]);
                    addMesh(leg, shared.box, accent, [0, -0.45, 0.08], [0.16, 0.025, 0.27]);
                    legs.push(leg);
                }

                if (spec.profession === 'porter') {
                    addMesh(root, shared.box, makeMaterial(0x7c5839), [0, 1.36, -0.25], [0.42, 0.48, 0.25]);
                } else if (spec.profession === 'farmer') {
                    const tool = new THREE.Group();
                    addMesh(tool, shared.limb, makeMaterial(0x553c27), [0, 0.1, 0], [0.62, 1.5, 0.62]);
                    addMesh(tool, shared.box, accent, [0, 0.48, 0], [0.7, 0.1, 0.12]);
                    tool.position.set(0.39, 0.68, 0.12);
                    root.add(tool);
                    spec.tool = tool;
                } else if (spec.profession === 'fisher') {
                    const net = new THREE.Group();
                    net.position.set(0, 1.3, -0.29);
                    root.add(net);
                    for (let line = -2; line <= 2; line++) {
                        addMesh(net, shared.box, accent, [line * 0.08, 0, 0], [0.014, 0.62, 0.014], [0, 0, line * 0.12]);
                        addMesh(net, shared.box, accent, [0, line * 0.1, 0.01], [0.35, 0.014, 0.014], [0, 0, line * 0.08]);
                    }
                } else if (spec.profession === 'potter') {
                    for (let jar = 0; jar < 2; jar++) {
                        const pot = new THREE.Mesh(shared.pot, makeMaterial(jar ? 0xc17b4d : 0x93513a));
                        pot.position.set(jar * 0.35 - 0.2, 0.05, 0.36);
                        pot.scale.setScalar(0.72);
                        root.add(pot);
                    }
                } else if (spec.profession === 'scribe') {
                    addMesh(root, shared.box, makeMaterial(0xd8c7a1), [0, 1.2, 0.3], [0.32, 0.36, 0.06], [0.18, 0, 0]);
                } else {
                    addMesh(root, shared.pot, makeMaterial(0xb46a42), [0.36, 0.18, 0.12], [0.8, 0.8, 0.8]);
                }

                root.position.set(spec.from[0], spec.from[1], spec.from[2]);
                world.root.add(root);
                crowd.push({ root, arms, legs, head, spec, phase: index * 1.19 });
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

            this.update = function (_context, _deltaTime, elapsedTime) {
                crowd.forEach(({ root, arms, legs, head, spec, phase }) => {
                    const cycle = elapsedTime * spec.speed + phase;
                    const progress = (Math.sin(cycle) + 1) * 0.5;
                    const moving = Math.abs(Math.cos(cycle)) > 0.32;
                    root.position.set(
                        spec.from[0] + (spec.to[0] - spec.from[0]) * progress,
                        spec.from[1],
                        spec.from[2] + (spec.to[2] - spec.from[2]) * progress
                    );
                    root.rotation.y = Math.atan2(spec.to[0] - spec.from[0], spec.to[2] - spec.from[2]);
                    const stride = moving ? Math.sin(elapsedTime * 5.2 + phase) * 0.46 : 0;
                    legs[0].rotation.x = stride;
                    legs[1].rotation.x = -stride;
                    arms[0].upper.rotation.x = -stride * 0.55;
                    arms[1].upper.rotation.x = stride * 0.55;
                    const task = Math.sin(elapsedTime * 2.6 + phase) * 0.32;
                    if (!moving && spec.profession === 'farmer') arms[0].upper.rotation.x = -0.6 - Math.max(0, task);
                    if (!moving && spec.profession === 'fisher') arms[1].upper.rotation.x = -0.45 + task;
                    if (!moving && spec.profession === 'scribe') head.rotation.x = 0.12 + Math.max(0, task) * 0.3;
                    else head.rotation.x = Math.sin(elapsedTime * 0.9 + phase) * 0.035;
                    if (spec.tool) spec.tool.rotation.z = Math.sin(elapsedTime * 2.6 + phase) * 0.22;
                    root.position.y = Math.abs(stride) * 0.035;
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