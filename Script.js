// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://qyomkjqgdzuanszkhtqx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_cZ_0QNlHoxKGE1tYBNbGvw_sGcuki-b";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// VARIABLES
// ==========================================

let restaurants = [];

let selectedArea = "all";

let products = [];

let categories = [];

let cart = [];

let currentRestaurant = null;


// ==========================================
// LOAD RESTAURANTS
// ==========================================

async function loadRestaurants() {

    const container =
        document.getElementById("restaurantsList");

    container.innerHTML = `
        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:50px;
            color:#999;
        ">
            ⏳ جاري تحميل المطاعم...
        </div>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", {
            ascending: false
        })
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        container.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
                color:#ff6b6b;
            ">
                ❌ تعذر تحميل المطاعم
            </div>
        `;

        return;
    }


    restaurants = data || [];

    renderRestaurants();
}

// ==========================================
// LOAD CATEGORIES
// ==========================================

async function loadCategories() {

    const {
        data,
        error
    } = await supabaseClient
        .from("categories")
        .select("*")
        .order("sort_order", {
            ascending: true,
            nullsFirst: false
        })
        .order("id", {
            ascending: true
        });

    if (error) {

        console.error("Categories error:", error);

        categories = [];

        return;
    }

    categories = data || [];
}

// ==========================================
// DISPLAY RESTAURANTS
// ==========================================

function renderRestaurants() {

    const container =
        document.getElementById("restaurantsList");

    const searchInput =
        document.getElementById("search");

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        restaurants.filter(restaurant => {

            const areaMatch =
                selectedArea === "all" ||
                restaurant.area === selectedArea;


            const searchMatch =
                String(restaurant.name || "")
                    .toLowerCase()
                    .includes(search);


            return areaMatch && searchMatch;

        });


    if (filtered.length === 0) {

        container.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:60px 20px;
                color:#888;
            ">

                <div style="font-size:50px">
                    🍽️
                </div>

                <h3 style="margin:15px 0">
                    لا توجد مطاعم
                </h3>

                <p>
                    جرّب البحث عن مطعم آخر أو اختر منطقة مختلفة.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        filtered.map(restaurant => `

            <div class="product-card restaurant-card">

                ${
                    restaurant.is_featured
                    ?
                    `
                    <div class="featured-badge">
                        ⭐ إعلان مميز
                    </div>
                    `
                    :
                    ""
                }


                <div class="product-image">

                    ${
                        restaurant.image_url
                        ?
                        `
                        <img
                            src="${escapeHTML(restaurant.image_url)}"
                            alt="${escapeHTML(restaurant.name)}"
                        >
                        `
                        :
                        "🍽️"
                    }

                </div>


                <div class="product-info">

                    <h3>
                        ${escapeHTML(restaurant.name)}
                    </h3>


                    ${
                        restaurant.description
                        ?
                        `
                        <p class="restaurant-description">
                            ${escapeHTML(restaurant.description)}
                        </p>
                        `
                        :
                        ""
                    }


                    ${
                        restaurant.area
                        ?
                        `
                        <div class="restaurant-area">
                            📍 ${escapeHTML(restaurant.area)}
                        </div>
                        `
                        :
                        ""
                    }


                    ${
                        restaurant.category
                        ?
                        `
                        <span class="restaurant-category">
                            ${escapeHTML(restaurant.category)}
                        </span>
                        `
                        :
                        ""
                    }


                    <div class="restaurant-buttons">

                        <button
                            class="restaurant-button"
                            onclick="openRestaurant(${restaurant.id})"
                        >
                            🍽️ عرض المنيو
                        </button>


                        ${
                            restaurant.instagram
                            ?
                            `
                            <a
                                class="restaurant-button secondary"
                                href="${escapeHTML(restaurant.instagram)}"
                                target="_blank"
                            >
                                📸 Instagram
                            </a>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            </div>

        `).join("");

}


// ==========================================
// AREA FILTER
// ==========================================

function setArea(area, button) {

    selectedArea = area;


    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    button.classList.add("active");


    renderRestaurants();
}


// ==========================================
// OPEN RESTAURANT
// ==========================================

async function openRestaurant(restaurantId) {

    const restaurant =
        restaurants.find(
            item => item.id === restaurantId
        );


    if (!restaurant) {
        return;
    }


    currentRestaurant = restaurant;
await loadCategories();

    // جلب منتجات المطعم

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("available", true)
        .order("sort_order", {
            ascending: true
        });


    if (error) {

        console.error(error);

        alert("تعذر تحميل منيو المطعم.");

        return;
    }


    products = data || [];


    showRestaurantMenu(restaurant);

}


// ==========================================
// SHOW RESTAURANT MENU
// ==========================================

function showRestaurantMenu(restaurant) {

    const section =
        document.getElementById("restaurants");

    // ==========================
    // روابط التواصل
    // ==========================

    const whatsapp =
        restaurant.whatsapp
            ? `https://wa.me/${cleanPhone(restaurant.whatsapp)}`
            : "";

    const phone =
        restaurant.phone
            ? `tel:${escapeHTML(restaurant.phone)}`
            : "";

    const instagram =
        restaurant.instagram
            ? restaurant.instagram
            : "";

    // ==========================
    // رابط الموقع
    // ==========================

    // ==========================
// الموقع الإلكتروني
// ==========================

const website = restaurant.website
    ? restaurant.website.trim()
    : "";


    // ==========================
    // صورة المطعم
    // ==========================

    const restaurantImage =
        restaurant.image_url
            ?
            `
            <img
                src="${escapeHTML(restaurant.image_url)}"
                alt="${escapeHTML(restaurant.name)}"
            >
            `
            :
            `
            <div style="
                width:100%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:60px;
            ">
                🍽️
            </div>
            `;


    // ==========================
    // الصفحة
    // ==========================

    section.innerHTML = `

        <div class="container">

            <!-- ================= HEADER ================= -->

            <div class="restaurant-menu-header">

                <div class="restaurant-menu-header-image">

                    ${restaurantImage}

                </div>


                ${
                    restaurant.is_featured
                    ?
                    `
                    <div style="
                        display:inline-block;
                        margin-bottom:12px;
                        padding:6px 13px;
                        border-radius:50px;
                        background:linear-gradient(
                            90deg,
                            #f5c451,
                            #ec4899
                        );
                        color:#08080b;
                        font-size:11px;
                        font-weight:bold;
                    ">
                        ⭐ مطعم مميز
                    </div>
                    `
                    :
                    ""
                }


                <h2>
                    ${escapeHTML(restaurant.name)}
                </h2>


                ${
                    restaurant.description
                    ?
                    `
                    <p>
                        ${escapeHTML(restaurant.description)}
                    </p>
                    `
                    :
                    ""
                }


                <!-- ================= INFO ================= -->

                <div class="restaurant-info-row">

                    ${
                        restaurant.area
                        ?
                        `
                        <div class="restaurant-info-item">
                            📍 ${escapeHTML(restaurant.area)}
                        </div>
                        `
                        :
                        ""
                    }


                    ${
                        restaurant.address
                        ?
                        `
                        <div class="restaurant-info-item">
                            🏠 ${escapeHTML(restaurant.address)}
                        </div>
                        `
                        :
                        ""
                    }


                    ${
                        restaurant.category
                        ?
                        `
                        <div class="restaurant-info-item">
                            🍽️ ${escapeHTML(restaurant.category)}
                        </div>
                        `
                        :
                        ""
                    }

                </div>

            </div>


            <!-- ================= BUTTONS ================= -->

            <div
                style="
                    display:flex;
                    justify-content:center;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-bottom:50px;
                "
            >

                <button
                    class="restaurant-button"
                    onclick="backToRestaurants()"
                    style="
                        border:none;
                        cursor:pointer;
                        max-width:180px;
                    "
                >
                    ← جميع المطاعم
                </button>


                ${
                    whatsapp
                    ?
                    `
                    <a
                        class="restaurant-button"
                        href="${whatsapp}"
                        target="_blank"
                        rel="noopener"
                        style="max-width:180px;"
                    >
                        💬 واتساب
                    </a>
                    `
                    :
                    ""
                }


                ${
                    phone
                    ?
                    `
                    <a
                        class="restaurant-button secondary"
                        href="${phone}"
                        style="max-width:180px;"
                    >
                        📞 اتصال
                    </a>
                    `
                    :
                    ""
                }


                ${
                    instagram
                    ?
                    `
                    <a
                        class="restaurant-button secondary"
                        href="${escapeHTML(instagram)}"
                        target="_blank"
                        rel="noopener"
                        style="max-width:180px;"
                    >
                        📸 إنستغرام
                    </a>
                    `
                    :
                    ""
                }


                ${
                    website
    ?
    `
    <a
        class="restaurant-button secondary"
        href="${website}"
        target="_blank"
        rel="noopener"
        style="max-width:180px;"
    >
        🌐 الموقع الإلكتروني
    </a>
    `
    :
    ""
}

</div>


            <!-- ================= MENU TITLE ================= -->

            <div class="section-title">

                <span>
                    OUR MENU
                </span>

                <h2>
                    المنيو 🍽️
                </h2>

            </div>


            <!-- ================= PRODUCTS ================= -->

            <div
                class="products"
                id="restaurantProducts"
            ></div>

        </div>

    `;


    // ==========================
    // عرض المنتجات
    // ==========================

    renderRestaurantProducts();


    // ==========================
    // النزول إلى صفحة المطعم
    // ==========================

    window.scrollTo({
        top: section.offsetTop - 70,
        behavior: "smooth"
    });

}

// ==========================================
// DISPLAY RESTAURANT PRODUCTS
// ==========================================

function renderRestaurantProducts() {

    const container =
        document.getElementById("restaurantProducts");

    if (!container) {
        return;
    }

    if (products.length === 0) {

        container.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:60px 20px;
                color:#888;
            ">
                <div style="font-size:55px;">
                    🍽️
                </div>

                <h3 style="
                    color:#ddd;
                    margin:15px 0 8px;
                ">
                    المنيو غير متوفر حاليًا
                </h3>

                <p>
                    لم تتم إضافة منتجات لهذا المطعم بعد.
                </p>
            </div>
        `;

        return;
    }

    const grouped = {};

    products.forEach(product => {

        const categoryId =
            product.category_id;

        let categoryName =
            "أصناف أخرى";

        if (categoryId) {

            const category =
                categories.find(
                    item =>
                        String(item.id) ===
                        String(categoryId)
                );

            if (category) {

                categoryName =
                    category.name ||
                    category.title ||
                    "أصناف أخرى";

            }
        }

        if (!grouped[categoryName]) {
            grouped[categoryName] = [];
        }

        grouped[categoryName].push(product);

    });


    const categoryNames =
    categories
        .filter(category =>
            grouped[category.name]
        )
        .map(category =>
            category.name
        );

Object.keys(grouped).forEach(categoryName => {

    if (!categoryNames.includes(categoryName)) {
        categoryNames.push(categoryName);
    }

});


    let categoryButtons = `
        <div class="menu-category-tabs">

            <button
                class="menu-tab active"
                onclick="filterMenuCategory('all', this)"
            >
                🍽️ الكل
            </button>
    `;


    categoryNames.forEach((categoryName, index) => {

        categoryButtons += `
            <button
                class="menu-tab"
                onclick="filterMenuCategory(
                    'menu-category-${index}',
                    this
                )"
            >
                ${escapeHTML(categoryName)}
            </button>
        `;

    });


    categoryButtons += `
        </div>
    `;


    let menuHTML = "";


    categoryNames.forEach(
        (categoryName, categoryIndex) => {

        const categoryProducts =
            grouped[categoryName];

        menuHTML += `

            <div
                class="menu-category-section"
                data-menu-category="menu-category-${categoryIndex}"
            >

                <div class="menu-category-title">

                    <div class="menu-category-icon">
                        🍽️
                    </div>

                    <div>

                        <span>
                            MENU CATEGORY
                        </span>

                        <h3>
                            ${escapeHTML(categoryName)}
                        </h3>

                    </div>

                </div>

                <div class="products">
        `;


        menuHTML +=
            categoryProducts
                .map(product => `

                    <div class="product-card">

                        <div class="product-image">

                            ${
                                product.image_url
                                ?
                                `
                                <img
                                    src="${escapeHTML(product.image_url)}"
                                    alt="${escapeHTML(product.name)}"
                                    loading="lazy"
                                >
                                `
                                :
                                "🍔"
                            }

                        </div>

                        <div class="product-info">

                            <h3>
                                ${escapeHTML(product.name)}
                            </h3>

                            ${
                                product.description
                                ?
                                `
                                <p class="restaurant-description">
                                    ${escapeHTML(product.description)}
                                </p>
                                `
                                :
                                ""
                            }

                            <div class="product-price">
                                ${product.price} ₪
                            </div>

                            

                        </div>

                    </div>

                `)
                .join("");


        menuHTML += `
                </div>
            </div>
        `;

    });


    container.innerHTML = `

        ${categoryButtons}

        <div class="menu-all-products">
            ${menuHTML}
        </div>

    `;
}


// ==========================================
// FILTER MENU CATEGORY
// ==========================================

function filterMenuCategory(category, button) {

    document
        .querySelectorAll(".menu-tab")
        .forEach(tab => {
            tab.classList.remove("active");
        });

    button.classList.add("active");


    const sections =
        document.querySelectorAll(
            ".menu-category-section"
        );


    sections.forEach(section => {

        if (
            category === "all" ||
            section.dataset.menuCategory === category
        ) {
            section.style.display = "block";
        }
        else {
            section.style.display = "none";
        }

    });


    if (category !== "all") {

        const selected =
            document.querySelector(
                `[data-menu-category="${category}"]`
            );

        if (selected) {

            selected.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }

}


// ==========================================
// BACK TO RESTAURANTS
// ==========================================

function backToRestaurants() {

    location.reload();

}


// ==========================================
// CART
// ==========================================

function addToCart(productId) {

    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) {
        return;
    }


    // منع إضافة منتجات من مطعم مختلف

    if (
        currentRestaurant &&
        cart.length > 0 &&
        cart[0].restaurant_id !== currentRestaurant.id
    ) {

        const confirmChange =
            confirm(
                "السلة تحتوي على طلب من مطعم آخر. هل تريد بدء طلب جديد؟"
            );


        if (!confirmChange) {
            return;
        }


        cart = [];

    }


    cart.push(product);

    updateCart();

    openCart();

}


// ==========================================
// REMOVE FROM CART
// ==========================================

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();

}


// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    const cartCount =
        document.getElementById("cartCount");

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");


    if (!cartCount || !cartItems || !cartTotal) {
        return;
    }


    cartCount.textContent =
        cart.length;


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div style="
                text-align:center;
                color:#777;
                padding:40px 10px;
            ">

                🛒

                <p>
                    السلة فارغة
                </p>

            </div>

        `;

    }

    else {

        cartItems.innerHTML =

            cart.map((product, index) => `

                <div class="cart-row">

                    <div>

                        <strong>
                            🍽️ ${escapeHTML(product.name)}
                        </strong>

                    </div>


                    <div>

                        <span>
                            ${product.price} ₪
                        </span>


                        <button
                            onclick="removeFromCart(${index})"
                        >
                            ×
                        </button>

                    </div>

                </div>

            `).join("");

    }


    const total =
        cart.reduce(
            (sum, product) =>
                sum + Number(product.price || 0),
            0
        );


    cartTotal.textContent =
        total;

}


// ==========================================
// OPEN CART
// ==========================================

function openCart() {

    document
        .getElementById("cart")
        .classList.add("open");


    document
        .getElementById("overlay")
        .classList.add("show");

}


// ==========================================
// CLOSE CART
// ==========================================

function closeCart() {

    document
        .getElementById("cart")
        .classList.remove("open");


    document
        .getElementById("overlay")
        .classList.remove("show");

}


// ==========================================
// CHECKOUT
// ==========================================

function checkout() {

    if (cart.length === 0) {

        alert(
            "السلة فارغة، أضف منتجات أولاً."
        );

        return;
    }


    if (!currentRestaurant) {

        alert(
            "اختر مطعمًا أولاً."
        );

        return;
    }


    if (!currentRestaurant.whatsapp) {

        alert(
            "هذا المطعم لم يضف رقم واتساب بعد."
        );

        return;
    }


    const total =
        cart.reduce(
            (sum, product) =>
                sum + Number(product.price || 0),
            0
        );


    let orderText =
        `مرحباً 👋 أريد الطلب من ${currentRestaurant.name}:\n\n`;


    cart.forEach((product, index) => {

        orderText +=
            `${index + 1}. ${product.name} - ${product.price} ₪\n`;

    });


    orderText +=
        `\n💰 الإجمالي: ${total} ₪`;


    orderText +=
        "\n\n📍 العنوان:";


    orderText +=
        "\n👤 الاسم:";


    const whatsappURL =
        `https://wa.me/${cleanPhone(currentRestaurant.whatsapp)}?text=${encodeURIComponent(orderText)}`;


    window.open(
        whatsappURL,
        "_blank"
    );

}


// ==========================================
// SEARCH
// ==========================================

function searchRestaurants() {

    renderRestaurants();

}


// ==========================================
// HELPERS
// ==========================================

function cleanPhone(phone) {

    return String(phone || "")
        .replace(/\D/g, "");

}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRestaurants();

        updateCart();

    }
);

// ==========================================
// LOAD RESTAURANT BRANCHES
// ==========================================

async function loadRestaurantBranches(
    restaurantId,
    containerId
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    const result =
        await supabaseClient
            .from("restaurant_branches")
            .select("*")
            .eq(
                "restaurant_id",
                restaurantId
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );

    if (result.error) {

        console.error(
            "خطأ في تحميل الفروع:",
            result.error
        );

        return;
    }

    container.innerHTML = "";

    if (
        !result.data ||
        result.data.length === 0
    ) {

        return;
    }

    result.data.forEach(
        function (branch) {

            const branchElement =
                document.createElement(
                    "div"
                );

            branchElement.className =
                "restaurant-branch";

            branchElement.innerHTML = `

                <div class="branch-title">
                    📍 ${branch.branch_name || "فرع"}
                </div>

                ${
                    branch.area
                        ? `<div>📌 المنطقة: ${branch.area}</div>`
                        : ""
                }

                ${
                    branch.address
                        ? `<div>🏠 العنوان: ${branch.address}</div>`
                        : ""
                }

                ${
                    branch.phone
                        ? `<div>📞 الهاتف: ${branch.phone}</div>`
                        : ""
                }

                ${
                    branch.whatsapp
                        ? `<div>💬 واتساب: ${branch.whatsapp}</div>`
                        : ""
                }

            `;

            container.appendChild(
                branchElement
            );

        }
    );

}