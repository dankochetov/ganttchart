// Перерисовка всей диаграммы
var redraw = function(){

	categories = [];

	table = document.getElementById('mainTable');
	table.innerHTML = '';

	minTime = maxTime = null;

	// Определяем границы времени, которые будут показываться на диаграмме
	for (var i in data){

		var row = data[i];

		// Если неправильно задано время - пытаемся восстановить
		if (parseDate(row.from) >= parseDate(row.to)){
			var t = row.from;
			data[i].from = row.to;
			data[i].to = t;
		}

		//Пропускаем не отображаемые категории
		if (categoriesToShow[row.category] == false) continue;

		var from = parseDate(row.from);
		var to = parseDate(row.to);
		if (!minTime || from < minTime) minTime = from;
		if (!maxTime || to > maxTime) maxTime = to;
	}

	// Сдвигаем время на диаграмме влево, чтобы она всегда начиналась с понедельника
	// Учитываем, что getDay() возвращает 0 для воскресенья
	var curDay = (new Date(minTime)).getDay() - 1;
	if (curDay == -1) curDay = 6;
	minTime = new Date(minTime - 1000 * 60 * 60 * 24 * curDay);

	// Вычисляем количество недель, которые будут показаны на диаграмме
	var weeksCount = Math.ceil((Date.parse(maxTime) - Date.parse(minTime)) / 1000 / 60 / 60 / 24 / 7); 

	// Номер текущей строки на диаграмме
	var ind = 0;

	// Индекс последней добавленной на диаграмму строки
	var lastRow = 0;

	// Список уже нарисованных спрятанных категорий
	var hiddenCategories = [];

	// Основной цикл - пытаемся нарисовать каждую ленту
	for (var i = 0; i < data.length; ++i){
		var row = data[i];

		// Если время начала и конца этапа совпадает - пропускаем его
		if (parseDate(row.from) == parseDate(row.to)) continue;

		// Пропускаем не отображаемые категории
		if (categoriesToShow[row.category] == false){
			hiddenCategories[row.category] = true;
			continue;
		}

		var tr, td_graphrow, td_category;
		// Пытаемся найти среди уже добавленных строк строку с такой же категорией
		// f - флаг, указывающий, создали ли мы ранее строку с этой категорией
		var f = false;
		for (var k = 0; k < categories.length; ++k){

			// Если такая категория уже была создана, запоминаем номер строки с ней и вместо создания элементов находим уже существующие
			if (categories[k] == row.category){
				f = true;
				ind = k + 1;
				tr = document.getElementById('row' + ind);
				td_graphrow = document.getElementById('graphrow' + ind);
				break;
			}
		}
		// Если уже добавленная категория не была найдена - создаём новую
		if (!f){

			// Переходим на новую строку
			ind = ++lastRow;

			// Добавляем новую категорию в список категорий
			categories.push(row.category);

			tr = createElement('div', 'row');
			tr.id = 'row' + ind;
			table.appendChild(tr);

			td_category = createElement('div', 'col category');

			var categoryName = createElement('div', 'name', row.category || row.title);
			var nameWidth = Math.max(categoryNameMinWidth, categoryNameMaxWidth * window.innerWidth / screen.width);
			categoryName.style.width = nameWidth;
			td_category.appendChild(categoryName);

			var removeBtn = createElement('span', 'removeBtn', '&times;');
			removeBtn.title = 'Скрыть эту категорию';
			td_category.appendChild(removeBtn);

			td_category.dataset.category = row.category;

			removeBtn.onclick = function(){
				categoriesToShow[this.parentNode.dataset.category] = false;
				redraw();
			}

			tr.appendChild(td_category);
		}

		// Лента, отображающая текущий этап
		var graph = createElement('div', 'graph');
		graph.id = 'graph' + ind;

		graph.style.backgroundColor = colors[i % colors.length];

		// Если категория уже была создана - добавляем новую ленту в контейнер лент
		if (f)
			td_graphrow.insertBefore(graph, document.getElementById('graph' + ind).nextSibling);
		else{

			// Иначе создаём контейнер лент и добавляем в него первую ленту
			td_graphrow = createElement('div', 'graphRow');
			td_graphrow.id = 'graphrow' + ind;
			td_graphrow.appendChild(graph);
			tr.appendChild(td_graphrow);
		}
		
		if (!f)
			// Если создали новую категорию - рисуем к ней вехи времени
			for (var k = 0; k < weeksCount; ++k){
				var td_interval = createElement('div', 'col interval');

				// Нужно, чтобы строки не меняли размер при масштабировании
				var spaceholder = createElement('div', 'spaceholder');
				var innerSpaceholder = createElement('div');
				spaceholder.appendChild(innerSpaceholder);
				td_interval.appendChild(spaceholder);

				tr.appendChild(td_interval);
			}

		// Перерисовка ленты

		// Считаем ширину недельного интервала как среднее арифметическое длин всех интервалов
		weekIntervalWidth = 0;
		var intervals = document.getElementsByClassName('interval');
		for (var k = 0; k < weeksCount; ++k)
			weekIntervalWidth += intervals[k].offsetWidth * 1;
		weekIntervalWidth /= weeksCount;

		var from = parseDate(row.from);
		var to = parseDate(row.to);

		// Длительность этапа в днях
		var time = (to - from) / 1000 / 60 / 60 / 24;

		var width = time * weekIntervalWidth / 7;

		// Сдвиг ленты - количество дней от начала отсчёта
		// Ширина сдвига - сумма ширин интервалов
		var diff = (from - minTime) / 1000 / 60 / 60 / 24;
		var offset = 0;
		for (var k = 0; k < Math.floor(diff / 7); ++k)
			offset += intervals[k].offsetWidth;
		offset += intervals[k].offsetWidth / 7 * (diff % 7);

		graph.style.width = width + 'px';
		graph.style.marginLeft = '-' + width + 'px';
		graph.style.left = (width + offset) + 'px';

		// Текст на ленте
		var text = '&nbsp;&nbsp;' + (row.title || row.category).trim();

		// Прячем текст ленты, если она слишком короткая
		if (width < graphWithTextMinWidth)
			graph.innerHTML = '&nbsp;';
		else
			graph.innerHTML = text;

		graph.dataset.title = row.title || row.category;
		graph.dataset.from = from;
		graph.dataset.to = to;

	}

	// Отрисовка дат под диаграммой - асинхронно для корректного вычисления позиций
		// Удаляем предыдущие даты
		var dates = document.getElementsByClassName('date');
		while (dates[0]) dates[0].parentNode.removeChild(dates[0]);

		// Каждую дату добавляем к соответствующей интервальной ячейке самой нижней строки
		for (var k = 0; k <= weeksCount; ++k){
			date = new Date(minTime - ((new Date().getTimezoneOffset()) * 60000) + 1000 * 60 * 60 * 24 * 7 * k);
			date = date.getDate() + ' ' + months[date.getMonth()];
			intervalDate = createElement('div', 'date', date);

			// Динамически вычисляем размер шрифта в зависимости от ширины экрана
			// Задаём при этом максимально возможный размер
			var fontSize = Math.max(dateFontSizeMin, dateFontSizeMax * window.innerWidth / screen.width) + 'pt';
			intervalDate.style.fontSize = fontSize;
			var width = calcWidth(date, fontSize);
			intervalDate.style.backgroundColor = 'transparent';
			intervalDate.style.marginLeft = '-' + width / 2 + 'px';
			var td_interval;
			if (k == weeksCount){
				intervalDate.style.marginLeft = (weekIntervalWidth -  width / 2) + 'px';
				td_interval = table.querySelector('.row:last-of-type .interval:nth-last-child(1)');
			}
			else
				// Почему-то нумерация интервалов начинается с 3
				td_interval = table.querySelector('.row:last-of-type .interval:nth-of-type(' + (k*1+3) + ')');
			td_interval.appendChild(intervalDate);
		}


	// Отрисовка блока со списком скрытых категорий

	// Если блок уже создан во время предыдущей отрисовки диаграммы - удаляем его
	if (tr_hiddenCategories){
		tr_hiddenCategories.parentNode.removeChild(tr_hiddenCategories);
		tr_hiddenCategories = null;
	}

	if (Object.keys(hiddenCategories).length > 0){
		tr_hiddenCategories = createElement('div', 'hiddenCategoriesRow');
		var text = createElement('h4', '', 'Скрытые категории');
		tr_hiddenCategories.appendChild(text);

		// Выводим список скрытых категорий
		for (var category in hiddenCategories){
			var label = createElement('div', 'categoryLabel', category);
			label.dataset.category = category;

			// При нажатии на категорию она вновь отображается на диаграмме
			label.onclick = function(){
				categoriesToShow[this.dataset.category] = true;
				this.parentNode.removeChild(this);
				redraw();
			}

			tr_hiddenCategories.appendChild(label);
		}
		document.body.appendChild(tr_hiddenCategories);
	}


}

window.onload = window.onresize = redraw;