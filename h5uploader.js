(function ($, window) {
    console.log('h5uploader');

    var uploader; // 页面上传的区域
    var uploadUrl; // 文件上传的路径

    var queueList = []; // 添加的文件列表
    var totalSize = 0; // 文件总大小
    var totalCount = 0; //文件总数目
    var isPreview = false; // 预览的时候改变样式

    if (window.H5Uploader) {
        alert("一个页面不能重复引用h5uploader.js");
        return;
    }

    function H5Uploader() {

    }

    function addEvent(uploader) {
        uploader.addEventListener('change', handleChange, false);

        uploader.addEventListener('dragenter', handleDragEnter, false);

        uploader.addEventListener('dragover', handleDragOver, false);

        uploader.addEventListener('dragleave', handleDragLeave, false);

        uploader.addEventListener('drop', handleDrop, false);

        uploader.addEventListener('mouseover', handleMouseOver, false);

        uploader.addEventListener('mouseout', handleMouseOut, false);

        uploader.addEventListener('click', handleClick, false);
    }

    function handleChange(e) {
        if (e.target.getAttribute('id') === 'selectFile') {
            var files = e.target.files;
            if (!isPreview) {
                changeStyle();
            }
            previewFiles(files);

        }

    }

    function handleDragEnter(e) {
        if (e.target.getAttribute('id') === 'fileList') {
            e.stopPropagation();
            e.preventDefault();
            e.target.style.border = "2px dashed #e6e6e6";
            console.log('enter');
        }
    }
    function handleDragLeave(e) {
        if (e.target.getAttribute('id') === 'fileList') {
            e.stopPropagation();
            e.preventDefault();
            e.target.style.border = 'none';
            console.log('leave');
        }
    }
    function handleDragOver(e) {
        if (e.target.getAttribute('id') === 'fileList') {
            e.stopPropagation();
            e.preventDefault();
            console.log('over');
        }
    }

    function handleDrop(e) {
        if (e.target.getAttribute('id') === 'fileList') {
            e.stopPropagation();
            e.preventDefault();
            e.target.style.border = 'none';
            var dt = e.dataTransfer;
            var files = dt.files;
            if (!isPreview) {
                changeStyle();
            }
            previewFiles(files)
        }
    }

    function handleMouseOver(e) {
        if (e.target.getAttribute('class') === 'preview-img') {
            e.target.nextSibling.style.display = 'block';
        }
        if (e.target.getAttribute('class') === 'delete-img') {
            e.target.style.display = "block";
        }
    }
    function handleMouseOut(e) {
        if (e.target.getAttribute('class') === 'preview-img') {
            e.target.nextSibling.style.display = 'none';
        }
    }
    function handleClick(e) {
        if (e.target.getAttribute('class') === 'delete-img') { //删除
            var index = e.target.dataset.index;
            var toolbar_tip = $.getElementById('toolbar_tip');
            totalCount--;
            console.log(index);
            queueList[index].deleted = 1;
            console.log(queueList);
            e.target.parentNode.style.display = "none";
            toolbar_tip.innerHTML = "文件数目:" + totalCount;
        }
        if (e.target.getAttribute('id') === 'upload_btn') { // 开始上传
            ajaxUpload();
        }
    }

    function previewFiles(files) {
        var previewbox = $.getElementById('fileList');
        for (var i = 0; i < files.length; i++) {
            queueList.push({
                'file': files[i],
                deleted: 0
            });
            totalSize += files[i].size;
            totalCount++;
            var file = files[i];
            var imgbox = $.createElement('div');
            imgbox.setAttribute('class', 'imgbox');
            var img = $.createElement("img");
            img.setAttribute('class', 'preview-img');
            img.setAttribute('data-index', queueList.length - 1);
            img.file = file;
            var deletebox = $.createElement('div');
            deletebox.setAttribute('class', 'delete-img');
            deletebox.setAttribute('data-index', queueList.length - 1);
            var upload_indicator = $.createElement('div');
            upload_indicator.setAttribute('class', 'upload-indicator');
            upload_indicator.innerHTML = '<div class="wrap circle-right"><div class="circle rightCircle"></div></div><div class="wrap circle-left"><div class="circle leftCircle"></div></div>';
            var filename = $.createElement('p');
            filename.setAttribute('class', 'preview-name');
            filename.innerHTML = file.name;
            imgbox.appendChild(img);
            imgbox.appendChild(deletebox);
            imgbox.appendChild(filename);
            imgbox.appendChild(upload_indicator);
            previewbox.appendChild(imgbox);
            var src = "";
            if (!((src = getPreviewImg(file.type)) === "")) {
                img.src = src;
            } else {
                var reader = new FileReader();
                reader.onload = (function (aimg) {
                    return function (e) {
                        aimg.src = e.target.result;
                    }
                })(img);
                reader.readAsDataURL(file);
            }

        }
        var toobar_tip = $.getElementById('toolbar_tip');
        toolbar_tip.innerHTML = "文件数目:" + totalCount;
    }


    function changeStyle() {  // 改变初始页面的样式,进入预览的状态
        var fileList = $.getElementById('fileList');
        fileList.innerHTML = "";
        setStyle(fileList, {
            'display': 'flex',
            'justify-content': 'flex-start',
            'align-items:': 'flex-start',
            'flex-wrap': 'wrap',
            'border': 'none'
        });
        var toolBar = $.getElementById('toolBar');
        toolBar.style.display = "block";
        toolBar.style.borderTop = "2px solid #e6e6e6";
        isPreview = true;
    }


    //为元素设置css 样式
    function setStyle(ele, obj) {
        for (var i in obj) {
            ele.style[i] = obj[i];
        }
    }

    H5Uploader.prototype.upload = function (url) {
        if (url === "") {
            alert('url 不为空')
            return;
        }
        uploadUrl = url;
    }

    H5Uploader.prototype.create = function (id) {
        uploader = $.getElementById(id);
        var inputfile = $.createElement('input');
        inputfile.setAttribute('type', 'file');
        inputfile.setAttribute('id', 'selectFile');
        inputfile.setAttribute('multiple', true);
        inputfile.setAttribute('style', 'display:none;');
        var fileList = $.createElement('div');
        fileList.setAttribute('id', 'fileList');
        var toolBar = $.createElement('div');
        toolBar.setAttribute('id', 'toolBar');
        uploader.appendChild(fileList);
        uploader.appendChild(toolBar);
        uploader.appendChild(inputfile);
        var placeholder = $.createElement('div');
        placeholder.setAttribute('id', 'placeholder');
        var filePicker = $.createElement('label');
        filePicker.setAttribute('for', 'selectFile');
        filePicker.setAttribute('id', 'filePicker');
        filePicker.innerHTML = "添加文件";
        var drag_tip = $.createElement('p');
        drag_tip.setAttribute('id', 'drag_tip');
        drag_tip.innerHTML = "或将文件拖放到这里";
        fileList.appendChild(placeholder);
        fileList.appendChild(filePicker);
        fileList.appendChild(drag_tip);
        var toolbar_tip = $.createElement('p');
        toolbar_tip.setAttribute('id', 'toolbar_tip');
        toolbar_tip.innerHTML = "文件数目:1 ";
        var btnGroup = $.createElement('div');
        btnGroup.setAttribute('id', 'btnGroup');
        var add_btn = $.createElement('label');
        add_btn.setAttribute('id', 'add_btn');
        add_btn.setAttribute('for', 'selectFile');
        add_btn.innerHTML = "继续添加";
        var upload_btn = $.createElement('div');
        upload_btn.setAttribute('id', 'upload_btn');
        upload_btn.innerHTML = "开始上传";
        btnGroup.appendChild(add_btn);
        btnGroup.appendChild(upload_btn);
        toolBar.appendChild(toolbar_tip);
        toolBar.appendChild(btnGroup);
        addEvent(uploader); // 添加事件
    };

    function sendFile(index, file) {
        var fileList = $.getElementById('fileList');
        var toolbar_tip = $.getElementById('toolbar_tip');
        var xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
            var res;
            if (xhr.status > 200 && xhr.status < 300 || xhr.status == 304) {
                console.error(xhr.responseText);

            } else {
                totalCount--;
                res = JSON.parse(xhr.responseText);
                queueList[index].deleted = 1;
                fileList.childNodes[index].style.display = 'none';
                toolbar_tip.innerHTML = "文件数目:" + totalCount;
            }

        };

        xhr.upload.onloadstart = function (e) {
            fileList.childNodes[index].lastChild.style.display = "block";
        };
        xhr.open('post', uploadUrl, true);
        var data = new FormData();
        data.append('file.name', file);
        xhr.send(data);
    }

    // 文件异步上传
    function ajaxUpload() {
        for (var index in queueList) {
            var file = queueList[index].file;
            var deleted = queueList[index].deleted;
            if (deleted === 1) {
                continue;
            }
            sendFile(index, file);

        }
    }

    function getPreviewImg(type) {
        var ImgType = /^image\//;
        var VideoType = /^video\//;
        var AudioType = /^audio\//;
        var TxtType = /^text\//;
        var ZipType = /^application\/zip$/;
        if (ImgType.test(type)) {
            return "";
        } else if (VideoType.test(type)) {
            return './img/video.png';
        } else if (AudioType.test(type)) {
            return './img/audio.png';
        } else if (ZipType.test(type)) {
            return './img/zip.png';
        } else {
            return './img/txt.png';
        }

    }

    window.H5Uploader = H5Uploader;
})(document, window);