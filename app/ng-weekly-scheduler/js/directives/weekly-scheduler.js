/* global mouseScroll, CLICK_ON_A_CELL, zoomInACell */
angular.module('weeklyScheduler')

  .directive('weeklyScheduler', ['$parse', 'weeklySchedulerTimeService', '$log', function ($parse, timeService, $log) {

    var defaultOptions = {
      monoSchedule: false,
      selector: '.schedule-area-container'
    };

    /**
     * Configure the scheduler.
     * @param schedules
     * @param options
     * @returns {{minDate: *, maxDate: *, nbWeeks: *}}
     */
    function config(schedules, options) {
      var now = moment();

      // Calculate min date of all scheduled events
     /* var minDate = (schedules ? schedules.reduce(function (minDate, slot) {
        return timeService.compare(slot.start, 'isBefore', minDate);
      }, now) : now).startOf('week');*/
      var minDate = options.minDate;
      var maxDate = options.maxDate;

      // Calculate max date of all scheduled events
     /* var maxDate = (schedules ? schedules.reduce(function (maxDate, slot) {
        return timeService.compare(slot.end, 'isAfter', maxDate);
      }, now) : now).clone().add(1, 'year').endOf('week');
*/	
      //console.log("MinDate : ", minDate);
     // console.log("maxDate : ", maxDate);
      // Calculate nb of weeks covered by minDate => maxDate
      var nbWeeks = timeService.weekDiff(minDate, maxDate);

      var nbDays = timeService.dayDiff(minDate, maxDate);

      var result = angular.extend(options, {minDate: minDate, maxDate: maxDate, nbWeeks: nbWeeks, nbDays : nbDays, nbHours : (24*nbDays)});
      // Log configuration
      $log.debug('Weekly Scheduler configuration:', result);

      return result;
    }

    return {
      restrict: 'E',
      require: 'weeklyScheduler',
      transclude: true,
      
      templateUrl: 'ng-weekly-scheduler/views/weekly-scheduler.html',
   	  controller: ['$injector', function ($injector) {
        // Try to get the i18n service
        var name = 'weeklySchedulerLocaleService';
        if ($injector.has(name)) {
          $log.info('The I18N service has successfully been initialized!');
          var localeService = $injector.get(name);
          defaultOptions.labels = localeService.getLang();
        } else {
          $log.info('No I18N found for this module, check the ng module [weeklySchedulerI18N] if you need i18n.');
        }

        // Will hang our model change listeners
        this.$modelChangeListeners = [];
      }],
      controllerAs: 'schedulerCtrl',
      link: function (scope, element, attrs, schedulerCtrl) {
        var optionsFn = $parse(attrs.options),
          options = angular.extend(defaultOptions, optionsFn(scope) || {});

        // Get the schedule container element
        var el = element[0].querySelector(defaultOptions.selector);
        
    	scope.elementClickedFunction = function(item){
            scope.$broadcast('ride-click', {ride : item});
    	}	


        function onModelChange(items) {
          // Check items are present
          if (items) {

            // Check items are in an Array
            if (!angular.isArray(items)) {
              throw 'You should use weekly-scheduler directive with an Array of items';
            }

            // Keep track of our model (use it in template)
            schedulerCtrl.items = items;

            // First calculate configuration
            schedulerCtrl.config = config(items.reduce(function (result, item) {
              var schedules = item.schedules;

              return result.concat(schedules && schedules.length ?
                // If in multiSlider mode, ensure a schedule array is present on each item
                // Else only use first element of schedule array
                (options.monoSchedule ? item.schedules = [schedules[0]] : schedules) :
                item.schedules = []
              );
            }, []), options);

            // Then resize schedule area knowing the number of weeks in scope

            el.firstChild.style.width = 1 / 53 * 200 + '%';

            // Finally, run the sub directives listeners
            schedulerCtrl.$modelChangeListeners.forEach(function (listener) {
              listener(schedulerCtrl.config);
            });
          }
        }

        scope.previousDay = function(){
        	options.minDate = options.minDate.add(-1,'days');
        	options.maxDate = moment(options.minDate).tz("Australia/Perth").set({hour:23,minute:59,second:59});
        	
		        scope.$broadcast('previousDayClick', {
		          options: options
		        });

		    schedulerCtrl.on.dayChange(options);

        }

        scope.nextDay = function(){
        	options.minDate = options.minDate.add(1,'days');
        	options.maxDate = moment(options.minDate).tz("Australia/Perth").set({hour:23,minute:59,second:59});
        	
		        scope.$broadcast('nextDayClick', {
		          options: options
		        });
		     schedulerCtrl.on.dayChange(options);
        }

        if (el) {
          // Install mouse scrolling event listener for H scrolling
          mouseScroll(el, 20);

          scope.$on(CLICK_ON_A_CELL, function(e, data) {
            zoomInACell(el, e, data);
          });

          schedulerCtrl.on = {
            change: function (itemIndex, scheduleIndex, scheduleValue) {
              var onChangeFunction = $parse(attrs.onChange)(scope);
              if (angular.isFunction(onChangeFunction)) {
                return onChangeFunction(itemIndex, scheduleIndex, scheduleValue);
              }
            },
            dayChange: function (options) {
              var onDayChangeFunction = $parse(attrs.onDayChange)(scope);
              if (angular.isFunction(onDayChangeFunction)) {
                return onDayChangeFunction(options);
              }
            }
          };

          /**
           * Watch the model items
           */
          scope.$watchCollection(attrs.items, onModelChange);

          /**
           * Listen to $locale change (brought by external module weeklySchedulerI18N)
           */
          scope.$on('weeklySchedulerLocaleChanged', function (e, labels) {
            if (schedulerCtrl.config) {
              schedulerCtrl.config.labels = labels;
            }
            onModelChange(angular.copy($parse(attrs.items)(scope), []));
          });
        }
      }
    };
  }]);