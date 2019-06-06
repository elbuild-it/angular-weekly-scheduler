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