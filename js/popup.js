var popup, prevNode;

// Удаление сообщения
var removePopup = function(){
	// Обнуляем отступы для корректной анимации при следующем создании сообщения
	popup.style.marginLeft = 0;
	popup.style.marginTop = 0;

	if (popup.parentNode) popup.parentNode.removeChild(popup);
}

// Определяем, когда надо отобразить сообщение
document.onmouseover = function(event){
	var target = event.target;
	var relatedTarget = event.relatedTarget;

	var onGraph = target?target.classList.contains('graph'):false;
	var fromGraph = relatedTarget?relatedTarget.classList.contains('graph'):false;
	var onPopup = target?target.classList.contains('popup'):false;
	var fromPopup = relatedTarget?relatedTarget.classList.contains('popup'):false;

	// Отображаем новое сообщение, если:
	// - или курсор перешёл на ленту, но не с сообщения
	// - или курсор перешёл на сообщение с ленты, но при этом до этого он был на другой ленте
	if (onGraph && !fromPopup || (fromPopup && onGraph && event.target != prevNode)){
		// Запоминаем, для какой ленты мы отобразили сообщение
		prevNode = target;

		var title = target.dataset.title;

		var from = target.dataset.from;
		from = new Date(from);
		from = from.getDate() + ' ' + months[from.getMonth()];

		var to = target.dataset.to;
		to = new Date(to);
		to = to.getDate() + ' ' + months[to.getMonth()];

		// Если сообщение ещё не было инициализировано - инициализируем его
		if (!popup){
			popup = createElement('div', 'popup');
			popup.onclick = removePopup;
		}

		// Обнуляем данные внутри сообщения
		popup.innerHTML = '';
		popup.className = 'popup';

		var html_title = createElement('h3', '', title);
		popup.appendChild(html_title);
		
		var html_timeline = createElement('div');
		html_timeline.innerHTML = from + ' — ' + to;
		popup.appendChild(html_timeline);

		document.body.appendChild(popup);

		// Применяем анимацию плавного появления
		popup.style.opacity = 0;
		window.getComputedStyle(popup).opacity;
		popup.style.opacity = 1;

		// Высота и ширина треугольника всплывающего окна
		var triangleHeight = 10;
		var triangleWidth = 11;

		// Рассчитываем положение всплывающего сообщения на экране
		var graphLeft = target.offsetLeft + target.parentNode.offsetLeft;
		var graphWidth = target.offsetWidth;
		var graphTop = target.offsetTop + target.parentNode.offsetTop;

		// В Firefox нужно учесть отступ ещё одного родительского элемента
		if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
			graphLeft += target.parentNode.parentNode.offsetLeft;
			graphTop += target.parentNode.parentNode.offsetTop;
		}

		var popupHeight = popup.offsetHeight;
		var popupWidth = popup.offsetWidth;
		var graphHeight = target.offsetHeight;

		var left = graphLeft + graphWidth / 2 - popup.offsetWidth / 2;
		var top = graphTop - popupHeight;

		// marginLeft и marginLeft нужны для анимации всплывания
		// Для разного расположения всплывающего окна они будут работать по-разному
		var marginLeft = 0;
		var marginTop = '-' + triangleHeight + 'px';

		var arrowPosition = 'bottom';

		// Определяем положение сообщения относительно ленты
		if (popupHeight + triangleHeight > graphTop){
			top = graphTop + graphHeight;
			marginTop = triangleHeight + 'px';
			arrowPosition = 'top';
		}

		if (graphLeft + graphWidth / 2 + popupWidth / 2 > window.innerWidth){
			left = graphLeft - popupWidth;
			marginTop = 0;
			marginLeft = '-' + triangleWidth + 'px';
			top = graphTop + graphHeight / 2 - popupHeight / 2;
			arrowPosition = 'right';
		}

		popup.className += ' arrow-' + arrowPosition;

		popup.style.left = left;
		popup.style.top = top;
		popup.style.marginTop = marginTop;
		popup.style.marginLeft = marginLeft;
	}
}


// Определяем, когда надо удалить сообщение
document.onmouseout = function(event){
	var from = event.target;
	var to = event.relatedTarget;
	if (!event.target) return;
	var fromGraph = from.classList.contains('graph');
	var onGraph = to?to.classList.contains('graph'):false;
	var fromPopup = from.classList.contains('popup');
	var onPopup = to?to.classList.contains('popup')||
		(to.parentNode&&to.parentNode.classList&&to.parentNode.classList.contains('popup')):false;
		
	// Удаляем всплывающее сообщение, если курсор находится не на сообщении и:
	// - или курор пришёл с ленты
	// - или курсор пришёл с сообщения не на ленту
	if (popup && !onPopup && (fromGraph || (fromPopup && !onGraph)))
		removePopup();
}