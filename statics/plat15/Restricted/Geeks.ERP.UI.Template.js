(function () {
    Geeks.ERP.UI.Template = new function () {
        var templates = this;

        this.Get = function (templateName) {
            var ret = $.grep($($("#Templates").html()), function (value) {
                return value.id == templateName;
            });

            if (ret.length <= 0) {
                jError("Templante não encontrado!", "Atenção");
                return "";
            }

            return $(ret[0]).html();
        }
    }
})();
