// Цвета для рисования полос на диаграмме
var colors = ['#FF7103', '#FD0002', '#C20201', '#FF01FD', '#85016F', '#570069', '#032A6B', '#02AEC2', '#026CA6', '#026802', '#01C303'];

// Названия месяцев
var months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

// Создаёт DOM-элемент с заданными параметрами
var createElement = function(type, classes, content){
	var e = document.createElement(type);
	e.className = classes || '';
	e.innerHTML = content || '';
	return e;
}

// Трансформирует строку с датой в стандартный вид (месяц/число/год) и оборачивает в объект Date
var parseDate = function(date){
	var date = date.split('.');
	var res = new Date(date[1] + '/' + date[0] + '/' + date[2]);
	return res;
}

// Считает длину строки в пикселях
var calcWidth = function(text, fontSize){
	var div = document.createElement('div');
	div.style.fontFamily = 'Open Sans, sans-serif';
	div.style.fontSize = fontSize;
	div.style.display = 'inline';
	div.style.whiteSpace = 'nowrap';
	div.innerHTML = text;
	document.getElementById('mainTable').appendChild(div);
	var width = div.offsetWidth;
	document.getElementById('mainTable').removeChild(div);
	return width;
}

// Ширина недельного интервала в пикселях
var weekIntervalWidth;

// Границы времени, отображаемого на диаграмме
var minTime, maxTime;

// Вся диаграмма
var table;

// Строка с датами под диаграммой
var tr_dates;

// Строка со списком скрытых категорий
var tr_hiddenCategories;

// Список категорий для поиска
var categories;

// Список видимых категорий
var categoriesToShow = [];

// Минимальная ширина ленты, при которой на ней будет отображаться текст
var graphWithTextMinWidth = 50;

// Минимальный и максимальный ширины ячейки с названием категории
var categoryNameMinWidth = 50;
var categoryNameMaxWidth = 160;

// Минимальный и максимальный размеры шрифта дат под диаграммой
var dateFontSizeMin = 6;
var dateFontSizeMax = 10;

//Оставляем только корректные данные
var sz = data.length;
var newData = [];
for (var i = 0; i < sz; ++i)
	if (parseDate(data[i].from) != parseDate(data[i].to))
		newData.push(data[i]);

data = newData;