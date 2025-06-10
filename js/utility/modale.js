function openModal(title, description, imgSrc, placesLeft, price) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-description').textContent = description;
    document.getElementById('modal-img').src = imgSrc;
    document.getElementById('modal-places').textContent = placesLeft;
    document.getElementById('modal-price').textContent = price;
    document.getElementById('quantity').textContent = 1;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function changeQuantity(change) {
    let quantityElem = document.getElementById('quantity');
    let quantity = parseInt(quantityElem.textContent);
    quantity += change;
    if (quantity < 1) quantity = 1;
    quantityElem.textContent = quantity;
}

// Fermer la modal si on clique à l'extérieur
window.onclick = function(event) {
    let modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
}