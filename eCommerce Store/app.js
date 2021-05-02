const client = contentful.createClient({
    space: "placeholder",
    accessToken: "placeholder"
});

//Variable Declarations
const shoppingCartButton = document.querySelector(".shoppingCart-button");
const closeShoppingCartButton = document.querySelector(".close-shoppingCart");
const clearShoppingCartButton = document.querySelector(".clear-shoppingCart");
const shoppingCartDOM= document.querySelector(".shoppingCart");
const shoppingCartOverlay = document.querySelector(".shoppingCart-overlay");
const shoppingCartItems = document.querySelector(".shoppingCart-items");
const shoppingCartTotal = document.querySelector(".shoppingCart-total");
const shoppingCartContent = document.querySelector(".shoppingCart-content");
const productsDOM = document.querySelector(".products-center");

//Main Shopping Cart
let shoppingCart = [];

//Add to Cart Buttons
let buttonsDOM = [];

//Accessing Products
class Products {

    async getProducts() {

        try {
            let result = await fetch("products.json");
            let data = await result.json();

            let products = data.items;

            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            })
            return products;
        } catch (error) {
            console.log(error);
        }
        
    }
}

//Product Display
class UserInterface {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
                <article class="product">
                    <div class="image-container">
                        <img src=${product.image} alt="product" class="product-image">
                        <button class="shoppingBag-button" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i>
                            Add to cart!
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getShoppingButtons() {
        const buttons = [...document.querySelectorAll(".shoppingBag-button")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = shoppingCart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            } 
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                //get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                //add product to the cart
                shoppingCart = [...shoppingCart, cartItem];
                //save cart in local storage
                Storage.saveCart(shoppingCart);
                //set cart values 
                this.setCartValues(shoppingCart);
                //display cart item
                this.addCartItem(cartItem);
                //show the cart
                this.showCart();
            });
        });
    }
    setCartValues(shoppingCart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        shoppingCart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        shoppingCartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        shoppingCartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("shoppingCart-item");
        div.innerHTML = `
            <img src=${item.image} alt="Product">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `;
        shoppingCartContent.appendChild(div);
    }
    showCart() {
        shoppingCartOverlay.classList.add("transparentBackground");
        shoppingCartDOM.classList.add("show-shoppingCart");
    }
    setupAPP() {
        shoppingCart = Storage.getCart();
        this.setCartValues(shoppingCart);
        this.populateCart(shoppingCart);
        shoppingCartButton.addEventListener("click", this.showCart);
        closeShoppingCartButton.addEventListener("click", this.hideCart);
    }
    populateCart(shoppingCart) {
        shoppingCart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        shoppingCartOverlay.classList.remove("transparentBackground");
        shoppingCartDOM.classList.remove("show-shoppingCart");
    }
    cartLogic() {
        //Clear Shopping Cart Button
        clearShoppingCartButton.addEventListener("click", () => {
            this.clearCart();
        });
        //Shopping Cart Functionality
        shoppingCartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                shoppingCartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let increaseAmount = event.target;
                let id = increaseAmount.dataset.id;
                let tempItem = shoppingCart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(shoppingCart);
                this.setCartValues(shoppingCart);
                increaseAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let decreaseAmount = event.target;
                let id = decreaseAmount.dataset.id;
                let tempItem = shoppingCart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(shoppingCart);
                    this.setCartValues(shoppingCart);
                    decreaseAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    shoppingCartContent.removeChild(decreaseAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    clearCart() {
        let cartItems = shoppingCart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(shoppingCartContent.children);
        while (shoppingCartContent.children.length > 0) {
            shoppingCartContent.removeChild(shoppingCartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        shoppingCart = shoppingCart.filter(item => item.id !== id);
        this.setCartValues(shoppingCart);
        Storage.saveCart(shoppingCart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to cart!"`
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//Local Storage 
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart() {
        localStorage.setItem("cart", JSON.stringify(shoppingCart));
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UserInterface();
    const products = new Products();
    //Setup App
    ui.setupAPP();
    //Get all Products
    products.getProducts().then(products => { 
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getShoppingButtons();
        ui.cartLogic();
    });
});