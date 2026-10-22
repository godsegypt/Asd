(function () {
    function createTexture(draw, repeatX, repeatY) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        draw(canvas.getContext('2d'));

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX || 1, repeatY || 1);
        return texture;
    }

    function createShape(points) {
        const shape = new THREE.Shape();
        shape.moveTo(points[0][0], points[0][1]);
        points.slice(1).forEach(point => shape.lineTo(point[0], point[1]));
        shape.closePath();
        return shape;
    }

    GameModules.register('world-detail', {
        setup({ scene, world }) {
            const root = world.root;
            if (!root) return;

            const mudTexture = createTexture(ctx => {
                ctx.fillStyle = '#aa794c';
                ctx.fillRect(0, 0, 256, 256);
                for (let row = 0; row < 16; row++) {
                    const y = row * 16;
                    const offset = row % 2 ? 12 : 0;
                    ctx.fillStyle = row % 3 ? '#b98553' : '#986b45';
                    ctx.fillRect(0, y, 256, 14);
                    ctx.strokeStyle = 'rgba(60,38,24,0.42)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, y + 15);
                    ctx.lineTo(256, y + 15);
                    ctx.stroke();
                    for (let x = offset; x < 256; x += 48) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, y + 15);
                        ctx.stroke();
                    }
                    for (let grain = 0; grain < 20; grain++) {
                        ctx.fillStyle = grain % 2 ? 'rgba(235,195,139,0.18)' : 'rgba(55,38,24,0.12)';
                        ctx.fillRect(Math.random() * 256, y + Math.random() * 12, 2, 1);
                    }
                }
            }, 2, 1.5);
            const linenTexture = createTexture(ctx => {
                ctx.fillStyle = '#a94432';
                ctx.fillRect(0, 0, 256, 256);
                ctx.fillStyle = '#e1bd72';
                ctx.fillRect(0, 0, 256, 12);
                ctx.fillRect(0, 244, 256, 12);
                for (let y = 18; y < 244; y += 28) {
                    ctx.fillStyle = y % 56 ? '#254e59' : '#d08b43';
                    ctx.fillRect(0, y, 256, 5);
                    ctx.fillStyle = 'rgba(255,232,184,0.22)';
                    for (let x = 0; x < 256; x += 16) ctx.fillRect(x, y + 8, 7, 2);
                }
            }, 1, 1);
            const waterTexture = createTexture(ctx => {
                ctx.fillStyle = '#146b7a';
                ctx.fillRect(0, 0, 256, 256);
                for (let row = 0; row < 48; row++) {
                    const x = (row * 37) % 256;
                    const y = (row * 61) % 256;
                    ctx.strokeStyle = row % 4 ? 'rgba(102,205,190,0.22)' : 'rgba(225,207,134,0.48)';
                    ctx.lineWidth = row % 4 ? 1 : 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.quadraticCurveTo(x + 12, y - 3, x + 27, y);
                    ctx.stroke();
                }
            }, 2, 12);

            const materials = {
                mud: new THREE.MeshStandardMaterial({ map: mudTexture, color: 0xe4c398, roughness: 0.96 }),
                sunDriedBrick: new THREE.MeshStandardMaterial({ color: 0x9e6540, roughness: 0.92 }),
                timber: new THREE.MeshStandardMaterial({ color: 0x49301f, roughness: 0.82 }),
                reed: new THREE.MeshStandardMaterial({ color: 0x75813f, roughness: 0.9 }),
                linen: new THREE.MeshStandardMaterial({ map: linenTexture, side: THREE.DoubleSide, roughness: 0.78 }),
                blueGlaze: new THREE.MeshStandardMaterial({ color: 0x187d88, roughness: 0.22, metalness: 0.25, emissive: 0x062c31 }),
                pottery: new THREE.MeshStandardMaterial({ color: 0xb65f37, roughness: 0.62 }),
                river: new THREE.MeshStandardMaterial({ map: waterTexture, color: 0x83c2b6, roughness: 0.2, metalness: 0.42, transparent: true, opacity: 0.78 }),
                spirit: new THREE.MeshStandardMaterial({ color: 0x5b3c83, emissive: 0x4e35a5, emissiveIntensity: 1.1, roughness: 0.32, metalness: 0.18 }),
                spiritGlow: new THREE.MeshBasicMaterial({ color: 0xc4a0ff, transparent: true, opacity: 0.54, blending: THREE.AdditiveBlending, depthWrite: false }),
                gold: new THREE.MeshStandardMaterial({ color: 0xffca58, metalness: 0.86, roughness: 0.24, emissive: 0x4e2606, emissiveIntensity: 0.28 })
            };

            const box = new THREE.BoxGeometry(1, 1, 1);
            const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8);

            function addMesh(parent, geometry, material, position, scale, rotation) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(position[0], position[1], position[2]);
                if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
                if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
                parent.add(mesh);
                return mesh;
            }

            function buildHouse(x, z, rotation, size) {
                const house = new THREE.Group();
                house.position.set(x, 0, z);
                house.rotation.y = rotation;
                root.add(house);

                addMesh(house, box, materials.mud, [0, 1.6, 0], [size, 3.2, size * 0.83]);
                addMesh(house, box, materials.sunDriedBrick, [0, 3.25, 0], [size + 0.32, 0.24, size * 0.83 + 0.3]);
                addMesh(house, box, materials.sunDriedBrick, [0, 3.54, -size * 0.38], [size + 0.1, 0.38, 0.18]);
                addMesh(house, box, materials.sunDriedBrick, [-size * 0.47, 3.48, 0], [0.18, 0.28, size * 0.83]);
                addMesh(house, box, materials.sunDriedBrick, [size * 0.47, 3.48, 0], [0.18, 0.28, size * 0.83]);

                addMesh(house, box, materials.timber, [0, 1.03, size * 0.42], [1.05, 2.05, 0.16]);
                addMesh(house, box, materials.gold, [0, 2.05, size * 0.435], [1.22, 0.12, 0.12]);
                for (const side of [-1, 1]) {
                    addMesh(house, box, materials.sunDriedBrick, [side * 0.67, 1.12, size * 0.43], [0.13, 2.25, 0.2]);
                    addMesh(house, box, materials.timber, [side * 1.45, 2.35, size * 0.425], [0.52, 0.62, 0.1]);
                    addMesh(house, box, materials.blueGlaze, [side * 1.45, 2.35, size * 0.44], [0.24, 0.35, 0.04]);
                    addMesh(house, box, materials.timber, [side * 1.45, 2.35, size * 0.46], [0.06, 0.72, 0.06]);
                }

                for (let step = 0; step < 3; step++) {
                    addMesh(house, box, materials.sunDriedBrick, [0, 0.16 + step * 0.15, size * 0.52 + step * 0.28], [1.5, 0.3, 0.62]);
                }
                for (let beam = -1; beam <= 1; beam++) {
                    addMesh(house, cylinder, materials.timber, [beam * 0.8, 3.18, -size * 0.02], [0.075, size * 0.93, 0.075], [Math.PI / 2, 0, 0]);
                }

                const shade = addMesh(house, box, materials.linen, [0, 3.06, size * 0.78], [size * 0.94, 0.12, size * 0.66], [-0.12, 0, 0]);
                shade.castShadow = true;
                for (const side of [-1, 1]) {
                    addMesh(house, cylinder, materials.timber, [side * size * 0.39, 1.52, size * 0.94], [0.09, 3.05, 0.09]);
                }

                house.traverse(object => {
                    if (object.isMesh && object !== shade) object.castShadow = object.position.y > 0.5;
                });
            }

            [
                [-8, -27, 0.08, 5.2], [-2, -20, -0.18, 4.6], [-8, 13, 0.16, 5.4],
                [-2, 20, -0.1, 4.7], [-27, 3, 0.3, 4.5]
            ].forEach(values => buildHouse(values[0], values[1], values[2], values[3]));

            function addAmphora(parent, x, y, z, scale) {
                const profile = [
                    new THREE.Vector2(0.12, 0), new THREE.Vector2(0.32, 0.12),
                    new THREE.Vector2(0.49, 0.42), new THREE.Vector2(0.44, 0.76),
                    new THREE.Vector2(0.24, 1.02), new THREE.Vector2(0.18, 1.16),
                    new THREE.Vector2(0.26, 1.22), new THREE.Vector2(0.26, 1.3)
                ];
                const jar = new THREE.Mesh(new THREE.LatheGeometry(profile, 10), materials.pottery);
                jar.position.set(x, y, z);
                jar.scale.setScalar(scale);
                jar.castShadow = true;
                parent.add(jar);
                return jar;
            }

            function buildMarketStall(x, z, colorShift) {
                const stall = new THREE.Group();
                stall.position.set(x, 0, z);
                root.add(stall);
                const counter = addMesh(stall, box, materials.timber, [0, 0.88, 0], [4.1, 1.05, 1.3]);
                counter.castShadow = true;
                for (const side of [-1, 1]) {
                    addMesh(stall, cylinder, materials.timber, [side * 1.82, 2.42, -0.28], [0.12, 3.4, 0.12]);
                    addMesh(stall, cylinder, materials.timber, [side * 1.82, 2.42, 1.08], [0.12, 3.4, 0.12]);
                }
                const canopy = addMesh(stall, box, materials.linen, [0, 3.56, 0.38], [4.45, 0.15, 2.4], [0.08, 0, 0]);
                canopy.material = materials.linen.clone();
                canopy.material.color.setHSL(colorShift, 0.68, 0.6);
                canopy.castShadow = true;
                for (let jar = 0; jar < 4; jar++) addAmphora(stall, -1.35 + jar * 0.8, 1.43, 0.05, 0.62 + (jar % 2) * 0.1);
                addMesh(stall, box, materials.blueGlaze, [0, 1.47, -0.48], [1.05, 0.5, 0.08]);
            }

            buildMarketStall(-5, -7, 0.08);
            buildMarketStall(3, -8, 0.47);

            const templeFires = [];
            function buildTemple(x, z, scale) {
                const temple = new THREE.Group();
                temple.position.set(x, 0, z);
                root.add(temple);

                addMesh(temple, box, materials.sunDriedBrick, [0, 2.1, 0], [5.2 * scale, 4.2, 3.6 * scale]);
                addMesh(temple, box, materials.gold, [0, 4.55, 0], [4.6 * scale, 0.26, 0.18]);
                addMesh(temple, box, materials.linen, [0, 5.2, 0], [2.75 * scale, 0.16, 2.1 * scale], [0.08, 0, 0]);
                addMesh(temple, box, materials.timber, [0, 1.45, 1.83 * scale], [1.18 * scale, 2.75, 0.08]);
                for (const side of [-1, 1]) {
                    addMesh(temple, box, materials.gold, [side * 0.72 * scale, 1.52, 1.9 * scale], [0.12 * scale, 3.05, 0.12]);
                    addMesh(temple, new THREE.TorusGeometry(0.34 * scale, 0.055 * scale, 8, 20), materials.gold,
                        [side * 1.2 * scale, 3.75, 1.87 * scale]);
                }

                for (let column = -2; column <= 2; column++) {
                    addMesh(temple, cylinder, materials.sunDriedBrick, [column * 1.2 * scale, 2.4, -0.5 * scale], [0.18 * scale, 4.8, 0.18 * scale]);
                    addMesh(temple, box, materials.gold, [column * 1.2 * scale, 4.3, -0.5 * scale], [0.2 * scale, 0.14, 0.2 * scale]);
                }

                for (const side of [-1, 1]) {
                    addMesh(temple, box, materials.sunDriedBrick, [side * 2.05 * scale, 2.8, 0], [0.24 * scale, 3.7, 2.35 * scale]);
                    addMesh(temple, new THREE.ConeGeometry(0.7 * scale, 2.1 * scale, 4), materials.gold, [side * 2.4 * scale, 5.25, 0], [1, 1, 1]);
                }

                for (let step = 0; step < 8; step++) {
                    const pathTile = addMesh(temple, box, step % 2 ? materials.mud : materials.sunDriedBrick,
                        [0, 0.08, (3.1 + step * 0.9) * scale], [3.7 * scale, 0.16, 0.82 * scale]);
                    pathTile.receiveShadow = true;
                }

                for (const side of [-1, 1]) {
                    const obelisk = new THREE.Group();
                    obelisk.position.set(side * 3.9 * scale, 0, 4.1 * scale);
                    obelisk.rotation.y = Math.PI / 4;
                    temple.add(obelisk);
                    addMesh(obelisk, box, materials.sunDriedBrick, [0, 0.34 * scale, 0], [0.92 * scale, 0.68 * scale, 0.92 * scale]);
                    addMesh(obelisk, new THREE.CylinderGeometry(0.13 * scale, 0.34 * scale, 3.45 * scale, 4), materials.gold,
                        [0, 2.38 * scale, 0]);
                    addMesh(obelisk, new THREE.ConeGeometry(0.34 * scale, 0.72 * scale, 4), materials.gold,
                        [0, 4.46 * scale, 0]);
                    for (let mark = 0; mark < 3; mark++) {
                        addMesh(obelisk, box, materials.blueGlaze,
                            [0, (1.15 + mark * 0.82) * scale, 0.255 * scale], [0.12 * scale, 0.28 * scale, 0.035 * scale]);
                    }

                    const torch = new THREE.Group();
                    torch.position.set(side * 1.8 * scale, 0, 2.2 * scale);
                    temple.add(torch);
                    addMesh(torch, cylinder, materials.timber, [0, 0.88 * scale, 0], [0.16 * scale, 1.76 * scale, 0.16 * scale]);
                    const flame = addMesh(torch, new THREE.ConeGeometry(0.22 * scale, 0.62 * scale, 6), materials.gold,
                        [0, 1.95 * scale, 0]);
                    const light = new THREE.PointLight(0xffa64d, 0.9, 10 * scale, 2);
                    light.position.set(0, 2 * scale, 0);
                    torch.add(light);
                    templeFires.push({ flame, light, phase: templeFires.length * 1.9, scale });
                }

                const shrine = new THREE.Group();
                shrine.position.set(0, 0.2, 1.5 * scale);
                temple.add(shrine);
                addMesh(shrine, box, materials.blueGlaze, [0, 1.1, 0], [1.4 * scale, 2.2, 0.7 * scale]);
                addMesh(shrine, new THREE.CylinderGeometry(0.46 * scale, 0.58 * scale, 1.4 * scale, 12), materials.gold, [0, 2.2, 0]);
                addMesh(shrine, new THREE.ConeGeometry(0.38 * scale, 1.2 * scale, 8), materials.gold, [0, 3.55, 0]);

                return temple;
            }

            buildTemple(18, -32, 1.2);
            buildTemple(-20, -38, 1.05);

            const cropGeometry = new THREE.ConeGeometry(0.14, 1.25, 5);
            cropGeometry.translate(0, 0.62, 0);
            const cropInstances = new THREE.InstancedMesh(cropGeometry, new THREE.MeshStandardMaterial({ color: 0x8c9c3d, roughness: 0.83 }), 96);
            const cropMatrix = new THREE.Object3D();
            for (let index = 0; index < 96; index++) {
                const row = Math.floor(index / 16);
                const column = index % 16;
                cropMatrix.position.set(-15 + column * 0.52, 0, 29 + row * 1.2);
                cropMatrix.rotation.y = (index % 3) * 0.9;
                cropMatrix.scale.setScalar(0.72 + (index % 5) * 0.08);
                cropMatrix.updateMatrix();
                cropInstances.setMatrixAt(index, cropMatrix.matrix);
            }
            root.add(cropInstances);

            const reedGeometry = new THREE.CylinderGeometry(0.035, 0.07, 2.4, 5);
            reedGeometry.translate(0, 1.2, 0);
            const reedInstances = new THREE.InstancedMesh(reedGeometry, materials.reed, 140);
            for (let index = 0; index < 140; index++) {
                const side = index % 2 ? -27.2 : -62.6;
                cropMatrix.position.set(side + (Math.random() - 0.5) * 2.6, -0.35, -90 + Math.random() * 180);
                cropMatrix.rotation.set((Math.random() - 0.5) * 0.12, Math.random() * Math.PI, (Math.random() - 0.5) * 0.12);
                cropMatrix.scale.setScalar(0.62 + Math.random() * 0.8);
                cropMatrix.updateMatrix();
                reedInstances.setMatrixAt(index, cropMatrix.matrix);
            }
            root.add(reedInstances);

            const waterRipples = [];
            const rippleMaterial = new THREE.MeshBasicMaterial({ color: 0x9cdbc7, transparent: true, opacity: 0.28, depthWrite: false });
            for (let index = 0; index < 18; index++) {
                const ripple = new THREE.Mesh(new THREE.PlaneGeometry(2 + (index % 4), 0.055), rippleMaterial);
                ripple.rotation.x = -Math.PI / 2;
                ripple.position.set(-45 + Math.sin(index * 4.2) * 12, -0.42, -80 + index * 9);
                ripple.userData.speed = 0.8 + (index % 4) * 0.28;
                ripple.userData.homeX = ripple.position.x;
                root.add(ripple);
                waterRipples.push(ripple);
            }

            const dock = new THREE.Group();
            dock.position.set(-38.5, -0.15, -13);
            root.add(dock);
            for (let plank = 0; plank < 9; plank++) {
                addMesh(dock, box, materials.timber, [0, 0, plank * 0.5], [3.8, 0.18, 0.43]);
            }
            for (const side of [-1, 1]) {
                for (const end of [-1, 1]) {
                    addMesh(dock, cylinder, materials.timber, [side * 1.65, -0.25, end * 0.5], [0.18, 1.65, 0.18]);
                    addMesh(dock, cylinder, materials.gold, [side * 1.65, 0.54, end * 0.5], [0.24, 0.12, 0.24]);
                }
            }

            const riverBoat = new THREE.Group();
            riverBoat.position.set(-47, -0.06, 4);
            root.add(riverBoat);
            addMesh(riverBoat, new THREE.CylinderGeometry(1.05, 1.5, 5.5, 7), materials.timber, [0, 0, 0], [1, 0.34, 1], [Math.PI / 2, 0, 0]);
            addMesh(riverBoat, box, materials.sunDriedBrick, [0, 0.16, 0], [2.35, 0.18, 4.2]);
            addMesh(riverBoat, cylinder, materials.timber, [0, 1.9, -0.1], [0.11, 3.6, 0.11]);
            const sailShape = createShape([[0, 0], [2.1, 0.3], [0.12, 3.15]]);
            const sail = new THREE.Mesh(new THREE.ShapeGeometry(sailShape), materials.linen);
            sail.position.set(-0.05, 0.33, -0.2);
            riverBoat.add(sail);
            riverBoat.userData.sail = sail;

            const solarBarque = world.solarBarque;
            const barqueDetails = new THREE.Group();
            solarBarque.add(barqueDetails);
            const mast = addMesh(barqueDetails, cylinder, materials.gold, [0, 3.2, -0.1], [0.2, 8.2, 0.2]);
            mast.castShadow = true;
            const solarSail = new THREE.Mesh(new THREE.ShapeGeometry(createShape([[-2.7, 0], [2.4, 0.25], [-0.25, 6.7]])), materials.linen);
            solarSail.position.set(0, 0.8, -0.3);
            barqueDetails.add(solarSail);
            solarBarque.userData.sail = solarSail;

            for (const side of [-1, 1]) {
                for (let index = 0; index < 9; index++) {
                    const x = -7.2 + index * 1.8;
                    addMesh(barqueDetails, cylinder, materials.gold, [x, 1.12, side * 1.25], [0.11, 1.35, 0.11]);
                }
                addMesh(barqueDetails, cylinder, materials.gold, [0, 1.6, side * 1.25], [0.065, 15, 0.065], [0, 0, Math.PI / 2]);

                const falcon = new THREE.Group();
                falcon.position.set(side * 8.1, 1.3, 0);
                falcon.rotation.z = side * -0.22;
                barqueDetails.add(falcon);
                addMesh(falcon, new THREE.SphereGeometry(0.72, 10, 8), materials.gold, [0, 0, 0], [1.3, 0.8, 0.78]);
                addMesh(falcon, new THREE.ConeGeometry(0.18, 0.72, 5), materials.gold, [side * 0.66, 0.02, 0.5], [1, 1, 1], [Math.PI / 2, 0, side * 0.25]);
                addMesh(falcon, new THREE.ConeGeometry(0.48, 1.1, 5), materials.gold, [0, -0.05, -0.8], [1, 1, 1], [Math.PI / 2, 0, side * -0.18]);
            }

            const sunRays = [];
            for (let index = 0; index < 12; index++) {
                const angle = (index / 12) * Math.PI * 2;
                const ray = addMesh(barqueDetails, new THREE.ConeGeometry(0.26, 1.45, 5), materials.gold,
                    [Math.cos(angle) * 4.4, 3.6 + Math.sin(angle) * 4.4, 0], [1, 1, 1], [0, 0, -angle]);
                sunRays.push(ray);
            }

            const underworld = world.underworld;
            const gate = new THREE.Group();
            gate.position.set(0, 0, -22);
            underworld.add(gate);
            const obsidian = new THREE.MeshStandardMaterial({ color: 0x171225, roughness: 0.48, metalness: 0.34, emissive: 0x130925, emissiveIntensity: 0.6 });
            const obsidianGlow = new THREE.MeshBasicMaterial({ color: 0x8a5de4, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
            for (const side of [-1, 1]) {
                addMesh(gate, box, obsidian, [side * 5.4, 4.8, 0], [1.5, 9.6, 1.9]);
                addMesh(gate, box, materials.gold, [side * 5.4, 4.8, 1.02], [0.13, 8.9, 0.1]);
                for (let band = 0; band < 5; band++) {
                    addMesh(gate, box, obsidianGlow, [side * 5.4, 1.2 + band * 1.6, 1.08], [0.55, 0.12, 0.06]);
                }
            }
            addMesh(gate, box, obsidian, [0, 9.1, 0], [12.3, 1.5, 2.2]);
            const portal = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.2, 12, 48), obsidianGlow);
            portal.position.set(0, 4.4, 0.3);
            gate.add(portal);
            const portalCore = new THREE.Mesh(new THREE.CircleGeometry(2.93, 48), new THREE.MeshBasicMaterial({ color: 0x24123d, transparent: true, opacity: 0.56, side: THREE.DoubleSide }));
            portalCore.position.set(0, 4.4, 0.32);
            gate.add(portalCore);

            const riverCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-24, 0.16, 17), new THREE.Vector3(-17, 0.18, 11),
                new THREE.Vector3(-19, 0.16, 2), new THREE.Vector3(-10, 0.17, -4),
                new THREE.Vector3(-5, 0.16, -15), new THREE.Vector3(4, 0.16, -23)
            ]);
            const soulRiver = new THREE.Mesh(new THREE.TubeGeometry(riverCurve, 72, 1.05, 9, false), new THREE.MeshStandardMaterial({ color: 0x29164a, emissive: 0x673eb5, emissiveIntensity: 1.6, transparent: true, opacity: 0.82, roughness: 0.24, metalness: 0.35 }));
            underworld.add(soulRiver);

            const graveObelisks = new THREE.Group();
            underworld.add(graveObelisks);
            for (let index = 0; index < 11; index++) {
                const angle = (index / 11) * Math.PI * 2;
                const radius = 22 + (index % 3) * 2;
                const height = 4.2 + (index % 4) * 1.7;
                const marker = new THREE.Group();
                marker.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                marker.rotation.y = -angle;
                graveObelisks.add(marker);
                addMesh(marker, box, obsidian, [0, height / 2, 0], [1.2, height, 1.2]);
                addMesh(marker, new THREE.ConeGeometry(0.88, 1.6, 4), materials.gold, [0, height + 0.7, 0], [1, 1, 1], [0, Math.PI / 4, 0]);
                addMesh(marker, box, obsidianGlow, [0, height * 0.65, 0.62], [0.62, 0.12, 0.06]);
            }

            const torchFires = [];
            for (const position of [[-21, 0, -10], [21, 0, -10], [-20, 0, 12], [20, 0, 12]]) {
                const torch = new THREE.Group();
                torch.position.set(position[0], position[1], position[2]);
                underworld.add(torch);
                addMesh(torch, cylinder, obsidian, [0, 1.25, 0], [0.22, 2.5, 0.22]);
                const flame = addMesh(torch, new THREE.OctahedronGeometry(0.56, 1), obsidianGlow, [0, 2.75, 0], [0.8, 1.6, 0.8]);
                const light = new THREE.PointLight(0x9b6cff, 1.7, 18, 2);
                light.position.set(0, 2.8, 0);
                torch.add(light);
                torchFires.push({ flame, light, phase: torchFires.length * 1.7 });
            }

            const spiritPositions = new Float32Array(84 * 3);
            const spiritPhases = new Float32Array(84);
            for (let index = 0; index < spiritPhases.length; index++) {
                spiritPositions[index * 3] = (Math.random() - 0.5) * 45;
                spiritPositions[index * 3 + 1] = 0.5 + Math.random() * 7;
                spiritPositions[index * 3 + 2] = (Math.random() - 0.5) * 45;
                spiritPhases[index] = Math.random() * Math.PI * 2;
            }
            const spiritGeometry = new THREE.BufferGeometry();
            spiritGeometry.setAttribute('position', new THREE.BufferAttribute(spiritPositions, 3));
            const spirits = new THREE.Points(spiritGeometry, new THREE.PointsMaterial({ color: 0xc7aaff, size: 0.24, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
            underworld.add(spirits);

            const dayColor = new THREE.Color(0xc88a4b);
            const nightColor = new THREE.Color(0x090414);
            const darkAgeColor = new THREE.Color(0x1a0808);
            const duatColor = new THREE.Color(0x100b1c);
            let lastEnvironment = '';

            function updateEnvironment(state) {
                const environment = state.inUnderworld ? 'duat' : state.isNightEvent ? 'night' : state.darkAgePenalty ? 'dark' : 'day';
                if (environment === lastEnvironment) return;
                lastEnvironment = environment;
                const color = environment === 'duat' ? duatColor : environment === 'night' ? nightColor : environment === 'dark' ? darkAgeColor : dayColor;
                scene.background.copy(color);
                if (scene.fog) {
                    scene.fog.color.copy(color);
                    scene.fog.density = environment === 'duat' ? 0.018 : environment === 'night' ? 0.008 : 0.0038;
                }
                if (environment === 'duat') spirits.visible = true;
                else spirits.visible = false;
            }

            this.update = function ({ state }, deltaTime, elapsedTime) {
                waterTexture.offset.y = (waterTexture.offset.y + deltaTime * 0.018) % 1;
                riverBoat.position.z = 4 + Math.sin(elapsedTime * 0.22) * 12;
                riverBoat.rotation.y = Math.sin(elapsedTime * 0.16) * 0.12;
                riverBoat.userData.sail.rotation.z = Math.sin(elapsedTime * 0.8) * 0.04;
                waterRipples.forEach(ripple => {
                    ripple.position.x = ripple.userData.homeX + Math.sin(elapsedTime * ripple.userData.speed + ripple.position.z) * 1.8;
                    ripple.material.opacity = 0.16 + (Math.sin(elapsedTime * 1.6 + ripple.position.z) + 1) * 0.08;
                });
                solarBarque.userData.sail.rotation.z = Math.sin(elapsedTime * 0.7) * 0.035;
                sunRays.forEach((ray, index) => {
                    ray.scale.y = 0.82 + (Math.sin(elapsedTime * 2.3 + index) + 1) * 0.14;
                });
                templeFires.forEach(({ flame, light, phase, scale }) => {
                    const flicker = 0.82 + Math.sin(elapsedTime * 8 + phase) * 0.18;
                    flame.scale.y = scale * flicker;
                    light.intensity = 0.65 + flicker * 0.55;
                });
                torchFires.forEach(({ flame, light, phase }) => {
                    const flicker = 0.82 + Math.sin(elapsedTime * 7 + phase) * 0.18;
                    flame.scale.y = 1.35 * flicker;
                    light.intensity = 1.35 + flicker;
                });
                for (let index = 0; index < spiritPhases.length; index++) {
                    spiritPositions[index * 3 + 1] += deltaTime * (0.12 + (index % 4) * 0.04);
                    if (spiritPositions[index * 3 + 1] > 9) spiritPositions[index * 3 + 1] = 0.45;
                    spiritPositions[index * 3] += Math.sin(elapsedTime * 0.5 + spiritPhases[index]) * deltaTime * 0.12;
                }
                spiritGeometry.attributes.position.needsUpdate = true;
                updateEnvironment(state);
            };
        },

        dispose() {}
    });
})();