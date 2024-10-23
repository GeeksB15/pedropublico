Geeks.ERP.UI.FileManager = {
    UploadFile: function(id, file) {

        if (file[0].files.length <= 0) {
            return 0;
        }

        var data = new FormData();

        data.append("id", id);
        data.append("file", file[0].files[0]);

        var result = 0;

        $.ajax({
            type: "POST",
            url: "/Sistema/Upload",
            data: data,
            async: false,
            cache: false,
            contentType: false,
            enctype: 'multipart/form-data',
            processData: false,
            success: function (response) {
                result = parseInt(response);

                file.parent().parent().find("input[name="+ file[0].name.replace("file_", "") +"]").val(result).change();
            },
            error: function(e) {
                ShowError(e);
                return;
            }
        });

        return result;

    },
    
    DownloadFile: function(id) {

    }
}