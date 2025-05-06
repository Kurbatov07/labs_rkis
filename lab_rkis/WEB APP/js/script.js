//#region глобальные переменные

const HOST = `http://web-app.api-web-tech.local`;
const CONTENT = document.querySelector('.content');

function _get(url, callback) {
    const HTTP_REQUEST = new XMLHttpRequest();
    HTTP_REQUEST.open('GET', url);
    HTTP_REQUEST.send();
    HTTP_REQUEST.onreadystatechange = function () {
        if (HTTP_REQUEST.readyState === 4) {
            callback(HTTP_REQUEST.responseText);
        }
    };
}

function _post(url, data, callback) {
    const HTTP_REQUEST = new XMLHttpRequest();
    HTTP_REQUEST.open('POST', url);
    HTTP_REQUEST.setRequestHeader('Accept', 'application/json');

    HTTP_REQUEST.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    const params = new URLSearchParams(data).toString();

    HTTP_REQUEST.send(params);

    HTTP_REQUEST.onreadystatechange = function () {
        if (HTTP_REQUEST.readyState === 4) {
            callback(HTTP_REQUEST.responseText);
        }
    };
}

function _elem(selector) { return document.querySelector(selector); }

function _load(url, callback) {
    const HTTP_REQUEST = new XMLHttpRequest();
    HTTP_REQUEST.open('GET', url);
    HTTP_REQUEST.send();

    HTTP_REQUEST.onreadystatechange = function () {
        if (HTTP_REQUEST.readyState === 4 && callback) {
            callback(HTTP_REQUEST.responseText);
        }
    };
}

//#endregion 

//#region Registration

_get(`modules/authorization.html`, function (responseText) {
    CONTENT.innerHTML = responseText;

    document.querySelector(`.go-register`).addEventListener('click', function () {
        _load(`modules/registration.html`, function (responseText) {
            CONTENT.innerHTML = responseText;

            document.querySelector(`.register`).addEventListener(`click`, function () {
                let data = new FormData();
                data.append("email", document.querySelector('input[name="email"]').value);
                data.append("password", document.querySelector('input[name="password"]').value);
                data.append("first_name", document.querySelector('input[name="first_name"]').value);
                data.append("last_name", document.querySelector('input[name="last_name"]').value);

                _post(`${HOST}/registration/`, data, function (responseText) {
                    try {
                        responseText = JSON.parse(responseText);
                        if (responseText.success) {
                            let token = responseText.token;
                            onloadProfile();
                        }
                    } catch (e) {
                        console.error('Ошибка при парсинге JSON:', e);
                    }
                });
            });
        });
    });

    //#region Authorization

    document.querySelector('.authorize').addEventListener('click', function () {
        let data = new FormData();
        data.append("email", document.querySelector('input[name="email"]').value);
        data.append("password", document.querySelector('input[name="password"]').value);

        _post(`${HOST}/authorization/`, data, function (responseText) {
            try {
                responseText = JSON.parse(responseText);

                if (responseText.success) {
                    let token = responseText.token;
                    onloadProfile();
                }
            } catch (e) {
                console.error('Ошибка при парсинге JSON:', e);
            }
        });
    });
});

//#endregion

//#region Profile 

function onloadProfile() {
    _load('./modules/profile.html', function (responseText) {
        CONTENT.innerHTML = responseText;
        setupProfileEventListeners();
    });
}

function setupProfileEventListeners() {
    document.querySelector('.btn-upload-file').addEventListener('click', function () {
        _load(`/modules/upload.html`, function (responseText) {
            CONTENT.innerHTML = responseText;

            document.querySelector(`.download1`).addEventListener(`click`, function () {
                _get(`.uploadedfiles`, function (responseText) {
                    CONTENT.innerHTML = responseText;
                });
            });

            document.querySelector('.btn-to-disk').addEventListener('click', function () {
                onloadProfile();

            });
        });
    });
}


function uploadedfiles() {
    console.log('uploadedfiles()')
    document.querySelector('.download1').addEventListener('click', function () {
        makeLoadTable();
        loadTable();
    });
}

function loadTable() {
    console.log('makeLoadTable()');
    let adata = new FormData();
    adata.append('token', TOKEN);

    _post(`${HOST}/disk`, adata, function (responseText) {
        let uploadedfiles;
        try {
            uploadedfiles = JSON.parse(responseText);
        } catch (e) {
            console.error('Ошибка при парсинге JSON:', e);
            return;
        }

        let table = document.querySelector('tbody');
        table.innerHTML = '';

        for (let i = 0; i < uploadedfiles.length; i++) {
            const element = uploadedfiles[i];

            let row = document.createElement('tr');

            let id = document.createElement('td');
            id.textContent = element.file_id;
            row.appendChild(id);

            let name = document.createElement('td');
            name.textContent = element.name;
            row.appendChild(name);

            let download = document.createElement('td');
            let link = document.createElement('a');
            link.setAttribute('href', `${HOST}${element.url}`);
            link.setAttribute('download', element.name);
            link.textContent = 'Скачать';
            download.appendChild(link);
            row.appendChild(download);

            let deletefile = document.createElement('td');
            let delLink = document.createElement('a');
            delLink.setAttribute('href', '#');
            delLink.setAttribute('data-file-id', element.file_id);
            delLink.textContent = 'Удалить';

            delLink.addEventListener('click', function (event) {
                event.preventDefault();
                deleteFile(element.file_id);
            });

            deletefile.appendChild(delLink);
            row.appendChild(deletefile);

            table.appendChild(row);

           
        }
    });
}


/*let fdata = new FormData();
fdata.append('token', token)
let xhr = new XMLHttpRequest();
xhr.open("POST" , `${HOST}/disk`);
xhr.send(fdata);
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            let resp = JSON.parse(xhr.responseText)
            makeLoadTable(resp)
        }
        if (xhr.status == 403) {
            let resp = JSON.parse (xhr.responseText)
            alert(resp.message)
        }
    }
}

function makeLoadTable(data) {
    data.forEach(element => {
        let row = document.createElement('tr')
        any
        cell = document.createElement('td')
        cell.textContent = element.name
        row.append(cell)

        document.querySelector('data table tbody').append(row)
    });
}

function makeLoadTablecell (content) {
    let cell = document.createElement('td')
    cell.textContent = content
    return cell;
}

function makeLoadTable (data) {
    data.forEach(element => {
        let row = document.createElement('tr')

        row.append(makeLoadTablecell(element.name_file))
        row.append(makeLoadTablecell(element.download))
    })
}
    */
//#endregion