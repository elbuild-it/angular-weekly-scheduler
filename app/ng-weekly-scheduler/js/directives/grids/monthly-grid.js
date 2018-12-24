/* global GRID_TEMPLATE, CLICK_ON_A_CELL */
angular.module('weeklyScheduler')
  .directive('monthlyGrid', ['weeklySchedulerTimeService', function (timeService) {

    function handleClickEvent(child, totalWidth, nbMonths, idx, scope) {
      child.bind('click', function () {
        scope.$broadcast(CLICK_ON_A_CELL, {
          nbElements: nbMonths,
          idx: idx,
          percentWidthFromBeginning: totalWidth
        });
      });
    }

    function doGrid(scope, element, attrs, model) {

      // Clean element
      element.empty();

      // Calculation month distribution
      var months = timeService.monthDistribution(model.minDate, model.maxDate);
      var days = timeService.dayDistribution(model.minDate, model.maxDate);

      var totalWidth = 0;

      days.forEach(function (day, idx) {
        var child = GRID_TEMPLATE.clone().css({ width: 400 + '%', "margin-top": "14px"});
        // child = GRID_TEMPLATE.clone().css({ width: 2653 + '%'});
        //child.css({ 'border-bottom': "grey"})
        if (angular.isUndefined(attrs.noText)) {
          handleClickEvent(child, totalWidth, months.length, idx, scope);
          child.text(timeService.dF(day.start.toDate(), 'dd/MM/yyyy'));
        }
        totalWidth += day.width;
        element.append(child);
      });

     
    }



    return {
      restrict: 'E',
      require: '^weeklyScheduler',
      link: function (scope, element, attrs, schedulerCtrl) {
        schedulerCtrl.$modelChangeListeners.push(function (newModel) {
    	 
          doGrid(scope, element, attrs, newModel);

           scope.$on("previousDayClick", function(event){
		      	doGrid(scope, element, attrs,event.targetScope.options)
	     	})

           scope.$on("nextDayClick", function(event){
		      	doGrid(scope, element, attrs,event.targetScope.options)
	     	})
        });
      }
    };
  }]);