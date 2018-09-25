$(document).ready(function() {
  
  $('#form-signup').on('submit', function(event) {
    event.preventDefault()

    var btnSubmit = $(this).find('[type=submit]')
    var formData = $(this).serialize()

    $.ajax({
      url: window.location.href,
      method: 'POST',
      dataType: 'json',
      data: formData, 
      beforeSend: function () {
        btnSubmit.attr('disabled', 'disabled')
      }, 
      success: function (data, jqXHR) {
        if (data && typeof data.user_id === 'number') {
          window.location.href = 'congratulations'
        }
      },
      error: function () {

      },
      complete: function () {
        setTimeout(function () {
          btnSubmit.removeAttr('disabled')
        });
      } 
    })
    return false
  })
});