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


    // جلب منتجات المطعم

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("available", true)
        .order("created_at", {
            ascending: false
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


    section.innerHTML = `

        <div class="container">

            <div
                style="
                    text-align:center;
                    margin-bottom:30px;
                "
            >

                <div
                    style="
                        font-size:60px;
                        margin-bottom:15px;
                    "
                >
                    🍽️
                </div>


                <h2 style="
                    font-size:38px;
                    margin-bottom:10px;
                ">
                    ${escapeHTML(restaurant.name)}
                </h2>


                ${
                    restaurant.description
                    ?
                    `
                    <p style="
                        color:#999;
                        line-height:1.8;
                        max-width:600px;
                        margin:auto;
                    ">
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
                    <p style="
                        color:#bbb;
                        margin-top:12px;
                    ">
                        📍 ${escapeHTML(restaurant.area)}
                        ${
                            restaurant.address
                            ?
                            ` - ${escapeHTML(restaurant.address)}`
                            :
                            ""
                        }
                    </p>
                    `
                    :
                    ""
                }

            </div>


            <div
                style="
                    display:flex;
                    justify-content:center;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-bottom:35px;
                "
            >

                <button
                    class="restaurant-button"
                    onclick="backToRestaurants()"
                    style="border:none;cursor:pointer;"
                >
                    ← جميع المطاعم
                </button>


                ${
                    restaurant.whatsapp
                    ?
                    `
                    <a
                        class="restaurant-button"
                        href="https://wa.me/${cleanPhone(restaurant.whatsapp)}"
                        target="_blank"
                    >
                        💬 WhatsApp
                    </a>
                    `
                    :
                    ""
                }


                ${
                    restaurant.phone
                    ?
                    `
                    <a
                        class="restaurant-button secondary"
                        href="tel:${escapeHTML(restaurant.phone)}"
                    >
                        📞 اتصال
                    </a>
                    `
                    :
                    ""
                }


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


            <div class="section-title">

                <span>
                    OUR MENU
                </span>

                <h2>
                    المنيو 🍽️
                </h2>

            </div>


            <div
                class="products"
                id="restaurantProducts"
            ></div>

        </div>

    `;


    renderRestaurantProducts();


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
                padding:50px;
                color:#888;
            ">

                🍽️

                <h3 style="margin:15px 0">
                    المنيو غير متوفر حاليًا
                </h3>

            </div>

        `;

        return;
    }


    container.innerHTML =
        products.map(product => `

            <div class="product-card">

                <div class="product-image">

                    ${
                        product.image_url
                        ?
                        `
                        <img
                            src="${escapeHTML(product.image_url)}"
                            alt="${escapeHTML(product.name)}"
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


                    <button
                        class="add-button"
                        onclick="addToCart(${product.id})"
                    >
                        🛒 أضف للطلب
                    </button>

                </div>

            </div>

        `).join("");

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