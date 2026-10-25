function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const toggleIcon = document.querySelector('.toggle-icon');

    if (!sidebar || !sidebarToggle || !toggleIcon) return;
    if (sidebar.dataset.sidebarInitialized === '1') return;
    sidebar.dataset.sidebarInitialized = '1';

    const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';
    const SUBMENU_STORAGE_KEY = 'sidebar-open-submenus';

    function persistCollapsedState(collapsed) {
        const value = String(Boolean(collapsed));
        localStorage.setItem(SIDEBAR_STORAGE_KEY, value);
        document.cookie = 'sidebar-collapsed=' + encodeURIComponent(value) + '; path=/; max-age=31536000; SameSite=Lax';
    }

    function getSavedSubmenuState() {
        try {
            const raw = localStorage.getItem(SUBMENU_STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function saveSubmenuState(state) {
        localStorage.setItem(SUBMENU_STORAGE_KEY, JSON.stringify(state));
    }

    function getSubmenuKey(toggle, index) {
        const label = toggle.textContent ? toggle.textContent.trim() : '';
        return label || String(index);
    }

    function normalizePath(path) {
        return (path || '').replace(/\/$/, '').toLowerCase();
    }

    // Initialize from saved preference and keep server-rendered fallback.
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const collapsed = saved === 'true'
        ? true
        : saved === 'false'
            ? false
            : sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed', collapsed);
    persistCollapsedState(collapsed);

    requestAnimationFrame(function() {
        sidebar.classList.add('sidebar-animate');
    });

    // Set ARIA state
    sidebarToggle.setAttribute('aria-expanded', String(!sidebar.classList.contains('collapsed')));

    sidebarToggle.addEventListener('click', function() {
        const collapsed = sidebar.classList.toggle('collapsed');
        persistCollapsedState(collapsed);
        sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
    });

    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    const savedSubmenuState = getSavedSubmenuState();
    const currentPath = normalizePath(window.location.pathname.split('/').pop());

    document.querySelectorAll('.sidebar-nav a[href]').forEach(function(link) {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        const linkPath = normalizePath(href.split('?')[0].split('#')[0]);
        if (!linkPath || linkPath !== currentPath) return;

        link.classList.add('is-active');
        const parentMenu = link.closest('.has-submenu');
        if (parentMenu) {
            parentMenu.classList.add('open');
            const relatedToggle = parentMenu.querySelector('.submenu-toggle');
            if (relatedToggle) {
                relatedToggle.setAttribute('aria-expanded', 'true');
            }
        }
    });

    submenuToggles.forEach(function(toggle, index) {
        const parent = toggle.closest('.has-submenu');
        if (!parent) return;

        const submenuKey = getSubmenuKey(toggle, index);
        const hasActiveLink = Boolean(parent.querySelector('a.is-active'));
        const shouldBeOpen = hasActiveLink || Boolean(savedSubmenuState[submenuKey]);

        parent.classList.toggle('open', shouldBeOpen);
        toggle.setAttribute('aria-expanded', String(shouldBeOpen));

        toggle.addEventListener('click', function() {
            const expanded = parent.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(expanded));

            const nextState = getSavedSubmenuState();
            nextState[submenuKey] = expanded;
            saveSubmenuState(nextState);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}
