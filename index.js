document.addEventListener('DOMContentLoaded', () => {
    // 1. 데이터 시각화 요소 초기화 실행
    renderBubbleChart();
    renderSidoMap();

    // 2. 스크롤 인터랙션 (Fade-in 효과 적용)
    initScrollAnimation();
});

/**
 * 17개 시도별 교통사고 현황 버블차트 구현 함수
 */
function renderBubbleChart() {
    const rawData = [
        { "sido": "전북특별자치도", "x": 1907, "y": 136, "casualties": 1971 },
        { "sido": "제주특별자치도", "x": 615, "y": 15, "casualties": 640 },
        { "sido": "경상남도", "x": 2675, "y": 116, "casualties": 2778 },
        { "sido": "경상북도", "x": 3054, "y": 123, "casualties": 3173 },
        { "sido": "전라남도", "x": 1685, "y": 134, "casualties": 1809 },
        { "sido": "충청남도", "x": 1494, "y": 77, "casualties": 1534 },
        { "sido": "충청북도", "x": 1725, "y": 87, "casualties": 1841 },
        { "sido": "경기도", "x": 10032, "y": 406, "casualties": 10563 },
        { "sido": "세종특별자치시", "x": 151, "y": 2, "casualties": 161 },
        { "sido": "울산광역시", "x": 817, "y": 27, "casualties": 873 },
        { "sido": "대전광역시", "x": 1436, "y": 88, "casualties": 1518 },
        { "sido": "광주광역시", "x": 1276, "y": 78, "casualties": 1339 },
        { "sido": "인천광역시", "x": 1223, "y": 78, "casualties": 1273 },
        { "sido": "대구광역시", "x": 5903, "y": 177, "casualties": 6175 },
        { "sido": "부산광역시", "x": 4206, "y": 204, "casualties": 4430 },
        { "sido": "서울특별시", "x": 18132, "y": 585, "casualties": 19324 },
        { "sido": "강원특별자치도", "x": 1013, "y": 66, "casualties": 1055 }
    ];

    const colors = [
        'rgba(200, 147, 44, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 
        'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)', 'rgba(255, 99, 255, 0.6)',
        'rgba(99, 255, 132, 0.6)', 'rgba(255, 159, 159, 0.6)', 'rgba(159, 255, 64, 0.6)',
        'rgba(64, 159, 255, 0.6)', 'rgba(206, 86, 255, 0.6)', 'rgba(86, 206, 255, 0.6)',
        'rgba(255, 86, 86, 0.6)', 'rgba(86, 255, 206, 0.6)'
    ];

    const datasets = rawData.map((d, index) => {
        return {
            label: d.sido,
            data: [{
                x: d.x,
                y: d.y,
                r: Math.sqrt(d.casualties) * 0.35,
                casualtiesRaw: d.casualties
            }],
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.6', '1'),
            borderWidth: 1
        };
    });

    const ctx = document.getElementById('bubbleChart').getContext('2d');
    new Chart(ctx, {
        type: 'bubble',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Noto Sans KR' } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const raw = context.raw;
                            return [
                                context.dataset.label,
                                `사고건수: ${raw.x.toLocaleString()}건`,
                                `사망자수: ${raw.y.toLocaleString()}명`,
                                `사상자수: ${raw.casualtiesRaw.toLocaleString()}명`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: '사고건수 (건)', font: { family: 'Noto Sans KR', weight: 'bold' } } },
                y: { title: { display: true, text: '사망자수 (명)', font: { family: 'Noto Sans KR', weight: 'bold' } } }
            }
        }
    });
}

/**
 * Leaflet 기반 시도별 사고건수 단계구분도 지도 지도 시각화 구현 함수
 */
function renderSidoMap() {
    const REGION_DATA = {
        "전북": 1907, "제주": 615, "경남": 2675, "경북": 3054, "전남": 1685,
        "충남": 1494, "충북": 1725, "경기": 10032, "세종": 151, "울산": 817,
        "대전": 1436, "광주": 1276, "인천": 1223, "대구": 5903, "부산": 4206,
        "서울": 18132, "강원": 1013
    };

    const SIDO_NAME_MAP = {
        "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구", "인천광역시": "인천",
        "광주광역시": "광주", "대전광역시": "대전", "울산광역시": "울산", "세종특별자치시": "세종",
        "경기도": "경기", "강원특별자치도": "강원", "강원도": "강원", "충청북도": "충북",
        "충청남도": "충남", "전북특별자치도": "전북", "전라북도": "전북", "전라남도": "전남",
        "경상북도": "경북", "경상남도": "경남", "제주특별자치도": "제주", "제주도": "제주"
    };

    // ColorBrewer 기반 머스타드/옐로우-브라운 단계별 색상 지정
    function getColor(v) {
        return v > 15000 ? '#7f5f10' :
               v > 10000 ? '#b28517' :
               v >  5000 ? '#c8932c' :
               v >  3000 ? '#dfb057' :
               v >  1500 ? '#e9c884' :
               v >   500 ? '#f3e1b6' :
                           '#fcf4dd';
    }

    const GRADES = [0, 500, 1500, 3000, 5000, 10000, 15000];
    const GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/southkorea/southkorea-maps@master/kostat/2018/json/skorea-provinces-2018-geo.json';

    const map = L.map('map').setView([36.3, 127.8], 7);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 대시보드 인포 컨트롤 패널 상단 배치
    const infoCtrl = L.control({ position: 'topleft' });
    infoCtrl.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info-box');
        this.update();
        return this._div;
    };
    infoCtrl.update = function (props, value) {
        this._div.innerHTML = props
            ? `<b>${props}</b><br>사고 ${value.toLocaleString()}건`
            : '<b>시도별 사고건수</b><br>지역에 마우스를 올려보세요';
    };
    infoCtrl.addTo(map);

    function styleFeature(feature) {
        const sido = SIDO_NAME_MAP[feature.properties.name] || feature.properties.name;
        const v = REGION_DATA[sido] || 0;
        return {
            fillColor: getColor(v),
            fillOpacity: 0.8,
            color: '#ffffff',
            weight: 1.5
        };
    }

    function highlight(e) {
        const layer = e.target;
        layer.setStyle({ weight: 3, color: '#111111', fillOpacity: 0.95 });
        layer.bringToFront();
        const sido = SIDO_NAME_MAP[layer.feature.properties.name] || layer.feature.properties.name;
        infoCtrl.update(sido, REGION_DATA[sido] || 0);
    }

    let geoLayer;
    function resetHL(e) {
        geoLayer.resetStyle(e.target);
        infoCtrl.update();
    }

    fetch(GEOJSON_URL)
        .then(r => { if (!r.ok) throw new Error('GeoJSON 로드 에러'); return r.json(); })
        .then(geo => {
            geoLayer = L.geoJSON(geo, {
                style: styleFeature,
                onEachFeature: (feature, layer) => {
                    const sido = SIDO_NAME_MAP[feature.properties.name] || feature.properties.name;
                    const v = REGION_DATA[sido] || 0;
                    layer.bindPopup(`<b>${sido}</b><br>사고건수: ${v.toLocaleString()}건`);
                    layer.bindTooltip(sido, { permanent: true, direction: 'center', className: 'sido-label' });
                    layer.on({ mouseover: highlight, mouseout: resetHL });
                }
            }).addTo(map);
            try { map.fitBounds(geoLayer.getBounds()); } catch (e) {}
        })
        .catch(err => console.error('지도 데이터 로드 중 문제 발생:', err));

    // 범례 엘리먼트 우하단 배치
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info-box legend');
        let html = '<b>사고건수 분배</b><br>';
        for (let i = 0; i < GRADES.length; i++) {
            const from = GRADES[i];
            const to = GRADES[i + 1];
            html += `<i style="background:${getColor(from + 1)}"></i>` +
                    `${from.toLocaleString()}${to ? '&ndash;' + to.toLocaleString() : '+'}<br>`;
        }
        div.innerHTML = html;
        return div;
    };
    legend.addTo(map);

    // 창 리사이즈 대응
    window.addEventListener('resize', () => {
        setTimeout(() => { map.invalidateSize(); }, 400);
    });
}

/**
 * 스크롤 인터랙션 초기화 함수
 */
function initScrollAnimation() {
    const sections = document.querySelectorAll('.paragraph, .visualization-wrapper, .media-container');
    
    sections.forEach(el => el.classList.add('fade-in-element'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
}