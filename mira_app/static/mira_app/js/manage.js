function addItem(name) {
    let inputEl = $('input#new-product');

    let newInputEl = $('<input>').attr('type', 'checkbox').attr('id', name).attr('value', name).attr('checked', 'checked');
    let newLabelEl = $('<label>').attr('for', name).text(name);
    let newLiEl = $('<li>').append(newInputEl).append(newLabelEl);

     $(newInputEl).on('change', function () {
        sortList();
        sendToDb('update', $(this).attr('value'), $(this).prop('checked'))
     });

    newLiEl.insertBefore(inputEl.parent().parent());
    inputEl.val('');
    sortList();
    sendToDb('create', name, true);
}


function sendToDb(method, text, value=false) {
    let url = '/cart/';
    let data = {
        method: method,
        text: text,
        value: value * 1,
    };

    $.post(url, data,
        function(returnedData){
             if (returnedData.status) {
                 alert('Error sending data to server. Contact admin.')
             }
        }
    );
}


function sortList() {
    let ul = $('ul.ks-cboxtags')[0];
    let newUl = ul.cloneNode(false);

    let checked = [];
    let unchecked = [];
    let inputLi = 0;

    $.each(ul.children, function(i, li) {
        let el = $(li).find('input')[0];

        if ($(el).attr('type') === 'checkbox') {
            if ($(el).prop('checked')) {
                checked.push(li);
            } else {
                unchecked.push(li);
            }
        } else if ($(el).attr('type') === 'text') {
            inputLi = li
        }
    });

    checked.sort(sortingFunction);
    unchecked.sort(sortingFunction);

    $.each(checked, function(i, li) {
        $(newUl).append(li)
    });
    $.each(unchecked, function(i, li) {
        $(newUl).append(li)
    });

    $(newUl).append(inputLi);
    $(ul).replaceWith($(newUl));
}


function sortingFunction(a, b) {
    let aText = $(a).find('label').text();
    let bText = $(b).find('label').text();

    if (aText > bText) {
        return 1
    } else if (bText > aText) {
        return -1
    } else {
        return 0
    }
}


$(document).ready(function () {
    $('input#new-product').on('keypress', function (e) {
        if (e.keyCode === 13) {
            let text = e.target.value;
            if (text) {
                addItem(text);
            }
        }
    });

    $.each($('.ks-cboxtags input[type=checkbox]'), function (i, el) {
        $(el).on('change', function () {
            sortList();
            sendToDb('update', $(el).attr('value'), $(el).prop('checked'))
        })
    })
});
