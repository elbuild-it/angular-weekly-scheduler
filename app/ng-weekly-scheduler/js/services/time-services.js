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
        return end.clone().endOf(DAY).diff(start.clone().startOf(DAY), DAY) ;
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