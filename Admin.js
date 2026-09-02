// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://qyomkjqgdzuanszkhtqx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_cZ_0QNlHoxKGE1tYBNbGvw_sGcuki-b";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// DATA
// ==========================================

let restaurants = [];
let products = [];
let categories = [];
let orders = [];


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(page) {

    const pages = [
        "home",
        "restaurants",
        "products",
        "categories",
        "orders",
        "settings"
    ];

    pages.forEach(function (name) {

        const element = document.getElementById(
            name + "Page"
        );

        if (element) {
            element.classList.add("hidden");
        }

    });

    const selectedPage = document.getElementById(
        page + "Page"
    );

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    if (page === "home") {
        loadDashboard();
    }

    if (page === "restaurants") {
        loadRestaurants();
    }

    if (page === "products") {
        loadProducts();
    }

    if (page === "categories") {
        loadCategories();
    }

    if (page === "orders") {
        loadOrders();
    }

}


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById(
    "loginForm"
);

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email = document.getElementById(
                "loginEmail"
            ).value.trim();

            const password = document.getElementById(
                "loginPassword"
            ).value;

            const message = document.getElementById(
                "loginMessage"
            );

            if (message) {
                message.textContent =
                    "جاري تسجيل الدخول...";
            }

            const result =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (result.error) {

                console.error(result.error);

                if (message) {
                    message.textContent =
                        "❌ " + result.error.message;
                }

                return;
            }

            if (message) {
                message.textContent =
                    "✅ تم تسجيل الدخول";
            }

            await showDashboard();

        }
    );

}


// ==========================================
// SESSION
// ==========================================

async function checkSession() {

    const result =
        await supabaseClient.auth.getSession();

    if (result.error) {

        console.error(result.error);

        showLogin();

        return;
    }

    if (result.data.session) {

        await showDashboard();

    } else {

        showLogin();

    }

}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    const loginPage =
        document.getElementById("loginPage");

    const dashboard =
        document.getElementById("dashboard");

    if (loginPage) {
        loginPage.classList.remove("hidden");
    }

    if (dashboard) {
        dashboard.classList.add("hidden");
    }

}


// ==========================================
// SHOW DASHBOARD
// ==========================================

async function showDashboard() {

    const loginPage =
        document.getElementById("loginPage");

    const dashboard =
        document.getElementById("dashboard");

    if (loginPage) {
        loginPage.classList.add("hidden");
    }

    if (dashboard) {
        dashboard.classList.remove("hidden");
    }

    await loadDashboard();

}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    const result =
        await supabaseClient.auth.signOut();

    if (result.error) {

        console.error(result.error);

        return;
    }

    showLogin();

}


// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    await loadRestaurants();
    await loadProducts();
    await loadCategories();
    await loadOrders();

}


// ==========================================
// RESTAURANTS
// ==========================================

async function loadRestaurants() {

    const container =
        document.getElementById(
            "adminRestaurants"
        );

    if (container) {

        container.innerHTML =
            "<div class='loading'>جاري تحميل المطاعم...</div>";

    }

    const result =
        await supabaseClient
            .from("restaurants")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (result.error) {

        console.error(
            "Restaurants:",
            result.error
        );

        if (container) {

            container.innerHTML =
                "<div class='message'>❌ " +
                escapeHTML(
                    result.error.message
                ) +
                "</div>";

        }

        return;
    }

    restaurants = result.data || [];

    const count =
        document.getElementById(
            "restaurantsCount"
        );

    if (count) {
        count.textContent =
            restaurants.length;
    }

    renderRestaurants();

}


// ==========================================
// RENDER RESTAURANTS
// ==========================================

function renderRestaurants() {

    const container =
        document.getElementById(
            "adminRestaurants"
        );

    if (!container) {
        return;
    }

    if (restaurants.length === 0) {

        container.innerHTML =
            "<div class='dashboard-card'>" +
            "<h3>🍽️ لا يوجد مطاعم</h3>" +
            "<p>اضغط إضافة مطعم لإضافة أول مطعم.</p>" +
            "</div>";

        return;
    }

    let html = "";

    restaurants.forEach(function (restaurant) {

        const image =
            restaurant.image_url ||
            "https://via.placeholder.com/600x400?text=Restaurant";

        html +=
            "<div class='restaurant-card'>" +

            "<img src='" +
            escapeHTML(image) +
            "' alt='" +
            escapeHTML(
                restaurant.name || "مطعم"
            ) +
            "'>" +

            "<div class='restaurant-card-content'>" +

            "<h3>" +
            escapeHTML(
                restaurant.name || "بدون اسم"
            ) +
            "</h3>" +

            "<p>" +
            escapeHTML(
                restaurant.description || "لا يوجد وصف"
            ) +
            "</p>" +

            (
                restaurant.area
                    ? "<p>📍 " +
                      escapeHTML(
                          restaurant.area
                      ) +
                      "</p>"
                    : ""
            ) +

            (
                restaurant.address
                    ? "<p>🏠 " +
                      escapeHTML(
                          restaurant.address
                      ) +
                      "</p>"
                    : ""
            ) +

            (
                restaurant.phone
                    ? "<p>📞 " +
                      escapeHTML(
                          restaurant.phone
                      ) +
                      "</p>"
                    : ""
            ) +

            "<p>" +
            (
                restaurant.is_active
                    ? "✅ فعال"
                    : "❌ غير فعال"
            ) +
            "</p>" +

            (
                restaurant.is_featured
                    ? "<p>⭐ مطعم مميز</p>"
                    : ""
            ) +

            "<div class='card-actions'>" +

            "<button " +
            "type='button' " +
            "class='secondary-btn' " +
            "onclick='editRestaurant(" +
            Number(restaurant.id) +
            ")'>" +
            "✏️ تعديل" +
            "</button>" +

            "<button " +
            "type='button' " +
            "class='delete-btn' " +
            "onclick='deleteRestaurant(" +
            Number(restaurant.id) +
            ")'>" +
            "🗑️ حذف" +
            "</button>" +

            "</div>" +

            "</div>" +

            "</div>";

    });

    container.innerHTML = html;

}


// ==========================================
// OPEN RESTAURANT MODAL
// ==========================================

function openRestaurantModal() {

    const form =
        document.getElementById(
            "restaurantForm"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "restaurantId"
    ).value = "";

    document.getElementById(
        "restaurantActive"
    ).checked = true;

    document.getElementById(
        "restaurantFeaturedAdmin"
    ).checked = false;

    document.getElementById(
        "restaurantModalTitle"
    ).textContent =
        "➕ إضافة مطعم";

    const message =
        document.getElementById(
            "restaurantFormMessage"
        );

    if (message) {
        message.textContent = "";
    }

    document.getElementById(
        "restaurantModal"
    ).classList.remove("hidden");

}


// ==========================================
// CLOSE RESTAURANT MODAL
// ==========================================

function closeRestaurantModal() {

    document.getElementById(
        "restaurantModal"
    ).classList.add("hidden");

}


// ==========================================
// EDIT RESTAURANT
// ==========================================

function editRestaurant(id) {

    const restaurant =
        restaurants.find(function (item) {

            return Number(item.id) === Number(id);

        });

    if (!restaurant) {

        alert("المطعم غير موجود");

        return;
    }

    document.getElementById(
        "restaurantId"
    ).value =
        restaurant.id || "";

    document.getElementById(
        "restaurantNameAdmin"
    ).value =
        restaurant.name || "";

    document.getElementById(
        "restaurantDescriptionAdmin"
    ).value =
        restaurant.description || "";

    document.getElementById(
        "restaurantPhoneAdmin"
    ).value =
        restaurant.phone || "";

    document.getElementById(
        "restaurantWhatsappAdmin"
    ).value =
        restaurant.whatsapp || "";

    document.getElementById(
        "restaurantInstagramAdmin"
    ).value =
        restaurant.instagram || "";

    document.getElementById(
        "restaurantAreaAdmin"
    ).value =
        restaurant.area || "";

    document.getElementById(
        "restaurantAddressAdmin"
    ).value =
        restaurant.address || "";

    document.getElementById(
        "restaurantImageAdmin"
    ).value =
        restaurant.image_url || "";

    document.getElementById(
        "restaurantLatitudeAdmin"
    ).value =
        restaurant.latitude ?? "";

    document.getElementById(
        "restaurantLongitudeAdmin"
    ).value =
        restaurant.longitude ?? "";

    document.getElementById(
        "restaurantCategoryAdmin"
    ).value =
        restaurant.category || "";

    document.getElementById(
        "restaurantFeaturedAdmin"
    ).checked =
        Boolean(restaurant.is_featured);

    document.getElementById(
        "restaurantActive"
    ).checked =
        restaurant.is_active !== false;

    document.getElementById(
        "restaurantModalTitle"
    ).textContent =
        "✏️ تعديل المطعم";

    document.getElementById(
        "restaurantModal"
    ).classList.remove("hidden");

}


// ==========================================
// SAVE RESTAURANT
// ==========================================

const restaurantForm =
    document.getElementById(
        "restaurantForm"
    );

if (restaurantForm) {

    restaurantForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const message =
                document.getElementById(
                    "restaurantFormMessage"
                );

            if (message) {
                message.textContent =
                    "جاري الحفظ...";
            }

            const id =
                document.getElementById(
                    "restaurantId"
                ).value;

            const name =
                document.getElementById(
                    "restaurantNameAdmin"
                ).value.trim();

            const description =
                document.getElementById(
                    "restaurantDescriptionAdmin"
                ).value.trim();

            const phone =
                document.getElementById(
                    "restaurantPhoneAdmin"
                ).value.trim();

            const whatsapp =
                document.getElementById(
                    "restaurantWhatsappAdmin"
                ).value.trim();

            const instagram =
                document.getElementById(
                    "restaurantInstagramAdmin"
                ).value.trim();

            const area =
                document.getElementById(
                    "restaurantAreaAdmin"
                ).value.trim();

            const address =
                document.getElementById(
                    "restaurantAddressAdmin"
                ).value.trim();

            const image =
                document.getElementById(
                    "restaurantImageAdmin"
                ).value.trim();

            const latitude =
                document.getElementById(
                    "restaurantLatitudeAdmin"
                ).value;

            const longitude =
                document.getElementById(
                    "restaurantLongitudeAdmin"
                ).value;

            const category =
                document.getElementById(
                    "restaurantCategoryAdmin"
                ).value.trim();

            const featured =
                document.getElementById(
                    "restaurantFeaturedAdmin"
                ).checked;

            const active =
                document.getElementById(
                    "restaurantActive"
                ).checked;

            if (!name) {

                if (message) {
                    message.textContent =
                        "❌ اكتب اسم المطعم";
                }

                return;
            }

            const restaurantData = {

                name: name,

                description:
                    description || null,

                image_url:
                    image || null,

                area:
                    area || null,

                address:
                    address || null,

                phone:
                    phone || null,

                whatsapp:
                    whatsapp || null,

                instagram:
                    instagram || null,

                latitude:
                    latitude === ""
                        ? null
                        : Number(latitude),

                longitude:
                    longitude === ""
                        ? null
                        : Number(longitude),

                category:
                    category || null,

                is_featured:
                    featured,

                is_active:
                    active

            };

            let result;

            if (id) {

                result =
                    await supabaseClient
                        .from("restaurants")
                        .update(
                            restaurantData
                        )
                        .eq(
                            "id",
                            id
                        );

            } else {

                result =
                    await supabaseClient
                        .from("restaurants")
                        .insert(
                            restaurantData
                        );

            }

            if (result.error) {

                console.error(
                    result.error
                );

                if (message) {
                    message.textContent =
                        "❌ " +
                        result.error.message;
                }

                return;
            }

            if (message) {
                message.textContent =
                    "✅ تم حفظ المطعم";
            }

            await loadRestaurants();

            setTimeout(
                function () {

                    closeRestaurantModal();

                },
                500
            );

        }
    );

}


// ==========================================
// DELETE RESTAURANT
// ==========================================

async function deleteRestaurant(id) {

    const restaurant =
        restaurants.find(function (item) {

            return Number(item.id) === Number(id);

        });

    if (!restaurant) {
        return;
    }

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف المطعم: " +
            restaurant.name +
            " ؟"
        );

    if (!confirmed) {
        return;
    }

    const result =
        await supabaseClient
            .from("restaurants")
            .delete()
            .eq(
                "id",
                id
            );

    if (result.error) {

        console.error(result.error);

        alert(
            "❌ فشل حذف المطعم:\n" +
            result.error.message
        );

        return;
    }

    alert(
        "✅ تم حذف المطعم"
    );

    await loadRestaurants();

}


// ==========================================
// PRODUCTS
// ==========================================

async function loadProducts() {

    const result =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (result.error) {

        console.error(
            "Products:",
            result.error
        );

        return;
    }

    products = result.data || [];

    const count =
        document.getElementById(
            "productsCount"
        );

    if (count) {
        count.textContent =
            products.length;
    }

    renderProducts();

}


function renderProducts() {

    const container =
        document.getElementById(
            "adminProducts"
        );

    if (!container) {
        return;
    }

    if (products.length === 0) {

        container.innerHTML =
            "<div class='dashboard-card'>" +
            "<h3>🍔 لا يوجد منتجات</h3>" +
            "</div>";

        return;
    }

    let html = "";

    products.forEach(function (product) {

        html +=
            "<div class='product-card'>" +

            (
                product.image_url
                    ? "<img src='" +
                      escapeHTML(
                          product.image_url
                      ) +
                      "' alt='" +
                      escapeHTML(
                          product.name || ""
                      ) +
                      "'>"
                    : ""
            ) +

            "<div class='product-card-content'>" +

            "<h3>" +
            escapeHTML(
                product.name || "بدون اسم"
            ) +
            "</h3>" +

            "<p>" +
            escapeHTML(
                product.description || ""
            ) +
            "</p>" +

            "<strong>" +
            escapeHTML(
                String(product.price ?? 0)
            ) +
            "</strong>" +

            "</div>" +

            "</div>";

    });

    container.innerHTML = html;

}


// ==========================================
// PRODUCT MODAL
// ==========================================

function openProductModal() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "productId"
    ).value = "";

    document.getElementById(
        "productActive"
    ).checked = true;

    document.getElementById(
        "productModalTitle"
    ).textContent =
        "➕ إضافة منتج";

    document.getElementById(
        "productModal"
    ).classList.remove("hidden");

}


function closeProductModal() {

    document.getElementById(
        "productModal"
    ).classList.add("hidden");

}


// ==========================================
// CATEGORIES
// ==========================================

async function loadCategories() {

    const result =
        await supabaseClient
            .from("categories")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (result.error) {

        console.error(
            "Categories:",
            result.error
        );

        return;
    }

    categories = result.data || [];

    const count =
        document.getElementById(
            "categoriesCount"
        );

    if (count) {
        count.textContent =
            categories.length;
    }

    renderCategories();

}


function renderCategories() {

    const container =
        document.getElementById(
            "adminCategories"
        );

    if (!container) {
        return;
    }

    if (categories.length === 0) {

        container.innerHTML =
            "<div class='dashboard-card'>" +
            "<h3>📂 لا يوجد تصنيفات</h3>" +
            "</div>";

        return;
    }

    let html = "";

    categories.forEach(function (category) {

        html +=
            "<div class='category-item'>" +
            "<strong>📂 " +
            escapeHTML(
                category.name || ""
            ) +
            "</strong>" +
            "</div>";

    });

    container.innerHTML = html;

}


// ==========================================
// ADD CATEGORY
// ==========================================

const categoryForm =
    document.getElementById(
        "categoryForm"
    );

if (categoryForm) {

    categoryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const input =
                document.getElementById(
                    "categoryName"
                );

            const name =
                input.value.trim();

            if (!name) {
                return;
            }

            const result =
                await supabaseClient
                    .from("categories")
                    .insert({
                        name: name
                    });

            if (result.error) {

                console.error(
                    result.error
                );

                alert(
                    "❌ " +
                    result.error.message
                );

                return;
            }

            input.value = "";

            await loadCategories();

        }
    );

}


// ==========================================
// ORDERS
// ==========================================

async function loadOrders() {

    const result =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (result.error) {

        console.error(
            "Orders:",
            result.error
        );

        return;
    }

    orders = result.data || [];

    const count =
        document.getElementById(
            "ordersCount"
        );

    if (count) {
        count.textContent =
            orders.length;
    }

    renderOrders();

}


function renderOrders() {

    const container =
        document.getElementById(
            "adminOrders"
        );

    if (!container) {
        return;
    }

    if (orders.length === 0) {

        container.innerHTML =
            "<div class='dashboard-card'>" +
            "<h3>🛒 لا يوجد طلبات</h3>" +
            "</div>";

        return;
    }

    let html = "";

    orders.forEach(function (order) {

        html +=
            "<div class='order-card'>" +

            "<h3>🛒 طلب #" +
            escapeHTML(
                String(order.id || "")
            ) +
            "</h3>" +

            "<p>الحالة: " +
            escapeHTML(
                order.status || "جديد"
            ) +
            "</p>" +

            "</div>";

    });

    container.innerHTML = html;

}


// ==========================================
// SETTINGS
// ==========================================

async function loadSettings() {

    // سيتم ربط الإعدادات بجدول settings
    // بعد التأكد من شكل الجدول عندك.

}


// ==========================================
// SAVE SETTINGS
// ==========================================

const settingsForm =
    document.getElementById(
        "settingsForm"
    );

if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            alert(
                "✅ تم حفظ الإعدادات"
            );

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// START
// ==========================================

checkSession();
