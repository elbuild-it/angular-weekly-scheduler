angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])

  .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
    localeServiceProvider.configure({
      doys: {'es-es': 4},
      lang: {'es-es': {month: 'Mes', weekNb: 'número de la semana', addNew: 'Añadir'}},
      localeLocationPattern: '/vendor/angular-i18n/angular-locale_{{locale}}.js'
    });
  }])

  .controller('DemoController', ['$scope', '$timeout', 'weeklySchedulerLocaleService', '$log',
    function ($scope, $timeout, localeService, $log) {
      

     $scope.options = {minDate : moment(), maxDate :  moment().add(1, 'days')}

      $scope.model = {
        locale: localeService.$locale.id,
        options : $scope.options,
        items: [{
          label: 'Item 56',
          editable: true,
          schedules: [
            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}, rgb : "red"},
            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}, rgb : "red"},

          ]
        },
        {
          label: 'Item 58',
          editable: true,
          schedules: [
            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}, rgb : "red"},
            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}},

          ]
        }]
      };

      this.nextDay = function(event){
	  	 $scope.model = {
	        locale: localeService.$locale.id,
	        options : $scope.options,
	        items: [{
	          label: 'Item 598',
	          editable: true,
	          schedules: [
	            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}, rgb : "yellow"},
	            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
	            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}, rgb : "red"},

	          ]
	        },
	        {
	          label: 'Item 52',
	          editable: true,
	          schedules: [
	            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}, rgb : "geen"},
	            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
	            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}},

	          ]
	        }]
	      };
      }

      this.redirect = function(event){
      	console.log("ciao", event);
      }

      /*$scope.$on("nextDayClick", function(event){
		     $scope.model = {
		        locale: localeService.$locale.id,
		        options : $scope.options,
		        items: [{
		          label: 'Item 59',
		          editable: true,
		          schedules: [
		            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}},
		            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
		            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}, rgb : "red"},

		          ]
		        },
		        {
		          label: 'Item 65',
		          editable: true,
		          schedules: [
		            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}, rgb : "red"},
		            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
		            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}},

		          ]
		        }]
		      };
 	  })


 	  $scope.$on("previousDayClick", function(event){
		     $scope.model = {
		        locale: localeService.$locale.id,
		        options : $scope.options,
		        items: [{
		          label: 'Item 59',
		          editable: true,
		          schedules: [
		            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}},
		            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
		            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}, rgb : "red"},

		          ]
		        },
		        {
		          label: 'Item 65',
		          editable: true,
		          schedules: [
		            {start:{hour : 3, minute : 30} , end: {hour : 5, minute : 45}, rgb : "red"},
		            {start:{hour : 6, minute : 30} , end: {hour : 8, minute : 30}, rgb : "red"},
		            {start:{hour : 9, minute : 30} , end: {hour : 18, minute : 30}},

		          ]
		        }]
		      };
 	  })

      

     /* $timeout(function () {
        $scope.model.items = $scope.model.items.concat([{
          label: 'Item 2',
          schedules: [
            {start: moment('2016-05-03').toDate(), end: moment('2017-02-01').toDate()},
            {start: moment('2015-11-20').toDate(), end: moment('2016-02-01').toDate()}
          ]
        }, {
          label: 'Item 3',
          schedules: [
            {start: moment('2017-08-09').toDate(), end: moment('2017-08-21').toDate()},
            {start: moment('2017-09-12').toDate(), end: moment('2017-10-12').toDate()}
          ]
        }]);
      }, 1000);*/

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        $log.debug('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };

      this.onLocaleChange = function () {
        $log.debug('The locale is changing to', $scope.model.locale);
        localeService.set($scope.model.locale).then(function ($locale) {
          $log.debug('The locale changed to', $locale.id);
        });
      };
    }]);