const BASE_URL = 'https://api.rss2json.com/v1/api.json?rss_url='
let store = {}

$(document).ready(function () {
    handleRSS()
});

function handleRSS() {
    // initial
    const activeTab = getActiveTab()
    requestAPI(activeTab.attr('data-url'), activeTab.text())
    handleLoading(true)

    $(".tab-option").click(onClickTab);
}

function onClickTab() {
    beforeAddFeeds()
    handleException(false)
    handleLoading(true)

    getActiveTab().addClass('btn-outline-secondary')
    getActiveTab().removeClass('btn-primary')

    $(this).addClass('btn-primary')
    $(this).removeClass('btn-outline-secondary')

    const tabName = $(this).text()

    if (store[tabName]) {
        onSuccessRequest(store[tabName])
        handleLoading()
    } else {
        const url = $(this).attr('data-url')
        requestAPI(url, tabName)
    }
}

function requestAPI(url, tabName) {
    $.ajax({
        url,
        type: 'GET',
        dataType: 'json',
        beforeSend: function (xhr, options) {
            options.url = BASE_URL + options.url;
        },
        success: function (res) {
            onSuccessRequest(res.items, tabName)
            handleLoading()
        },
        error: function (request, message, error) {
            handleException();
            handleLoading()
        }
    });
}

function onSuccessRequest(feeds, tabName) {

    if (tabName) {
        store = {
            ...store,
            [tabName]: feeds
        }
    }

    handlePagination()
}

function addFeedInDOM(feed) {
    const date = new Date(feed.pubDate)
    const parseDate = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear()

    const template = `
     <div class="col">
      <div class="card shadow-sm">
        <img src="${feed.thumbnail}">
        <div class="card-body">
          <h5>${feed.title}</h5>
          <p><a href="#">Read more &rarr;</a></p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">${parseDate}</small>
          </div>
        </div>
      </div>
  `

    $("#feed-inner").append(template);
}

function beforeAddFeeds() {
    // clear bofore append
    $("#feed-inner").empty();

    // ...
}

function handleException(open = true) {
    const el = $('#error-prompt')
    if (open) el.removeClass('visually-hidden')
    else el.addClass('visually-hidden')

    handlePagination()
}

function handleLoading(open = false) {
    const el = $('#loading')

    if (open) el.removeClass('visually-hidden')
    else el.addClass('visually-hidden')
}

function getActiveTab() {
    return $(".btn-group").children(".btn-primary")
}


// pagination
function handlePagination() {
    const pagination = $('.pagination')
    $("#feed-inner").empty();
    pagination.empty()

    const activeTab = getActiveTab()
    const items = store[activeTab.text()]

    if (items) {
        const pageCount = Math.ceil(items.length / 5)

        const logic = (page) => {
            const from = (page - 1) * 5
            const to = (page - 1) * 5 + 5
            const sliced = items.slice(from, to)
            $("#feed-inner").empty();

            sliced.forEach(item => {
                addFeedInDOM(item)
            })
        }

        for (let i = 1; i <= pageCount; i++) {
            pagination.append(
                `<li class="page-item ${i === 1 ? 'active' : ''}"> <a class="page-link" href="#">${i}</a></li>`
            )
        }

        const page = pagination.children(".active").text()
        logic(page)

        $(".page-link").click(function () {
            pagination.children(".active").removeClass('active')
            $(this).parent('.page-item').addClass('active')

            logic($(this).text())
        });
    }

}