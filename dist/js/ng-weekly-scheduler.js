;(function( window, undefined ){ 
 'use strict';

angular.module('weeklyScheduler', ['ngWeeklySchedulerTemplates']);

/* jshint -W098 */
var GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
var CLICK_ON_A_CELL = 'clickOnACell';

var isCtrl;

function ctrlCheck(e) {
  if (e.which === 17) {
    isCtrl = e.type === 'keydown';
  }
}


function mouseScroll(el, delta) {

  window.addEventListener('keydown', ctrlCheck);
  window.addEventListener('keyup', ctrlCheck);

  el.addEventListener('mousewheel', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (isCtrl) {
      var style = el.firstChild.style, currentWidth = parseInt(style.width);
      if ((e.wheelDelta || e.detail) > 0) {
        style.width = (currentWidth + 2 * delta) + '%';
      } else {
        var width = currentWidth - 2 * delta;
        style.width = (width > 100 ? width : 100) + '%';
      }
    } else {
      if ((e.wheelDelta || e.detail) > 0) {
        el.scrollLeft -= delta;
      } else {
        el.scrollLeft += delta;
      }
    }
    return false;
  });
}

function zoomInACell(el, event, data) {

  var nbElements = data.nbElements;
  var idx = data.idx;
  // percentWidthFromBeginning is used when the first element of the grid is not full
  // For instance, in the example below `feb 17` is not full
  // feb 17          march 17
  //       |                          |
  var percentWidthFromBeginning = data.percentWidthFromBeginning;

  var containerWidth = el.offsetWidth;

  // leave (1/3) each side
  // 1/3 |    3/3   | 1/3
  var boxWidth = containerWidth / (5 / 3);
  var gutterSize = boxWidth / 3;

  var scheduleAreaWidthPx = nbElements * boxWidth;
  var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;

 // el.firstChild.style.width = scheduleAreaWidthPercent + '%';

  if (percentWidthFromBeginning === undefined) {
    // All cells of a line have the same size
   // el.scrollLeft = idx * boxWidth - gutterSize;
  } else {
    // Sizes of cells in a line could different (especially the first one)
   // el.scrollLeft = scheduleAreaWidthPx * (percentWidthFromBeginning / 100) - gutterSize;
  }
}
/* jshint +W098 */

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
        var child = GRID_TEMPLATE.clone().css({ width: 400 + '%'});
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
/* global GRID_TEMPLATE, CLICK_ON_A_CELL */
angular.module('weeklyScheduler')
  .directive('weeklyGrid', [function () {

    function handleClickEvent(child, nbWeeks, idx, scope) {
      child.bind('click', function () {
        scope.$broadcast(CLICK_ON_A_CELL, {
          nbElements: nbWeeks,
          idx: idx
        });
      });
    }

    function doGrid(scope, element, attrs, model) {
      var i;
      // Calculate week width distribution

      var tickcount;
      if(attrs.isday)
       tickcount = 24;
   	  else
   	  	tickcount = 96
      var ticksize = 100 / tickcount;

   	  var gridItemEl;
      if(!attrs.isday) gridItemEl = GRID_TEMPLATE.css({width: ticksize + '%','border-top': "grey", 'border-top-style': 'solid','border-top-width':'1px'});
      else  gridItemEl = GRID_TEMPLATE.css({width: ticksize + '%'});
      var now = model.minDate.clone().startOf('week');
      // Clean element
      element.empty();

      for (i = 0; i < tickcount; i++) {
        var child = gridItemEl.clone();
        if (angular.isUndefined(attrs.noText)) {
          handleClickEvent(child, tickcount, i, scope);
          child.text(i);
        }
        element.append(child);
      }

    }

    return {
      restrict: 'E',
      require: '^weeklyScheduler',
      link: function (scope, element, attrs, schedulerCtrl) {
        if (schedulerCtrl.config) {
          doGrid(scope, element, attrs, schedulerCtrl.config);
        }
        schedulerCtrl.$modelChangeListeners.push(function (newModel) {
          doGrid(scope, element, attrs, newModel);
        });
      }
    };
  }]);
angular.module('weeklyScheduler')
  .directive('handle', ['$document', function ($document) {
    return {
      restrict: 'A',
      scope: {
        ondrag: '=',
        ondragstop: '=',
        ondragstart: '=',
        onclick: '='
      },
      link: function (scope, element) {

        var x = 0;

        element.on('mousedown', function (event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          x = event.pageX;

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);

          if (scope.ondragstart) {
            scope.ondragstart();
          }
        });

        element.on('click', function (event) {
        	event.preventDefault();
        	$document.on('click', click);
        	 if (scope.onclick) 
        		scope.onclick();
        });

        function click (event){
        }

        function mousemove(event) {
          var delta = event.pageX - x;
          if (scope.ondrag) {
            scope.ondrag(delta);
          }
        }

        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);

          if (scope.ondragstop) {
            scope.ondragstop();
          }
        }
      }
    };
  }]);
angular.module('weeklyScheduler')
  .directive('inject', [function () {

    return {
      link: function ($scope, $element, $attrs, controller, $transclude) {
        if (!$transclude) {
          throw 'Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found.';
        }

        var innerScope = $scope.$new();
        $transclude(innerScope, function (clone) {
          $element.empty();
          $element.append(clone);
          $element.on('$destroy', function () {
            innerScope.$destroy();
          });
        });
      }
    };
  }]);
angular.module('weeklyScheduler')

  .filter('byIndex', [function () {
    return function (input, index) {
      var ret = [];
      angular.forEach(input, function (el) {
        if (el.index === index) {
          ret.push(el);
        }
      });
      return ret;
    };
  }])

  .directive('multiSlider', ['$parse','weeklySchedulerTimeService', function ($parse,timeService) {
    return {
      restrict: 'E',
      require: '^weeklyScheduler',
      templateUrl: 'ng-weekly-scheduler/views/multi-slider.html',
      link: function (scope, element, attrs, schedulerCtrl) {
        var conf = schedulerCtrl.config;


        scope.elementClickedFunction = $parse(attrs.elementClicked)(scope);
        

        // The default scheduler block size when adding a new item
        var defaultNewScheduleSize = parseInt(attrs.size) || 8;

        var valToPixel = function (val) {
          var percent = val / (conf.nbWeeks);
          return Math.floor(percent * element[0].clientWidth + 0.5);
        };

        var pixelToVal = function (pixel) {
          var percent = pixel / element[0].clientWidth;
          return Math.floor(percent * (conf.nbWeeks) + 0.5);
        };

        var addSlot = function (start, end) {
          start = start >= 0 ? start : 0;
          end = end <= conf.nbWeeks ? end : conf.nbWeeks;

          var startDate = timeService.addWeek(conf.minDate, start);
          var endDate = timeService.addWeek(conf.minDate, end);

          scope.$apply(function () {
            var item = scope.item;
            if (!item.schedules) {
              item.schedules = [];
            }
            item.schedules.push({start: startDate.toDate(), end: endDate.toDate()});
          });
        };

        var hoverElement = angular.element(element.find('div')[0]);
        var hoverElementWidth = valToPixel(defaultNewScheduleSize);

        hoverElement.css({
          width: hoverElementWidth + 'px'
        });

        element.on('mousemove', function (e) {
          var elOffX = element[0].getBoundingClientRect().left;

          hoverElement.css({
            left: e.pageX - elOffX - hoverElementWidth / 2 + 'px'
          });
        });

        hoverElement.on('click', function (event) {
          if (!element.attr('no-add')) {
            var elOffX = element[0].getBoundingClientRect().left;
            var pixelOnClick = event.pageX - elOffX;
            var valOnClick = pixelToVal(pixelOnClick);

            var start = Math.round(valOnClick - defaultNewScheduleSize / 2);
            var end = start + defaultNewScheduleSize;

            addSlot(start, end);
          }
        });
      }
    };
  }]);
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
angular.module('weeklyScheduler')

  .directive('weeklySlot', ['$parse','weeklySchedulerTimeService', function ($parse,timeService) {
    return {
      restrict: 'E',
      require: ['^weeklyScheduler', 'ngModel'],
      templateUrl: 'ng-weekly-scheduler/views/weekly-slot.html',
      link: function (scope, element, attrs, ctrls) {
        var schedulerCtrl = ctrls[0], ngModelCtrl = ctrls[1];


        
        var conf = schedulerCtrl.config;
        var index = scope.$parent.$index;
        var containerEl = element.parent();
        var resizeDirectionIsStart = true;
        var valuesOnDragStart = {start: scope.schedule.start, end: scope.schedule.end};


        var pixelToVal = function (pixel) {
          var percent = pixel / containerEl[0].clientWidth;
          return Math.floor(percent * conf.nbHours*4 + 0.5);
        };


        var mergeOverlaps = function () {
          var schedule = scope.schedule;
          var schedules = scope.item.schedules;


          schedules.forEach(function (el) {
            if (el !== schedule) {
              // model is inside another slot
              if (el.end >= schedule.end && el.start <= schedule.start) {
                schedules.splice(schedules.indexOf(el), 1);
                schedule.end = el.end;
                schedule.start = el.start;
              }
              // model completely covers another slot
              else if (schedule.end >= el.end && schedule.start <= el.start) {
                schedules.splice(schedules.indexOf(el), 1);
              }
              // another slot's end is inside current model
              else if (el.end >= schedule.start && el.end <= schedule.end) {
                schedules.splice(schedules.indexOf(el), 1);
                schedule.start = el.start;
              }
              // another slot's start is inside current model
              else if (el.start >= schedule.start && el.start <= schedule.end) {
                schedules.splice(schedules.indexOf(el), 1);
                schedule.end = el.end;
              }
            }
          });
        };


        ctrls.on = {
            elementClicked: function (event) {
              var elementClickedFunction = $parse(attrs.elementClicked)(scope);
              if (angular.isFunction(elementClickedFunction)) {
                return elementClickedFunction(event);
              }
            }
          };

        /**
         * Delete on right click on slot
         */
        var deleteSelf = function () {
          containerEl.removeClass('dragging');
          containerEl.removeClass('slot-hover');
          scope.item.schedules.splice(scope.item.schedules.indexOf(scope.schedule), 1);
          containerEl.find('weekly-slot').remove();
          scope.$apply();
        };

        element.find('span').on('click', function (e) {
          e.preventDefault();
          deleteSelf();
        });

        element.on('mouseover', function () {
          containerEl.addClass('slot-hover');
        });

        element.on('mouseleave', function () {
          containerEl.removeClass('slot-hover');
        });

         element.on('click', function() {
         	ctrls.on.elementClicked(scope.schedule);
        });


        scope.clickOnBar = function (){
        	console.log();
        }

        scope.startResizeEnd = function () {
            resizeDirectionIsStart = false;
            scope.startDrag();
          };

        if (scope.item.editable !== false) {
          scope.startResizeStart = function () {
            resizeDirectionIsStart = true;
            scope.startDrag();
          };

          scope.startResizeEnd = function () {
            resizeDirectionIsStart = false;
            scope.startDrag();
          };

          scope.startDrag = function () {
            element.addClass('active');

            containerEl.addClass('dragging');
            containerEl.attr('no-add', true);

            valuesOnDragStart = {start: ngModelCtrl.$viewValue.start, end: ngModelCtrl.$viewValue.end};
          };

          scope.endDrag = function () {

            // this prevents user from accidentally
            // adding new slot after resizing or dragging
            setTimeout(function () {
              containerEl.removeAttr('no-add');
            }, 500);

            element.removeClass('active');
            containerEl.removeClass('dragging');

            mergeOverlaps();
            scope.$apply();
          };

          scope.resize = function (d) {
            var ui = ngModelCtrl.$viewValue;
            var delta = pixelToVal(d);

            if (resizeDirectionIsStart) {
              var newStart = Math.round(valuesOnDragStart.start + delta);

              if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
                ngModelCtrl.$setViewValue({
                  start: newStart,
                  end: ui.end
                });
                ngModelCtrl.$render();
              }
            } else {
              var newEnd = Math.round(valuesOnDragStart.end + delta);

              if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= conf.nbWeeks) {
                ngModelCtrl.$setViewValue({
                  start: ui.start,
                  end: newEnd
                });
                ngModelCtrl.$render();
              }
            }
          };

          scope.drag = function (d) {
            var ui = ngModelCtrl.$viewValue;
            var delta = pixelToVal(d);
            var duration = valuesOnDragStart.end - valuesOnDragStart.start;

            var newStart = Math.round(valuesOnDragStart.start + delta);
            var newEnd = Math.round(newStart + duration);

            if (ui.start !== newStart && newStart >= 0 && newEnd <= conf.nbWeeks) {
              ngModelCtrl.$setViewValue({
                start: newStart,
                end: newEnd
              });
              ngModelCtrl.$render();
            }
          };
        }

        // on init, merge overlaps
        //mergeOverlaps(true);

        //// UI -> model ////////////////////////////////////
        ngModelCtrl.$parsers.push(function onUIChange(ui) {
          ngModelCtrl.$modelValue.start = timeService.addWeek(conf.minDate, ui.start).toDate();
          ngModelCtrl.$modelValue.end = timeService.addWeek(conf.minDate, ui.end).toDate();
          //$log.debug('PARSER :', ngModelCtrl.$modelValue.$$hashKey, index, scope.$index, ngModelCtrl.$modelValue);
          schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);
          return ngModelCtrl.$modelValue;
        });

        //// model -> UI ////////////////////////////////////
        ngModelCtrl.$formatters.push(function onModelChange(model) {
          /*var ui = {
            start: timeService.weekPreciseDiff(conf.minDate, moment(model.start), true),
            end: timeService.weekPreciseDiff(conf.minDate, moment(model.end), true)
          };*/
          var start = {hour : 0, minute : 0}
          var ui = {
            start: timeService.quartersDiff(start, model.start),
            end: timeService.quartersDiff(start, model.end),
            rgb : model.rgb
          };
          //$log.debug('FORMATTER :', index, scope.$index, ui);
          return ui;
        });

        ngModelCtrl.$render = function () {
          var ui = ngModelCtrl.$viewValue;
          var css = {
            left: (ui.start / (conf.nbHours*4)) * 100 + '%',
            width: ((ui.end - ui.start) / (conf.nbHours*4)) * 100+ '%',
            background : ui.rgb || "#4eb8d5"
          };



          /*var css = {
            left: 0+ '%',
            width: 100 + '%'
          };*/


          //console.log(element);
          element.css(css);
        };

        scope.$on('weeklySchedulerLocaleChanged', function () {
          // Simple change object reference so that ngModel triggers formatting & rendering
          scope.schedule = angular.copy(scope.schedule);
        });
      }
    };
  }]);
angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);

angular.module('weeklySchedulerI18N')
  .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {

    var defaultConfig = {
      doys: {'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4},
      lang: {
        'de-de': {month: 'Monat', weekNb: 'Wochenummer', addNew: 'Hinzufügen'},
        'en-gb': {month: 'Month', weekNb: 'Week #', addNew: 'Add'},
        'en-us': {month: 'Month', weekNb: 'Week #', addNew: 'Add'},
        'fr-fr': {month: 'Mois', weekNb: 'N° de semaine', addNew: 'Ajouter'}
      }
    };

    this.configure = function (config) {

      if (config && angular.isObject(config)) {
        angular.merge(defaultConfig, config);

        if (defaultConfig.localeLocationPattern) {
          tmhDynamicLocaleProvider.localeLocationPattern(defaultConfig.localeLocationPattern);
        }
      }
    };

    this.$get = ['$rootScope', '$locale', 'tmhDynamicLocale', function ($rootScope, $locale, tmhDynamicLocale) {

      var momentLocaleCache = {};

      function getLang() {
        var key = $locale.id;
        if (!momentLocaleCache[key]) {
          momentLocaleCache[key] = getMomentLocale(key);
          moment.locale(momentLocaleCache[key].id, momentLocaleCache[key].locale);
        } else {
          moment.locale(momentLocaleCache[key].id);
        }
        return defaultConfig.lang[key];
      }

      // We just need few moment local information
      function getMomentLocale(key) {
        return {
          id: key,
          locale: {
            week: {
              // Angular monday = 0 whereas Moment monday = 1
              dow: ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7,
              doy: defaultConfig.doys[key]
            }
          }
        };
      }

      
      return {
        $locale: $locale,
        getLang: getLang,
        set: function (key) {
          return tmhDynamicLocale.set(key);
        }
      };
    }];
  }]);
angular.module('weeklyScheduler')
  .service('weeklySchedulerTimeService', ['$filter', function ($filter) {

    var MONTH = 'month';
    var WEEK = 'week';
    var DAY = 'day';

    return {
      const: {
        MONTH: MONTH,
        WEEK: WEEK,
        FORMAT: 'YYYY-MM-DD'
      },
      dF: $filter('date'),
      compare: function (date, method, lastMin) {
        if (date) {
          var dateAsMoment;
          if (angular.isDate(date)) {
            dateAsMoment = moment(date);
          } else if (date._isAMomentObject) {
            dateAsMoment = date;
          } else {
            throw 'Could not parse date [' + date + ']';
          }
          return dateAsMoment[method](lastMin) ? dateAsMoment : lastMin;
        }
      },
      addWeek: function (moment, nbWeek) {
        return moment.clone().add(nbWeek, WEEK);
      },
      weekPreciseDiff: function (start, end) {
        return end.clone().diff(start.clone(), WEEK, true);
      },
      minutesDiff: function(start,end){
      	var difference;
      	if(end.minute - start.minute < 0){
      		difference = 60 + (end.minute - start.minute);
      		difference += 60*(end.hour - start.hour -1);
      	}
      	else{
      		difference = end.minute - start.minute;
      		difference += 60*(end.hour - start.hour);
      	}

      	return difference;

      },

      quartersDiff: function(start,end){
      	return Math.floor(this.minutesDiff(start,end)/15);

      },
      weekDiff: function (start, end) {
        return end.clone().endOf(WEEK).diff(start.clone().startOf(WEEK), WEEK) + 1;
      },
      monthDiff: function (start, end) {
        return end.clone().endOf(MONTH).diff(start.clone().startOf(MONTH), MONTH) + 1;
      },
      dayDiff: function (start, end) {
      	return 1;
        //return end.clone().endOf(DAY).diff(start.clone().startOf(DAY), DAY) ;
      },
      monthDistribution: function (minDate, maxDate) {
        var i, result = [];
        var startDate = minDate.clone();
        var endDate = maxDate.clone();
        var monthDiff = this.monthDiff(startDate, endDate);
        var dayDiff = endDate.diff(startDate, DAY);

        //var total = 0, totalDays = 0;
        // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
        for (i = 0; i < monthDiff; i++) {
          var startOfMonth = i === 0 ? startDate : startDate.add(1, MONTH).startOf(MONTH);
          var endOfMonth = i === monthDiff - 1 ? endDate : startDate.clone().endOf(MONTH);
          var dayInMonth = endOfMonth.diff(startOfMonth, DAY) + (i !== monthDiff - 1 && 1);
          var width = Math.floor(dayInMonth / dayDiff * 1E8) / 1E6;
          result.push({start: startOfMonth.clone(), end: endOfMonth.clone(), width: width});
          if(i==2)break;

          // totalDays += dayInMonth; total += width;
          // console.log(startOfMonth, endOfMonth, dayInMonth, dayDiff, width, total, totalDays);
        }
        return result;
      },
      dayDistribution: function (minDate, maxDate) {
        var i, result = [];
        var startDate = minDate.clone();
        var endDate = maxDate.clone();
        var dayDiff = this.dayDiff(startDate, endDate);
        var quartersInDay = 96;
        //var total = 0, totalDays = 0;
        // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
        if(dayDiff == 0){
        	result.push({start: minDate.clone(), end: maxDate.clone(), width: Math.floor(dayInMonth / 1 * 1E8) / 1E6});
        }
        for (i = 0; i < dayDiff; i++) {
          var startOfMonth = i === 0 ? startDate : startDate.add(1, DAY).startOf(DAY);
          var endOfMonth = i === dayDiff - 1 ? endDate : startDate.clone().endOf(DAY);
          var dayInMonth = 96; //quarters
          var width = Math.floor(dayInMonth / dayDiff * 1E8) / 1E6;
          result.push({start: startOfMonth.clone(), end: endOfMonth.clone(), width: width});
          if(i==2)break;

          // totalDays += dayInMonth; total += width;
          // console.log(startOfMonth, endOfMonth, dayInMonth, dayDiff, width, total, totalDays);
        }
        return result;
      }

    };
  }]);
angular.module('ngWeeklySchedulerTemplates', ['ng-weekly-scheduler/views/multi-slider.html', 'ng-weekly-scheduler/views/weekly-scheduler.html', 'ng-weekly-scheduler/views/weekly-slot.html']);

angular.module('ng-weekly-scheduler/views/multi-slider.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/multi-slider.html',
    '<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class=slot ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model=schedule element-clicked=elementClickedFunction ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }" uib-tooltip={{schedule.text}} tooltip-placement=\'{{(schedule.end.hour<19)?("right"):("left")}}\'></weekly-slot>');
}]);

angular.module('ng-weekly-scheduler/views/weekly-scheduler.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/weekly-scheduler.html',
    '<div class=labels><div class="srow text-right">{{schedulerCtrl.config.labels.day || \'Days\'}}</div><div class="srow text-right">{{schedulerCtrl.config.labels.hour || \'Hours\'}}</div><div class=schedule-animate ng-repeat="item in schedulerCtrl.items" inject></div></div><div class=schedule-area-container><div class=schedule-area><div class="srow timestamps"><div class=montly-container><span class="glyphicon glyphicon-arrow-left" ng-click=previousDay() style="cursor : pointer"></span> <span><monthly-grid class=grid-container></monthly-grid></span><span class="glyphicon glyphicon-arrow-right" ng-click=nextDay() style="cursor : pointer"></span></div></div><div style="width : 2650%"><div class="srow timestamps"><weekly-grid isday=true class=grid-container></weekly-grid></div></div><div class="srow schedule-animate" style="width : 2650%" ng-repeat="item in schedulerCtrl.items"><weekly-grid isquarters=true class="grid-container striped" no-text></weekly-grid><multi-slider element-clicked=elementClickedFunction style="{background : red !important}" index={{$index}}></multi-slider></div></div></div>');
}]);

angular.module('ng-weekly-scheduler/views/weekly-slot.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/weekly-slot.html',
    '<div title="{{schedule.start | date}} - {{schedule.end | date}}"></div>');
}]);
}( window ));