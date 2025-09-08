// ----- Improved displayFinalResult + overlay helpers (replace your existing displayFinalResult) -----
function displayFinalResult(c, problemType, n) {
    let f_x2 = 0;
    for (let i = 0; i < newPoint.length; i++) {
        f_x2 += c[i] * newPoint[i];
    }

    document.getElementById('final-result').innerHTML = `
        <div class="result">
            <h3>Optimal Solution Found</h3>
            ${newPoint.map((val, idx) => `<p>x${idx+1}* = ${val.toFixed(6)}</p>`).join('')}
            <p>Optimal ${problemType === 'max'} Objective Function Value = ${f_x2.toFixed(6)}</p>
        </div>
        <div style="margin-top:12px;">
        
            <button id="open-all-steps-newtab" class="btn-secondary" style="margin-left:8px;">Open All Steps in New Tab</button>
        </div>
    `;

    // // Attach event listeners
    // const viewBtn = document.getElementById('view-all-steps');
    // if (viewBtn) viewBtn.addEventListener('click', createAllStepsView);

    const newTabBtn = document.getElementById('open-all-steps-newtab');
    if (newTabBtn) newTabBtn.addEventListener('click', () => openAllStepsInNewTab());
}

// Helper: escape HTML
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Build overlay that shows complete step contents with tables and calculated values
function createAllStepsView() {
    // remove existing overlay
    const existing = document.getElementById('all-steps-overlay');
    if (existing) existing.remove();

    const stepTitles = [
        "Step 1: Initial Design Matrix",
        "Step 2: Optimal Starting Point",
        "Step 3: Direction of Movement",
        "Step 4: Optimal Step Length",
        "Step 5: First Movement",
        "Step 6: Termination Criteria",
        "Step 7: Second Movement",
        "Step 8: Final Result"
    ];

    const overlay = document.createElement('div');
    overlay.id = 'all-steps-overlay';
    // minimal inline styling so overlay works without CSS changes
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';

    const inner = document.createElement('div');
    inner.id = 'all-steps-inner';
    inner.style.width = '100%';
    inner.style.maxWidth = '1100px';
    inner.style.maxHeight = '90%';
    inner.style.overflow = 'auto';
    inner.style.background = '#fff';
    inner.style.borderRadius = '8px';
    inner.style.padding = '20px';
    inner.style.boxSizing = 'border-box';
    inner.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';

    // Header with controls
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '12px';

    const h = document.createElement('h2');
    h.textContent = 'All Algorithm Steps — Single Page';
    header.appendChild(h);

    const controls = document.createElement('div');

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy All Steps';
    copyBtn.className = 'btn-primary';
    copyBtn.style.marginRight = '8px';
    copyBtn.addEventListener('click', copyAllStepsText);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn-danger';
    closeBtn.addEventListener('click', closeAllStepsView);

    controls.appendChild(copyBtn);
    controls.appendChild(closeBtn);
    header.appendChild(controls);
    inner.appendChild(header);

    // iterate through step-content blocks and convert to readable HTML
    const stepContentsList = document.querySelectorAll('.step-content');
    stepContentsList.forEach((sc, idx) => {
        const section = document.createElement('section');

        const title = document.createElement('h3');
        title.textContent = stepTitles[idx] || `Step ${idx+1}`;
        section.appendChild(title);

        // clone node so we don't change live DOM
        const cloned = sc.cloneNode(true);

        // Replace input/select/checkboxes with readable spans (show current values)
        const inputs = cloned.querySelectorAll('input, select, textarea');
        inputs.forEach(inp => {
            let valueText = '';
            if (inp.tagName.toLowerCase() === 'input') {
                const t = inp.type;
                if (t === 'checkbox' || t === 'radio') {
                    valueText = inp.checked ? '☑ (checked)' : '☐ (unchecked)';
                } else {
                    valueText = inp.value || inp.placeholder || '';
                }
            } else if (inp.tagName.toLowerCase() === 'select') {
                valueText = inp.value;
            } else {
                valueText = inp.value || inp.textContent || '';
            }
            const span = document.createElement('span');
            span.textContent = valueText;
            span.style.whiteSpace = 'pre-wrap';
            if (inp.parentNode) inp.parentNode.replaceChild(span, inp);
        });

        // Convert known calculation/result blocks' textContent -> HTML preserving line breaks
        const textualBlocks = cloned.querySelectorAll('.calculation, .result, #initial-design-matrix, #final-result');
        textualBlocks.forEach(el => {
            // For tables (initial-design-matrix) keep existing HTML if it's a table element
            if (el.querySelector && el.querySelector('table')) {
                const table = el.querySelector('table');
                const rows = Array.from(table.rows).map(row => {
                    const cells = Array.from(row.cells).map(cell => `<td>${escapeHTML(cell.innerText)}</td>`).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');
                el.innerHTML = `<table>${rows}</table>`;
            } else {
                const txt = el.innerText || el.textContent || '';
                el.innerHTML = escapeHTML(txt).replace(/\n/g, '<br>');
            }
        });

        section.appendChild(cloned);
        inner.appendChild(section);
    });

    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    // scroll to top
    inner.scrollTop = 0;
}

function copyAllStepsText() {
    const overlay = document.getElementById('all-steps-overlay');
    if (!overlay) return;
    const inner = overlay.querySelector('#all-steps-inner');
    if (!inner) return;

    // build readable plain-text from inner HTML by using innerText
    const text = inner.innerText.trim();
    if (!text) {
        alert('Nothing to copy.');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            const copyBtn = overlay.querySelector('button.btn-primary');
            if (copyBtn) {
                const old = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = old, 1400);
            }
        }).catch(() => {
            alert('Unable to copy to clipboard. Please select and copy manually.');
        });
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            alert('Copied to clipboard.');
        } catch (e) {
            alert('Unable to copy to clipboard. Please select and copy manually.');
        }
        ta.remove();
    }
}

function closeAllStepsView() {
    const overlay = document.getElementById('all-steps-overlay');
    if (overlay) overlay.remove();
}

// Optional: open a new tab with the same content (print-friendly)
function openAllStepsInNewTab() {
    const stepTitles = [
        "Step 1: Initial Design Matrix",
        "Step 2: Optimal Starting Point",
        "Step 3: Direction of Movement",
        "Step 4: Optimal Step Length",
        "Step 5: First Movement",
        "Step 6: Termination Criteria",
        "Step 7: Second Movement",
        "Step 8: Final Result"
    ];
    let bodyHtml = `<h1>All Algorithm Steps</h1>`;
    const stepContentsList = document.querySelectorAll('.step-content');

    stepContentsList.forEach((sc, idx) => {
        const cloned = sc.cloneNode(true);

        const inputs = cloned.querySelectorAll('input, select, textarea');
        inputs.forEach(inp => {
            let valueText = '';
            if (inp.tagName.toLowerCase() === 'input') {
                const t = inp.type;
                if (t === 'checkbox' || t === 'radio') {
                    valueText = inp.checked ? '☑ (checked)' : '☐ (unchecked)';
                } else {
                    valueText = inp.value || inp.placeholder || '';
                }
            } else if (inp.tagName.toLowerCase() === 'select') {
                valueText = inp.value;
            } else {
                valueText = inp.value || inp.textContent || '';
            }
            const span = document.createElement('span');
            span.textContent = valueText;
            if (inp.parentNode) inp.parentNode.replaceChild(span, inp);
        });

        const textualBlocks = cloned.querySelectorAll('.calculation, .result, #initial-design-matrix, #final-result');
        textualBlocks.forEach(el => {
            if (el.querySelector && el.querySelector('table')) {
                const table = el.querySelector('table');
                const rows = Array.from(table.rows).map(row => {
                    const cells = Array.from(row.cells).map(cell => `<td>${escapeHTML(cell.innerText)}</td>`).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');
                el.innerHTML = `<table>${rows}</table>`;
            } else {
                const txt = el.innerText || el.textContent || '';
                el.innerHTML = escapeHTML(txt).replace(/\n/g, '<br>');
            }
        });

        bodyHtml += `<h2>${escapeHTML(stepTitles[idx] || `Step ${idx+1}`)}</h2>` + cloned.innerHTML;
    });

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Pop-up blocked. Allow pop-ups or use the overlay copy function instead.');
        return;
    }
    newWindow.document.write(`
        <html>
          <head>
            <title>All Steps - IPBA</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding:20px; }
              pre, .calculation { white-space: pre-wrap; }
              table { width:100%; border-collapse:collapse; margin-top:6px; }
              th, td { border:1px solid #ddd; padding:6px; text-align:left; }
            </style>
          </head>
          <body>
            ${bodyHtml}
          </body>
        </html>
    `);
    newWindow.document.close();
}
