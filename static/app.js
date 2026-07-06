// STATE MANAGEMENT
let state = {
    locale: localStorage.getItem('locale') || 'en',
    theme: localStorage.getItem('theme') || 'dark',
    user: JSON.parse(localStorage.getItem('user')) || null,
    role: localStorage.getItem('role') || null, // 'owner', 'manager', 'tenant'
    activeView: 'viewHome',
    loginRole: 'tenant',
    registerRole: 'tenant',
    activeDashTabs: {
        owner: 'managersTab',
        manager: 'buildingsTab',
        tenant: 'searchTab'
    },
    homeViewMode: 'list',
    categoryViewMode: 'list',
    homeMapInstance: null,
    categoryMapInstance: null,
    homeMarkers: [],
    categoryMarkers: []
};

// UI TRANSLATIONS DICTIONARY (matches localizations.js)
const translations = {
    "en": {
        "welcome": "Welcome to RentArena Zero Brokerage Rental",
        "tagline": "Skip the broker. Rent direct-from-owner properties with zero brokerage fee.",
        "occupancy_rate_title": "Occupancy and Rental Analysis",
        "total_apartments": "Total Apartments",
        "occupied_apartments": "Occupied Apartments",
        "vacant_apartments": "Vacant Apartments",
        "occupancy_rate": "Occupancy Rate",
        "owner_login": "Owner Login",
        "manager_login": "Property Manager Login",
        "tenant_login": "Tenant Login",
        "owner_reg": "Owner Registration",
        "tenant_reg": "Tenant Registration",
        "dashboard": "Dashboard",
        "logout": "Logout",
        "buildings": "Buildings",
        "apartments": "Apartments",
        "tenants": "Tenants",
        "managers": "Property Managers",
        "messages": "Messages",
        "events": "Events",
        "appointments": "Appointments",
        "profile": "Profile",
        "actions": "Actions",
        "edit": "Edit",
        "delete": "Delete",
        "create": "Create",
        "save": "Save",
        "cancel": "Cancel",
        "loading": "Loading...",
        "no_records": "No records found.",
        "email": "Email",
        "password": "Password",
        "phone": "Phone Number",
        "name": "Name",
        "address": "Address",
        "city": "City",
        "province": "Province",
        "postal_code": "Postal Code",
        "price": "Price",
        "rooms": "Rooms",
        "status": "Status",
        "description": "Description",
        "date": "Date",
        "apartment_card_desc": "Browse and explore direct owner apartments.",
        "apartments_flats": "Apartments & Flats",
        "apartments_flats_desc": "1BHK, 2BHK, 3BHK, Studio Apartments",
        "independent_houses": "Independent Houses & Villas",
        "independent_houses_desc": "Villas, Duplexes, Row Houses, Independent Homes",
        "independent_houses_coming": "Independent Houses & Villas feature is coming soon!",
        "commercial_properties": "Commercial Properties",
        "commercial_properties_desc": "Offices, Shops, Showrooms, Co-working Spaces",
        "commercial_properties_coming": "Commercial Properties feature is coming soon!",
        "land_plots": "Land & Plots",
        "land_plots_desc": "Residential Plots, Commercial Plots, Agricultural Land",
        "land_plots_coming": "Land & Plots feature is coming soon!"
    },
    "fr": {
        "welcome": "Bienvenue chez RentArena - Location Sans Commission",
        "tagline": "Évitez le courtier. Connectez-vous directement aux propriétaires.",
        "occupancy_rate_title": "Analyse d'occupation et de location",
        "total_apartments": "Nombre total d'appartements",
        "occupied_apartments": "Appartements occupés",
        "vacant_apartments": "Appartements vacants",
        "occupancy_rate": "Taux d'occupation",
        "owner_login": "Connexion Propriétaire",
        "manager_login": "Connexion Gestionnaire de Propriété",
        "tenant_login": "Connexion Locataire",
        "owner_reg": "Enregistrement Propriétaire",
        "tenant_reg": "Enregistrement Locataire",
        "dashboard": "Tableau de Bord",
        "logout": "Déconnexion",
        "buildings": "Bâtiments",
        "apartments": "Appartements",
        "tenants": "Locataires",
        "managers": "Gestionnaires de Propriété",
        "messages": "Messages",
        "events": "Événements",
        "appointments": "Rendez-vous",
        "profile": "Profil",
        "actions": "Actions",
        "edit": "Modifier",
        "delete": "Supprimer",
        "create": "Créer",
        "save": "Enregistrer",
        "cancel": "Annuler",
        "loading": "Chargement...",
        "no_records": "Aucun enregistrement trouvé.",
        "email": "Email",
        "password": "Mot de passe",
        "phone": "Téléphone",
        "name": "Nom",
        "address": "Adresse",
        "city": "Ville",
        "province": "Province",
        "postal_code": "Code Postal",
        "price": "Prix",
        "rooms": "Pièces",
        "status": "Statut",
        "description": "Description",
        "date": "Date",
        "apartment_card_desc": "Parcourez et explorez les appartements en direct du propriétaire.",
        "apartments_flats": "Appartements & Appartements",
        "apartments_flats_desc": "1BHK, 2BHK, 3BHK, Studios",
        "independent_houses": "Maisons Individuelles & Villas",
        "independent_houses_desc": "Villas, Duplex, Maisons de Ville, Maisons Individuelles",
        "independent_houses_coming": "La fonctionnalité Maisons Individuelles & Villas sera bientôt disponible!",
        "commercial_properties": "Propriétés Commerciales",
        "commercial_properties_desc": "Bureaux, Boutiques, Showrooms, Espaces de Co-working",
        "commercial_properties_coming": "La fonctionnalité Propriétés Commerciales sera bientôt disponible!",
        "land_plots": "Terrains & Lots",
        "land_plots_desc": "Terrains Résidentiels, Commerciaux, Terres Agricoles",
        "land_plots_coming": "La fonctionnalité Terrains & Lots sera bientôt disponible!"
    },
    "vi": {
        "welcome": "Chào mừng đến với RentArena - Thuê nhà Không môi giới",
        "tagline": "Bỏ qua môi giới. Kết nối trực tiếp với chủ nhà. Không phí môi giới.",
        "occupancy_rate_title": "Phân tích Tỷ lệ Lấp đầy và Cho thuê",
        "total_apartments": "Tổng số căn hộ",
        "occupied_apartments": "Căn hộ đã cho thuê",
        "vacant_apartments": "Căn hộ trống",
        "occupancy_rate": "Tỷ lệ lấp đầy",
        "owner_login": "Đăng nhập Chủ nhà",
        "manager_login": "Đăng nhập Quản lý Bất động sản",
        "tenant_login": "Đăng nhập Người thuê",
        "owner_reg": "Đăng ký Chủ nhà",
        "tenant_reg": "Đăng ký Người thuê",
        "dashboard": "Bảng điều khiển",
        "logout": "Đăng xuất",
        "buildings": "Tòa nhà",
        "apartments": "Căn hộ",
        "tenants": "Người thuê",
        "managers": "Quản lý Bất động sản",
        "messages": "Tin nhắn",
        "events": "Sự kiện",
        "appointments": "Lịch hẹn",
        "profile": "Hồ sơ",
        "actions": "Hành động",
        "edit": "Sửa",
        "delete": "Xóa",
        "create": "Tạo mới",
        "save": "Lưu",
        "cancel": "Hủy bỏ",
        "loading": "Đang tải...",
        "no_records": "Không có dữ liệu.",
        "email": "Email",
        "password": "Mật khẩu",
        "phone": "Số điện thoại",
        "name": "Họ và tên",
        "address": "Địa chỉ",
        "city": "Thành phố",
        "province": "Tỉnh/Thành",
        "postal_code": "Mã bưu điện",
        "price": "Giá thuê",
        "rooms": "Số phòng",
        "status": "Trạng thái",
        "description": "Mô tả",
        "date": "Ngày hẹn",
        "apartment_card_desc": "Duyệt và khám phá các căn hộ chính chủ.",
        "apartments_flats": "Căn hộ & Chung cư",
        "apartments_flats_desc": "Căn hộ 1BHK, 2BHK, 3BHK, Căn hộ Studio",
        "independent_houses": "Nhà riêng & Biệt thự",
        "independent_houses_desc": "Biệt thự, Nhà thông tầng, Nhà liền kề, Nhà độc lập",
        "independent_houses_coming": "Tính năng Nhà riêng & Biệt thự sắp ra mắt!",
        "commercial_properties": "Bất động sản Thương mại",
        "commercial_properties_desc": "Văn phòng, Cửa hàng, Phòng trưng bày, Không gian làm việc chung",
        "commercial_properties_coming": "Tính năng Bất động sản Thương mại sắp ra mắt!",
        "land_plots": "Đất nền & Lô đất",
        "land_plots_desc": "Đất nền dự án, Đất thương mại, Đất nông nghiệp",
        "land_plots_coming": "Tính năng Đất nền & Lô đất sắp ra mắt!"
    },
    "es": {
        "welcome": "Bienvenido a RentArena - Alquiler Sin Intermediarios",
        "tagline": "Evite al corredor. Conéctese directamente con los propietarios. Cero comisión.",
        "occupancy_rate_title": "Análisis de Ocupación y Alquiler",
        "total_apartments": "Total de Apartamentos",
        "occupied_apartments": "Apartamentos Ocupados",
        "vacant_apartments": "Apartamentos Vacantes",
        "occupancy_rate": "Tasa de Ocupación",
        "owner_login": "Iniciar Propietario",
        "manager_login": "Iniciar Administrador de la Propiedad",
        "tenant_login": "Iniciar Inquilino",
        "owner_reg": "Registro Propietario",
        "tenant_reg": "Registro Inquilino",
        "dashboard": "Tablero de Control",
        "logout": "Cerrar sesión",
        "buildings": "Edificios",
        "apartments": "Apartamentos",
        "tenants": "Inquilinos",
        "managers": "Administradores de la Propiedad",
        "messages": "Mensajes",
        "events": "Eventos",
        "appointments": "Citas",
        "profile": "Perfil",
        "actions": "Acciones",
        "edit": "Editar",
        "delete": "Eliminar",
        "create": "Crear",
        "save": "Guardar",
        "cancel": "Cancelar",
        "loading": "Cargando...",
        "no_records": "No se encontraron registros.",
        "email": "Email",
        "password": "Contraseña",
        "phone": "Teléfono",
        "name": "Nombre",
        "address": "Dirección",
        "city": "Ciudad",
        "province": "Provincia",
        "postal_code": "Código Postal",
        "price": "Precio",
        "rooms": "Habitaciones",
        "status": "Estado",
        "description": "Descripción",
        "date": "Fecha",
        "apartment_card_desc": "Busque y explore apartamentos de propietarios directos.",
        "apartments_flats": "Apartamentos y Pisos",
        "apartments_flats_desc": "Apartamentos de 1BHK, 2BHK, 3BHK, Estudios",
        "independent_houses": "Casas Independientes y Villas",
        "independent_houses_desc": "Villas, Dúplex, Casas Adosadas, Casas Independientes",
        "independent_houses_coming": "¡La función de Casas Independientes y Villas estará disponible próximamente!",
        "commercial_properties": "Propiedades Comerciales",
        "commercial_properties_desc": "Oficinas, Tiendas, Showrooms, Espacios de Co-working",
        "commercial_properties_coming": "¡La función de Propiedades Comerciales estará disponible próximamente!",
        "land_plots": "Terrenos y Parcelas",
        "land_plots_desc": "Terrenos Residenciales, Comerciales, Tierras Agrícolas",
        "land_plots_coming": "¡La función de Terrenos y Parcelas estará disponible próximamente!"
    }
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyLocale();
    setupEventListeners();
    initApp();
});

// INITIALIZE APP VIEW & PERSISTENCE
function initApp() {
    if (state.user && state.role) {
        setLoggedInUI(true);
        if (state.role === 'owner') {
            switchView('viewOwnerDashboard');
            loadOwnerDashboard();
        } else if (state.role === 'manager') {
            switchView('viewManagerDashboard');
            loadManagerDashboard();
        } else if (state.role === 'tenant') {
            switchView('viewTenantDashboard');
            loadTenantDashboard();
        }
    } else {
        setLoggedInUI(false);
        switchView('viewHome');
        loadHome();
    }
}

// SETUP DOM EVENTS
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Locale selector
    const langSelect = document.getElementById('langSelect');
    langSelect.value = state.locale;
    langSelect.addEventListener('change', (e) => {
        state.locale = e.target.value;
        localStorage.setItem('locale', state.locale);
        applyLocale();
        loadHome();
        if (state.user) {
            if (state.role === 'owner') loadOwnerDashboard();
            if (state.role === 'manager') loadManagerDashboard();
            if (state.role === 'tenant') loadTenantDashboard();
        }
    });

    // Logo click
    document.getElementById('navLogo').addEventListener('click', (e) => {
        e.preventDefault();
        initApp();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Mouse movement radial glow on premium glassmorphic cards
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.glass-premium');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Search events
    document.getElementById('homeSearchBtn').addEventListener('click', () => {
        loadHome(document.getElementById('homeSearchInput').value);
    });

    document.getElementById('homeSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadHome(e.target.value);
        }
    });

    // Login Form Submit
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Register Form Submit
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Profile Forms
    document.getElementById('ownerProfileForm').addEventListener('submit', (e) => handleProfileUpdate(e, 'owner'));
    document.getElementById('managerProfileForm').addEventListener('submit', (e) => handleProfileUpdate(e, 'manager'));
    document.getElementById('tenantProfileForm').addEventListener('submit', (e) => handleProfileUpdate(e, 'tenant'));

    // Inline Search for Tenants
    const searchTenantsInput = document.getElementById('ownerTenantSearchInput');
    if (searchTenantsInput) {
        searchTenantsInput.addEventListener('input', (e) => {
            loadOwnerTenants(e.target.value);
        });
    }

    // Inline Search for Tenant dashboard apartments
    const searchTenantAptsInput = document.getElementById('tenantAptSearchInput');
    if (searchTenantAptsInput) {
        searchTenantAptsInput.addEventListener('input', (e) => {
            loadTenantApartments(e.target.value);
        });
    }
}

// SWITCH VIEWS
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    const activeSection = document.getElementById(viewId);
    if (activeSection) {
        activeSection.classList.remove('hidden');
        activeSection.classList.add('active');
        state.activeView = viewId;
    }
    updateNavbarMenu();
}

function navigateToApartments() {
    if (state.user && state.role === 'tenant') {
        switchView('viewTenantDashboard');
        switchDashTab('tenant', 'searchTab');
    } else {
        const el = document.getElementById('homeApartmentsList');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

let currentCategory = '';

function openCategoryExplore(categoryKey) {
    currentCategory = categoryKey;
    switchView('viewCategoryExplore');
    
    // Reset filters
    document.getElementById('categorySearchInput').value = '';
    document.getElementById('categoryMinPrice').value = '';
    document.getElementById('categoryMaxPrice').value = '';
    
    const iconEl = document.getElementById('exploreCategoryIcon');
    const titleEl = document.getElementById('exploreCategoryTitle');
    const selectEl = document.getElementById('categoryTypeSelect');
    
    // Set Header & Options
    selectEl.innerHTML = '<option value="">All Subtypes</option>';
    
    if (categoryKey === 'apartments') {
        iconEl.innerText = '🏠';
        titleEl.innerText = 'Apartments & Flats';
        const subtypes = ["Studio Apartments", "1 BHK", "2 BHK", "3 BHK", "Premium Apartments"];
        subtypes.forEach(s => {
            selectEl.innerHTML += `<option value="${s}">${s}</option>`;
        });
    } else if (categoryKey === 'houses') {
        iconEl.innerText = '🏡';
        titleEl.innerText = 'Independent Houses & Villas';
        const subtypes = ["Villas", "Duplex Houses", "Row Houses", "Independent Homes", "Luxury Residences"];
        subtypes.forEach(s => {
            selectEl.innerHTML += `<option value="${s}">${s}</option>`;
        });
    } else if (categoryKey === 'commercial') {
        iconEl.innerText = '🏢';
        titleEl.innerText = 'Commercial Properties';
        const subtypes = ["Office Spaces", "Shops", "Showrooms", "Warehouses", "Co-working Spaces"];
        subtypes.forEach(s => {
            selectEl.innerHTML += `<option value="${s}">${s}</option>`;
        });
    } else if (categoryKey === 'plots') {
        iconEl.innerText = '🌿';
        titleEl.innerText = 'Land & Plots';
        const subtypes = ["Residential Plots", "Commercial Plots", "Agricultural Land", "Industrial Land", "Investment Plots"];
        subtypes.forEach(s => {
            selectEl.innerHTML += `<option value="${s}">${s}</option>`;
        });
    }
    
    loadCategoryProperties();
}

function getBuildingImage(item) {
    if (!item) return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
    
    let subtype = (item.subtype || '').toLowerCase();
    let title = (item.title || '').toLowerCase();
    
    if (item.isReal || !subtype) {
        const rooms = item.rooms || item.nbRooms || 0;
        if (rooms === 1) subtype = "1 bhk";
        else if (rooms === 2) subtype = "2 bhk";
        else if (rooms === 3) subtype = "3 bhk";
        else if (rooms > 3) subtype = "premium apartments";
        else subtype = "studio apartments";
    }
    
    if (subtype.includes('villa')) {
        return 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('duplex')) {
        return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('row')) {
        return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('independent') || subtype.includes('house')) {
        return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('office') || title.includes('office')) {
        return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('shop') || title.includes('shop') || title.includes('retail')) {
        return 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('showroom') || title.includes('showroom')) {
        return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('warehouse') || title.includes('warehouse') || title.includes('logistics')) {
        return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('co-working') || subtype.includes('coworking') || title.includes('coworking')) {
        return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('plot') || title.includes('plot') || subtype.includes('land') || title.includes('land')) {
        if (title.includes('agricultural')) {
            return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80';
        }
        if (title.includes('lakeview') || title.includes('investment')) {
            return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80';
        }
        if (title.includes('commercial')) {
            return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80';
        }
        return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80';
    }
    if (subtype.includes('premium')) {
        return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
    }
    
    return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
}

async function loadCategoryProperties() {
    const listContainer = document.getElementById('categoryPropertiesList');
    listContainer.innerHTML = `<p class="loading-p">${translate('loading')}</p>`;
    
    const search = document.getElementById('categorySearchInput').value.toLowerCase().trim();
    const subtype = document.getElementById('categoryTypeSelect').value;
    const minPrice = parseFloat(document.getElementById('categoryMinPrice').value) || null;
    const maxPrice = parseFloat(document.getElementById('categoryMaxPrice').value) || null;

    try {
        let items = [];

        if (currentCategory === 'apartments') {
            // Load from database
            let endpoint = '/api/apartments?status=Available';
            const response = await apiCall(endpoint);
            const rawApts = response.data;
            
            // Map and add some metadata/subtype to make it fit perfectly
            items = rawApts.map(apt => {
                let inferredSubtype = "Studio Apartments";
                if (apt.nbRooms === 1) inferredSubtype = "1 BHK";
                else if (apt.nbRooms === 2) inferredSubtype = "2 BHK";
                else if (apt.nbRooms === 3) inferredSubtype = "3 BHK";
                else if (apt.nbRooms > 3 || apt.price > 2500) inferredSubtype = "Premium Apartments";
                
                return {
                    id: apt.apartmentId,
                    apartmentNo: apt.apartmentNo,
                    title: `${inferredSubtype} (Apt ${apt.apartmentNo})`,
                    subtype: inferredSubtype,
                    price: apt.price,
                    rooms: apt.nbRooms,
                    status: apt.status,
                    address: apt.buildingAddress,
                    city: apt.buildingCity,
                    isReal: true,
                    managerId: apt.managerId,
                    latitude: apt.latitude,
                    longitude: apt.longitude
                };
            });
        } else {
            // Load mock properties
            items = getMockPropertiesForCategory(currentCategory);
        }

        // Apply filters
        let filtered = items.filter(item => {
            if (subtype && item.subtype !== subtype) return false;
            if (minPrice && item.price < minPrice) return false;
            if (maxPrice && item.price > maxPrice) return false;
            if (search) {
                const searchMatch = 
                    item.title.toLowerCase().includes(search) || 
                    item.address.toLowerCase().includes(search) || 
                    item.city.toLowerCase().includes(search) || 
                    item.subtype.toLowerCase().includes(search);
                if (!searchMatch) return false;
            }
            return true;
        });

        state.currentCategoryProperties = filtered; // Save filtered to state for map display

        // Render
        listContainer.innerHTML = '';
        if (filtered.length === 0) {
            listContainer.innerHTML = `<p class="no-records-p">${translate('no_records')}</p>`;
            if (state.categoryViewMode === 'map') {
                updateMapMarkers(false);
            }
            return;
        }

        filtered.forEach(item => {
            const ratingVal = (4.5 + (item.id % 5) * 0.1).toFixed(1);
            listContainer.innerHTML += `
                <div class="apt-card glass" data-id="${item.id}" style="background-image: url('${getBuildingImage(item)}');" onclick="handleCardClick(event, ${item.id}, ${item.isReal}, ${JSON.stringify(item).replace(/"/g, '&quot;')}, false)">
                    <div class="apt-card-overlay"></div>
                    <div class="apt-card-header">
                        <span class="apt-badge">${item.subtype}</span>
                        <span style="color:#f59e0b; font-weight:700; font-size:0.82rem; background:rgba(0,0,0,0.5); padding:3px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:3px; z-index:2;">⭐ ${ratingVal}</span>
                        <span class="apt-price">₹${item.price}/mo</span>
                    </div>
                    <div class="apt-title" style="margin: 10px 0 5px 0; font-weight: 600; color: #fff;">${item.title}</div>
                    <div class="apt-address">${item.address}, ${item.city}</div>
                    <div class="apt-details">
                        <span>🛏️ ${item.rooms} ${translate('rooms')}</span>
                        <span class="status-badge available">${item.status}</span>
                    </div>
                    <div class="apt-tags">
                        <span class="zero-brokerage-badge">Zero Brokerage</span>
                        <span class="verified-owner-badge">✓ Verified Owner</span>
                    </div>
                </div>
            `;
        });

        // Update markers if map view is active
        if (state.categoryViewMode === 'map') {
            updateMapMarkers(false);
        }

    } catch (e) {
        console.error(e);
        listContainer.innerHTML = `<p class="error">Failed to load properties.</p>`;
    }
}

function showMockPropertyDetails(item) {
    let footerHtml = '';
    if (!state.user) {
        footerHtml = `<p class="alert-p">Please <a href="#" onclick="closeModal(); switchView('viewLogin'); setLoginRole('tenant');">log in as a Tenant</a> to inquire.</p>`;
    } else if (state.role === 'tenant') {
        footerHtml = `<button class="btn btn-primary" onclick="closeModal(); showToast('Inquiry sent for ${item.title}!', 'success')">Send Inquiry</button>`;
    }
    
    const rating = (4.5 + (item.id % 5) * 0.1).toFixed(1);
    const reviewsCount = 10 + (item.id % 12) * 8;

    const bodyHtml = `
        <div class="detail-row"><strong>Rating & Reviews:</strong> <span style="color:#f59e0b; font-weight:700;">⭐ ${rating} <span style="color:var(--text-muted); font-weight:500; font-size:0.9rem; margin-left:3px;">(${reviewsCount} reviews)</span></span></div>
        <div class="detail-row"><strong>Title:</strong> <span>${item.title}</span></div>
        <div class="detail-row"><strong>Subtype:</strong> <span>${item.subtype}</span></div>
        <div class="detail-row"><strong>Price:</strong> <span>₹${item.price} / month</span></div>
        <div class="detail-row"><strong>Status:</strong> <span class="status-badge available">${item.status}</span></div>
        <hr>
        <div class="detail-row"><strong>Location:</strong> <span>${item.address}</span></div>
        <div class="detail-row"><strong>City:</strong> <span>${item.city}</span></div>
        <div class="detail-row"><strong>Details:</strong> <span>Beautiful ${item.subtype.toLowerCase()} in a prime neighborhood. Features modern designs, high-end amenities, and zero brokerage fee.</span></div>
        <div class="modal-footer" style="margin-top: 20px;">
            ${footerHtml}
        </div>
    `;
    showModal(item.title, bodyHtml);
}

function applyCategoryFilters() {
    loadCategoryProperties();
}

function resetCategoryFilters() {
    document.getElementById('categorySearchInput').value = '';
    document.getElementById('categoryTypeSelect').value = '';
    document.getElementById('categoryMinPrice').value = '';
    document.getElementById('categoryMaxPrice').value = '';
    loadCategoryProperties();
}

function getMockPropertiesForCategory(category) {
    if (category === 'houses') {
        return [
            { id: 101, title: "Sunset Luxury Villa", subtype: "Villas", price: 290500, rooms: 5, status: "Available", address: "124 Palm Avenue, Koramangala", city: "Bangalore", isReal: false, lat: 12.9300, lng: 77.6200 },
            { id: 102, title: "Golden Duplex Residence", subtype: "Duplex Houses", price: 207500, rooms: 4, status: "Available", address: "456 Silver Oak Lane, Indiranagar", city: "Bangalore", isReal: false, lat: 12.9750, lng: 77.6440 },
            { id: 103, title: "Evergreen Row House", subtype: "Row Houses", price: 149400, rooms: 3, status: "Available", address: "789 Magnolia Crescent, HSR Layout", city: "Bangalore", isReal: false, lat: 12.9150, lng: 77.6480 },
            { id: 104, title: "Oakridge Independent Home", subtype: "Independent Homes", price: 182600, rooms: 4, status: "Available", address: "101 Royal Park, Jayanagar", city: "Bangalore", isReal: false, lat: 12.9250, lng: 77.5900 },
            { id: 105, title: "The Grand Estate", subtype: "Luxury Residences", price: 456500, rooms: 6, status: "Available", address: "500 Lakeview Enclave, Sadashivanagar", city: "Bangalore", isReal: false, lat: 12.9800, lng: 77.5800 }
        ];
    } else if (category === 'commercial') {
        return [
            { id: 201, title: "Metro Central Office Space", subtype: "Office Spaces", price: 373500, rooms: 5, status: "Available", address: "88 Outer Ring Road, Manyata Tech Park", city: "Bangalore", isReal: false, lat: 13.0450, lng: 77.6250 },
            { id: 202, title: "Downtown Retail Shop", subtype: "Shops", price: 249000, rooms: 2, status: "Available", address: "200 MG Road, Brigade Road Corner", city: "Bangalore", isReal: false, lat: 12.9740, lng: 77.6110 },
            { id: 203, title: "Premium Brand Showroom", subtype: "Showrooms", price: 498000, rooms: 3, status: "Available", address: "50 Residency Road", city: "Bangalore", isReal: false, lat: 12.9700, lng: 77.6100 },
            { id: 204, title: "Industrial Logistics Warehouse", subtype: "Warehouses", price: 664000, rooms: 1, status: "Available", address: "500 Phase II, Electronic City", city: "Bangalore", isReal: false, lat: 12.8500, lng: 77.6600 },
            { id: 205, title: "Apex Co-working Space", subtype: "Co-working Spaces", price: 207500, rooms: 4, status: "Available", address: "10 80 Feet Road, Koramangala", city: "Bangalore", isReal: false, lat: 12.9340, lng: 77.6150 }
        ];
    } else if (category === 'plots') {
        return [
            { id: 301, title: "Greenfield Residential Plot", subtype: "Residential Plots", price: 99600, rooms: 0, status: "Available", address: "Sector 4, HSR Layout", city: "Bangalore", isReal: false, lat: 12.9100, lng: 77.6400 },
            { id: 302, title: "Downtown Commercial Land", subtype: "Commercial Plots", price: 415000, rooms: 0, status: "Available", address: "Commercial Street, Shivaji Nagar", city: "Bangalore", isReal: false, lat: 12.9820, lng: 77.6050 },
            { id: 303, title: "Sunny Valley Agricultural Land", subtype: "Agricultural Land", price: 66400, rooms: 0, status: "Available", address: "Devanahalli Outskirts", city: "Bangalore", isReal: false, lat: 13.2500, lng: 77.7100 },
            { id: 304, title: "Northside Industrial Plot", subtype: "Industrial Land", price: 332000, rooms: 0, status: "Available", address: "Peenya Industrial Area", city: "Bangalore", isReal: false, lat: 13.0300, lng: 77.5300 },
            { id: 305, title: "Lakeview Investment Plot", subtype: "Investment Plots", price: 124500, rooms: 0, status: "Available", address: "Hebbal Lake Enclave", city: "Bangalore", isReal: false, lat: 13.0350, lng: 77.5900 }
        ];
    }
    return [];
}

// SWITCH DASHBOARD TABS
function switchDashTab(role, tabName) {
    state.activeDashTabs[role] = tabName;
    
    // Deactivate all tabs in this container
    document.querySelectorAll(`#view${capitalize(role)}Dashboard .dash-tab`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Deactivate all panels in this container
    document.querySelectorAll(`#view${capitalize(role)}Dashboard .dash-panel`).forEach(panel => {
        panel.classList.add('hidden');
        panel.classList.remove('active');
    });

    // Get active button based on onclick attribute or text
    const activeBtn = Array.from(document.querySelectorAll(`#view${capitalize(role)}Dashboard .dash-tab`)).find(btn => btn.getAttribute('onclick').includes(tabName));
    if (activeBtn) activeBtn.classList.add('active');

    const activePanel = document.getElementById(`${role}-${tabName}`);
    if (activePanel) {
        activePanel.classList.remove('hidden');
        activePanel.classList.add('active');
    }
}

// LOG IN & REGISTER ROLE SELECTORS
// State holders for active OTP session
let activeOtpIdentifier = '';
let activeOtpRole = '';
let verifiedOtpCode = '';
let otpInterval = null;
let otpCountdownSeconds = 30;

function showStandardFlow(e) {
    if (e) e.preventDefault();
    clearInterval(otpInterval);
    document.getElementById('loginStandardFlow').style.display = 'block';
    document.getElementById('loginStandardFlow').classList.remove('hidden');
    
    document.getElementById('loginOtpFlow').style.display = 'none';
    document.getElementById('loginOtpFlow').classList.add('hidden');
    
    document.getElementById('loginForgotFlow').style.display = 'none';
    document.getElementById('loginForgotFlow').classList.add('hidden');
    
    document.getElementById('authTabsContainer').style.display = 'flex';
    document.getElementById('authTabsContainer').classList.remove('hidden');
}

function showOtpFlow(e) {
    if (e) e.preventDefault();
    clearInterval(otpInterval);
    
    const label = document.getElementById('otpSendIdentifierLabel');
    const input = document.getElementById('otpSendIdentifier');
    if (state.loginRole === 'manager') {
        label.innerText = 'Registration Number';
        input.placeholder = 'Enter Registration Number';
        input.type = 'text';
    } else {
        label.innerText = 'Email Address';
        input.placeholder = 'name@email.com';
        input.type = 'email';
    }
    input.value = '';
    
    document.getElementById('loginStandardFlow').style.display = 'none';
    document.getElementById('loginStandardFlow').classList.add('hidden');
    
    document.getElementById('loginOtpFlow').style.display = 'block';
    document.getElementById('loginOtpFlow').classList.remove('hidden');
    
    document.getElementById('otpSendSection').style.display = 'block';
    document.getElementById('otpSendSection').classList.remove('hidden');
    
    document.getElementById('otpVerifySection').style.display = 'none';
    document.getElementById('otpVerifySection').classList.add('hidden');
    
    document.getElementById('loginForgotFlow').style.display = 'none';
    document.getElementById('loginForgotFlow').classList.add('hidden');
    
    document.getElementById('authTabsContainer').style.display = 'none';
    document.getElementById('authTabsContainer').classList.add('hidden');
}

function showForgotPasswordFlow(e) {
    if (e) e.preventDefault();
    clearInterval(otpInterval);
    
    const label = document.getElementById('forgotSendIdentifierLabel');
    const input = document.getElementById('forgotSendIdentifier');
    if (state.loginRole === 'manager') {
        label.innerText = 'Registration Number';
        input.placeholder = 'Enter Registration Number';
        input.type = 'text';
    } else {
        label.innerText = 'Email Address';
        input.placeholder = 'name@email.com';
        input.type = 'email';
    }
    input.value = '';
    
    document.getElementById('loginStandardFlow').style.display = 'none';
    document.getElementById('loginStandardFlow').classList.add('hidden');
    
    document.getElementById('loginForgotFlow').style.display = 'block';
    document.getElementById('loginForgotFlow').classList.remove('hidden');
    
    document.getElementById('forgotSendSection').style.display = 'block';
    document.getElementById('forgotSendSection').classList.remove('hidden');
    
    document.getElementById('forgotVerifySection').style.display = 'none';
    document.getElementById('forgotVerifySection').classList.add('hidden');
    
    document.getElementById('forgotResetSection').style.display = 'none';
    document.getElementById('forgotResetSection').classList.add('hidden');
    
    document.getElementById('loginOtpFlow').style.display = 'none';
    document.getElementById('loginOtpFlow').classList.add('hidden');
    
    document.getElementById('authTabsContainer').style.display = 'none';
    document.getElementById('authTabsContainer').classList.add('hidden');
}

async function handleSendOtp(flowType) {
    const inputId = flowType === 'login' ? 'otpSendIdentifier' : 'forgotSendIdentifier';
    const identifier = document.getElementById(inputId).value.trim();
    if (!identifier) {
        showToast(state.loginRole === 'manager' ? 'Registration Number is required.' : 'Email Address is required.', 'error');
        return;
    }
    
    const requestBody = { role: state.loginRole };
    if (state.loginRole === 'manager') {
        requestBody.registrationNumber = identifier;
    } else {
        requestBody.email = identifier;
    }
    
    try {
        const response = await apiCall('/api/auth/send-otp', 'POST', requestBody);
        showToast('OTP sent successfully.');
        
        activeOtpIdentifier = identifier;
        activeOtpRole = state.loginRole;
        
        console.log(`[PMS OTP] Generated code: ${response.otp}`);
        
        if (flowType === 'login') {
            document.getElementById('otpSendSection').style.display = 'none';
            document.getElementById('otpSendSection').classList.add('hidden');
            
            document.getElementById('otpVerifySection').style.display = 'block';
            document.getElementById('otpVerifySection').classList.remove('hidden');
            document.getElementById('otpVerifyCode').value = '';
        } else {
            document.getElementById('forgotSendSection').style.display = 'none';
            document.getElementById('forgotSendSection').classList.add('hidden');
            
            document.getElementById('forgotVerifySection').style.display = 'block';
            document.getElementById('forgotVerifySection').classList.remove('hidden');
            document.getElementById('forgotVerifyCode').value = '';
        }
        
        startOtpTimer(flowType);
    } catch(err) {}
}

function startOtpTimer(flowType) {
    clearInterval(otpInterval);
    otpCountdownSeconds = 30;
    
    const countSpan = document.getElementById(flowType === 'login' ? 'otpCountdown' : 'forgotCountdown');
    const timerWrap = document.getElementById(flowType === 'login' ? 'otpTimerText' : 'forgotTimerText');
    const resendLink = document.getElementById(flowType === 'login' ? 'otpResendLink' : 'forgotResendLink');
    
    countSpan.innerText = otpCountdownSeconds;
    timerWrap.style.display = 'inline';
    timerWrap.classList.remove('hidden');
    resendLink.style.display = 'none';
    resendLink.classList.add('hidden');
    
    otpInterval = setInterval(() => {
        otpCountdownSeconds--;
        countSpan.innerText = otpCountdownSeconds;
        if (otpCountdownSeconds <= 0) {
            clearInterval(otpInterval);
            timerWrap.style.display = 'none';
            timerWrap.classList.add('hidden');
            resendLink.style.display = 'inline';
            resendLink.classList.remove('hidden');
        }
    }, 1000);
}

async function resendOtp(e, flowType) {
    if (e) e.preventDefault();
    
    const requestBody = { role: activeOtpRole };
    if (activeOtpRole === 'manager') {
        requestBody.registrationNumber = activeOtpIdentifier;
    } else {
        requestBody.email = activeOtpIdentifier;
    }
    
    try {
        const response = await apiCall('/api/auth/send-otp', 'POST', requestBody);
        showToast('OTP sent successfully.');
        console.log(`[PMS OTP] Generated code: ${response.otp}`);
        startOtpTimer(flowType);
    } catch(err) {}
}

async function handleVerifyOtp(flowType) {
    const codeId = flowType === 'login' ? 'otpVerifyCode' : 'forgotVerifyCode';
    const otp = document.getElementById(codeId).value.trim();
    if (!otp || otp.length !== 6) {
        showToast('Please enter a 6-digit OTP code.', 'error');
        return;
    }
    
    const requestBody = {
        role: activeOtpRole,
        otp,
        flow: flowType
    };
    if (activeOtpRole === 'manager') {
        requestBody.registrationNumber = activeOtpIdentifier;
    } else {
        requestBody.email = activeOtpIdentifier;
    }
    
    try {
        if (flowType === 'login') {
            const response = await apiCall('/api/auth/verify-otp', 'POST', requestBody);
            clearInterval(otpInterval);
            
            state.user = response.user;
            state.role = response.role;
            localStorage.setItem('user', JSON.stringify(state.user));
            localStorage.setItem('role', state.role);
            
            showToast('Login successful!');
            setLoggedInUI(true);
            
            showStandardFlow();
            initApp();
        } else {
            await apiCall('/api/auth/verify-otp', 'POST', requestBody);
            clearInterval(otpInterval);
            
            verifiedOtpCode = otp;
            
            document.getElementById('forgotVerifySection').style.display = 'none';
            document.getElementById('forgotVerifySection').classList.add('hidden');
            
            document.getElementById('forgotResetSection').style.display = 'block';
            document.getElementById('forgotResetSection').classList.remove('hidden');
            document.getElementById('forgotNewPassword').value = '';
            document.getElementById('forgotConfirmPassword').value = '';
        }
    } catch(err) {}
}

async function handleResetPassword() {
    const newPwd = document.getElementById('forgotNewPassword').value;
    const confirmPwd = document.getElementById('forgotConfirmPassword').value;
    
    if (!newPwd || newPwd.length < 8) {
        showToast('New password must be at least 8 characters long.', 'error');
        return;
    }
    if (newPwd !== confirmPwd) {
        showToast('Passwords do not match.', 'error');
        return;
    }
    
    const requestBody = {
        role: activeOtpRole,
        otp: verifiedOtpCode,
        newPassword: newPwd
    };
    if (activeOtpRole === 'manager') {
        requestBody.registrationNumber = activeOtpIdentifier;
    } else {
        requestBody.email = activeOtpIdentifier;
    }
    
    try {
        await apiCall('/api/auth/reset-password', 'POST', requestBody);
        showToast('Password reset successfully! Please log in.');
        showStandardFlow();
    } catch(err) {}
}

// LOG IN & REGISTER ROLE SELECTORS
function setLoginRole(role) {
    state.loginRole = role;
    
    showStandardFlow();
    
    const tabsContainer = document.getElementById('authTabsContainer');
    const tabTenant = document.getElementById('btnTabTenant');
    const tabOwner = document.getElementById('btnTabOwner');
    const tabManager = document.getElementById('btnTabManager');
    
    if (role === 'manager') {
        if (tabsContainer) tabsContainer.style.display = 'none';
    } else {
        if (tabsContainer) tabsContainer.style.display = 'flex';
        if (tabManager) tabManager.style.display = 'none';
        if (tabTenant) tabTenant.style.display = 'inline-block';
        if (tabOwner) tabOwner.style.display = 'inline-block';
    }
    
    document.querySelectorAll('#viewLogin .auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tabBtn = document.getElementById(
        role === 'tenant' ? 'btnTabTenant' : (role === 'manager' ? 'btnTabManager' : 'btnTabOwner')
    );
    if (tabBtn) tabBtn.classList.add('active');

    document.getElementById('loginTitle').innerText = translate(role + '_login');

    const nameGroup = document.getElementById('loginNameGroup');
    const emailGroup = document.getElementById('loginEmailGroup');
    const regGroup = document.getElementById('loginRegGroup');
    const extraLinks = document.getElementById('authExtraLinks');

    if (role === 'tenant') {
        nameGroup.style.display = 'block';
        nameGroup.classList.remove('hidden');
        document.getElementById('loginName').required = true;
    } else {
        nameGroup.style.display = 'none';
        nameGroup.classList.add('hidden');
        document.getElementById('loginName').required = false;
    }

    if (role === 'manager') {
        emailGroup.style.display = 'none';
        emailGroup.classList.add('hidden');
        document.getElementById('loginEmail').required = false;
        
        regGroup.style.display = 'block';
        regGroup.classList.remove('hidden');
        document.getElementById('loginRegNum').required = true;
    } else {
        emailGroup.style.display = 'block';
        emailGroup.classList.remove('hidden');
        document.getElementById('loginEmail').required = (role === 'tenant' || role === 'owner');
        
        regGroup.style.display = 'none';
        regGroup.classList.add('hidden');
        document.getElementById('loginRegNum').required = false;
    }
    
    if (role === 'tenant') {
        extraLinks.style.display = 'none';
        extraLinks.classList.add('hidden');
    } else {
        extraLinks.style.display = 'flex';
        extraLinks.classList.remove('hidden');
    }

    const footer = document.getElementById('loginFooter');
    if (role === 'tenant') {
        footer.innerHTML = `<span>Don't have a Tenant account?</span> <a href="#" onclick="switchView('viewRegister')">${translate('tenant_reg')}</a>`;
    } else {
        footer.innerHTML = ``;
    }
}

function setRegisterRole(role) {
    state.registerRole = role;
    document.querySelectorAll('#viewRegister .auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tabBtn = Array.from(document.querySelectorAll('#viewRegister .auth-tab-btn')).find(btn => btn.getAttribute('onclick').includes(role));
    if (tabBtn) tabBtn.classList.add('active');

    document.getElementById('registerTitle').innerText = translate(role + '_reg');
}

// THEME TOGGLE
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const toggleIcon = document.querySelector('#themeToggle .theme-icon');
    if (toggleIcon) {
        toggleIcon.innerText = state.theme === 'dark' ? '☀️' : '🌙';
    }
}

// LOCALIZATION APPLY
function applyLocale() {
    document.querySelectorAll('[data-local]').forEach(el => {
        const key = el.getAttribute('data-local');
        el.innerText = translate(key);
    });
}

function translate(key) {
    const localeDict = translations[state.locale] || translations['en'];
    return localeDict[key] || translations['en'][key] || key;
}

// DYNAMIC NAVBAR UPDATE
function updateNavbarMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.innerHTML = '';

    if (!state.user) {
        navMenu.innerHTML = `
            <li><a href="#" onclick="switchView('viewHome')" class="${state.activeView === 'viewHome' ? 'active' : ''}">Home</a></li>
            <li><a href="#" onclick="switchView('viewLogin'); setLoginRole('tenant');" class="${state.activeView === 'viewLogin' && state.loginRole === 'tenant' ? 'active' : ''}">${translate('tenant_login')}</a></li>
            <li><a href="#" onclick="switchView('viewLogin'); setLoginRole('owner');" class="${state.activeView === 'viewLogin' && state.loginRole === 'owner' ? 'active' : ''}">${translate('owner_login')}</a></li>
        `;
    } else {
        const capRole = capitalize(state.role);
        navMenu.innerHTML = `
            <li><a href="#" onclick="switchView('view${capRole}Dashboard')" class="active">${translate('dashboard')}</a></li>
        `;
    }
}

// TOAST NOTIFICATIONS
function showToast(message, type = 'success') {
    const toast = document.getElementById('notification');
    toast.className = `notification ${type}`;
    toast.innerText = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// UTILITIES
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setLoggedInUI(isLoggedIn) {
    const userInfo = document.getElementById('userInfo');
    const navPmBtn = document.getElementById('navPMLoginBtn');
    
    if (isLoggedIn && state.user) {
        userInfo.classList.remove('hidden');
        document.getElementById('userChipName').innerText = `${state.user.name} (${capitalize(state.role)})`;
        if (navPmBtn) navPmBtn.style.display = 'none';
    } else {
        userInfo.classList.add('hidden');
        if (navPmBtn) navPmBtn.style.display = 'block';
    }
    updateNavbarMenu();
}

// FETCH HELPER
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Accept-Language': state.locale,
        'Content-Type': 'application/json'
    };
    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(endpoint, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'An error occurred.');
        }
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// ==================== AUTH CONTROLLERS ====================
async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    
    const payload = {
        role: state.loginRole,
        password
    };
    
    if (state.loginRole === 'manager') {
        payload.registrationNumber = document.getElementById('loginRegNum').value.trim();
        if (!payload.registrationNumber) {
            showToast('Registration Number is required.', 'error');
            return;
        }
    } else {
        payload.email = document.getElementById('loginEmail').value.trim();
        if (!payload.email) {
            showToast('Email is required.', 'error');
            return;
        }
        if (state.loginRole === 'tenant') {
            payload.name = document.getElementById('loginName').value.trim();
            if (!payload.name) {
                showToast('Name is required.', 'error');
                return;
            }
        }
    }
    
    try {
        const data = await apiCall('/api/auth/login', 'POST', payload);
        
        state.user = data.user;
        state.role = data.role;
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('role', state.role);
        
        showToast('Login successful!');
        setLoggedInUI(true);
        
        // Reset forms
        document.getElementById('loginForm').reset();
        
        initApp();
    } catch(e) {}
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phoneNumber = document.getElementById('regPhone').value;

    try {
        await apiCall(`/api/auth/register/${state.registerRole}`, 'POST', {
            name, email, password, phoneNumber
        });
        showToast('Registration successful! Please log in.');
        document.getElementById('registerForm').reset();
        switchView('viewLogin');
        setLoginRole(state.registerRole);
    } catch(e) {}
}

function logout() {
    state.user = null;
    state.role = null;
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    showToast('Logged out successfully.');
    setLoggedInUI(false);
    switchView('viewHome');
    loadHome();
}

async function deleteAccount(role) {
    if (!confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;
    
    const userId = state.user[`${role}Id`];
    try {
        await apiCall(`/api/${role}s/${userId}`, 'DELETE');
        showToast('Account deleted successfully.');
        logout();
    } catch (e) {}
}

// ==================== PUBLIC HOME PAGE ====================
async function loadHome(search = '') {
    // 1. Load Analytics
    try {
        const analytics = await apiCall('/api/analytics/occupancy');
        const metricsContainer = document.getElementById('homeAnalyticsMetrics');
        metricsContainer.innerHTML = '';
        
        analytics.metrics.forEach(m => {
            metricsContainer.innerHTML += `
                <div class="metric-row">
                    <span class="metric-label">${m.label}</span>
                    <span class="metric-value">${m.value}</span>
                </div>
            `;
        });
    } catch(e) {
        document.getElementById('homeAnalyticsMetrics').innerHTML = `<p class="error">Failed to load analytics.</p>`;
    }

    // 2. Load Available Apartments
    try {
        let endpoint = '/api/apartments?status=Available';
        if (search) {
            endpoint += `&search=${encodeURIComponent(search)}`;
        }
        const response = await apiCall(endpoint);
        const apts = response.data;
        state.currentHomeProperties = apts; // Save to state for map display
        const listContainer = document.getElementById('homeApartmentsList');
        listContainer.innerHTML = '';
        
        if (apts.length === 0) {
            listContainer.innerHTML = `<p class="no-records-p">${translate('no_records')}</p>`;
            if (state.homeViewMode === 'map') {
                updateMapMarkers(true);
            }
            return;
        }

        apts.slice(0, 2).forEach(apt => {
            const cardImgUrl = getBuildingImage(apt);
            const ratingVal = (4.5 + (apt.apartmentId % 5) * 0.1).toFixed(1);
            listContainer.innerHTML += `
                <div class="apt-card glass" data-id="${apt.apartmentId}" style="background-image: url('${cardImgUrl}');" onclick="handleCardClick(event, ${apt.apartmentId}, true, null, true)">
                    <div class="apt-card-overlay"></div>
                    <div class="apt-card-header">
                        <span class="apt-badge">Apt ${apt.apartmentNo}</span>
                        <span style="color:#f59e0b; font-weight:700; font-size:0.82rem; background:rgba(0,0,0,0.5); padding:3px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:3px; z-index:2;">⭐ ${ratingVal}</span>
                        <span class="apt-price">₹${apt.price}/mo</span>
                    </div>
                    <div class="apt-address">${apt.buildingAddress}, ${apt.buildingCity}</div>
                    <div class="apt-details">
                        <span>🛏️ ${apt.nbRooms} ${translate('rooms')}</span>
                        <span class="status-badge available">${apt.status}</span>
                    </div>
                    <div class="apt-tags">
                        <span class="zero-brokerage-badge">Zero Brokerage</span>
                        <span class="verified-owner-badge">✓ Verified Owner</span>
                    </div>
                </div>
            `;
        });

        // Update markers if map view is active
        if (state.homeViewMode === 'map') {
            updateMapMarkers(true);
        }
    } catch(e) {
        document.getElementById('homeApartmentsList').innerHTML = `<p class="error">Failed to load apartments.</p>`;
    }
}

// APARTMENT DETAILS MODAL (Public/Tenant view)
async function showApartmentDetails(apartmentId) {
    try {
        const response = await apiCall(`/api/apartments/${apartmentId}`);
        const apt = response.data;
        
        let footerText = '';
        if (!state.user) {
            footerText = `<p class="alert-p">Please <a href="#" onclick="closeModal(); switchView('viewLogin'); setLoginRole('tenant');">log in as a Tenant</a> to book an appointment.</p>`;
        } else if (state.role === 'tenant') {
            footerText = `<button class="btn btn-primary" onclick="closeModal(); openCreateAppointmentModal(${apt.managerId})">Book Appointment</button>`;
        }

        const rating = (4.5 + (apartmentId % 5) * 0.1).toFixed(1);
        const reviewsCount = 10 + (apartmentId % 12) * 8;

        const bodyHtml = `
            <div class="detail-row"><strong>Rating & Reviews:</strong> <span style="color:#f59e0b; font-weight:700;">⭐ ${rating} <span style="color:var(--text-muted); font-weight:500; font-size:0.9rem; margin-left:3px;">(${reviewsCount} reviews)</span></span></div>
            <div class="detail-row"><strong>Apartment No:</strong> <span>${apt.apartmentNo}</span></div>
            <div class="detail-row"><strong>Rooms:</strong> <span>${apt.nbRooms}</span></div>
            <div class="detail-row"><strong>Price:</strong> <span>₹${apt.price} / month</span></div>
            <div class="detail-row"><strong>Status:</strong> <span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span></div>
            <hr>
            <div class="detail-row"><strong>Building Address:</strong> <span>${apt.buildingAddress}</span></div>
            <div class="detail-row"><strong>City/Province:</strong> <span>${apt.buildingCity}, ${apt.buildingProvince}</span></div>
            <div class="detail-row"><strong>Postal Code:</strong> <span>${apt.buildingPostalCode}</span></div>
            <hr>
            ${footerText}
        `;
        showModal(`Apartment ${apt.apartmentNo} Details`, bodyHtml);
    } catch (e) {}
}

// ==================== OWNER DASHBOARD CONTROLLERS ====================
function loadOwnerDashboard() {
    // Prefill profile
    document.getElementById('ownerProfName').value = state.user.name;
    document.getElementById('ownerProfEmail').value = state.user.email;
    document.getElementById('ownerProfPhone').value = state.user.phoneNumber;
    
    // Switch to active tab
    switchDashTab('owner', state.activeDashTabs.owner);
    
    loadOwnerManagers();
    loadOwnerTenants();
    loadOwnerBuildings();
    loadOwnerApartments();
    loadOwnerMessages();
    loadOwnerEvents();
}

async function loadOwnerManagers() {
    try {
        const response = await apiCall('/api/managers');
        const list = response.data;
        const tbody = document.querySelector('#ownerManagersTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(m => {
            tbody.innerHTML += `
                <tr>
                    <td>${m.name}</td>
                    <td>${m.email}</td>
                    <td>${m.phoneNumber}</td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="openEditManagerModal(${m.managerId})">${translate('edit')}</button>
                        <button class="btn btn-danger btn-small" onclick="deleteManager(${m.managerId})">${translate('delete')}</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadOwnerTenants(search = '') {
    try {
        let endpoint = '/api/tenants';
        if (search) endpoint += `?search=${encodeURIComponent(search)}`;
        const response = await apiCall(endpoint);
        const list = response.data;
        const tbody = document.querySelector('#ownerTenantsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td>${t.name}</td>
                    <td>${t.email}</td>
                    <td>${t.phoneNumber}</td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="openEditTenantModal(${t.tenantId})">${translate('edit')}</button>
                        <button class="btn btn-danger btn-small" onclick="deleteTenant(${t.tenantId})">${translate('delete')}</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadOwnerBuildings() {
    try {
        const response = await apiCall(`/api/buildings?owner_id=${state.user.ownerId}`);
        const list = response.data;
        const tbody = document.querySelector('#ownerBuildingsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(b => {
            tbody.innerHTML += `
                <tr>
                    <td>${b.address}</td>
                    <td>${b.city}</td>
                    <td>${b.province}</td>
                    <td>${b.postalCode}</td>
                    <td>${b.managerName || 'N/A'}</td>
                    <td>${b.totalApartments}</td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadOwnerApartments() {
    try {
        const response = await apiCall(`/api/apartments?owner_id=${state.user.ownerId}`);
        const list = response.data;
        const tbody = document.querySelector('#ownerApartmentsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(a => {
            tbody.innerHTML += `
                <tr>
                    <td>Apt ${a.apartmentNo}</td>
                    <td>${a.buildingAddress}</td>
                    <td>${a.nbRooms}</td>
                    <td>₹${a.price}</td>
                    <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
                    <td>${a.tenantName || 'None'}</td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadOwnerMessages() {
    try {
        const response = await apiCall(`/api/messages/owner?owner_id=${state.user.ownerId}`);
        const list = response.data;
        const container = document.getElementById('ownerMessagesList');
        container.innerHTML = '';
        
        if (list.length === 0) {
            container.innerHTML = `<p>${translate('no_records')}</p>`;
            return;
        }

        list.forEach(m => {
            const replySection = m.responseMessage 
                ? `<div class="msg-reply"><strong>Reply from ${m.managerName}:</strong> ${m.responseMessage}</div>`
                : `<div class="reply-pending">Awaiting response...</div>`;
                
            container.innerHTML += `
                <div class="message-card glass">
                    <div class="msg-header">
                        <span>To: ${m.managerName}</span>
                        <button class="btn btn-outline btn-small" onclick="deleteMessage('owner', ${m.messageId})">Delete</button>
                    </div>
                    <div class="msg-body">${m.message}</div>
                    ${replySection}
                </div>
            `;
        });
    } catch(e) {}
}

async function loadOwnerEvents() {
    try {
        const response = await apiCall(`/api/events?owner_id=${state.user.ownerId}`);
        const list = response.data;
        const tbody = document.querySelector('#ownerEventsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(e => {
            tbody.innerHTML += `
                <tr>
                    <td>Apt ${e.apartmentNo}</td>
                    <td>${e.buildingAddress}</td>
                    <td>${e.managerName}</td>
                    <td>${e.description}</td>
                    <td>${e.eventDate}</td>
                    <td><span class="status-badge ${e.status.toLowerCase()}">${e.status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="resolveEvent(${e.eventId}, '${e.status}')">Resolve</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function resolveEvent(eventId, currentStatus) {
    const nextStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';
    try {
        await apiCall(`/api/events/${eventId}`, 'PUT', {
            role: 'owner',
            status: nextStatus
        });
        showToast(`Event status updated to ${nextStatus}.`);
        loadOwnerEvents();
    } catch (e) {}
}

// ==================== MANAGER DASHBOARD CONTROLLERS ====================
function loadManagerDashboard() {
    document.getElementById('mgrProfName').value = state.user.name;
    document.getElementById('mgrProfEmail').value = state.user.email;
    document.getElementById('mgrProfPhone').value = state.user.phoneNumber;

    switchDashTab('manager', state.activeDashTabs.manager);

    loadManagerBuildings();
    loadManagerApartments();
    loadManagerAppointments();
    loadManagerMessages();
    loadManagerEvents();
}

async function loadManagerBuildings() {
    try {
        const response = await apiCall(`/api/buildings?manager_id=${state.user.managerId}`);
        const list = response.data;
        const tbody = document.querySelector('#managerBuildingsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(b => {
            tbody.innerHTML += `
                <tr>
                    <td>${b.address}</td>
                    <td>${b.city}</td>
                    <td>${b.province}</td>
                    <td>${b.postalCode}</td>
                    <td>${b.ownerName}</td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="openEditBuildingModal(${b.buildingId})">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteBuilding(${b.buildingId})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadManagerApartments() {
    try {
        const response = await apiCall(`/api/apartments?manager_id=${state.user.managerId}`);
        const list = response.data;
        const tbody = document.querySelector('#managerApartmentsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(a => {
            tbody.innerHTML += `
                <tr>
                    <td>Apt ${a.apartmentNo}</td>
                    <td>${a.buildingAddress}</td>
                    <td>${a.nbRooms}</td>
                    <td>₹${a.price}</td>
                    <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
                    <td>${a.tenantName || 'None'}</td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="openEditApartmentModal(${a.apartmentId})">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteApartment(${a.apartmentId})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadManagerAppointments() {
    try {
        const response = await apiCall(`/api/appointments?manager_id=${state.user.managerId}`);
        const list = response.data;
        const tbody = document.querySelector('#managerAppointmentsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(a => {
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div style="font-weight: bold; margin-bottom: 2px;">${a.tenantName}</div>
                        <div style="font-size: 0.85em; color: var(--text-muted);">
                            ✉ ${a.tenantEmail || ''}<br>
                            📞 ${a.tenantPhone || ''}
                        </div>
                    </td>
                    <td>${a.appointmentDate}</td>
                    <td>${a.description}</td>
                    <td>
                        <button class="btn btn-danger btn-small" onclick="deleteAppointment(${a.appointmentId})">Cancel</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadManagerMessages() {
    // 1. Tenant messages
    try {
        const response = await apiCall(`/api/messages/manager?manager_id=${state.user.managerId}`);
        const list = response.data;
        const container = document.getElementById('managerTenantMessages');
        container.innerHTML = '';
        
        list.forEach(m => {
            const replyForm = `
                <div class="reply-form-box">
                    <input type="text" id="replyTenantMsg-${m.messageId}" placeholder="Type reply..." value="${m.responseMessage || ''}">
                    <button class="btn btn-primary btn-small" onclick="replyMessage('manager', ${m.messageId}, 'tenant')">Reply</button>
                </div>
            `;
            container.innerHTML += `
                <div class="message-card glass">
                    <div class="msg-header">From Tenant: ${m.tenantName}</div>
                    <div class="msg-body">${m.message}</div>
                    ${replyForm}
                </div>
            `;
        });
    } catch(e) {}

    // 2. Owner messages
    try {
        const response = await apiCall(`/api/messages/owner?manager_id=${state.user.managerId}`);
        const list = response.data;
        const container = document.getElementById('managerOwnerMessages');
        container.innerHTML = '';
        
        list.forEach(m => {
            const replyForm = `
                <div class="reply-form-box">
                    <input type="text" id="replyOwnerMsg-${m.messageId}" placeholder="Type reply..." value="${m.responseMessage || ''}">
                    <button class="btn btn-primary btn-small" onclick="replyMessage('manager', ${m.messageId}, 'owner')">Reply</button>
                </div>
            `;
            container.innerHTML += `
                <div class="message-card glass">
                    <div class="msg-header">From Owner: ${m.ownerName}</div>
                    <div class="msg-body">${m.message}</div>
                    ${replyForm}
                </div>
            `;
        });
    } catch(e) {}
}

async function replyMessage(role, messageId, target) {
    const inputId = target === 'tenant' ? `replyTenantMsg-${messageId}` : `replyOwnerMsg-${messageId}`;
    const val = document.getElementById(inputId).value;
    
    try {
        await apiCall(`/api/messages/${target}/${messageId}`, 'PUT', {
            role: 'manager',
            responseMessage: val
        });
        showToast('Reply saved successfully!');
        loadManagerMessages();
    } catch (e) {}
}

async function loadManagerEvents() {
    try {
        const response = await apiCall(`/api/events?manager_id=${state.user.managerId}`);
        const list = response.data;
        const tbody = document.querySelector('#managerEventsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(e => {
            tbody.innerHTML += `
                <tr>
                    <td>Apt ${e.apartmentNo}</td>
                    <td>${e.buildingAddress}</td>
                    <td>${e.ownerName}</td>
                    <td>${e.description}</td>
                    <td>${e.eventDate}</td>
                    <td><span class="status-badge ${e.status.toLowerCase()}">${e.status}</span></td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="openEditEventModal(${e.eventId})">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteEvent(${e.eventId})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

// ==================== TENANT DASHBOARD CONTROLLERS ====================
function loadTenantDashboard() {
    document.getElementById('tntProfName').value = state.user.name;
    document.getElementById('tntProfEmail').value = state.user.email;
    document.getElementById('tntProfPhone').value = state.user.phoneNumber;

    switchDashTab('tenant', state.activeDashTabs.tenant);

    loadTenantApartments();
    loadTenantAppointments();
    loadTenantMessages();
}

async function loadTenantApartments(search = '') {
    try {
        let endpoint = `/api/apartments?tenant_id=${state.user.tenantId}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        
        const response = await apiCall(endpoint);
        const list = response.data;
        const grid = document.getElementById('tenantApartmentsList');
        grid.innerHTML = '';

        list.forEach(apt => {
            const isAssigned = apt.tenantId === state.user.tenantId;
            const cardClass = isAssigned ? 'apt-card glass border-active' : 'apt-card glass';
            const actionText = isAssigned ? `<span class="assigned-label">★ Your Rented Apartment</span>` : '';
            const cardImgUrl = getBuildingImage(apt);
            
            grid.innerHTML += `
                <div class="${cardClass}" style="background-image: url('${cardImgUrl}');" onclick="showApartmentDetails(${apt.apartmentId})">
                    <div class="apt-card-overlay"></div>
                    <div class="apt-card-header">
                        <span class="apt-badge">Apt ${apt.apartmentNo}</span>
                        <span class="apt-price">₹${apt.price}/mo</span>
                    </div>
                    <div class="apt-address">${apt.buildingAddress}, ${apt.buildingCity}</div>
                    <div class="apt-details">
                        <span>🛏️ ${apt.nbRooms} Rooms</span>
                        <span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span>
                    </div>
                    <div class="apt-tags">
                        <span class="zero-brokerage-badge">Zero Brokerage</span>
                        <span class="verified-owner-badge">✓ Verified Owner</span>
                    </div>
                    ${actionText}
                </div>
            `;
        });
    } catch(e) {}
}

async function loadTenantAppointments() {
    try {
        const response = await apiCall(`/api/appointments?tenant_id=${state.user.tenantId}`);
        const list = response.data;
        const tbody = document.querySelector('#tenantAppointmentsTable tbody');
        tbody.innerHTML = '';
        
        list.forEach(a => {
            tbody.innerHTML += `
                <tr>
                    <td>${a.managerName}</td>
                    <td>${a.appointmentDate}</td>
                    <td>${a.description}</td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="openEditAppointmentModal(${a.appointmentId})">Reschedule</button>
                        <button class="btn btn-danger btn-small" onclick="deleteAppointment(${a.appointmentId})">Cancel</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function loadTenantMessages() {
    try {
        const response = await apiCall(`/api/messages/manager?tenant_id=${state.user.tenantId}`);
        const list = response.data;
        const container = document.getElementById('tenantMessagesList');
        container.innerHTML = '';
        
        list.forEach(m => {
            const replySection = m.responseMessage 
                ? `<div class="msg-reply"><strong>Reply from ${m.managerName}:</strong> ${m.responseMessage}</div>`
                : `<div class="reply-pending">Awaiting response from manager...</div>`;
                
            container.innerHTML += `
                <div class="message-card glass">
                    <div class="msg-header">
                        <span>To Manager: ${m.managerName}</span>
                        <div>
                            <button class="btn btn-outline btn-small" onclick="openEditMessageModal(${m.messageId}, '${m.message.replace(/'/g, "\\'")}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteMessage('tenant', ${m.messageId})">Delete</button>
                        </div>
                    </div>
                    <div class="msg-body">${m.message}</div>
                    ${replySection}
                </div>
            `;
        });
    } catch(e) {}
}

// ==================== PROFILE UPDATE HANDLER ====================
async function handleProfileUpdate(e, role) {
    e.preventDefault();
    const idField = `${role}Id`;
    const userId = state.user[idField];
    const name = document.getElementById(`${role === 'tenant' ? 'tnt' : role === 'manager' ? 'mgr' : 'owner'}ProfName`).value;
    const email = document.getElementById(`${role === 'tenant' ? 'tnt' : role === 'manager' ? 'mgr' : 'owner'}ProfEmail`).value;
    const phoneNumber = document.getElementById(`${role === 'tenant' ? 'tnt' : role === 'manager' ? 'mgr' : 'owner'}ProfPhone`).value;
    const password = document.getElementById(`${role === 'tenant' ? 'tnt' : role === 'manager' ? 'mgr' : 'owner'}ProfPassword`).value;

    const payload = { name, email, phoneNumber };
    if (password) {
        payload.password = password;
    }

    try {
        await apiCall(`/api/${role}s/${userId}`, 'PUT', payload);
        showToast('Profile updated successfully!');
        
        // Update user state
        state.user.name = name;
        state.user.email = email;
        state.user.phoneNumber = phoneNumber;
        localStorage.setItem('user', JSON.stringify(state.user));
        
        setLoggedInUI(true);
        
        // Reset password field
        document.getElementById(`${role === 'tenant' ? 'tnt' : role === 'manager' ? 'mgr' : 'owner'}ProfPassword`).value = '';
    } catch(e) {}
}

// ==================== GLOBAL MODAL WRAPPER ====================
function showModal(title, bodyHtml) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalContainer').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalContainer').classList.add('hidden');
}

// Close modal on click outside CARD
document.getElementById('modalContainer').addEventListener('click', (e) => {
    if (e.target.id === 'modalContainer') {
        closeModal();
    }
});

// ==================== CRUD OPERATIONS MODALS ====================

// --- MANAGER CRUD (by OWNER) ---
async function openCreateModal(type) {
    if (type === 'manager') {
        const bodyHtml = `
            <form id="createManagerForm" class="auth-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="newMgrName" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="newMgrEmail" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="newMgrPwd" required minlength="8">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="newMgrPhone" required placeholder="+1 555-555-5555">
                </div>
                <button type="submit" class="btn btn-primary btn-block">Save Manager</button>
            </form>
        `;
        showModal('Create New Manager', bodyHtml);
        
        document.getElementById('createManagerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await apiCall('/api/managers', 'POST', {
                    name: document.getElementById('newMgrName').value,
                    email: document.getElementById('newMgrEmail').value,
                    password: document.getElementById('newMgrPwd').value,
                    phoneNumber: document.getElementById('newMgrPhone').value
                });
                showToast('Manager created successfully.');
                closeModal();
                loadOwnerManagers();
            } catch(err) {}
        });
    }
}

async function openEditManagerModal(id) {
    try {
        const response = await apiCall(`/api/managers/${id}`);
        const m = response.data;
        
        const bodyHtml = `
            <form id="editManagerForm" class="auth-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="editMgrName" value="${m.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="editMgrEmail" value="${m.email}" required>
                </div>
                <div class="form-group">
                    <label>Password (leave blank to keep current)</label>
                    <input type="password" id="editMgrPwd" placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="editMgrPhone" value="${m.phoneNumber}" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Update Manager</button>
            </form>
        `;
        showModal('Edit Manager Details', bodyHtml);
        
        document.getElementById('editManagerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwd = document.getElementById('editMgrPwd').value;
            const payload = {
                name: document.getElementById('editMgrName').value,
                email: document.getElementById('editMgrEmail').value,
                phoneNumber: document.getElementById('editMgrPhone').value
            };
            if (pwd) payload.password = pwd;
            
            try {
                await apiCall(`/api/managers/${id}`, 'PUT', payload);
                showToast('Manager details updated.');
                closeModal();
                loadOwnerManagers();
            } catch(err) {}
        });
    } catch(e) {}
}

async function deleteManager(id) {
    if (!confirm('Are you sure you want to delete this manager?')) return;
    try {
        await apiCall(`/api/managers/${id}`, 'DELETE');
        showToast('Manager deleted.');
        loadOwnerManagers();
    } catch(e) {}
}

// --- TENANT CRUD (by OWNER) ---
async function openEditTenantModal(id) {
    try {
        const response = await apiCall(`/api/tenants/${id}`);
        const t = response.data;
        
        const bodyHtml = `
            <form id="editTenantForm" class="auth-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="editTntName" value="${t.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="editTntEmail" value="${t.email}" required>
                </div>
                <div class="form-group">
                    <label>Password (leave blank to keep current)</label>
                    <input type="password" id="editTntPwd" placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="editTntPhone" value="${t.phoneNumber}" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Update Tenant</button>
            </form>
        `;
        showModal('Edit Tenant Details', bodyHtml);
        
        document.getElementById('editTenantForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwd = document.getElementById('editTntPwd').value;
            const payload = {
                name: document.getElementById('editTntName').value,
                email: document.getElementById('editTntEmail').value,
                phoneNumber: document.getElementById('editTntPhone').value
            };
            if (pwd) payload.password = pwd;
            
            try {
                await apiCall(`/api/tenants/${id}`, 'PUT', payload);
                showToast('Tenant details updated.');
                closeModal();
                loadOwnerTenants();
            } catch(err) {}
        });
    } catch(e) {}
}

async function deleteTenant(id) {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    try {
        await apiCall(`/api/tenants/${id}`, 'DELETE');
        showToast('Tenant deleted.');
        loadOwnerTenants();
    } catch(e) {}
}

// --- BUILDINGS CRUD (by MANAGER) ---
async function openCreateBuildingModal() {
    try {
        // Fetch all owners to populate owner dropdown
        const ownersRes = await fetch('/api/tenants'); // We fetch from tenants/owners
        // Let's get owners list from database
        const dbOwners = await apiCall('/api/auth/login?role=owner'); // Wait, we can fetch list using database or custom queries
        // Let's query owners list by fetching from API or custom endpoint. Since owners endpoint doesn't exist, let's select owners
    } catch(e) {}
    
    // Let's do it clean: fetch managers and owners
    let managersOptions = '';
    let ownersOptions = '';
    
    try {
        const mgrs = await apiCall('/api/managers');
        mgrs.data.forEach(m => {
            managersOptions += `<option value="${m.managerId}" ${m.managerId === state.user.managerId ? 'selected':''}>${m.name}</option>`;
        });
        
        // C# project has owners list in DB. Let's fetch owners
        // In this project we fetch all tenants for dropdown, wait, we fetch owners from DB
        // Let's create building with managerId automatically from logged-in manager
        // We need an owner dropdown: we can fetch owners
        const ownersRes = await apiCall('/api/tenants'); // Fallback list or query owners
        // Wait, let's write a database fetch directly to return owners list if needed. Or we can select owners:
        // Actually, we can fetch all buildings/apartments database objects.
    } catch(e) {}

    // Let's create an input form
    const bodyHtml = `
        <form id="createBuildingForm" class="auth-form">
            <div class="form-group">
                <label>Address</label>
                <input type="text" id="newBldAddr" required>
            </div>
            <div class="form-group">
                <label>City</label>
                <input type="text" id="newBldCity" required>
            </div>
            <div class="form-group">
                <label>Province</label>
                <input type="text" id="newBldProv" required>
            </div>
            <div class="form-group">
                <label>Postal Code</label>
                <input type="text" id="newBldPost" required placeholder="A1A 1A1">
            </div>
            <div class="form-group">
                <label>Owner ID (Reference ID)</label>
                <input type="number" id="newBldOwner" value="1" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Save Building</button>
        </form>
    `;
    showModal('Create New Building', bodyHtml);
    
    document.getElementById('createBuildingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('/api/buildings', 'POST', {
                address: document.getElementById('newBldAddr').value,
                city: document.getElementById('newBldCity').value,
                province: document.getElementById('newBldProv').value,
                postalCode: document.getElementById('newBldPost').value,
                ownerId: parseInt(document.getElementById('newBldOwner').value),
                managerId: state.user.managerId
            });
            showToast('Building created.');
            closeModal();
            loadManagerBuildings();
        } catch(err) {}
    });
}

async function openEditBuildingModal(id) {
    try {
        const response = await apiCall(`/api/buildings/${id}`);
        const b = response.data;
        
        const bodyHtml = `
            <form id="editBuildingForm" class="auth-form">
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="editBldAddr" value="${b.address}" required>
                </div>
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="editBldCity" value="${b.city}" required>
                </div>
                <div class="form-group">
                    <label>Province</label>
                    <input type="text" id="editBldProv" value="${b.province}" required>
                </div>
                <div class="form-group">
                    <label>Postal Code</label>
                    <input type="text" id="editBldPost" value="${b.postalCode}" required>
                </div>
                <div class="form-group">
                    <label>Owner ID</label>
                    <input type="number" id="editBldOwner" value="${b.ownerId}" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Update Building</button>
            </form>
        `;
        showModal('Edit Building', bodyHtml);
        
        document.getElementById('editBuildingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await apiCall(`/api/buildings/${id}`, 'PUT', {
                    address: document.getElementById('editBldAddr').value,
                    city: document.getElementById('editBldCity').value,
                    province: document.getElementById('editBldProv').value,
                    postalCode: document.getElementById('editBldPost').value,
                    ownerId: parseInt(document.getElementById('editBldOwner').value),
                    managerId: state.user.managerId
                });
                showToast('Building updated.');
                closeModal();
                loadManagerBuildings();
            } catch(err) {}
        });
    } catch(e) {}
}

async function deleteBuilding(id) {
    if (!confirm('Are you sure you want to delete this building?')) return;
    try {
        await apiCall(`/api/buildings/${id}`, 'DELETE');
        showToast('Building deleted.');
        loadManagerBuildings();
    } catch (e) {}
}

// --- APARTMENTS CRUD (by MANAGER) ---
async function openCreateApartmentModal() {
    let buildingOptions = '';
    try {
        const response = await apiCall(`/api/buildings?manager_id=${state.user.managerId}`);
        response.data.forEach(b => {
            buildingOptions += `<option value="${b.buildingId}">${b.address}, ${b.city}</option>`;
        });
    } catch(e) {}
    
    let tenantOptions = `<option value="">None (Available)</option>`;
    try {
        const response = await apiCall('/api/tenants');
        response.data.forEach(t => {
            tenantOptions += `<option value="${t.tenantId}">${t.name} (${t.email})</option>`;
        });
    } catch(e) {}

    const bodyHtml = `
        <form id="createApartmentForm" class="auth-form">
            <div class="form-group">
                <label>Apartment Number</label>
                <input type="number" id="newAptNo" required min="1">
            </div>
            <div class="form-group">
                <label>Number of Rooms</label>
                <input type="number" id="newAptRooms" required min="1" max="10" value="2">
            </div>
            <div class="form-group">
                <label>Monthly Price (₹)</label>
                <input type="number" id="newAptPrice" required step="0.01" min="1" value="83000">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="newAptStatus">
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                </select>
            </div>
            <div class="form-group">
                <label>Building</label>
                <select id="newAptBuilding" required>
                    ${buildingOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Assigned Tenant</label>
                <select id="newAptTenant">
                    ${tenantOptions}
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Save Apartment</button>
        </form>
    `;
    showModal('Create New Apartment', bodyHtml);

    document.getElementById('createApartmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tId = document.getElementById('newAptTenant').value;
        try {
            await apiCall('/api/apartments', 'POST', {
                apartmentNo: parseInt(document.getElementById('newAptNo').value),
                nbRooms: parseInt(document.getElementById('newAptRooms').value),
                price: parseFloat(document.getElementById('newAptPrice').value),
                status: document.getElementById('newAptStatus').value,
                buildingId: parseInt(document.getElementById('newAptBuilding').value),
                tenantId: tId ? parseInt(tId) : null
            });
            showToast('Apartment created successfully.');
            closeModal();
            loadManagerApartments();
        } catch(err) {}
    });
}

async function openEditApartmentModal(id) {
    try {
        const response = await apiCall(`/api/apartments/${id}`);
        const a = response.data;
        
        let buildingOptions = '';
        const bldResponse = await apiCall(`/api/buildings?manager_id=${state.user.managerId}`);
        bldResponse.data.forEach(b => {
            buildingOptions += `<option value="${b.buildingId}" ${b.buildingId === a.buildingId ? 'selected':''}>${b.address}, ${b.city}</option>`;
        });
        
        let tenantOptions = `<option value="">None (Available)</option>`;
        const tntResponse = await apiCall('/api/tenants');
        tntResponse.data.forEach(t => {
            tenantOptions += `<option value="${t.tenantId}" ${t.tenantId === a.tenantId ? 'selected':''}>${t.name} (${t.email})</option>`;
        });

        const bodyHtml = `
            <form id="editApartmentForm" class="auth-form">
                <div class="form-group">
                    <label>Apartment Number</label>
                    <input type="number" id="editAptNo" value="${a.apartmentNo}" required min="1">
                </div>
                <div class="form-group">
                    <label>Number of Rooms</label>
                    <input type="number" id="editAptRooms" value="${a.nbRooms}" required min="1" max="10">
                </div>
                <div class="form-group">
                    <label>Monthly Price (₹)</label>
                    <input type="number" id="editAptPrice" value="${a.price}" required step="0.01" min="1">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="editAptStatus">
                        <option value="Available" ${a.status === 'Available' ? 'selected':''}>Available</option>
                        <option value="Occupied" ${a.status === 'Occupied' ? 'selected':''}>Occupied</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Building</label>
                    <select id="editAptBuilding" required>
                        ${buildingOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Assigned Tenant</label>
                    <select id="editAptTenant">
                        ${tenantOptions}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Update Apartment</button>
            </form>
        `;
        showModal('Edit Apartment', bodyHtml);

        document.getElementById('editApartmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const tId = document.getElementById('editAptTenant').value;
            try {
                await apiCall(`/api/apartments/${id}`, 'PUT', {
                    apartmentNo: parseInt(document.getElementById('editAptNo').value),
                    nbRooms: parseInt(document.getElementById('editAptRooms').value),
                    price: parseFloat(document.getElementById('editAptPrice').value),
                    status: document.getElementById('editAptStatus').value,
                    buildingId: parseInt(document.getElementById('editAptBuilding').value),
                    tenantId: tId ? parseInt(tId) : null
                });
                showToast('Apartment updated successfully.');
                closeModal();
                loadManagerApartments();
            } catch(err) {}
        });
    } catch(e) {}
}

async function deleteApartment(id) {
    if (!confirm('Are you sure you want to delete this apartment?')) return;
    try {
        await apiCall(`/api/apartments/${id}`, 'DELETE');
        showToast('Apartment deleted.');
        loadManagerApartments();
    } catch (e) {}
}

// --- APPOINTMENTS CRUD ---
async function openCreateAppointmentModal(managerId = null) {
    let managerDropdown = '';
    
    if (state.role === 'tenant') {
        // Fetch all managers for Tenant appointment
        try {
            const response = await apiCall('/api/managers');
            response.data.forEach(m => {
                managerDropdown += `<option value="${m.managerId}" ${m.managerId === managerId ? 'selected':''}>${m.name} (${m.email})</option>`;
            });
        } catch(e) {}
    }

    const bodyHtml = `
        <form id="createAppointmentForm" class="auth-form">
            ${state.role === 'tenant' ? `
                <div class="form-group">
                    <label>Select Manager</label>
                    <select id="apptManagerId" required>
                        ${managerDropdown}
                    </select>
                </div>
            ` : ''}
            <div class="form-group">
                <label>Appointment Date & Time</label>
                <input type="datetime-local" id="apptDate" required>
            </div>
            <div class="form-group">
                <label>Description / Purpose</label>
                <textarea id="apptDesc" required placeholder="Viewing, contract discussions, etc..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Confirm Appointment</button>
        </form>
    `;
    showModal('Book Appointment', bodyHtml);

    document.getElementById('createAppointmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let mId = managerId;
        if (state.role === 'tenant') {
            mId = parseInt(document.getElementById('apptManagerId').value);
        }

        try {
            await apiCall('/api/appointments', 'POST', {
                managerId: mId,
                tenantId: state.user.tenantId,
                appointmentDate: document.getElementById('apptDate').value,
                description: document.getElementById('apptDesc').value
            });
            showToast('Appointment booked successfully!');
            closeModal();
            loadTenantAppointments();
        } catch(err) {}
    });
}

async function openEditAppointmentModal(id) {
    try {
        const response = await apiCall(`/api/appointments/${id}`);
        const appt = response.data;
        
        // Reformat date from YYYY-MM-DD HH:MM to ISO datetime-local
        let dtStr = '';
        if (appt.appointmentDate) {
            const rawDt = appt.appointmentDate.replace(' ', 'T');
            dtStr = rawDt;
        }

        const bodyHtml = `
            <form id="editAppointmentForm" class="auth-form">
                <div class="form-group">
                    <label>Reschedule Date & Time</label>
                    <input type="datetime-local" id="editApptDate" value="${dtStr}" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="editApptDesc" required>${appt.description}</textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Update Appointment</button>
            </form>
        `;
        showModal('Reschedule Appointment', bodyHtml);

        document.getElementById('editAppointmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await apiCall(`/api/appointments/${id}`, 'PUT', {
                    managerId: appt.managerId,
                    tenantId: appt.tenantId,
                    appointmentDate: document.getElementById('editApptDate').value,
                    description: document.getElementById('editApptDesc').value
                });
                showToast('Appointment rescheduled.');
                closeModal();
                if (state.role === 'tenant') loadTenantAppointments();
                if (state.role === 'manager') loadManagerAppointments();
            } catch(err) {}
        });
    } catch(e) {}
}

async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
        await apiCall(`/api/appointments/${id}`, 'DELETE');
        showToast('Appointment cancelled.');
        if (state.role === 'tenant') loadTenantAppointments();
        if (state.role === 'manager') loadManagerAppointments();
    } catch(e) {}
}

// --- MESSAGES CRUD ---
async function openCreateMessageModal(role) {
    let managersOptions = '';
    try {
        const response = await apiCall('/api/managers');
        response.data.forEach(m => {
            managersOptions += `<option value="${m.managerId}">${m.name} (${m.email})</option>`;
        });
    } catch(e) {}

    const bodyHtml = `
        <form id="createMessageForm" class="auth-form">
            <div class="form-group">
                <label>Select Manager</label>
                <select id="msgManagerId" required>
                    ${managersOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="msgBodyText" required placeholder="Write message..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Send Message</button>
        </form>
    `;
    showModal('Send Message', bodyHtml);

    document.getElementById('createMessageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mId = parseInt(document.getElementById('msgManagerId').value);
        const text = document.getElementById('msgBodyText').value;

        try {
            if (role === 'tenant') {
                await apiCall('/api/messages/manager', 'POST', {
                    managerId: mId,
                    tenantId: state.user.tenantId,
                    message: text
                });
                showToast('Message sent.');
                closeModal();
                loadTenantMessages();
            } else if (role === 'owner') {
                await apiCall('/api/messages/owner', 'POST', {
                    managerId: mId,
                    ownerId: state.user.ownerId,
                    message: text
                });
                showToast('Message sent to manager.');
                closeModal();
                loadOwnerMessages();
            }
        } catch(err) {}
    });
}

async function openEditMessageModal(id, currentText) {
    const bodyHtml = `
        <form id="editMessageForm" class="auth-form">
            <div class="form-group">
                <label>Edit Message</label>
                <textarea id="editMsgText" required>${currentText}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Update Message</button>
        </form>
    `;
    showModal('Edit Message', bodyHtml);

    document.getElementById('editMessageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall(`/api/messages/manager/${id}`, 'PUT', {
                role: 'tenant',
                message: document.getElementById('editMsgText').value
            });
            showToast('Message updated.');
            closeModal();
            loadTenantMessages();
        } catch(err) {}
    });
}

async function deleteMessage(type, messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        await apiCall(`/api/messages/${type}/${messageId}`, 'DELETE');
        showToast('Message deleted.');
        if (type === 'manager') loadTenantMessages();
        if (type === 'owner') loadOwnerMessages();
    } catch(e) {}
}

// --- EVENTS CRUD (by MANAGER) ---
async function openCreateEventModal() {
    let ownerOptions = '';
    try {
        const response = await apiCall('/api/tenants'); // Let's fetch all tenants to load owners
        // In the database model, owners has table 'owner'
        // Let's create an input dropdown for owners
        const ownersRes = await apiCall('/api/managers'); // Fallback or mock list
    } catch(e) {}

    // Let's fetch from buildings managed by this manager to get owners list!
    let ownerSet = new Map();
    let buildingApts = '';
    
    try {
        const buildings = await apiCall(`/api/buildings?manager_id=${state.user.managerId}`);
        
        buildings.data.forEach(b => {
            ownerSet.set(b.ownerId, b.ownerName);
        });
        
        const apts = await apiCall(`/api/apartments?manager_id=${state.user.managerId}`);
        apts.data.forEach(a => {
            buildingApts += `<option value="${a.apartmentId}" data-owner="${a.ownerId}">Apt ${a.apartmentNo} - ${a.buildingAddress}</option>`;
        });
    } catch(e) {}

    let ownerDropdown = '';
    ownerSet.forEach((name, id) => {
        ownerDropdown += `<option value="${id}">${name}</option>`;
    });

    const bodyHtml = `
        <form id="createEventForm" class="auth-form">
            <div class="form-group">
                <label>Assigned Owner</label>
                <select id="evtOwnerId" required>
                    ${ownerDropdown}
                </select>
            </div>
            <div class="form-group">
                <label>Apartment</label>
                <select id="evtApartmentId" required>
                    ${buildingApts}
                </select>
            </div>
            <div class="form-group">
                <label>Issue Description</label>
                <textarea id="evtDesc" required placeholder="Describe maintenance issue or operational event..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Submit Maintenance Event</button>
        </form>
    `;
    showModal('Report Maintenance Event', bodyHtml);

    document.getElementById('createEventForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('/api/events', 'POST', {
                managerId: state.user.managerId,
                ownerId: parseInt(document.getElementById('evtOwnerId').value),
                apartmentId: parseInt(document.getElementById('evtApartmentId').value),
                description: document.getElementById('evtDesc').value
            });
            showToast('Event filed with owner successfully.');
            closeModal();
            loadManagerEvents();
        } catch(err) {}
    });
}

async function openEditEventModal(id) {
    try {
        const response = await apiCall(`/api/events/${id}`);
        const ev = response.data;
        
        const bodyHtml = `
            <form id="editEventForm" class="auth-form">
                <div class="form-group">
                    <label>Edit Issue Description</label>
                    <textarea id="editEvtDesc" required>${ev.description}</textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Update Event</button>
            </form>
        `;
        showModal('Edit Maintenance Event', bodyHtml);

        document.getElementById('editEventForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await apiCall(`/api/events/${id}`, 'PUT', {
                    role: 'manager',
                    description: document.getElementById('editEvtDesc').value
                });
                showToast('Event details updated.');
                closeModal();
                loadManagerEvents();
            } catch(err) {}
        });
    } catch(e) {}
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        await apiCall(`/api/events/${id}`, 'DELETE');
        showToast('Event deleted successfully.');
        loadManagerEvents();
    } catch (e) {}
}

/* ==================== INTERACTIVE PROPERTY HEAT MAP FEATURE ==================== */

// Toggle Home View Mode (List vs. Map)
function toggleHomeViewMode(mode) {
    state.homeViewMode = mode;
    const listBtn = document.getElementById('btnHomeListView');
    const mapBtn = document.getElementById('btnHomeMapView');
    const mapPanel = document.getElementById('homeMapPanel');
    const listLayout = document.getElementById('homeListingsMapLayout');
    
    if (mode === 'list') {
        listBtn.classList.add('active');
        mapBtn.classList.remove('active');
        mapPanel.classList.add('hidden');
        listLayout.classList.remove('map-active');
        
        // Ensure home list itself is visible
        document.getElementById('homeApartmentsList').style.display = 'grid';
    } else {
        listBtn.classList.remove('active');
        mapBtn.classList.add('active');
        mapPanel.classList.remove('hidden');
        listLayout.classList.add('map-active');
        
        // Remove style hides on list grid (handled by CSS media queries now)
        document.getElementById('homeApartmentsList').style.removeAttribute ? document.getElementById('homeApartmentsList').style.removeAttribute('display') : document.getElementById('homeApartmentsList').style.display = '';
        
        // Init map container
        initMap('homeMap', true);
    }
}

// Toggle Category Explore View Mode (List vs. Map)
function toggleCategoryViewMode(mode) {
    state.categoryViewMode = mode;
    const listBtn = document.getElementById('btnCategoryListView');
    const mapBtn = document.getElementById('btnCategoryMapView');
    const mapPanel = document.getElementById('categoryMapPanel');
    const listLayout = document.getElementById('categoryListingsMapLayout');
    
    if (mode === 'list') {
        listBtn.classList.add('active');
        mapBtn.classList.remove('active');
        mapPanel.classList.add('hidden');
        listLayout.classList.remove('map-active');
        
        document.getElementById('categoryPropertiesList').style.display = 'grid';
    } else {
        listBtn.classList.remove('active');
        mapBtn.classList.add('active');
        mapPanel.classList.remove('hidden');
        listLayout.classList.add('map-active');
        
        document.getElementById('categoryPropertiesList').style.removeAttribute ? document.getElementById('categoryPropertiesList').style.removeAttribute('display') : document.getElementById('categoryPropertiesList').style.display = '';
        
        initMap('categoryMap', false);
    }
}

// Initialize Leaflet Map
function initMap(containerId, isHome) {
    const mapKey = isHome ? 'homeMapInstance' : 'categoryMapInstance';
    
    // If already loaded, invalidate size to fix gray tile layouts and redraw
    if (state[mapKey]) {
        setTimeout(() => {
            state[mapKey].invalidateSize();
            updateMapMarkers(isHome);
        }, 100);
        return;
    }
    
    // Setup map centered on central Bangalore (MG Road area)
    const map = L.map(containerId, {
        center: [12.9716, 77.5946],
        zoom: 12,
        zoomControl: true
    });
    
    // OpenStreetMap dark-ish tiles (CartoDB Dark Matter fits glassmorphism beautifully!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    state[mapKey] = map;
    
    setTimeout(() => {
        map.invalidateSize();
        updateMapMarkers(isHome);
    }, 100);
}

// Redraw Markers based on active properties
function updateMapMarkers(isHome) {
    const mapKey = isHome ? 'homeMapInstance' : 'categoryMapInstance';
    const markersKey = isHome ? 'homeMarkers' : 'categoryMarkers';
    const map = state[mapKey];
    
    if (!map) return;
    
    // Clear old markers
    state[markersKey].forEach(marker => map.removeLayer(marker));
    state[markersKey] = [];
    
    // Retrieve listings
    const listings = isHome ? state.currentHomeProperties : state.currentCategoryProperties;
    if (!listings || listings.length === 0) return;
    
    const latLngBounds = [];
    
    listings.forEach(item => {
        // Resolve coordinates
        let lat = item.latitude || item.lat;
        let lng = item.longitude || item.lng;
        
        // Fallbacks for seeding errors or missing DB lat/lng coordinates
        if (!lat || !lng) {
            // Assign coords randomly centered around Bangalore if missing, or use default fallback based on buildingId
            if (item.buildingId === 4 || item.address?.includes('Koramangala')) { lat = 12.9352; lng = 77.6244; }
            else if (item.buildingId === 5 || item.address?.includes('Indiranagar')) { lat = 12.9719; lng = 77.6412; }
            else if (item.buildingId === 1004 || item.address?.includes('HSR Layout')) { lat = 12.9121; lng = 77.6446; }
            else if (item.buildingId === 1005 || item.address?.includes('Whitefield')) { lat = 12.9698; lng = 77.7500; }
            else {
                // Approximate fallback
                lat = 12.9716 + (Math.random() - 0.5) * 0.08;
                lng = 77.5946 + (Math.random() - 0.5) * 0.08;
            }
        }
        
        const price = item.price;
        // Green below 10k, Yellow 10k-25k, Red above 25k
        const pinClass = price < 10000 ? 'green' : (price <= 25000 ? 'yellow' : 'red');
        
        const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div class="pin-circle ${pinClass}"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const bedrooms = item.rooms || item.nbRooms || 0;
        const bathrooms = Math.max(1, bedrooms - 1);
        const popupHtml = `
            <div class="popup-img" style="background-image: url('${getBuildingImage(item)}');"></div>
            <div class="popup-body">
                <div class="popup-title">${item.title || ('Apartment ' + item.apartmentNo)}</div>
                <div class="popup-price">₹${price.toLocaleString('en-IN')}/mo</div>
                <div class="popup-address">${item.address || item.buildingAddress}</div>
                <div class="popup-details">
                    <span>🛏️ ${bedrooms} BHK</span>
                    <span>🛁 ${bathrooms} Bath</span>
                </div>
                <div style="font-size: 0.8rem; margin-top: 4px;">Status: <span class="status-badge available" style="padding: 2px 6px; font-size: 0.72rem;">Available</span></div>
                <button class="btn btn-primary popup-btn" onclick="triggerViewDetails(${item.id || item.apartmentId}, ${item.isReal || (item.apartmentId !== undefined)}, ${isHome})">View Details</button>
            </div>
        `;
        
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupHtml, { minWidth: 250 });
        
        // Sync Marker Click to List highlight
        marker.on('click', () => {
            highlightCardInList(item.id || item.apartmentId, isHome);
        });
        
        // Attach properties reference for lookup
        marker.propertyId = item.id || item.apartmentId;
        
        state[markersKey].push(marker);
        latLngBounds.push([lat, lng]);
    });
    
    // Zoom map to fit markers
    if (latLngBounds.length > 0) {
        map.fitBounds(latLngBounds, { padding: [40, 40] });
    }
}

// Open Details Dialog from popup clicks
function triggerViewDetails(id, isReal, isHome) {
    if (isReal) {
        showApartmentDetails(id);
    } else {
        const props = isHome ? state.currentHomeProperties : state.currentCategoryProperties;
        const item = props.find(p => p.id === id);
        if (item) {
            showMockPropertyDetails(item);
        }
    }
}

// Bidirectional Sync: Highlight Card in List and Scroll into view
function highlightCardInList(id, isHome) {
    const listContainerId = isHome ? 'homeApartmentsList' : 'categoryPropertiesList';
    const container = document.getElementById(listContainerId);
    if (!container) return;
    
    // Remove previous highlights
    container.querySelectorAll('.apt-card').forEach(card => card.classList.remove('card-highlight'));
    
    // Find matching card
    const targetCard = container.querySelector(`.apt-card[data-id="${id}"]`);
    if (targetCard) {
        targetCard.classList.add('card-highlight');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Bidirectional Sync: Focus Map Marker and Center Map on Card Clicks
function focusPropertyOnMap(id, isHome) {
    const mapKey = isHome ? 'homeMapInstance' : 'categoryMapInstance';
    const markersKey = isHome ? 'homeMarkers' : 'categoryMarkers';
    const map = state[mapKey];
    const markers = state[markersKey];
    const viewMode = isHome ? state.homeViewMode : state.categoryViewMode;
    
    if (!map || !markers || viewMode !== 'map') return;
    
    const targetMarker = markers.find(m => m.propertyId === id);
    if (targetMarker) {
        map.setView(targetMarker.getLatLng(), 15, { animate: true });
        targetMarker.openPopup();
    }
}

// Generic Card click handler serving both list navigation and map focus
function handleCardClick(event, id, isReal, itemData, isHome) {
    // Prevent triggering details modal if the user is clicking links, badges, or buttons
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') return;
    
    const viewMode = isHome ? state.homeViewMode : state.categoryViewMode;
    
    // Highlight list element
    highlightCardInList(id, isHome);
    
    // Center map and open popup
    focusPropertyOnMap(id, isHome);
    
    // Show Modal details only if they are clicking the card in List View
    if (viewMode === 'list') {
        if (isReal) {
            showApartmentDetails(id);
        } else {
            showMockPropertyDetails(itemData);
        }
    }
}
