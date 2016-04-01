
var WebGLGraphs = [];

function initWebGlGraph(graphContainer) {

    var containersMain = graphContainer.split(',');

    for (var ii = 0; ii < containersMain.length; ++ii) {
        var containers = containersMain[ii].split(':');
        var graphs = containers[1];

        var container = document.getElementById(containers[0].trim());
        // document.body.appendChild(container);

        var style = window.getComputedStyle(container);
        var canvasWidth = style.getPropertyValue('width').replace("px", '');
        var canvasHeight = style.getPropertyValue('height').replace("px", '');
        var graphTitle = container.getAttribute('class');

        WebGLGraphs.push(new CWebGLGraphs(graphs, container, canvasWidth, canvasHeight, graphTitle));
    }
}

function animate() {
    for (var i = 0; i < WebGLGraphs.length; ++i)
        WebGLGraphs[i].animate();
    requestAnimationFrame(animate);
}

function CWebGLGraphs(functionCount, container, canvasWidth, canvasHeight, graphTitle) {
    var functionPoints = [], functionPointsTime = [];
    var particlecount = canvasWidth * 1.75;

    var text2D = THREE_Text.Text2D;
    var textAlign = THREE_Text.textAlign;

    var xText = [], yText = [], colors = [];

    var maxY, minY, maxTime;
    var camera, scene, renderer, particles = [];

    var hide = [];

    initGraph(functionCount);

    function initGraph(functionCount) {

        functionPoints = createArray(functionCount);

        //define the Y height of the graph
        minY = -1000;
        maxY = 1000;
        maxTime = canvasWidth * 7;

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 20000);

        camera.position.set(-3 * canvasWidth, 0, 3000);
        camera.up = new THREE.Vector3(0, 1, 0);
        camera.lookAt(-3 * canvasWidth, 0, 0);

        scene = new THREE.Scene();
        light = new THREE.AmbientLight(0xFFFFFF);
        scene.add(light);

        for (var qq = 0; qq < functionCount; ++qq) {
            particles[qq] = new THREE.Geometry();
            hide[qq] = 0;
            colors = [];

            for (ii = 0; ii < particlecount + 10 ; ii++) {
                particles[qq].vertices.push(new THREE.Vector3());
                colors[ii] = new THREE.Color(0xffffff);
            }

            particles[qq].colors = colors;
            var material = new THREE.PointsMaterial({ size: 20, vertexColors: THREE.VertexColors });
            scene.add(new THREE.Points(particles[qq], material));
            scene.add(new THREE.Line(particles[qq], material));
        }

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0xffffff, 1);

        document.body.appendChild(container);

        camera.aspect = (canvasWidth / canvasHeight);
        camera.updateProjectionMatrix();
        renderer.setSize(canvasWidth, canvasHeight);
        container.appendChild(renderer.domElement);

        coordinateSystem();
        drawBorder();
        drawLines();
        drawText();
        animate();
    }

    this.addPoint = function addPoint(x, y) {
        functionPointsTime.push(x);
        if (y.length > 1) {
            for (ii = 0; ii < y.length; ++ii)
                functionPoints[ii].push(y[ii]);
        }
        else
            functionPoints[0].push(y);
    };

    this.hideGraph = function hideGraph(ii) {
        hide[ii] = !hide[ii];
    };

    this.animate = function () {
        render();
    };

    function createArray(length) {
        var myArr = new Array();
        for (ii = 0; ii < length; ++ii)
            myArr[ii] = new Array();
        return myArr;
    }

    function coordinateSystem() {
        var geometry = new THREE.Geometry();
        var vertex = new THREE.Vector3(0, maxY, 0); geometry.vertices.push(vertex);
        var vertex2 = new THREE.Vector3(-0, minY, 0); geometry.vertices.push(vertex2);
        var vertex3 = new THREE.Vector3(-0, 0, 0); geometry.vertices.push(vertex3);
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 1.0 }));
        scene.add(line);

        geometry = new THREE.Geometry();
        vertex = new THREE.Vector3(0, 1000, 0); geometry.vertices.push(vertex);
        vertex2 = new THREE.Vector3(-0, -1000, 0); geometry.vertices.push(vertex2);
        vertex3 = new THREE.Vector3(-0, 0, 0); geometry.vertices.push(vertex3);
        line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 1.0 }));
        scene.add(line);
    }

    function drawLines() {
        var geometry = new THREE.Geometry();
        var vertex;
        var line;
        vertex = new THREE.Vector3(0, 0, 0);
        geometry.vertices.push(vertex);
        vertex = new THREE.Vector3(-maxTime, 0, 0);
        geometry.vertices.push(vertex);
        line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ linewidth: 1.0, color: 0x0000ff, opacity: 0.2, transparent: true }));
        scene.add(line);
    }

    function drawBorder() {
        var rectShape = new THREE.Shape();
        rectShape.moveTo(0, 0);
        rectShape.lineTo(0, maxY);
        rectShape.lineTo(-maxTime, maxY);
        rectShape.lineTo(-maxTime, minY);
        rectShape.lineTo(0, minY);
        rectShape.lineTo(0, 0);

        var rectGeom = new THREE.ShapeGeometry(rectShape);
        var rectMesh = new THREE.Mesh(rectGeom, new THREE.MeshBasicMaterial({ opacity: 0.01, color: 0x0000ff, transparent: true }));
        scene.add(rectMesh);
    }


    function drawText() {
        var tempText;
        //draw X Axis
        for (var ii = 0; ii < 10; ++ii) {
            tempText = new text2D(10 - ii, { align: textAlign.center, font: '50px Arial', fillStyle: '#000000', antialias: true });
            tempText.material.alphaTest = 0.1;
            tempText.position.set(ii * -canvasWidth * 7 / 10, -100, 10);
            tempText.scale.set(1.5, 1.5, 1.5);
            tempText.rotation.set(0, 0, -1.0);
            xText.push(tempText);
            scene.add(tempText);
        }

        //draw Y Axis
        for (var ii = 0; ii < 9; ++ii) {
            tempText = new text2D(1000 - ii * 100, { align: textAlign.center, font: '50px Arial', fillStyle: '#000000', antialias: true });
            tempText.material.alphaTest = 0.1;
            tempText.position.set(150, 1000 + ii * -250, 10);
            tempText.scale.set(1.5, 1.5, 1.5);
            yText.push(tempText);
            scene.add(tempText);
        }

        //draw Title
        tempText = new text2D(graphTitle, { align: textAlign.center, font: '50px Arial', fillStyle: '#000000', antialias: true });
        tempText.material.alphaTest = 0.1;
        tempText.position.set(-particlecount * 0.9, 1000, 10);
        tempText.scale.set(1.5, 1.5, 1.5);
        scene.add(tempText);
    }

    function renderGraph() {
        var colorTarget = 1.0;
        var totalRange = maxY - minY;
        var zoom = 2000.0 / (maxY - minY);

        for (var pp = 0; pp < functionPoints.length; ++pp) {
            for (var ii = 0; ii < functionPoints[pp].length; ++ii) {
                //move point along y axis
                if (hide[pp]) {
                    particles[pp].vertices[ii].y += (0 - particles[pp].vertices[ii].y) * 0.9 * Math.random();
                    colorTarget = 1.0;
                }
                else {
                    colorTarget = 0.0;
                    particles[pp].vertices[ii].y = ((functionPoints[pp][ii] - minY) * zoom - 1000);
                }

                //move point along x axis
                particles[pp].vertices[ii].x = -5 - (functionPointsTime[functionPointsTime.length - 1] - functionPointsTime[ii]);

                //color fade animation
                if (pp === 0) {
                    particles[pp].colors[ii].b += (1.0 - particles[pp].colors[ii].b) * 0.01;
                    particles[pp].colors[ii].r += (colorTarget - particles[pp].colors[ii].r) * 0.01;
                    particles[pp].colors[ii].g += (colorTarget - particles[pp].colors[ii].b) * 0.01;
                } else {
                    particles[pp].colors[ii].b += (colorTarget - particles[pp].colors[ii].b) * 0.01;
                    particles[pp].colors[ii].r += (colorTarget - particles[pp].colors[ii].r) * 0.01;
                    particles[pp].colors[ii].g += (colorTarget - particles[pp].colors[ii].g) * 0.01;
                }
            }
            particles[pp].verticesNeedUpdate = true;
            particles[pp].colorsNeedUpdate = true;

            //set initial color for new points -> fade animation
            particles[pp].colors[functionPoints[pp].length].setHex(0x00ff00);
        }

        for (var ii = 8; ii > -1; ii--)
            yText[ii].text = ((minY + totalRange / 8 * (8 - ii)) / 10.0).toFixed(1);
        for (var ii = 0; ii < 10; ++ii)
            xText[ii].text = Math.round(functionPointsTime[functionPointsTime.length - 1] - 10 * ii, 2);

        //  tempText.text = functionPoints[0].length;

        maxY = Math.max.apply(Math, functionPoints[0]);
        minY = Math.min.apply(Math, functionPoints[0]);

        if (functionPoints[0].length > (particlecount)) {
            particles[0].colors.shift();
            particles[0].colors.push(new THREE.Color(0xff0000));

            if (functionPoints.length > 1) {
                for (var ii = 0; ii < functionPoints.length; ++ii)
                    functionPoints[ii].shift();
            }
            else
                functionPoints[0].shift();

            functionPointsTime.shift();
        }
    }

    function render() {
        renderGraph();
        renderer.render(scene, camera);
    }
}
