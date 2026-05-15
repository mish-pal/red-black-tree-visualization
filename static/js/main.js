// Utilities
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const sessionId = uuidv4();
let fullHistory = [];
let currentStepIndex = -1;
let isPlaying = false;
let playInterval = null;
let currentSpeed = 500;

// Theme handling
const themeSwitch = document.getElementById('theme-switch');
const themeLabel = document.getElementById('theme-label');
const body = document.body;

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeLabel.textContent = "Dark Mode";
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeLabel.textContent = "Light Mode";
    }
    renderCurrentStep();
});

// Options
const showNilToggle = document.getElementById('show-nil');
const colorblindToggle = document.getElementById('colorblind-mode');

showNilToggle.addEventListener('change', renderCurrentStep);
colorblindToggle.addEventListener('change', renderCurrentStep);

// Speed Control
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
speedSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val < 33) speedVal.textContent = "Slow";
    else if (val < 66) speedVal.textContent = "Medium";
    else speedVal.textContent = "Fast";
    
    currentSpeed = 2000 - (val * 19); 
    if (isPlaying) {
        pause();
        play();
    }
});

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'var(--danger)' : 'var(--success)';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// D3 Setup
const container = document.getElementById('vis-container');
let width = container.clientWidth;
let height = container.clientHeight;

const svg = d3.select('#vis-container')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

// Define Colorblind patterns
const defs = svg.append("defs");
const pattern = defs.append("pattern")
    .attr("id", "pattern-red")
    .attr("width", 8)
    .attr("height", 8)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("patternTransform", "rotate(45)");
pattern.append("rect")
    .attr("width", 8)
    .attr("height", 8)
    .attr("fill", "#ef4444");
pattern.append("path")
    .attr("d", "M 0,0 L 0,8")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2);

const g = svg.append('g');

const zoom = d3.zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
        g.attr('transform', event.transform);
    });

svg.call(zoom);
svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 50).scale(1));

window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
});

function convertToD3Hierarchy(node) {
    if (!node) return null;
    const showNil = showNilToggle.checked;
    
    if (node.isNull) {
        return showNil ? { name: "NIL", isNull: true, color: "black", hidden: false } : null;
    }
    
    let children = [];
    let lChild = convertToD3Hierarchy(node.left);
    let rChild = convertToD3Hierarchy(node.right);
    
    if (lChild || rChild || showNil) {
        children.push(lChild || { name: `null-L-${node.val}`, isNull: true, hidden: !showNil, color: "black" });
        children.push(rChild || { name: `null-R-${node.val}`, isNull: true, hidden: !showNil, color: "black" });
    }
    
    return {
        name: node.val,
        color: node.color,
        children: children.length > 0 ? children : null,
        isNull: false,
        hidden: false
    };
}

function updateStats(treeDict) {
    if (!treeDict || treeDict.isNull) {
        document.getElementById('stat-nodes').textContent = 0;
        document.getElementById('stat-height').textContent = 0;
        document.getElementById('stat-bh').textContent = 0;
        return;
    }
    
    let nodesCount = 0;
    
    function calculateStats(n) {
        if (!n || n.isNull) return { height: 0, blackHeight: 1 };
        nodesCount++;
        let left = calculateStats(n.left);
        let right = calculateStats(n.right);
        
        let bh = left.blackHeight + (n.color === 'black' ? 1 : 0);
        let h = Math.max(left.height, right.height) + 1;
        return { height: h, blackHeight: bh };
    }
    
    let stats = calculateStats(treeDict);
    document.getElementById('stat-nodes').textContent = nodesCount;
    document.getElementById('stat-height').textContent = stats.height;
    document.getElementById('stat-bh').textContent = stats.blackHeight;
}

function getThemeColors() {
    const isLight = document.body.classList.contains('light-theme');
    return {
        red: '#ef4444',
        black: isLight ? '#0f172a' : '#1e293b',
        nil: isLight ? '#94a3b8' : '#475569',
        text: '#ffffff',
        edge: isLight ? '#94a3b8' : '#64748b',
        highlight: '#fbbf24'
    };
}

function renderTree(treeDict, highlightNodes = [], message = "") {
    document.getElementById('current-operation-text').textContent = message;
    updateStats(treeDict);
    
    const colors = getThemeColors();
    const isColorblind = colorblindToggle.checked;
    
    if (!treeDict || treeDict.isNull && !showNilToggle.checked) {
        g.selectAll('*').remove();
        return;
    }
    
    let rootData = convertToD3Hierarchy(treeDict);
    if (!rootData) {
        g.selectAll('*').remove();
        return;
    }
    const root = d3.hierarchy(rootData);
    
    const treeLayout = d3.tree()
        .nodeSize([50, 70])
        .separation((a, b) => a.parent == b.parent ? 1.5 : 2);
        
    treeLayout(root);
    
    const nodes = root.descendants().filter(d => !d.data.hidden);
    const links = root.links().filter(l => !l.target.data.hidden && !l.source.data.hidden);

    const t = d3.transition().duration(currentSpeed * 0.4);

    // Links
    const link = g.selectAll('path.link')
        .data(links, d => `${d.source.data.name}-${d.target.data.name}`);

    link.enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', colors.edge)
        .attr('stroke-width', 2)
        .attr('d', d => {
            const o = {x: d.source.x, y: d.source.y};
            return diagonal({source: o, target: o});
        })
        .merge(link)
        .transition(t)
        .attr('d', diagonal);

    link.exit()
        .transition(t)
        .attr('opacity', 0)
        .remove();

    // Nodes
    const node = g.selectAll('g.node')
        .data(nodes, d => d.data.name);

    const nodeEnter = node.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.parent ? d.parent.x : d.x},${d.parent ? d.parent.y : d.y})`)
        .attr('opacity', 0);

    // Differentiate shapes based on isNull
    nodeEnter.each(function(d) {
        const el = d3.select(this);
        if (d.data.isNull) {
            el.append('rect')
                .attr('width', 24)
                .attr('height', 24)
                .attr('x', -12)
                .attr('y', -12)
                .attr('rx', 4);
        } else {
            el.append('circle')
                .attr('r', 20);
        }
    });

    nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', 0)
        .text(d => d.data.isNull ? "NIL" : d.data.name)
        .attr('fill', colors.text)
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('font-family', 'Inter')
        .style('font-size', d => d.data.isNull ? '10px' : '14px');

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition(t)
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .attr('opacity', 1);

    nodeUpdate.select('circle')
        .transition(t)
        .attr('fill', d => {
            if (d.data.color === 'red') return isColorblind ? 'url(#pattern-red)' : colors.red;
            return colors.black;
        })
        .attr('stroke', d => {
            if (highlightNodes.includes(d.data.name)) return colors.highlight;
            return d.data.color === 'red' ? colors.red : colors.black;
        })
        .attr('stroke-width', d => highlightNodes.includes(d.data.name) ? 5 : 3);

    nodeUpdate.select('rect')
        .transition(t)
        .attr('fill', colors.nil)
        .attr('stroke', d => highlightNodes.includes(d.data.name) ? colors.highlight : colors.nil)
        .attr('stroke-width', d => highlightNodes.includes(d.data.name) ? 5 : 3);

    node.exit()
        .transition(t)
        .attr('opacity', 0)
        .remove();
}

function diagonal(d) {
    return `M${d.source.x},${d.source.y}
            C${d.source.x},${(d.source.y + d.target.y) / 2}
             ${d.target.x},${(d.source.y + d.target.y) / 2}
             ${d.target.x},${d.target.y}`;
}

// Timeline and Playback Logic
const timeline = document.getElementById('timeline');
const logList = document.getElementById('history-log');

function updateTimelineUI() {
    timeline.max = Math.max(0, fullHistory.length - 1);
    
    if (fullHistory.length === 0) {
        logList.innerHTML = '<li class="empty-log">No operations yet.</li>';
    } else {
        logList.innerHTML = fullHistory.map((s, i) => `<li data-index="${i}">${i+1}. ${s.message}</li>`).join('');
        document.querySelectorAll('#history-log li').forEach(li => {
            li.addEventListener('click', () => {
                pause();
                currentStepIndex = parseInt(li.getAttribute('data-index'));
                renderCurrentStep();
            });
        });
    }
}

function highlightCode(lineId) {
    document.querySelectorAll('#code-block span').forEach(el => el.classList.remove('code-highlight'));
    if (lineId) {
        const el = document.getElementById(lineId);
        if (el) {
            el.classList.add('code-highlight');
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

function renderCurrentStep() {
    if (currentStepIndex < 0 || currentStepIndex >= fullHistory.length) return;
    const step = fullHistory[currentStepIndex];
    renderTree(step.tree, step.highlight, step.message);
    highlightCode(step.code_line);
    
    timeline.value = currentStepIndex;
    
    // update log active
    document.querySelectorAll('#history-log li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`#history-log li[data-index="${currentStepIndex}"]`);
    if (activeLi) {
        activeLi.classList.add('active');
        activeLi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function stepForward() {
    if (currentStepIndex < fullHistory.length - 1) {
        currentStepIndex++;
        renderCurrentStep();
    } else {
        pause();
    }
}

function stepBack() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderCurrentStep();
    }
}

function play() {
    if (currentStepIndex === fullHistory.length - 1 && fullHistory.length > 0) {
        // Start from beginning if at the end
        currentStepIndex = 0;
        renderCurrentStep();
    }
    isPlaying = true;
    document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-pause"></i>';
    clearInterval(playInterval);
    playInterval = setInterval(stepForward, currentSpeed);
}

function pause() {
    isPlaying = false;
    document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play"></i>';
    clearInterval(playInterval);
}

timeline.addEventListener('input', (e) => {
    pause();
    currentStepIndex = parseInt(e.target.value);
    renderCurrentStep();
});

document.getElementById('btn-play').addEventListener('click', () => {
    if (isPlaying) pause();
    else play();
});
document.getElementById('btn-next').addEventListener('click', () => { pause(); stepForward(); });
document.getElementById('btn-prev').addEventListener('click', () => { pause(); stepBack(); });
document.getElementById('btn-first').addEventListener('click', () => { pause(); if(fullHistory.length > 0) { currentStepIndex = 0; renderCurrentStep(); } });
document.getElementById('btn-last').addEventListener('click', () => { pause(); if(fullHistory.length > 0) { currentStepIndex = fullHistory.length - 1; renderCurrentStep(); } });

async function processBulkAction(endpoint, valuesStr) {
    const values = valuesStr.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length === 0) return showToast('Please enter valid numbers', true);

    document.getElementById('node-value').value = '';
    
    for (let val of values) {
        try {
            const res = await fetch(`/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, value: val })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                if (data.snapshots && data.snapshots.length > 0) {
                    data.snapshots.forEach(s => fullHistory.push(s));
                    updateTimelineUI();
                    if (!isPlaying) {
                        play();
                    }
                }
                if (data.found !== undefined) {
                    if (data.found) showToast(`Found node ${val}`);
                    else showToast(`Node ${val} not found`, true);
                }
            }
        } catch (err) {
            showToast('Error communicating with server', true);
            break;
        }
    }
}

// Actions
document.getElementById('btn-insert').addEventListener('click', () => {
    processBulkAction('insert', document.getElementById('node-value').value);
});
document.getElementById('btn-delete').addEventListener('click', () => {
    processBulkAction('delete', document.getElementById('node-value').value);
});
document.getElementById('btn-search').addEventListener('click', () => {
    processBulkAction('search', document.getElementById('node-value').value);
});

// Actions

document.getElementById('btn-reset').addEventListener('click', async () => {
    pause();
    fullHistory = [];
    currentStepIndex = -1;
    updateTimelineUI();
    await fetch('/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
    });
    renderTree(null, [], "Tree reset.");
    highlightCode("");
});

document.querySelectorAll('.traversal-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const order = e.target.dataset.type;
        try {
            const res = await fetch('/traverse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, order: order })
            });
            const data = await res.json();
            if (data.status === 'success') {
                document.getElementById('traversal-result').innerHTML = `<p>${data.result.join(' → ')}</p>`;
            }
        } catch (err) {
            showToast('Error fetching traversal', true);
        }
    });
});

document.getElementById('node-value').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('btn-insert').click();
    }
});

// Download image functionality
document.getElementById('btn-download').addEventListener('click', () => {
    const svgElement = document.querySelector('#vis-container svg');
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "rbtree.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

// Initial Setup
renderTree(null, [], "Ready to start. Insert a node to begin.");
