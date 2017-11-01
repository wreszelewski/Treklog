function showLoader() {
    $('#screenLoader').fadeIn(500);
}

function hideLoader() {
    $('#screenLoader').fadeOut(500);
}

module.exports = {
    showLoader,
    hideLoader
}