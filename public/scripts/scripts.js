let itemCount = 1;

function addItem() {
    const container = document.getElementById('itemsContainer');
    const itemHTML = `
        <div class="item">
            <input type="text" name="items[${itemCount}][name]" placeholder="Item Name">
            <input type="text" name="items[${itemCount}][description]" placeholder="Description">
            <input type="number" name="items[${itemCount}][quantity]" value="1" min="1">
            <input type="number" name="items[${itemCount}][price]" placeholder="Price">
        </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHTML);
    itemCount++;
}
