happyLeaf.directive('highlightOnChange', function() {
  return {
    link : function(scope, element, attrs) {
      attrs.$observe( 'highlightOnChange', function ( val ) {
        $(element).addClass('highlight');
        setTimeout(function(){
          $(element).removeClass('highlight');
        }, 800);
      });
    }
  };
});
