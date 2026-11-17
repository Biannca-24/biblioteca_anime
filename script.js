// ==========================================
// ANIMEX BR - Código principal da biblioteca
// ==========================================

// Atalho usado para encontrar elementos no HTML pelo seletor.
const $ = selector => document.querySelector(selector);

// Textos exibidos para cada status disponível.
const STATUSES = {
    watching: 'Assistindo',
    done: 'Concluído',
    plan: 'Quero ver',
    drop: 'Abandonado'
};

// Chave usada no armazenamento local e biblioteca inicial de exemplo.
const STORAGE_KEY = 'animeLib.v1';
const DEFAULT_LIBRARY = [
    { id: 1, title: 'Spirited Away', year: 2001, genres: ['Aventura', 'Família'], status: 'done', rate: 5, img: '', note: '' },
    { id: 2, title: 'Princess Mononoke', year: 1997, genres: ['Fantasia'], status: 'plan', rate: 0, img: '', note: '' },
    { id: 3, title: 'My Neighbor Totoro', year: 1988, genres: ['Família', 'Fantasia'], status: 'watching', rate: 4, img: '', note: '' }
];

// Estado geral da aplicação: lista, item em edição, nota e capa.
const appState = {
    library: [],
    editingId: null,
    selectedRating: 0,
    coverUrl: ''
};

// Retorna os status na forma usada para montar opções de seleção.
const getStatusOptions = () => Object.entries(STATUSES);

// Evita que textos adicionados ao HTML sejam interpretados como código.
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[char]));

// Gera uma cor de fundo fixa a partir do título do anime.
const getBackgroundGradient = title => {
    let hash = 0;

    for (const character of title) {
        hash = (hash * 31 + character.charCodeAt(0)) % 360;
    }

    return `linear-gradient(160deg,hsl(${hash},60%,22%),hsl(${(hash + 70) % 360},70%,40%))`;
};

// Normaliza os dados para evitar valores inválidos vindos do armazenamento.
const normalizeAnime = (anime, index) => {
    const safeTitle = String(anime?.title || 'Sem título');
    const safeGenres = Array.isArray(anime?.genres) ? anime.genres.map(String) : [];

    return {
        id: anime?.id || Date.now() + index,
        title: safeTitle,
        year: Number(anime?.year) || 0,
        status: Object.prototype.hasOwnProperty.call(STATUSES, anime?.status) ? anime.status : 'plan',
        genres: safeGenres,
        rate: Math.min(5, Math.max(0, Number(anime?.rate) || 0)),
        img: String(anime?.img || ''),
        note: String(anime?.note || '')
    };
};

// -----------------------
// Armazenamento local
// -----------------------

// Recupera a biblioteca salva ou usa os dados padrão.
const loadLibrary = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === null) {
            return [...DEFAULT_LIBRARY];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [...DEFAULT_LIBRARY];
        }

        return parsed.map(normalizeAnime);
    } catch (error) {
        return [...DEFAULT_LIBRARY];
    }
};

// Salva a biblioteca atual no navegador.
const saveLibrary = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.library));
    } catch (error) {
        alert('Sem espaço para salvar. Use imagens menores.');
    }
};

// -----------------------
// Filtros e estatísticas
// -----------------------

// Preenche um campo de seleção com os status disponíveis.
const populateStatusSelect = (select, includeAll = false) => {
    const options = includeAll
        ? ['<option value="">Todos os status</option>']
        : [];

    const values = getStatusOptions();
    select.innerHTML = options.concat(values.map(([key, label]) => `<option value="${key}">${label}</option>`)).join('');
};

// Atualiza as opções do filtro de gêneros.
const renderGenreFilter = () => {
    const currentValue = $('#fg').value;
    const genres = [...new Set(appState.library.flatMap(item => item.genres))].sort();

    $('#fg').innerHTML = '<option value="">Todos os gêneros</option>' + genres
        .map(genre => `<option value="${escapeHtml(genre)}" ${genre === currentValue ? 'selected' : ''}>${escapeHtml(genre)}</option>`)
        .join('');
};

// Aplica busca, filtros e ordenação à biblioteca.
const getVisibleLibrary = () => {
    const search = $('#q').value.toLowerCase();
    const statusFilter = $('#fs').value;
    const genreFilter = $('#fg').value;
    const sortBy = $('#so').value;

    let visibleList = appState.library.filter(item => {
        const matchesTitle = item.title.toLowerCase().includes(search);
        const matchesStatus = !statusFilter || item.status === statusFilter;
        const matchesGenre = !genreFilter || item.genres.includes(genreFilter);

        return matchesTitle && matchesStatus && matchesGenre;
    });

    visibleList.sort((left, right) => {
        if (sortBy === 'rate') return right.rate - left.rate;
        if (sortBy === 'title') return left.title.localeCompare(right.title);
        if (sortBy === 'year') return (right.year || 0) - (left.year || 0);
        return right.id - left.id;
    });

    return visibleList;
};

// Atualiza os números exibidos no painel de estatísticas.
const renderStats = () => {
    const ratedItems = appState.library.filter(item => item.rate > 0);
    const average = ratedItems.length
        ? (ratedItems.reduce((sum, item) => sum + item.rate, 0) / ratedItems.length).toFixed(1)
        : '–';

    $('#sT').textContent = appState.library.length;
    $('#sC').textContent = appState.library.filter(item => item.status === 'done').length;
    $('#sA').textContent = average;
};

// Monta os cartões de anime exibidos na biblioteca.
const renderLibrary = () => {
    renderGenreFilter();

    const visibleList = getVisibleLibrary();

    $('#lib').innerHTML = visibleList.length
        ? visibleList.map(item => `
        <div class="card" data-id="${item.id}">
          <div class="cover" style="background-image:${getBackgroundGradient(item.title)}">
            ${item.img ? `<img src="${escapeHtml(item.img)}" alt="" onerror="this.remove()">` : ''}
            <span class="badge">${STATUSES[item.status]}</span>
            <span style="position:relative">${item.img ? '' : escapeHtml(item.title)}</span>
          </div>
          <div class="info">
            <strong>${escapeHtml(item.title)}</strong>
            <small>${item.year || '—'} · ${escapeHtml(item.genres.join(', ') || 'Sem gênero')}</small>
            <div class="stars">
              ${[1, 2, 3, 4, 5].map(value => `<button data-n="${value}" class="${value <= item.rate ? 'on' : ''}" aria-label="${value} estrelas">★</button>`).join('')}
            </div>
            ${item.note ? `<small>${escapeHtml(item.note)}</small>` : ''}
            <div class="acts">
              <button class="ed">Editar</button>
              <button class="del">Excluir</button>
            </div>
          </div>
        </div>
      `).join('')
        : '<div class="empty">Nenhum anime encontrado. Clique em “+ Adicionar”.</div>';

    renderStats();
};

// -----------------------
// Modal e avaliação
// -----------------------

// Atualiza visualmente as estrelas selecionadas no formulário.
const drawRatingStars = () => {
    const starButtons = [...$('#fStars').children];
    starButtons.forEach((button, index) => button.classList.toggle('on', index < appState.selectedRating));
};

// Atualiza a prévia da imagem de capa.
const updateCoverPreview = () => {
    const preview = $('#prev');
    preview.style.backgroundImage = appState.coverUrl ? `url("${appState.coverUrl.replace(/"/g, '%22')}")` : 'none';
};

// Cria os cinco botões de avaliação do formulário.
const populateStarButtons = () => {
    const starContainer = $('#fStars');
    starContainer.innerHTML = '';

    for (let value = 1; value <= 5; value += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '★';
        button.onclick = () => {
            appState.selectedRating = appState.selectedRating === value ? 0 : value;
            drawRatingStars();
        };
        starContainer.appendChild(button);
    }
};

// Abre o modal para adicionar ou editar um anime.
const openModal = anime => {
    appState.editingId = anime ? anime.id : null;
    appState.selectedRating = anime ? anime.rate : 0;
    appState.coverUrl = anime ? anime.img : '';

    $('#mt').textContent = anime ? 'Editar anime' : 'Adicionar anime';
    $('#fTitle').value = anime ? anime.title : '';
    $('#fYear').value = anime && anime.year ? anime.year : '';
    $('#fStatus').value = anime ? anime.status : 'plan';
    $('#fGen').value = anime ? anime.genres.join(', ') : '';
    $('#fNote').value = anime ? anime.note : '';
    $('#fUrl').value = appState.coverUrl.startsWith('data:') ? '' : appState.coverUrl;
    $('#fFile').value = '';

    drawRatingStars();
    updateCoverPreview();
    $('#ov').classList.add('show');
    $('#fTitle').focus();
};

// Fecha a janela modal.
const closeModal = () => {
    $('#ov').classList.remove('show');
};

// -----------------------
// Interações da biblioteca
// -----------------------

// Trata avaliações, exclusões e abertura do modo de edição.
const handleLibraryClick = event => {
    const card = event.target.closest('.card');
    if (!card) return;

    const anime = appState.library.find(item => item.id == card.dataset.id);
    if (!anime) return;

    const starButton = event.target.closest('.stars button');
    if (starButton) {
        const selectedRating = Number(starButton.dataset.n);
        anime.rate = anime.rate === selectedRating ? 0 : selectedRating;
        saveLibrary();
        renderLibrary();
        return;
    }

    if (event.target.closest('.del')) {
        if (confirm(`Excluir “${anime.title}”?`)) {
            appState.library = appState.library.filter(item => item !== anime);
            saveLibrary();
            renderLibrary();
        }
        return;
    }

    if (event.target.closest('.ed')) {
        openModal(anime);
    }
};

// Liga os eventos dos campos de busca, filtro e ordenação.
const bindFilterEvents = () => {
    ['input', 'change'].forEach(eventName => {
        ['#q', '#fs', '#fg', '#so'].forEach(selector => $(selector).addEventListener(eventName, renderLibrary));
    });
};

// -----------------------
// Importação e exportação
// -----------------------

// Lê um arquivo JSON selecionado pelo usuário e importa a biblioteca.
const handleImport = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid JSON');
            }

            appState.library = parsed.map((anime, index) => ({
                id: anime.id || Date.now() + index,
                title: String(anime.title || 'Sem título'),
                year: Number(anime.year) || 0,
                status: Object.prototype.hasOwnProperty.call(STATUSES, anime.status) ? anime.status : 'plan',
                genres: Array.isArray(anime.genres) ? anime.genres.map(String) : [],
                rate: Math.min(5, Math.max(0, Number(anime.rate) || 0)),
                img: String(anime.img || ''),
                note: String(anime.note || '')
            }));

            saveLibrary();
            renderLibrary();
        } catch (error) {
            alert('Arquivo inválido.');
        }
    };

    reader.readAsText(file);
    event.target.value = '';
};

// Processa uma imagem enviada e cria uma versão reduzida para a capa.
const handleFileUpload = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const image = new Image();
        image.onload = () => {
            const width = 300;
            const height = Math.round((image.height * width) / image.width);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, width, height);
            appState.coverUrl = canvas.toDataURL('image/jpeg', 0.8);
            $('#fUrl').value = '';
            updateCoverPreview();
        };
        image.src = reader.result;
    };

    reader.readAsDataURL(file);
};

// -----------------------
// Formulário
// -----------------------

// Valida e salva os dados informados no formulário.
const handleFormSubmit = event => {
    event.preventDefault();

    const nextAnime = {
        title: $('#fTitle').value.trim(),
        year: Number($('#fYear').value) || 0,
        status: $('#fStatus').value,
        genres: $('#fGen').value.split(',').map(item => item.trim()).filter(Boolean),
        rate: appState.selectedRating,
        img: appState.coverUrl,
        note: $('#fNote').value.trim()
    };

    if (!nextAnime.title) {
        return;
    }

    if (appState.editingId !== null) {
        const anime = appState.library.find(item => item.id === appState.editingId);
        if (anime) {
            Object.assign(anime, nextAnime);
        }
    } else {
        appState.library.push({ id: Date.now(), ...nextAnime });
    }

    saveLibrary();
    renderLibrary();
    closeModal();
};

// -----------------------
// Efeitos visuais
// -----------------------

// Faz o banner reagir ao movimento do mouse com efeito parallax.
const initializeHeroParallax = () => {
    const hero = $('#hero');

    hero.addEventListener('mousemove', event => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        hero.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
        hero.style.setProperty('--my', `${(y + 0.5) * 100}%`);
        $('#moon').style.transform = `translate(${-x * 40}px,${-y * 20}px)`;
        $('#tor').style.transform = `translate(${x * 30}px,${y * 10}px)`;
    });

    hero.addEventListener('mouseleave', () => {
        $('#moon').style.transform = '';
        $('#tor').style.transform = '';
    });
};

// Liga os eventos do modal e dos campos de capa.
const bindModalEvents = () => {
    $('#add').onclick = () => openModal(null);
    $('#cancel').onclick = closeModal;
    $('#ov').addEventListener('mousedown', event => {
        if (event.target.id === 'ov') {
            closeModal();
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    $('#fUrl').oninput = event => {
        appState.coverUrl = event.target.value.trim();
        updateCoverPreview();
    };

    $('#fFile').onchange = handleFileUpload;
    $('#form').addEventListener('submit', handleFormSubmit);
};

// Liga os botões de exportar e importar biblioteca.
const bindBackupEvents = () => {
    $('#exp').onclick = () => {
        try {
            const blob = new Blob([JSON.stringify(appState.library, null, 1)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'biblioteca-animes.json';
            link.click();
        } catch (error) {
            alert('Não foi possível exportar aqui.');
        }
    };

    $('#imp').onclick = () => $('#impf').click();
    $('#impf').onchange = handleImport;
};

// -----------------------
// Inicialização
// -----------------------



// Carrega os dados e configura todos os eventos da aplicação.
const initializeApp = () => {
    appState.library = loadLibrary();

    populateStatusSelect($('#fs'), true);
    populateStatusSelect($('#fStatus'));
    populateStarButtons();
    bindFilterEvents();
    bindModalEvents();
    bindBackupEvents();
    initializeHeroParallax();
    renderLibrary();

     $('#lib').addEventListener('click', handleLibraryClick); // <-- faltava isto

    renderLibrary();
};

// Inicia a aplicação assim que o script termina de ser carregado.
initializeApp();
