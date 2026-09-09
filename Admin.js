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

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const message =
                document.getElementById(
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
                        "❌ " +
                        result.error.message;
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

    restaurants =
        result.data || [];

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

    container.innerHTML =
        html;

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


    // ==========================================
    // CLEAR RESTAURANT BRANCHES
    // ==========================================

    const branchesContainer =
        document.getElementById(
            "restaurantBranchesAdmin"
        );

    if (branchesContainer) {

        branchesContainer.innerHTML = "";

    }


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
// ADD RESTAURANT BRANCH
// ==========================================

function addBranchAdmin() {

    const container =
        document.getElementById(
            "restaurantBranchesAdmin"
        );

    if (!container) {
        return;
    }

    const branch = document.createElement("div");

    branch.className = "branch-admin-item";

    branch.innerHTML = `
        <input
            type="text"
            class="branch-name"
            placeholder="اسم الفرع"
        >

        <input
            type="text"
            class="branch-area"
            placeholder="المنطقة"
        >

        <input
            type="text"
            class="branch-address"
            placeholder="العنوان"
        >

        <input
            type="text"
            class="branch-phone"
            placeholder="رقم الهاتف"
        >

        <input
            type="text"
            class="branch-whatsapp"
            placeholder="رقم الواتساب"
        >

        <button
            type="button"
            onclick="this.parentElement.remove()"
        >
            🗑️ حذف الفرع
        </button>
    `;

    container.appendChild(branch);
}


// ==========================================
// EDIT RESTAURANT
// ==========================================

async function editRestaurant(id) {

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
        "restaurantWebsiteAdmin"
    ).value =
        restaurant.website || "";

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
        "restaurantCategoryAdmin"
    ).value =
        restaurant.category || "";

    document.getElementById(
        "restaurantFeaturedAdmin"
    ).checked =
        Boolean(
            restaurant.is_featured
        );

    document.getElementById(
        "restaurantActive"
    ).checked =
        restaurant.is_active !== false;


    // ==========================================
    // LOAD RESTAURANT BRANCHES
    // ==========================================

    const branchesContainer =
        document.getElementById(
            "restaurantBranchesAdmin"
        );

    if (branchesContainer) {

        branchesContainer.innerHTML =
            "جاري تحميل الفروع...";

        const branchResult =
            await supabaseClient
                .from("restaurant_branches")
                .select("*")
                .eq(
                    "restaurant_id",
                    restaurant.id
                )
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );

        if (branchResult.error) {

            console.error(
                branchResult.error
            );

            branchesContainer.innerHTML =
                "❌ حدث خطأ أثناء تحميل الفروع";

        } else {

            branchesContainer.innerHTML = "";

            branchResult.data.forEach(
                function (branch) {

                    const branchElement =
                        document.createElement(
                            "div"
                        );

                    branchElement.className =
                        "branch-admin-item";

                    branchElement.innerHTML = `

                        <input
                            type="text"
                            class="branch-name"
                            placeholder="اسم الفرع"
                            value="${branch.branch_name || ""}"
                        >

                        <input
                            type="text"
                            class="branch-area"
                            placeholder="المنطقة"
                            value="${branch.area || ""}"
                        >

                        <input
                            type="text"
                            class="branch-address"
                            placeholder="العنوان"
                            value="${branch.address || ""}"
                        >

                        <input
                            type="text"
                            class="branch-phone"
                            placeholder="رقم الهاتف"
                            value="${branch.phone || ""}"
                        >

                        <input
                            type="text"
                            class="branch-whatsapp"
                            placeholder="رقم الواتساب"
                            value="${branch.whatsapp || ""}"
                        >

                        <button
                            type="button"
                            onclick="this.parentElement.remove()"
                        >
                            🗑️ حذف الفرع
                        </button>

                    `;

                    branchesContainer.appendChild(
                        branchElement
                    );

                }
            );

        }

    }


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
          
            const website =
                document.getElementById(
                   "restaurantWebsiteAdmin"
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
              
               website:
                    website || null,
         

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
            )
            .select("id")
            .single();

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

          // ==========================================
// SAVE RESTAURANT BRANCHES
// ==========================================

let restaurantId = id;

if (!restaurantId && result.data) {
    restaurantId = result.data.id;
}

const branchElements =
    document.querySelectorAll(
        ".branch-admin-item"
    );

if (
    restaurantId &&
    branchElements.length > 0
) {

    // حذف الفروع القديمة عند تعديل المطعم
    if (id) {

        await supabaseClient
            .from("restaurant_branches")
            .delete()
            .eq(
                "restaurant_id",
                restaurantId
            );

    }

    const branches = [];

    branchElements.forEach(
        function (branch) {

            const branchName =
                branch
                    .querySelector(
                        ".branch-name"
                    )
                    .value
                    .trim();

            const branchArea =
                branch
                    .querySelector(
                        ".branch-area"
                    )
                    .value
                    .trim();

            const branchAddress =
                branch
                    .querySelector(
                        ".branch-address"
                    )
                    .value
                    .trim();

            const branchPhone =
                branch
                    .querySelector(
                        ".branch-phone"
                    )
                    .value
                    .trim();

            const branchWhatsapp =
                branch
                    .querySelector(
                        ".branch-whatsapp"
                    )
                    .value
                    .trim();

            if (branchName) {

                branches.push({

                    restaurant_id:
                        restaurantId,

                    branch_name:
                        branchName,

                    area:
                        branchArea || null,

                    address:
                        branchAddress || null,

                    phone:
                        branchPhone || null,

                    whatsapp:
                        branchWhatsapp || null

                });

            }

        }
    );

    if (branches.length > 0) {

        const branchResult =
            await supabaseClient
                .from("restaurant_branches")
                .insert(branches);

        if (branchResult.error) {

            console.error(
                branchResult.error
            );

            if (message) {
                message.textContent =
                    "❌ تم حفظ المطعم لكن حدث خطأ في حفظ الفروع: " +
                    branchResult.error.message;
            }

            return;
        }

    }

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
    "sort_order",
    {
        ascending: true
    }
)
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

    products =
        result.data || [];

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


// ==========================================
// RENDER PRODUCTS
// ==========================================

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
            "<p>اضغط إضافة منتج لإضافة أول منتج.</p>" +
            "</div>";

        return;
    }

    let html = "";

    products.forEach(function (product) {

        const restaurant =
            restaurants.find(function (item) {

                return Number(item.id) ===
                    Number(product.restaurant_id);

            });

        const category =
            categories.find(function (item) {

                return Number(item.id) ===
                    Number(product.category_id);

            });

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

            "<p>🍽️ المطعم: <strong>" +
            escapeHTML(
                restaurant
                    ? restaurant.name
                    : "غير محدد"
            ) +
            "</strong></p>" +

            "<p>📂 التصنيف: <strong>" +
            escapeHTML(
                category
                    ? category.name
                    : "غير محدد"
            ) +
            "</strong></p>" +

            "<strong>" +
            escapeHTML(
                String(product.price ?? 0)
            ) +
            " ₪</strong>" +

            "<p>" +
            (
                product.available
                    ? "✅ متوفر"
                    : "❌ غير متوفر"
            ) +
            " " +
            (
                product.featured
                    ? "⭐ مميز"
                    : ""
            ) +
            "</p>" +

            "<div class='card-actions'>" +

"<button " +
"type='button' " +
"class='secondary-btn' " +
"onclick='moveProduct(" +
Number(product.id) +
", -1)'>" +
"⬆️" +
"</button>" +

"<button " +
"type='button' " +
"class='secondary-btn' " +
"onclick='moveProduct(" +
Number(product.id) +
", 1)'>" +
"⬇️" +
"</button>" +

"<button " +
"type='button' " +
"class='secondary-btn' " +
"onclick='editProduct(" +
Number(product.id) +
")'>" +
"✏️ تعديل" +
"</button>" +

            "<button " +
            "type='button' " +
            "class='delete-btn' " +
            "onclick='deleteProduct(" +
            Number(product.id) +
            ")'>" +
            "🗑️ حذف" +
            "</button>" +

            "</div>" +

            "</div>" +

            "</div>";

    });

    container.innerHTML =
        html;

}


// ==========================================
// LOAD PRODUCT SELECTS
// ==========================================

function loadProductSelects() {

    const restaurantSelect =
        document.getElementById(
            "productRestaurant"
        );

    const categorySelect =
        document.getElementById(
            "productCategory"
        );

    if (restaurantSelect) {

        restaurantSelect.innerHTML =
            "<option value=''>🍽️ اختر المطعم</option>";

        restaurants.forEach(function (restaurant) {

            restaurantSelect.innerHTML +=
                "<option value='" +
                Number(restaurant.id) +
                "'>" +
                escapeHTML(
                    restaurant.name
                ) +
                "</option>";

        });

    }

    if (categorySelect) {

        categorySelect.innerHTML =
            "<option value=''>📂 اختر التصنيف</option>";

        categories.forEach(function (category) {

            categorySelect.innerHTML +=
                "<option value='" +
                Number(category.id) +
                "'>" +
                escapeHTML(
                    category.name
                ) +
                "</option>";

        });

    }

}


// ==========================================
// OPEN PRODUCT MODAL
// ==========================================

function openProductModal() {

    loadProductSelects();

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
        "productAvailable"
    ).checked = true;

    document.getElementById(
        "productFeatured"
    ).checked = false;

    document.getElementById(
        "productModalTitle"
    ).textContent =
        "➕ إضافة منتج";

    document.getElementById(
        "productModal"
    ).classList.remove("hidden");

}


// ==========================================
// CLOSE PRODUCT MODAL
// ==========================================

function closeProductModal() {

    document.getElementById(
        "productModal"
    ).classList.add("hidden");

}


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(id) {

    const product =
        products.find(function (item) {

            return Number(item.id) ===
                Number(id);

        });

    if (!product) {

        alert("المنتج غير موجود");

        return;
    }

    loadProductSelects();

    document.getElementById(
        "productId"
    ).value =
        product.id || "";

    document.getElementById(
        "productName"
    ).value =
        product.name || "";

    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";

    document.getElementById(
        "productPrice"
    ).value =
        product.price ?? "";

    document.getElementById(
        "productImage"
    ).value =
        product.image_url || "";

    document.getElementById(
        "productRestaurant"
    ).value =
        product.restaurant_id ?? "";

    document.getElementById(
        "productCategory"
    ).value =
        product.category_id ?? "";

    document.getElementById(
        "productAvailable"
    ).checked =
        product.available !== false;

    document.getElementById(
        "productFeatured"
    ).checked =
        Boolean(
            product.featured
        );

    document.getElementById(
        "productModalTitle"
    ).textContent =
        "✏️ تعديل المنتج";

    document.getElementById(
        "productModal"
    ).classList.remove("hidden");

}


// ==========================================
// SAVE PRODUCT
// ==========================================

const productForm =
    document.getElementById(
        "productForm"
    );

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "productName"
                ).value.trim();

            const description =
                document.getElementById(
                    "productDescription"
                ).value.trim();

            const price =
                document.getElementById(
                    "productPrice"
                ).value;

            const image =
                document.getElementById(
                    "productImage"
                ).value.trim();

            const restaurantId =
                document.getElementById(
                    "productRestaurant"
                ).value;

            const categoryId =
                document.getElementById(
                    "productCategory"
                ).value;

            const available =
                document.getElementById(
                    "productAvailable"
                ).checked;

            const featured =
                document.getElementById(
                    "productFeatured"
                ).checked;

            const id =
                document.getElementById(
                    "productId"
                ).value;

            if (!name) {

                alert(
                    "❌ اكتب اسم المنتج"
                );

                return;
            }

            if (!price) {

                alert(
                    "❌ اكتب سعر المنتج"
                );

                return;
            }

            if (!restaurantId) {

                alert(
                    "❌ اختر المطعم"
                );

                return;
            }

            const productData = {

                name:
                    name,

                description:
                    description || null,

                price:
                    Number(price),

                image_url:
                    image || null,

                restaurant_id:
                    Number(restaurantId),

                category_id:
                    categoryId
                        ? Number(categoryId)
                        : null,

                available:
                    available,

                featured:
                    featured

            };

            let result;

            if (id) {

                result =
                    await supabaseClient
                        .from("products")
                        .update(
                            productData
                        )
                        .eq(
                            "id",
                            id
                        );

            } else {

                result =
                    await supabaseClient
                        .from("products")
                        .insert(
                            productData
                        );

            }

            if (result.error) {

                console.error(
                    "Save Product:",
                    result.error
                );

                alert(
                    "❌ فشل حفظ المنتج:\n" +
                    result.error.message
                );

                return;
            }

            alert(
                "✅ تم حفظ المنتج بنجاح"
            );

            closeProductModal();

            await loadProducts();

        }
    );

}


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(id) {

    const product =
        products.find(function (item) {

            return Number(item.id) ===
                Number(id);

        });

    if (!product) {
        return;
    }

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف المنتج: " +
            product.name +
            " ؟"
        );

    if (!confirmed) {
        return;
    }

    const result =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                id
            );

    if (result.error) {

        console.error(
            result.error
        );

        alert(
            "❌ فشل حذف المنتج:\n" +
            result.error.message
        );

        return;
    }

    alert(
        "✅ تم حذف المنتج"
    );

    await loadProducts();

}

// ==========================================
// MOVE PRODUCT
// ==========================================

async function moveProduct(id, direction) {

    // ترتيب المنتجات الحالي
    const sortedProducts = [...products].sort(function (a, b) {

        const orderA = Number(a.sort_order ?? 0);
        const orderB = Number(b.sort_order ?? 0);

        return orderA - orderB;

    });

    const currentIndex =
        sortedProducts.findIndex(function (product) {

            return Number(product.id) === Number(id);

        });

    if (currentIndex === -1) {
        return;
    }

    const targetIndex =
        currentIndex + direction;

    // إذا المنتج أول أو آخر القائمة
    if (
        targetIndex < 0 ||
        targetIndex >= sortedProducts.length
    ) {
        return;
    }

    const currentProduct =
        sortedProducts[currentIndex];

    const targetProduct =
        sortedProducts[targetIndex];

    const currentOrder =
        Number(currentProduct.sort_order ?? 0);

    const targetOrder =
        Number(targetProduct.sort_order ?? 0);

    // تبديل الترتيب
    const firstUpdate =
        await supabaseClient
            .from("products")
            .update({
                sort_order: targetOrder
            })
            .eq(
                "id",
                currentProduct.id
            );

    if (firstUpdate.error) {

        console.error(
            "Move Product:",
            firstUpdate.error
        );

        alert(
            "❌ فشل تحريك المنتج:\n" +
            firstUpdate.error.message
        );

        return;
    }

    const secondUpdate =
        await supabaseClient
            .from("products")
            .update({
                sort_order: currentOrder
            })
            .eq(
                "id",
                targetProduct.id
            );

    if (secondUpdate.error) {

        console.error(
            "Move Product:",
            secondUpdate.error
        );

        alert(
            "❌ فشل حفظ ترتيب المنتج:\n" +
            secondUpdate.error.message
        );

        return;
    }

    // إعادة تحميل المنتجات
    await loadProducts();

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
    "sort_order",
    {
        ascending: true,
        nullsFirst: false
    }
)
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

    categories =
        result.data || [];

    const count =
        document.getElementById(
            "categoriesCount"
        );

    if (count) {
        count.textContent =
            categories.length;
    }

    renderCategories();

    loadProductSelects();

}


// ==========================================
// RENDER CATEGORIES
// ==========================================

// ==========================================
// RENDER CATEGORIES
// ==========================================

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
            "<p>أضف تصنيفًا لاستخدامه مع المنتجات.</p>" +
            "</div>";

        return;
    }

    let html = "";

    categories.forEach(function (category, index) {

        html +=
            "<div class='category-item'>" +

            "<strong>📂 " +
            escapeHTML(
                category.name || ""
            ) +
            "</strong>" +

            "<div style='display:flex; gap:6px;'>" +

            "<button " +
            "type='button' " +
            "onclick='moveCategoryUp(" + index + ")' " +
            "style='cursor:pointer;'>" +
            "⬆️" +
            "</button>" +

            "<button " +
            "type='button' " +
            "onclick='moveCategoryDown(" + index + ")' " +
            "style='cursor:pointer;'>" +
            "⬇️" +
            "</button>" +

            "</div>" +

            "</div>";

    });

    container.innerHTML =
        html;
}


// ==========================================
// MOVE CATEGORY UP
// ==========================================

async function moveCategoryUp(index) {

    if (index <= 0) {
        return;
    }

    const current =
        categories[index];

    const previous =
        categories[index - 1];

    const currentOrder =
        current.sort_order ??
        index;

    const previousOrder =
        previous.sort_order ??
        (index - 1);


    const { error } =
        await supabaseClient
            .from("categories")
            .update({
                sort_order: previousOrder
            })
            .eq("id", current.id);

    if (error) {

        console.error(error);

        alert("تعذر تغيير ترتيب التصنيف.");

        return;
    }


    const { error: error2 } =
        await supabaseClient
            .from("categories")
            .update({
                sort_order: currentOrder
            })
            .eq("id", previous.id);

    if (error2) {

        console.error(error2);

        alert("تعذر حفظ ترتيب التصنيف.");

        return;
    }


    await loadCategories();

}


// ==========================================
// MOVE CATEGORY DOWN
// ==========================================

async function moveCategoryDown(index) {

    if (index >= categories.length - 1) {
        return;
    }

    const current =
        categories[index];

    const next =
        categories[index + 1];

    const currentOrder =
        current.sort_order ??
        index;

    const nextOrder =
        next.sort_order ??
        (index + 1);


    const { error } =
        await supabaseClient
            .from("categories")
            .update({
                sort_order: nextOrder
            })
            .eq("id", current.id);

    if (error) {

        console.error(error);

        alert("تعذر تغيير ترتيب التصنيف.");

        return;
    }


    const { error: error2 } =
        await supabaseClient
            .from("categories")
            .update({
                sort_order: currentOrder
            })
            .eq("id", next.id);

    if (error2) {

        console.error(error2);

        alert("تعذر حفظ ترتيب التصنيف.");

        return;
    }


    await loadCategories();

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

                alert(
                    "❌ اكتب اسم التصنيف"
                );

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
                    "❌ فشل إضافة التصنيف:\n" +
                    result.error.message
                );

                return;
            }

            input.value = "";

            alert(
                "✅ تم إضافة التصنيف"
            );

            await loadCategories();

        }
    );

}


// ==========================================
// ORDERS
// ==========================================

async function loadOrders() {

    const container =
        document.getElementById(
            "adminOrders"
        );

    if (!container) {
        return;
    }

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

        container.innerHTML =
            "<div class='message'>❌ " +
            escapeHTML(
                result.error.message
            ) +
            "</div>";

        return;
    }

    orders =
        result.data || [];

    const count =
        document.getElementById(
            "ordersCount"
        );

    if (count) {
        count.textContent =
            orders.length;
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
            "<div class='dashboard-card'>" +

            "<h3>🛒 طلب #" +
            escapeHTML(
                String(order.id)
            ) +
            "</h3>" +

            "<p>الحالة: " +
            escapeHTML(
                order.status || "جديد"
            ) +
            "</p>" +

            "</div>";

    });

    container.innerHTML =
        html;

}


// ==========================================
// SETTINGS
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