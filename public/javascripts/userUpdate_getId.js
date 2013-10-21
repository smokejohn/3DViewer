$(document).ready(function() {
     
     $(document).on("click", ".openForm", function () {
        var UserId = $(this).data('id');
        $(".modal-body #UserId").val( UserId );
        $(".modal-body #DelUserId").prop("href", '/user/delete/' +  UserId );
    });
});