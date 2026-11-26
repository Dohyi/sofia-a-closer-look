const config = window.SOFIA_CONFIG;
const app = document.querySelector('#app');
const navigation = document.querySelector('#navigation');
const menuButton = document.querySelector('#menu-button');

const modes = {
  exterior: {
    title: '外部结构',
    description: '认识主体、穹顶与钟楼的组合。',
    instruction: '识别后，在AR场景内选择外部结构与构件。'
  },
  interior: {
    title: '内部空间',
    description: '探索穹顶之下的空间与细节。',
    instruction: '识别后，在AR场景内选择内部空间。'
  }
};

const parts = {
  dome: {
    title: '中央穹顶',
    text: '观察穹顶外形、基座，以及它与主体建筑的关系。',
    mode: 'exterior'
  },
  tower: {
    title: '钟楼',
    text: '从整体位置到局部构件，了解钟楼的组成。',
    mode: 'exterior'
  },
  brick: {
    title: '红砖立面',
    text: '近距离观察砖墙材质、门窗与拱形装饰。',
    mode: 'exterior'
  },
  innerDome: {
    title: '穹顶内侧',
    text: '此处预留穹顶内部与采光关系的模型和说明。',
    mode: 'interior'
  },
  mural: {
    title: '壁画与装饰',
    text: '此处预留有资料依据的壁画图片、位置与保护信息。',
    mode: 'interior'
  },
  layout: {
    title: '空间布局',
    text: '此处预留室内平面、通道与主要空间的介绍。',
    mode: 'interior'
  }
};

function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function assetURL(value) {
    if (!value) return '';

    try {
        const parsed = new URL(value, window.location.href);
        return ['http:', 'https:', 'file:'].includes(parsed.protocol) ? value : '';
    } catch {
        return '';
    }
}

function sceneURL(mode) {
    const value = config.kivicube[`${mode}Url`] || config.kivicube.sceneUrl;
    if (!value) return '';

    try {
        const parsed = new URL(value);
        const officialHost = ['www.kivicube.com', 'kivicube.com'].includes(parsed.hostname);
        const scenePath = /^\/(scenes|collections)\/[^/]+\/?$/.test(parsed.pathname);

        return parsed.protocol === 'https:' && officialHost && scenePath
        ? parsed.href
        : '';
    } catch {
        return '';
    }
}

function fallback(label) {
    return `
    <div class="image-fallback" role="img" aria-label="${escapeHTML(label)}">
    <span aria-hidden="true">S</span>
    <strong>${escapeHTML(label)}</strong>
    <small>图片待补充 · 非建筑模型</small>
    </div>
    `;
}

function photo(src, alt, className = '') {
    const safe = assetURL(src);
    return safe
    ? `<img class="${className}" src="${escapeHTML(safe)}" alt="${escapeHTML(alt)}" data-image>`
    : fallback(alt);
}

function bindImageFallbacks() {
    app.querySelectorAll('[data-image').forEach((image) => {
        image.addEventListener('error', () => {
            const holder = document.createElement('div');
            holder.innerHTML = fallback(image.alt);
            image.replaceWith(holder.firstElementChild);
        }, { once: true });
    });
}

function heading(title, subtitle, back = '#home', backText = '返回首页') {
    return `
    <a class="back" href="${back}">← ${backText}</a>
    <div class="eyebrow">SOFIA / EXPLORE</div>
    <h1>${title}</h1>
    <p class="lede">${subtitle}</p>
    `;
}

function demoNote() {
    return '<p class="note">目前为演示版本，图片与详细说明后续将进行修改。</p>';
}

function modeTabs(mode, prefix) {
  return `
    <div class="tabs" aria-label="探索模式">
      <button data-route="${prefix}/exterior" aria-pressed="${mode === 'exterior'}">外部结构</button>
      <button data-route="${prefix}/interior" aria-pressed="${mode === 'interior'}">内部空间</button>
    </div>
  `;
}

function home() {
  app.innerHTML = `
    <div class="eyebrow">HARBIN · ARCHITECTURE GUIDE</div>
    <h1>走近索菲亚<br>读懂建筑的故事</h1>
    <p class="lede">从一块红砖，到穹顶之下。<br>用互动的方式，探索建筑的内外。</p>

    <div class="hero">
      ${photo(config.heroImage, '哈尔滨圣索菲亚教堂', 'hero-photo')}
    </div>
    ${config.imageCredit ? `<p class="credit">${escapeHTML(config.imageCredit)}</p>` : ''}

    <a class="primary" href="#ar/exterior">开始 AR 探索　↗</a>
    <p class="credit">进入三维场景，探索索菲亚的建筑细节。</p>

    <div class="section-heading">
      <strong>选择你的探索方式</strong>
      <span>EXPLORE / 01—04</span>
    </div>
    <div class="grid">
      <a class="tile" href="#ar/exterior">
        <b>01</b><strong>外部结构 ↗</strong><small>进入AR · 了解建筑构件</small>
      </a>
      <a class="tile" href="#demo/interior">
        <b>02</b><strong>内部空间 ↗</strong><small>查看照片 · 探索内部空间</small>
      </a>
      <a class="tile" href="#history">
        <b>03</b><strong>建筑历史 →</strong><small>沿着时间 · 了解建筑历史</small>
      </a>
      <a class="tile" href="#compare">
        <b>04</b><strong>历史照片 →</strong><small>滑动对比 · 查看建筑今昔</small>
      </a>
    </div>
  `;
}

function ar(mode) {
  const selected = modes[mode];
  const url = sceneURL(mode);

  app.innerHTML = heading(
    'AR 建筑探索',
    '走近三维模型，探索索菲亚的建筑细节。'
  ) + `
    <div class="tabs" aria-label="选择探索方式">
      <button type="button" aria-pressed="true">
        外部结构 · AR
      </button>
      <button type="button" data-route="demo/interior">
        内部图解 →
      </button>
    </div>

    <ol class="steps">
      <li>点击下方“开始体验”按钮。</li>
      <li>加载完成后，点击“Start Now”进入场景。</li>
      <li>查看教堂模型，点击场景中的按钮探索建筑细节。</li>
    </ol>

    ${url ? `
      <button class="primary" id="launch-ar">
        开始体验
      </button>
      <a class="secondary" href="${escapeHTML(url)}">
        单独打开体验 ↗
      </a>
    ` : `
      <p class="note">体验暂时无法打开，请稍后重试。</p>
    `}

    <p class="status" id="ar-status" role="status"></p>
    <div id="ar-host" class="ar-host" hidden></div>

    <button id="stop-ar" class="secondary" hidden>
      关闭体验
    </button>
  `;

  if (!url) return;

  document.querySelector('#launch-ar').onclick = () => {
    const host = document.querySelector('#ar-host');
    const status = document.querySelector('#ar-status');
    const frame = document.createElement('iframe');

    frame.className = 'ar-frame';
    frame.title = `索菲亚建筑探索 · ${selected.title}`;
    frame.allow =
      'camera; autoplay; fullscreen; gyroscope; accelerometer; xr-spatial-tracking';
    frame.allowFullscreen = true;
    frame.src = url;

    frame.addEventListener('load', () => {
      status.textContent =
        '体验页面已载入，请按画面提示进入场景。';
    });

    host.replaceChildren(frame);
    host.hidden = false;

    document.querySelector('#stop-ar').hidden = false;
    document.querySelector('#launch-ar').disabled = true;

    status.textContent = '正在加载体验，请稍候。';
    host.scrollIntoView({ block: 'start' });
  };

  document.querySelector('#stop-ar').onclick = () => {
    document.querySelector('#ar-host').replaceChildren();
    document.querySelector('#ar-host').hidden = true;
    document.querySelector('#stop-ar').hidden = true;
    document.querySelector('#launch-ar').disabled = false;

    document.querySelector('#ar-status').textContent =
      '体验已关闭。';
  };
}

function interiorOverview() {
  app.innerHTML = heading(
    '内部空间',
    '点击照片上的标记或下方项目，探索对应的建筑细节。'
  ) + `
    <div class="interior-overview-photo">
      ${photo(
        'images/sofia-interior.jpg',
        '教堂内部的穹顶、高窗与拱券'
      )}

      <a
        class="interior-dot"
        href="#part/innerDome"
        style="left:50%; top:49%"
        aria-label="查看穹顶内侧"
      >
        <span class="interior-dot-label">穹顶</span>
      </a>

      <a
        class="interior-dot"
        href="#part/mural"
        style="left:68%; top:29%"
        aria-label="查看环形高窗"
      >
        <span class="interior-dot-label">高窗</span>
      </a>

      <a
        class="interior-dot"
        href="#part/layout"
        style="left:88%; top:62%"
        aria-label="查看拱券与墙面"
      >
        <span class="interior-dot-label">拱券</span>
      </a>
    </div>

    <div class="hotspots" aria-label="选择内部结构">
      <button data-route="part/innerDome">
        穹顶内侧
      </button>
      <button data-route="part/mural">
        环形高窗
      </button>
      <button data-route="part/layout">
        拱券与墙面
      </button>
    </div>
  `;
}

function demo(mode) {
    if (mode === 'exterior') {
    window.location.hash = '#ar/exterior';
    return;
  }

    if (mode === 'interior') {
    interiorOverview();
    return;
  }

  const selected = modes[mode];
  const keys = Object.keys(parts).filter((key) => parts[key].mode === mode);

  app.innerHTML = heading(
    selected.title,
    selected.description,
    `#ar/${mode}`,
    '返回AR入口'
  ) + `
    <span class="demo-tag">UI流程演示 · 非真实AR / 3D</span>
    ${modeTabs(mode, 'demo')}
    <div class="demo-stage">
      ${fallback(
        mode === 'exterior'
        ? '建筑外部3D模型待接入'
        : '建筑内部3D模型待接入'
      )}
    </div>
    <div class="card">
      <h2>${mode === 'exterior' ? '圣索菲亚教堂' : '走进建筑内部'}</h2>
      <p>选择下方的部件，预览“整体 → 单个部件 → 详细介绍”的界面流程。</p>
    </div>
    <div class="hotspots" aria-label="选择部件">
      ${keys.map((key) => `
        <button data-route="part/${key}">${parts[key].title} ↗</button>
      `).join('')}
    </div>
    ${demoNote()}
    <a class="secondary" href="#ar/${mode}">前往真实AR体验入口 →</a>
  `;
}

function interiorDome(key) {
  const isWindows = key === 'mural';

  const isArches = key === 'layout';

  const details = isArches ? [
    {
      title: '拱券轮廓',
      image: 'sofia-arch-profile.jpg',
      description: '从正面看，拱券从两侧柱身上方起拱，在顶部连成一道圆弧，勾勒出开口的轮廓。',
      left: 49,
      top: 58
    },
    {
      title: '拱券纹饰',
      image: 'sofia-arch-ornament.jpg',
      description: '蓝绿色的卷曲纹样沿拱券边缘重复排列。近看可以看到纹样随着拱券的弧线延伸。',
      left: 83,
      top: 25
    }
  ] : isWindows ? [
    {
      title: '拱形高窗',
      image: 'sofia-window-arch.jpg',
      description: '高窗细长，顶部呈拱形。从下方仰望，可以看到窗洞上方的弧形轮廓。',
      left: 35,
      top: 40
    },
    {
      title: '环形排列',
      image: 'sofia-windows-ring.png',
      description: '高窗沿穹顶下方围成一圈。从正下方仰望，可以看到窗户顺着穹顶的圆形轮廓排列。',
      left: 67,
      top: 26
    }
  ] : [
    {
      title: '中央吊灯',
      image: 'sofia-dome-chandelier.jpg',
      description: '吊灯悬挂在中央穹顶下方，多层灯臂从中心向外伸展。从侧面看，可以看到灯臂和灯泡的层次。',
      source: 3,
      left: 34,
      top: 45
    },
    {
      title: '穹顶星纹',
      image: 'sofia-dome-stars-kquhen.jpg',
      description: '深蓝色的穹顶上散布着金色星纹。站在吊灯下向上看，穹顶仿佛一片夜空。',
      source: 'stars',
      left: 39,
      top: 14
    }
  ];

  const photoCredit = (source, edit) => {
  const isStarPhoto = source === 'stars';
  const author = isStarPhoto ? 'KQuhen' : 'EditQ';
  const file = isStarPhoto
    ? 'Saint_Sophia_Cathedral_Harbin_2016_02.jpg'
    : `Interior_of_Cathedral_of_Holy_Wisdom,_Harbin_${source}.jpg`;

  return `
    <p class="credit">
      照片：<a href="https://commons.wikimedia.org/wiki/File:${file}">${author} / Wikimedia Commons</a>
      · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      · ${edit}
    </p>
  `;
};

  app.innerHTML = heading(
    isArches ? '拱券与墙面' : (isWindows ? '环形高窗' : '穹顶内侧'),
    isArches
    ? '点击照片上的标记，观察拱券的轮廓与纹饰。'
    : (isWindows
      ? '点击照片上的标记，观察高窗的形状与排列。'
      : '点击照片上的标记，查看吊灯与星纹的细节。'),
    '#demo/interior',
    '返回内部空间'
  ) + `
    <div class="dome-photo">
      ${isArches
        ? photo('images/sofia-arches-overview.png', '教堂内部的拱券与墙面')
        : (isWindows
          ? photo('images/sofia-windows-overview.png', '穹顶下方成环排列的高窗')
          : photo('images/sofia-dome-overview.jpg', '从拱券下方仰望教堂穹顶'))}

      ${details.map((detail, index) => `
        <button type="button" class="dome-marker" data-dome-detail="${index}"
          aria-pressed="false" aria-controls="dome-detail"
          style="left:${detail.left}%; top:${detail.top}%">
          <span class="dome-marker-number" aria-hidden="true">${index + 1}</span>
          <span class="dome-marker-label">${detail.title}</span>
        </button>
      `).join('')}
    </div>

    <div id="dome-detail" aria-live="polite">
      ${isArches ? `
        <div class="card">
          <h2>拱券与墙面的细节</h2>
          <p>
            从穹顶往下看，可以看到几道大拱券。拱券从两侧向上弯曲，
            勾勒出不同开口的轮廓。沿着拱券边缘，还能看到随弧线延伸的蓝绿色纹饰。
          </p>
        </div>
      ` : ''}
      ${isWindows ? `
        <div class="card">
          <h2>穹顶下的一圈高窗</h2>
          <P>
            抬头看，穹顶下方的高窗沿着弧形墙面围成一圈。
            每扇窗都细长，顶部呈拱形。
            自然光从这些高窗进入室内，照亮穹顶周围的墙面。
          </p>
        </div>
      ` : ''}
      ${key === 'innerDome' ? `
        <div class="card">
          <h2>抬头看穹顶</h2>
          <p>
            从拱券下方抬头，可以看到深蓝色的穹顶。
            金色星纹散布在穹顶内侧，中央吊灯悬挂在下方。
            一圈高窗把自然光引入室内，照亮了穹顶下方的空间。
          </p>
        </div>
      ` : ''}
    </div>
  `;

  const markers = app.querySelectorAll('[data-dome-detail]');
  const panel = app.querySelector('#dome-detail');

  markers.forEach((marker) => {
    marker.addEventListener('click', () => {
      const detail = details[Number(marker.dataset.domeDetail)];

      markers.forEach((item) => {
        item.setAttribute('aria-pressed', String(item === marker));
      });

      panel.innerHTML = `
        <div class="dome-detail-card">
          <div>
            ${photo('images/' + detail.image, detail.title)}
          </div>
          <div>
            <h2>${detail.title}</h2>
            <p>${detail.description}</p>
          </div>
        </div>
      `;
    });
  });
}

function part(key) {
  if (key === 'innerDome' || key === 'mural' || key === 'layout') {
    interiorDome(key);
    return;
  }
  const data = parts[key];

  app.innerHTML = heading(
    data.title,
    '从整体到细节，认识建筑的组成。',
    `#demo/${data.mode}`,
    '返回整体'
  ) + `
    <span class="demo-tag">部件详情界面演示</span>
    <div class="demo-stage detail-photo ${key}">
      ${data.mode === 'exterior'
        ? photo(config.heroImage, '图片裁切占位，非独立部件3D模型')
        : fallback(`${data.title}模型预留位置`)}
    </div>
    <p class="credit">模型预留位置：目前仅为图片占位，实际独立模型将在Kivicube中制作。</p>
    <div class="card">
      <h2>${data.title}</h2>
      <p>${data.text}</p>
      <p class="credit">部件说明与资料来源待补充。</p>
    </div>
    ${demoNote()}
    <a class="secondary" href="#demo/${data.mode}">← 返回整体模型界面</a>
  `;
}

function history() {
  app.innerHTML = heading('建筑历史', '沿着时间，了解建筑的变化。') + `
    <div class="years" aria-label="选择历史年份">
      ${config.history.map((item, index) => `
        <button data-year-index="${index}" aria-pressed="false">${escapeHTML(item.year)}</button>
      `).join('')}
    </div>
    <section id="history-content" aria-live="polite"></section>
    <a class="secondary" href="#compare">查看今昔照片对比 →</a>
  `;

  const select = (index) => {
    const item = config.history[index];
    document.querySelector('#history-content').innerHTML = `
      <div class="history-photo">${photo(item.image, `${item.year}年历史资料图片待补充`)}</div>
      <div class="card">
        <div class="year-number">${escapeHTML(item.year)}</div>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(item.text)}</p>
        ${item.source ? `<p class="credit">资料来源：${escapeHTML(item.source)}</p>` : ''}
      </div>
    `;

    app.querySelectorAll('[data-year-index]').forEach((button) => {
      button.setAttribute('aria-pressed', Number(button.dataset.yearIndex) === index);
    });
    bindImageFallbacks();
  };

  app.querySelectorAll('[data-year-index]').forEach((button) => {
    button.onclick = () => select(Number(button.dataset.yearIndex));
  });
  if (config.history.length) select(0);
}

function compare() {
  const media = config.media;
  const past = assetURL(media.pastImage);
  const present = assetURL(media.presentImage);

  app.innerHTML = heading(
    '历史照片',
    '今昔对照，观看索菲亚的建筑变迁。'
  ) + `
  <section id="media-content"></section>
  `;

  const content = document.querySelector('#media-content');

  if (!past || !present) {
    content.innerHTML = fallback('历史与现状照片待补充');
    return;
  }

  content.innerHTML = `
  <div class="compare-box" id="comparison">
      <img
        src="${escapeHTML(present)}"
        alt="${escapeHTML(media.presentLabel)}"
      >
      <img
        class="past"
        src="${escapeHTML(past)}"
        alt="${escapeHTML(media.pastLabel)}"
      >
      <div class="compare-line"></div>
    </div>

    <div class="compare-labels">
    <span>${escapeHTML(media.pastLabel)}</span>
      <span>${escapeHTML(media.presentLabel)}</span>
    </div>

    <label for="compare-range">
      拖动查看历史与现状
    </label>

    <input
      id="compare-range"
      type="range"
      min="0"
      max="100"
      value="50"
    >

    <p
      class="status"
      id="comparison-status"
      role="status"
    ></p>
  `;

  content.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      document.querySelector('#comparison-status').textContent =
        '照片无法载入，请检查图片路径与文件名。';
    });
  });

  const comparison = document.querySelector('#comparison');
const range = document.querySelector('#compare-range');
const handle = comparison.querySelector('.compare-line');

function updateSplit(value) {
  const percent = Math.max(0, Math.min(100, value));

  comparison.style.setProperty('--split', `${percent}%`);
  range.value = percent;
}

range.oninput = () => {
  updateSplit(Number(range.value));
};

function updateFromPointer(event) {
  const bounds = comparison.getBoundingClientRect();
  const percent = ((event.clientX - bounds.left) / bounds.width) * 100;

  updateSplit(percent);
}

handle.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;

  event.preventDefault();
  handle.setPointerCapture(event.pointerId);
  updateFromPointer(event);
});

handle.addEventListener('pointermove', (event) => {
  if (!handle.hasPointerCapture(event.pointerId)) return;

  updateFromPointer(event);
});

handle.addEventListener('pointerup', (event) => {
  if (handle.hasPointerCapture(event.pointerId)) {
    handle.releasePointerCapture(event.pointerId);
  }
});

handle.addEventListener('pointercancel', (event) => {
  if (handle.hasPointerCapture(event.pointerId)) {
    handle.releasePointerCapture(event.pointerId);
  }
});
}

function render() {
  app.querySelectorAll('video').forEach((video) => video.pause());
  app.replaceChildren();
  navigation.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');

  const [page, parameter] = location.hash.slice(1).split('/');
  const mode = modes[parameter] ? parameter : 'exterior';

  if (page === 'ar' && mode === 'interior') {
  interiorOverview();
} else if (page === 'ar') {
  ar(mode);
}
  else if (page === 'demo') demo(mode);
  else if (page === 'part' && parts[parameter]) part(parameter);
  else if (page === 'history') history();
  else if (page === 'compare') compare();
  else home();

  app.querySelectorAll('[data-route]').forEach((button) => {
    button.onclick = () => { location.hash = button.dataset.route; };
  });
  bindImageFallbacks();
  window.scrollTo(0, 0);
  app.tabIndex = -1;
  app.focus({ preventScroll: true });
}

menuButton.onclick = () => {
  navigation.hidden = !navigation.hidden;
  menuButton.setAttribute('aria-expanded', String(!navigation.hidden));
};

window.addEventListener('hashchange', render);
window.addEventListener('pagehide', () => {
  app.querySelectorAll('iframe').forEach((frame) => frame.remove());
  app.querySelectorAll('video').forEach((video) => video.pause());
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) render();
});
render();