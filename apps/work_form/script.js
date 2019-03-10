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
					"Неработоспособность ЕЛК"
				],
				"CRM": [
					"Неработоспособность CRM"
				],
				"ЕБЗ/СУЗ": [
					"Неработоспособность ЕБЗ",
					"Неработоспособность СУЗ"
				],
				"Биллинг": [
					"Неработоспособность Биллинга"
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
				"Северо-Запад",
				"Волга",
				"Сибирь",
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
			const dateTxt = this.openDate + 'T' + this.openTime;
			return (new Date(dateTxt));
		},
		openLocalDate: function () {
			if (this.openDateObj == '') return '';
			return (this.openDateObj).toLocaleString().slice(0, -3);
		},
		closeDateObj: function () {
			if (this.closeDate == '' || this.closeTime == '') return '';
			const dateTxt = this.closeDate + 'T' + this.closeTime;
			return (new Date(dateTxt));
		},
		closeLocaleDate: function () {
			if (this.closeDateObj == '') return '';
			return (this.closeDateObj).toLocaleString().slice(0, -3);
		},
		moscowDateStamp: function () {
			const date = new Date();
			const y = date.getUTCFullYear();
			const m = date.getUTCMonth();
			const d = date.getUTCDate();
			const h = date.getUTCHours();
			const min = date.getUTCMinutes();
			const sec = date.getUTCSeconds();
			console.log((new Date(y, m, d, h + 3, min + 1, sec)));

			return +(new Date(y, m, d, h + 3, min + 1, sec));
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
			storage.setItem("openDate", this.openDate);
			storage.setItem("openTime", this.openTime);

			console.log('сохранено');
		},
		validAndSaveData: function () {
			this.validateDates();
			this.saveData();
		}
	}
});

vm.probType = storage.getItem('probType') || '...';
vm.mrf = storage.getItem('mrf') || '...';
vm.openDate = (new Date()).toLocaleDateString().split('.').reverse().join('-');

vm.validateDates();
