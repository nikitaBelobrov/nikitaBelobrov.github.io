/*jshint esversion: 6*/
/*globals chrome, document, console, SKUF, setTimeout, console, window, log, Vue, alert*/
"use strict";
const w = window,
	d = document,
	$ = d.querySelector.bind(d),
	$$ = d.querySelectorAll.bind(d),
	storage = w.localStorage;

const vm = new Vue({
	el: '#app',
	data: {
		formMode: '...',
		validOpenDate: 'yes',
		validCloseDate: 'yes',
		msgType: '...',
		probType: '...',
		mrf: '...',
		moscowTimeDiff: '0',
		openDate: '',
		openTime: '',
		closeDate: '',
		closeTime: '',
		comment: '',
		reason: 'выясняется',
		resolveTime: '',
		queue: '',
		SLHour: '',
		capacityHour: '',

		lists: {
			msgTypes: {
				'...': '...',
				'FAIL': 'сообщаем о событии',
				'UP': 'обновляем информацию о событии',
				'DONE': 'событие завершено'
			},
			probTypes: {
				"...": ['...'],
				"Недоступность услуг (указать каких)": [
					"Незапланированные тех. работы со стороны РТК",
					"Авария на сети РТК"
				],
				"СМС рассылка/Счета/ЦСДЗ/Акция": [
					"Незапланированный запуск акций",
					"Незапланированные изменения условий предоставления услуг",
					"Некорректное информирование клиентов"
				],
				"Платежи": [
					"Сбой в системе оплаты услуг"
				],
				"IVR": [
					"Сбой в работе IVR"
				],
				"ЦОВ/Омничат": [
					"Недоступность 8-800",
					"Сбой маршрутизации вызовов внутри АПК Единого контактного центра"
				],
				"ЦОВ": [
					"Сброс вызовов"
				],
				"РМ Сетевой Доступ/питание": [
					"Неработоспособность АРМ оператора"
				],
				"ЕЛК": [
					"Неработоспособность ЕЛК",
					"Неработоспособность ЕИССД"
				],
				"CRM": [
					"Неработоспособность CRM"
				],
				"ЕБЗ/СУЗ": [
					"Неработоспособность ЕБЗ",
					"Неработоспособность СУЗ"
				],
				"Биллинг": [
					"Неработоспособность Биллинга",
					"Неработоспособность ПО \"Агент по продажам\""
				],
				"Техучёт": [
					"Неработоспособность Техучёта"
				],
				"Персонал": [
					"Эвакуация персонала"
				],
				"Телеграммы": [
					"Неработоспособность ПО для обработки телеграмм"
				],
				"Угроза теракта": [
					"Угроза теракта"
				]
			},
			mrfs: [
				"...",
				"Уфа",
				"Северо-Запад",
				"Волга",
				"Сибирь Барнаул",
				"Сибирь Омск",
				"ДВ",
				"Центр",
				"Юг",
				"Урал"
			]
		}
	},
	computed: {
		probTypesSorted: function () {
			return Object.keys(this.lists.probTypes).sort();
		},
		openDateObj: function () {
			if (this.openDate == '' || this.openTime == '') return '';
			
			return moment(this.openDate + ' ' + this.openTime,"YYYY-MM-DD HH:mm");
		},
		openLocalDate: function () {
			if (this.openDateObj == '') return '';
			
			return this.openDateObj.format('DD.MM.YYYY HH:mm');
		},
		closeDateObj: function () {
			if (this.closeDate == '' || this.closeTime == '') return '';
			
			return moment(this.closeDate + ' ' + this.closeTime,"YYYY-MM-DD HH:mm");
		},
		closeLocaleDate: function () {
			if (this.closeDateObj == '') return '';
			return this.closeDateObj.format('DD.MM.YYYY HH:mm');;
		},
		moscowDateStamp: function () {
			const moscowTime = moment().subtract(this.moscowTimeDiff, 'hours');
	
			return +moscowTime;
		},
		result: function () {
			let str = '';

			str += (this.msgType) ? `${this.msgType}: ` : '';
			str += (this.probType) ? `${this.probType}\n` : '\n';
			str += (this.mrf) ? `МРФ: ${this.mrf}\n` : '';
			str += (this.openLocalDate) ? `Начало: ${this.openLocalDate} мск\n` : '';
			str += (this.closeLocaleDate) ? `Завершение: ${this.closeLocaleDate} мск\n` : '';
			str += (this.comment) ? `Комментарий: ${this.comment}\n` : '';
			str += (this.reason) ? `Причина: ${this.reason}\n` : '';
			str += (this.resolveTime) ? `Срок восстановления: ${this.resolveTime}\n` : '';
			str += (this.queue) ? `Очередь: ${this.queue}\n` : '';
			str += (this.SLHour) ? `SL в часе: ${this.SLHour}\n` : '';
			str += (this.capacityHour) ? `Превышение нагрузки в часе: ${this.capacityHour}` : '';

			return str.trim();
		}
	},
	methods: {
		changeMode: function () {
			this.formMode = this.msgType;
			const mode = this.formMode;

			switch (mode) {
				case 'FAIL':
					this.resolveTime = '';
					this.queue = '';
					this.SLHour = '';
					this.capacityHour = '';
					this.reason = 'выясняется'
					break;
				case 'UP':
					this.resolveTime = '';
					this.queue = '';
					this.SLHour = '';
					this.capacityHour = '';
					break;
				case 'DONE':
					this.reason = '';
					break;
			}
		},
		copyResult: function (e) {
			const self = e.target;
			self.disabled = true;

			const resultArea = $('.result_area');
			resultArea.select();

			const copy = d.execCommand('copy');

			if (copy === true) {
				self.textContent = 'Скопировано';
				setTimeout(function () {
					self.textContent = 'Копировать';
					self.disabled = false;
				}, 1000);
			}

			resultArea.blur();
		},
		validateDates: function () {
			const openDateStamp = +this.openDateObj;
			const closeDateStamp = +this.closeDateObj;

			if (!openDateStamp && !closeDateStamp) return;

			if (openDateStamp && openDateStamp > this.moscowDateStamp) {
				this.validOpenDate = 'no';
			} else {
				this.validOpenDate = 'yes';
			}

			if (closeDateStamp && closeDateStamp > this.moscowDateStamp) {
				this.validCloseDate = 'no';
			} else {
				this.validCloseDate = 'yes';
			}
		},
		saveData: function () {
			storage.setItem("probType", this.probType);
			storage.setItem("mrf", this.mrf);
			storage.setItem("moscowTimeDiff", this.moscowTimeDiff);
			storage.setItem("openDate", this.openDate);
			storage.setItem("openTime", this.openTime);

			console.log('сохранено');
		},
		validAndSaveData: function () {
			this.validateDates();
			this.saveData();
		},
		disableCopy: function(e) {
			if (this.validOpenDate === 'no' || this.validCloseDate === 'no') {
				alert('По всей видимости вы указали не московское время, для копирования необходимо исправить!');
				e.preventDefault();
			}
		}
	}
});

vm.probType = storage.getItem('probType') || '...';
vm.mrf = storage.getItem('mrf') || '...';
vm.openDate = (new Date()).toLocaleDateString().split('.').reverse().join('-');
vm.moscowTimeDiff = +storage.getItem("moscowTimeDiff");


vm.validateDates();
