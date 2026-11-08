const DFLT = { U: undefined, V: '(MCC 4.2)', Z: {} };

class DefaultParameters {
    constructor() { }

    error(paramName = '', stack = '') {
        let caller = stack.split('\n')[1].replace('@', '() - ');
        throw 'The required ' + paramName + " parameter wasn't filled at: \nfunction " + caller + '.';
    }

    get div() {
        this.error('div', (new Error()).stack);
        return document.createElement('div');
    }

    get inp() {
        this.error('input', (new Error()).stack);
        return document.createElement('input');
    }

    get a() {
        this.error('a', (new Error()).stack);
        return document.createElement('a');
    }

    get crash() {
        this.error('crash', (new Error()).stack);
        return new Error();
    }
}

class InputS {
    constructor(id = '', defaultValue) {
        this.element = document.createElement('input');
        this.store = defaultValue;
        this.based = defaultValue;
        this.id = id;
        this.idElementSelect();
    }

    idElementSelect() {
        this.element = document.getElementById(this.id);
        if (!this.element) {
            console.warn("HTMLInputElement '" + this.id + "' does not exist.");
        }
    }

    determineFirstState() {
        const stored = store_inp(this, false);
        if (stored != null) {
            this.store = stored;
        }
        store_man(this.id, this.store);
        return this.store;
    }
}

class CheckBoxS extends InputS {
    constructor(id = '', defaultValue = false) {
        super(id, defaultValue);
        this.value = this.sanitize(this.determineFirstState());
    }

    sanitize(raw = '') {
        if (typeof raw === 'boolean') {
            return raw;
        }
        if (raw === 'true') {
            return true;
        }
        if (raw === 'false') {
            return false;
        }
        throw 'Checkbox first state is not sanitizable.';
    }

    get value() {
        if (!this.element) {
            return console.warn("Cannot get value from HTML Checkbox '" + this.id + "'");
        }
        return this.element.checked;
    }

    set value(checked = false) {
        if (!this.element) {
            return console.warn("Cannot set value from HTML Checkbox '" + this.id + "'");
        }
        this.element.checked = checked;
    }
}

class NumBoxS extends InputS {
    constructor(id = '', defaultValue = 0) {
        super(id, defaultValue);
        this.value = this.determineFirstState();
    }

    get value() {
        return parseInt(this.element.value);
    }

    set value(value = 0) {
        this.element.value = value;
    }
}

class TextBoxS extends InputS {
    constructor(id = '', defaultValue = '') {
        super(id, defaultValue);
        this.value = this.determineFirstState();
    }

    get value() {
        return this.element.value;
    }

    set value(value = '') {
        this.element.value = value;
    }
}

class CheckArrayS {
    constructor(id = '', defaultValue = []) {
        this.element = { value: null };
        this.id = id;
        this.based = defaultValue;
        this.store = defaultValue;
        this.value = this.sanitize(this.determineFirstState());
    }

    determineFirstState() {
        const stored = store_inp(this, false);
        if (stored != null) {
            this.store = stored;
        }
        store_man(this.id, this.store);
        return this.store;
    }

    sanitize(raw = '') {
        if (raw.includes(',')) {
            return raw.split(',');
        }
        if (!raw) {
            return [];
        }
        return [raw];
    }

    get value() {
        return this.element.value;
    }

    set value(value = []) {
        if (typeof value === 'string') {
            value = this.sanitize(value);
        }
        this.element.value = value;
        store_man(this.id, value);
    }
}

class BalloonButtonS {
    constructor(label = '&#10005', title = 'No Button', onClick = () => { }, className = '') {
        const anchor = document.createElement('a');
        anchor.innerHTML = label;
        anchor.className = className;
        anchor.href = 'javascript:void(0)';
        anchor.onclick = onClick;
        return anchor;
    }
}

class WidgetSettings {
    constructor(interval = '', timezone = '', dark = '', style = '', locale = '', toolbarBg = '', hideLegend = '', hideSideToolbar = '', hideTopToolbar = '', allowSymbolChange = '', withDateRanges = '', details = '', hideIdeas = '', range = '', studies = [''], rangeOrInterval = false) {
        this.interval = interval;
        this.timezone = timezone;
        this.theme = this.boolToTheme(dark);
        this.style = style;
        this.locale = locale;
        this.toolbar_bg = toolbarBg;
        this.hide_legend = hideLegend;
        this.hide_side_toolbar = hideSideToolbar;
        this.hide_top_toolbar = hideTopToolbar;
        this.allow_symbol_change = allowSymbolChange;
        this.withdateranges = withDateRanges;
        this.details = details;
        this.hideideas = hideIdeas;
        this.range = range;
        this.studies = studies;
        this.range_or_interval = rangeOrInterval;
    }

    boolToTheme(dark = true) {
        if (dark) {
            return 'dark';
        } else {
            return 'light';
        }
    }
}

class WidgetS {
    constructor(symbol = '', settings = new WidgetSettings(), container = U.div, beforeElement = U.div) {
        if (symbol === 'exit') {
            return;
        }
        this.settings = settings;
        this.symbol = symbol;
        this.id = '' + Math.random();
        this.name = 'box-' + this.id;
        this.element = this.idCreateElement();
        container.insertBefore(this.element, beforeElement);
        this.widget = this.createWidget();
        this.createChartButtons();
    }

    idCreateElement() {
        const box = document.createElement('div');
        box.id = this.name;
        box.setAttribute('name', this.symbol);
        box.className = 'box';
        return box;
    }

    createChartButtons() {
        const settings = this.settings;
        const symbol = this.symbol;
        const buttons = document.createElement('div');
        buttons.className = 'box-button-container';
        this.element.appendChild(buttons);
        let multiTimeframeIcon = '<IMG src="images/multi-timeframe.svg" style="filter: invert(1);"/>';
        buttons.appendChild(new BalloonButtonS(multiTimeframeIcon, 'Multi-Timeframe', () => open('/?c=' + symbol + '&s=1&p=1', '_blank'), 'button-fullscreen'));
        buttons.appendChild(new BalloonButtonS('&#10064', 'Show in fullscreen', ZDirectUI.fullscreen.bind(null, this.element), 'button-fullscreen'));
        buttons.appendChild(new BalloonButtonS('&#10005', 'Remove chart', all.charts.bind.remove_chart.bind(null, this.element, this.symbol), 'button-fullscreen'));
    }

    rangeVsInterval(settings = new WidgetSettings(), options = {}) {
        if (settings.range_or_interval) {
            options.range = settings.range.toUpperCase();
        } else {
            options.interval = settings.interval;
        }
        return options;
    }

    createWidget() {
        const settings = this.settings;
        const studies = settings.studies.map(study => {
            return { id: study + '@tv-basicstudies' };
        });
        return new TradingView.widget(this.rangeVsInterval(settings, {
            container_id: this.name,
            autosize: true,
            symbol: this.symbol,
            timezone: settings.timezone,
            theme: settings.theme,
            style: settings.style,
            locale: settings.locale,
            toolbar_bg: settings.toolbar_bg,
            enable_publishing: false,
            hide_legend: settings.hide_legend,
            hide_side_toolbar: settings.hide_side_toolbar,
            hide_top_toolbar: settings.hide_top_toolbar,
            allow_symbol_change: settings.allow_symbol_change,
            withdateranges: settings.withdateranges,
            details: settings.details,
            hideideas: true,
            studies: studies
        }));
    }
}

class ChartArrayT {
    constructor() {
        this.charts = [new WidgetS('exit', null, null, null)];
        this.charts.pop();
        this.names = [''];
        this.names.pop();
        this.bind = {
            remove_chart: (box = U.div, symbol = '') => {
                box.parentNode.removeChild(box);
                this.pop(this.charts.indexOf(symbol));
            }
        };
    }

    get length() {
        const chartCount = this.charts.length;
        const nameCount = this.names.length;
        if (chartCount !== nameCount) {
            throw 'ChartArray charts[' + chartCount + '] y names[' + nameCount + '] have different lengths.';
        }
        return chartCount;
    }

    push(...symbols) {
        symbols.forEach((symbol = '') => {
            this.names.push(symbol);
            this.charts.push(new WidgetS(symbol, all.widget_settings, html.charts, html.notif));
        });
        OnChartChange.all();
    }

    pop(index = NaN) {
        if (isNaN(index)) {
            throw 'ChartArray pop(id) id is NaN';
        }
        this.charts.splice(index, 1);
        this.names.splice(index, 1);
        OnChartChange.all();
    }
}

class HTMLDragging {
    constructor(selector = '') {
        this.query_selector = selector;
        this.elements = document.querySelectorAll(selector);
        this.drop_upon = null;
        this.drag_enable();
    }

    drag_enable() {
        let dragging = this;
        const order = [];
        this.elements.forEach((box, rank) => {
            const symbol = box.getAttribute('name');
            if (symbol) {
                order.push(symbol);
            }
            box.draggable = true;
            box.ondragenter = () => this.drop_upon = { div: box, rank: rank };
            box.ondragend = function (event) {
                const target = dragging.drop_upon;
                if (rank < target.rank) {
                    target.div.parentElement.insertBefore(this, target.div.nextSibling);
                } else {
                    target.div.parentElement.insertBefore(this, target.div);
                }
                dragging.drag_disable();
                dragging = new HTMLDragging(dragging.query_selector);
            };
        });
        OnChartRearrange.all(order);
    }

    drag_disable() {
        this.elements.forEach(box => {
            box.draggable = false;
        });
    }
}

const exch_fill = {
    forex: {
        all: [
            { name: 'ICE', id: 'FX_IDC' },
            { name: 'Saxo', id: 'SAXO' },
            { name: 'Forex.com', id: 'FOREXCOM' },
            { name: 'OANDA', id: 'OANDA' },
            { name: 'FXCM', id: 'FX' },
            { name: 'Global Prime', id: 'GLOBALPRIME' }
        ],
        match(exchangeName = '', pattern = '') {
            const exchange = this.all.find(entry => entry.name == exchangeName);
            if (!exchange) {
                return false;
            }
            return { name: exchange.id, pattern: pattern };
        }
    },
    crypto: {
        favored: ['Binance', 'Coinbase', 'Gemini', 'KuCoin', 'Bittrex', 'BitMEX', 'Bitfinex'],
        rest: [
            'CEXio',
            'Mercado',
            'OKCoin',
            'OKEx',
            'Phemex',
            'Poloniex',
            'Kraken',
            'Korbit',
            'Huobi',
            'FTX',
            'Deribit',
            'CurrencyCom',
            'Coinfloor',
            'Bybit',
            'Btse',
            'BTCYou',
            'Bitstamp',
            'Bitso',
            'BitMax',
            'BITKUB',
            'Bithumb',
            'bitFlyer',
            'BitCoke',
            'BitBay',
            'Bingbon',
            'UniSwap',
            'TradeStation'
        ],
        match(exchangeName = '', pattern = '') {
            if (!this.favored.includes(exchangeName) && !this.rest.includes(exchangeName)) {
                return false;
            }
            return { name: exchangeName.toUpperCase(), pattern: pattern };
        }
    },
    async go(exchangeName = '', pattern = '') { },
    async search(query = '', market = 'crypto') {
        return [];
    }
};

const OnLoad = {
    all: () => {
        OnLoad.loadHome();
        OnLoad.show_close_ad();
        OnLoad.set_private_status();
        OnLoad.set_scan_status();
        OnLoad.set_indicators();
        const urlCharts = [];
        OnLoad.url_parse_chart_names(urlCharts);
        OnLoad.url_parse_legacy_chart_names(urlCharts);
        OnLoad.clear_url_if_present(urlCharts);
        OnLoad.private_load(urlCharts);
        OnLoad.scan_load(urlCharts);
        OnLoad.url_profile_chart_names(all.charts);
        OnLoad.url_fallback_chart_names(all.charts);
        new HTMLDragging('.box');
        OnLoad.smallify(all.usesmallbutton.value);
        OnLoad.select_range_enable(all.range_or_interval.value);
        OnLoad.insert_buttons_for_add_chart();
    },
    loadHome() {
        const noQuery = window.location.search.length === 0;
        if (noQuery) {
            window.location.href = '/home/';
        }
    },
    show_close_ad() { },
    set_private_status() {
        word.private = location.search.includes('&p=1');
    },
    set_scan_status() {
        word.scan = location.search.includes('&s=1');
    },
    url_parse_legacy_chart_names: (charts = new ChartArrayT(U.crash)) => {
        let regex = /[?&]chart(=([^&#]*)|&|#|$)/g;
        let match = null;
        const found = [];
        while (match = regex.exec(location.search)) {
            found.push(match[2].replace(/\+/g, ' '));
        }
        if (found.length) {
            charts.push(...found);
        }
    },
    url_parse_chart_names: (charts = new ChartArrayT(U.crash)) => {
        const start = location.search.indexOf('c=');
        if (start < 0) {
            return;
        }
        let end = location.search.indexOf('&', start);
        end = end < 0 ? location.search.length : end;
        const names = location.search.substring(start + 2, end).split(',');
        if (names.length) {
            charts.push(...names);
        }
    },
    url_profile_chart_names: (charts = new ChartArrayT(U.crash)) => {
        if (charts.names.length > 0) {
            return;
        }
        const profile = store_man('profile_select', '', false) || 'default';
        if (!profile) {
            return;
        }
        const saved = store_man('profile_' + profile, '', false);
        if (!saved) {
            return;
        }
        charts.push(...saved.split(','));
    },
    url_fallback_chart_names: (charts = new ChartArrayT(U.crash)) => {
        if (charts.names.length > 0) {
            return;
        }
        const legacy = store_man(word.STORAGE_CHARTSPAIRS, null, false);
        if (legacy) {
            charts.push(...legacy.split(','));
        } else {
            charts.push(...[
                'COINBASE:BTCUSD',
                'COINBASE:ETHUSD',
                'COINBASE:LTCUSD',
                'BINANCE:BTCUSDT',
                'KUCOIN:NEARUSDT',
                'KUCOIN:XRPUSDT',
                'BINANCE:ADAUSDT',
                'BINANCE:ETHBTC'
            ]);
        }
    },
    clear_url_if_present: (charts = ['']) => {
        if (word.scan) {
            return;
        }
        if (word.private) {
            return;
        }
        if (!charts.length) {
            return;
        }
        OnChartChange.save_charts(charts, undefined);
    },
    scan_load(charts = ['']) {
        if (!word.scan) {
            return;
        }
        all.width.value = 2;
        all.height.value = 2;
        let repeated = [charts[0], charts[0], charts[0], charts[0]];
        charts = repeated;
        let intervals = ['15', '1H', '4H', '1D'];
        intervals.forEach(interval => {
            let settings = new WidgetSettings(interval, all.timezone.value, all.dark.value, all.style.value, 'en-us', '#f00', all.hide_legend.value, all.hide_side_toolbar.value, all.hide_top_toolbar.value, true, all.withdateranges.value, all.details.value, true, all.range.value, all.studies.value, all.range_or_interval.value);
            all.charts.names.push(charts[0]);
            all.charts.charts.push(new WidgetS(charts[0], settings, html.charts, html.notif));
        });
        OnChartChange.all(html.nav.scrollHeight);
        location.hash = 'undefined';
        location.hash = 'nav';
    },
    private_load(charts = ['']) {
        if (word.scan) {
            return;
        }
        if (!word.private) {
            return;
        }
        all.charts.push(...charts);
    },
    set_indicators: () => {
        all.studies.value.forEach(study => {
            if (!window[study]) {
                console.warn("Could not set Indicator: '" + study + "' because HTML checkbox does not exist");
            } else {
                window[study].checked = true;
            }
        });
    },
    smallify: (small = false) => {
        document.body.classList.toggle('small', small);
    },
    select_range_enable: (useRange = false) => {
        all.interval.element.disabled = useRange;
        all.range.element.disabled = !useRange;
    },
    insert_buttons_for_add_chart: () => { }
};

const OnChartChange = {
    all: () => {
        OnChartChange.resize_chart_boxes(html.nav.scrollHeight);
        OnChartChange.count_charts();
        OnChartChange.calc_charts_url(all.charts.names);
        OnChartChange.save_charts(all.charts.names, undefined);
    },
    resize_chart_boxes: (navHeight = 0, columns = all.width.value, rows = all.height.value, percent = 100) => {
        const boxes = document.getElementsByClassName('box');
        for (const box of boxes) {
            box.style.height = 'calc((' + percent + 'vh / ' + rows + ') - (' + navHeight / rows + 'px))';
            box.style.width = 'calc(' + percent + '% / ' + columns + ')';
        }
    },
    count_charts: (configButton = html.config_reveal, shareButton = html.share_reveal) => {
        configButton.innerHTML = 'Settings';
        shareButton.innerHTML = 'Share ' + all.charts.length;
    },
    calc_charts_url: (names = ['']) => {
        let privateParam = '';
        let scanParam = '';
        if (word.private) {
            privateParam = '&p=1';
        }
        if (word.scan) {
            scanParam = '&s=1';
        }
        let url = location.origin + '/?c=' + names.join(',') + privateParam + scanParam + location.hash;
        const firstWithExchange = names.filter(name => name.includes(':'))[0];
        let title = firstWithExchange ? firstWithExchange.split(':')[0] : names[0];
        title = 'MultiCoinCharts: ' + title;
        html.url.value = location.href;
        html['url-twitter'].href = html['url-twitter'].dataset.original + location.href;
        html['url-facebook'].href = html['url-facebook'].dataset.original + location.href;
        html['url-reddit'].href = html['url-reddit'].dataset.original + location.href;
        document.title = title;
        try {
            history.replaceState(null, title, url);
        } catch (error) { }
    },
    save_charts: (names = [''], profile = 'default') => {
        store_man('profile_' + profile, names.join(','));
    }
};

const OnSizeChange = {
    all: () => {
        OnChartChange.resize_chart_boxes(html.nav.scrollHeight);
        if (word.scan) {
            return;
        }
        store_inp(all.width);
        store_inp(all.height);
    }
};

const OnChartRearrange = {
    all: (names = []) => {
        all.charts.names = names;
        OnChartChange.all();
    }
};

const U = new DefaultParameters();

const word = {
    private: false,
    scan: false,
    DEBUGMODE: false,
    STORAGE_CHARTSPAIRS: 'chartPairs',
    elements: [
        'charts',
        'nav',
        'pairsInputautocomplete-list',
        'chart_name',
        'chart_names',
        'box_space',
        'chart_adder',
        'notif',
        'configChart',
        'theme-toggle',
        'url',
        'modalAd',
        'modalConfig',
        'modalMCC',
        'box_space_img',
        'modalUs',
        'profile_select',
        'config_reveal',
        'share_reveal',
        'charts_order',
        'chart_add',
        'chart_options',
        'modalIndicators',
        'features',
        'chart_add_select',
        'link_set',
        'box_space_google',
        'box_space_google2',
        'top_space',
        'top_space_html',
        'top_space_img',
        'top_space_google',
        'Crypto-Insert',
        'Forex-Insert',
        'Crypto-Insert-Alts',
        'ad-text-anchor'
    ],
    links: [['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', '']]
};

const html = window;

const all = {
    timezone: new TextBoxS('timezone', 'exchange'),
    interval: new TextBoxS('interval', '60'),
    style: new TextBoxS('style', '1'),
    range: new TextBoxS('range', '1M'),
    width: new NumBoxS('width', 3),
    height: new NumBoxS('height', 3),
    details: new CheckBoxS('details', false),
    withdateranges: new CheckBoxS('withdateranges', false),
    hide_top_toolbar: new CheckBoxS('hide_top_toolbar', true),
    usesmallbutton: new CheckBoxS('usesmallbutton', true),
    hide_legend: new CheckBoxS('hide_legend', false),
    hide_side_toolbar: new CheckBoxS('hide_side_toolbar', true),
    range_or_interval: new CheckBoxS('range_or_interval', false),
    dark: new CheckBoxS('dark', true),
    widget_settings: new WidgetSettings(),
    charts: new ChartArrayT('chartPairs', false),
    profile: new TextBoxS('profile_select', 'default'),
    studies: new CheckArrayS('studies', [])
};

function initPage() {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hide');
        html.features.innerHTML += DFLT.V;
        OnChartChange.all();
    }, 250);
    document.addEventListener('keydown', function (event) {
        if (html['box-hides']) {
            if (event.key === 'Escape') {
                XDirectUI.toggle_rearrange_mode();
            }
        }
    });
    const language = navigator.language.includes('-') ? navigator.language.split('-')[0] : 'en';
    all.widget_settings = new WidgetSettings(all.interval.value, all.timezone.value, all.dark.value, all.style.value, language, '#f1f3f6', all.hide_legend.value, all.hide_side_toolbar.value, all.hide_top_toolbar.value, true, all.withdateranges.value, all.details.value, true, all.range.value, all.studies.value, all.range_or_interval.value);
    OnLoad.all();
    V_load();
    location.hash = 'nav';
    all.width.element.addEventListener('change', OnSizeChange.all, true);
    all.height.element.addEventListener('change', OnSizeChange.all, true);
    html.chart_adder.addEventListener('keyup', (event = new KeyboardEvent()) => X_add(event.target.value, event.key === 'Enter'), true);
    location.hash = 'undefined';
    location.hash = 'nav';
}

function V_link() {
    const count = 10;
    const index = Math.random() * count >> 0;
    return;
}

function V_load() { }

const XDirectUI = {
    visibility(id = '') {
        if (!html[id]) {
            console.warn("HTMLElement '" + id + "' was not present on the page.");
        } else {
            html[id].classList.toggle('hide');
        }
    },
    random() {
        const symbols = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSD', 'BINANCE:LTCBTC', 'BINANCE:DOGEBTC'];
        all.charts.push(symbols[Math.floor(Math.random() * symbols.length)]);
    },
    choose_indicators() {
        all.studies.value = INDICATORS.filter(study => window[study].checked);
        location.reload();
    },
    toggle_rearrange_mode() {
        const styleId = 'box-hides';
        const existing = document.getElementById(styleId);
        if (existing) {
            return existing.parentElement.removeChild(existing);
        }
        const html = strings => strings;
        const style = html`
      <style id="box-hides">
        .box {
          display: flex;
          cursor: pointer;
          background: #3334;
          border-radius: 0.5em;
          border: 1em solid #161823;
        }
        .box > div {
          visibility: hidden;
          display: none;
        }
        .box::after {
          content: attr(name);
          text-decoration: underline;
          margin: auto;
          font-size: 2em;
          transition: 0.4s all;
        }
        .box:hover {
          background: #5554;
          color: white;
        }

        #chart_rearrange {
          color: hsl(0deg 0% 80%);
          box-shadow: 0 0 1vw #1041ff, 0 0 3vw #1041ff, 0 0 10vw #1041ff,
            0 0 10vw #1041ff, 0 0 0.4vw #8bfdfe, 0vw 0vw 0.1vw #147280;
          background: transparent;
        }
      </style>
    `;
        document.body.insertAdjacentHTML('afterbegin', style);
    }
};

const ZDirectUI = {
    clipboard(input = U.inp) {
        input.select();
        document.execCommand('copy');
        input.blur();
        alert('Link Copied.');
    },
    fullscreen(element = U.div) {
        if (navigator.userAgent.includes('Chrome')) {
            if (document.isFullScreen || document.fullscreenElement) {
                if ('exitFullscreen' in document) {
                    document.exitFullscreen();
                }
            } else {
                if ('requestFullscreen' in element) {
                    element.requestFullscreen();
                }
            }
        } else {
            element.classList.toggle('fullscreen');
        }
    }
};

async function X_add(text = '', submit = false, results = [], exchange = '') {
    const list = html.chart_options;
    const addChart = (symbol = '') => {
        all.charts.push(symbol);
        alert('Added ' + symbol + '.');
    };
    const clearList = () => {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    };
    list.classList.toggle('border-none', true);
    text = text.toUpperCase();
    if (submit) {
        return addChart(text);
    }
    if (text.length === 1) {
        clearList();
    }
    if (text.length < 2) {
        return;
    }
    list.classList.toggle('border-none', false);
    clearList();
    if (!results.length) {
        const results = await exch_fill.search(text);
        results.forEach(result => {
            const item = document.createElement('li');
            let symbol = result.exchange + ':' + result.symbol;
            item.innerHTML = symbol;
            symbol = item.innerText;
            item.onclick = () => addChart(symbol);
            item.innerHTML = '<strong> ' + result.exchange + ':' + result.symbol + '</strong> <br> ' + result.description + ' ';
            list.appendChild(item);
        });
    } else {
        results.forEach(result => {
            const item = document.createElement('li');
            const symbol = exchange + ':' + result.symbol;
            item.onclick = () => addChart(symbol);
            item.innerText = symbol;
            list.appendChild(item);
        });
    }
}

function store_inp(input = new NumBoxS(), useValue = true) {
    if (useValue) {
        return store_man(input.id, input.value, useValue);
    } else {
        return store_man(input.id, null, false);
    }
}

function store_man(key = '', value = '', write = true) {
    try {
        if (write) {
            if (word.private) {
                return;
            }
            localStorage.setItem(key, value);
        } else {
            return localStorage.getItem(key);
        }
    } catch (error) {
        alert(JSON.stringify(error));
    }
}

function doLOG(message = '', ...args) {
    return;
}

function storeMAN(write = true, key = '', value = '') {
    store_man(key, value, write);
}
