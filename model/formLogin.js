$("form[name=login]").submit(function(e){
    e.preventDefault();
    var $this = $(this);
    $.post(
        $this.attr("action"),
        $this.serialize(),
        function(data){
            alert('toto');
        }
    )
});