function showLoader() {
    $('#screenLoader').fadeIn(500);
}

function hideLoader() {
    $('#screenLoader').fadeOut(500);
    setTimeout(() => {
        $('#screenLoader').html('<div class="ui active inverted dimmer"><div class="ui massive text loader">Ładowanie</div></div>');
    }, 600);
}

module.exports = {
    showLoader,
    hideLoader
}