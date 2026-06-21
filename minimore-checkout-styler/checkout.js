
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("minimore-checkout-header")) return;
    var header = document.createElement("header");
    header.id = "minimore-checkout-header";
    header.innerHTML = "<h1>Minimore</h1><a href='https://minimore.my/cart'><span>&larr;</span> Back to Cart</a>";
    
    var container = document.querySelector(".wc-block-checkout") || document.querySelector(".wc-block-order-confirmation");
    if (container && container.parentNode) {
        container.parentNode.insertBefore(header, container);
    } else {
        document.body.insertBefore(header, document.body.firstChild);
    }
});
